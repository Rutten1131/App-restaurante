# Propuesta técnica v2 — Roma App SaaS

> Complemento de `docs/auditoria-v2.md`. Describe **cómo** construir la v2: arquitectura, modelo de datos multi-tenant, decisión de stack, roadmap y plan de migración.
> Alcance: solo documento de diseño. No deja de ser una **propuesta** a validar antes de escribir código.

---

## Índice
1. [Principios de diseño](#1-principios-de-diseño)
2. [Decisión de stack](#2-decisión-de-stack)
3. [Arquitectura de alto nivel](#3-arquitectura-de-alto-nivel)
4. [Multitenancy: modelo de datos](#4-multitenancy-modelo-de-datos)
5. [Seguridad y autorización](#5-seguridad-y-autorización)
6. [Rendimiento y realtime](#6-rendimiento-y-realtime)
7. [Facturación SRI y pagos](#7-facturación-sri-y-pagos)
8. [Observabilidad, tests y CI/CD](#8-observabilidad-tests-y-cicd)
9. [Roadmap por fases](#9-roadmap-por-fases)
10. [Plan de migración desde v1](#10-plan-de-migración-desde-v1)
11. [Riesgos y decisiones abiertas](#11-riesgos-y-decisiones-abiertas)

---

## 1. Principios de diseño

1. **Seguridad por defecto** — auth firmada, RBAC real en cada server action, nunca confiar en el cliente.
2. **Multi-tenant aislado** — los datos de un restaurante nunca se mezclan con otro; garantía verificable en cada query.
3. **Liviano y escalable** — paginación server-side, cahé/ISR, realtime por eventos, no polling pesado.
4. **Dinero como `DECIMAL`/céntimos** — evitar floating point en IVA y totales.
5. **Evolucionable** — migraciones versionadas con Drizzle, sin DDL en runtime.
6. **Configurable por tenant** — `configuraciones` pasa a ser por-tenant, no global.

---

## 2. Decisión de stack

| Aspecto | Recomendación v2 | Justificación |
|---|---|---|
| Framework | **Next.js 15+/16 (App Router)** — mantener | Ya existente, RSC + server actions; equipo ya lo usa. |
| Data access | **Drizzle ORM + mysql2** — mantener | YA existente; tipado y migraciones. Añadir patrón de "data access por tenant". |
| Base de datos | **PostgreSQL** (migrar) o **MySQL** (mantener) — **ver riesgos §11** | Para autenticidad multi-tenant por **RLS** es más fuerte en Postgres. Si se prefiere MySQL/plan gratis, usar **DB por tenant**. **Recomendado: PostgreSQL + RLS.** |
| Auth | **Auth.js (v5) o Lucia** + sesiones en DB | Sesiones revocables, firmadas, con CSRF integrado. Reemplaza la cookie base64. |
| Passwords | **bcrypt/argon2** | Sustituye SHA-256 sin salt. |
| Validación | **Zod** (ya disponible como dependencia transitiva) | Schemas compartidos cliente/servidor; validar precios/forms. |
| Realtime | **WebSocket/SSE** para comandas; o polling moderado con diff | Sustituye `router.refresh()` cada 4 s. |
| Cache | **ISR + revalidateTag** + `unstable_cache` | Páginas públicas/menú casi estáticas. |
| Iconos | **Librería unificada** (lucide-react o heroicons) | Elimina los `Ic*` duplicados. |
| Billing | **Stripe** (checkout + suscripción) + webhooks | Plan/base por tenant. |
| Emails/notif | Proveedor transaccional (Resend/SES) o WhatsApp (Evolution) | Facturas y alertas. |
| Tests | **Vitest + Playwright** + Testing Library | unit + e2e; falta hoy. |
| CI/CD | **GitHub Actions**: lint + typecheck + tests + build + migraciones + deploy | Falta hoy. |

> **Nota de auditoría:** la v2 no necesita una API REST separada de entrada; Next.js con server actions + route handlers es suficiente mientras el consumidor sea la propia app. Si en el futuro habrá apps móviles/terceros, añadir una capa de route handlers con la misma capa de servicio.

---

## 3. Arquitectura de alto nivel

```
┌─────────────────────────────  App Next.js (App Router)  ─────────────────────────────┐
│                                                                                      │
│  /            Landing pública   (ISR)                                                 │
│  /app/*       Cliente QR mesa (pedido)   (ISR menú + acciones)                       │
│  /admin/*     Tenant admin (dinámico, autenticado, realtime)                         │
│  /r/...       Marca pública por tenant (web del restaurante)                         │
│                                                                                      │
│  Capa de servicio (server-only): useAuth(), requireRole(), withTenant(db)            │
│  ────────────────────────────────────────────────────────────────────────────────    │
│  Server Actions  → zod validación →  Servicio  →  Realtime emitir evento            │
│  Route Handlers  → (API para webhooks SRI/Stripe/WhatsApp si se requiere)           │
└───────────────────────────────┬─────────────────────────────────────────────────────┘
                                │ (pool con tenant obligatorio)
┌───────────────────────────────▼─────────────────────────────────────────────────────┐
│  Base de datos PostgreSQL (RLS)                                                      │
│  tenants · planes · usuarios · sesiones ·  [tablas de dominio con tenant_id]  · pago │
└──────────────────────────────────────────────────────────────────────────────────────┘

Integraciones externas:
  Evolución WhatsApp · SRI Ecuador (firma .p12) · Stripe · Google Maps · Cloud Storage (imgs)
```

### Patrón clave: `withTenant`
- Todo query pasa por un helper que fija el tenant de la sesión/lógica de negocio.
- Con **PostgreSQL + RLS**: `SET app.tenant_id = X` por transacción → el DB garantiza el aislamiento aunque un query olvide el filtro (defensa en profundidad).
- Con **MySQL/DB por tenant**: el pool se selecciona por tenant (baja por defecto de las server actions).

---

## 4. Multitenancy: modelo de datos

### 4.1 Tablas de plataforma (no tenant)

```sql
-- Tenants: cada restaurante es un tenant
CREATE TABLE tenants (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,            -- ej. 'roma-loja'
  nombre        TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free',    -- free | basic | pro | enterprise
  estado        TEXT NOT NULL DEFAULT 'activo',  -- activo | pendiente | suspendido | cancelado
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  configcresa TEXT -- url google review, total mesas, etc. (JSONB) -- ver §4.3
);

-- Planes
CREATE TABLE planes (
  id     TEXT PRIMARY KEY,          -- 'free' | 'basic' | 'pro'
  nombre TEXT NOT NULL,
  precio_mensual INT NULL,          -- en céntimos; NULL = custom
  limites JSONB NOT NULL DEFAULT '{}' -- ej. {"max_usuarios":3,"max_mesas":20}
);

-- Roles por tenant
CREATE TABLE tenant_miembros (
  tenant_id  BIGINT NOT NULL REFERENCES tenants(id),
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  rol        TEXT NOT NULL DEFAULT 'caja',  -- owner | caja | cocina
  PRIMARY KEY (tenant_id, usuario_id)
);

-- Autenticación global
CREATE TABLE usuarios (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,               -- argon2/bcrypt
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sesiones revocables
CREATE TABLE sesiones (
  id         TEXT PRIMARY KEY,      -- token firmado
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  expires_at TIMESTAMPTZ NOT NULL,
  creada_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.2 Tablas de dominio → todas con `tenant_id`

Toda la v1 se mantiene funcionalmente, añadiendo columna `tenant_id` como primera columna y clave primaria compuesta o índice FK:

```sql
CREATE TABLE platos (
  tenant_id    BIGINT NOT NULL REFERENCES tenants(id),
  id           BIGINT NOT NULL,
  categoria_id BIGINT,
  nombre       TEXT NOT NULL,
  precio       NUMERIC(10,2) NOT NULL,
  disponible   BOOLEAN NOT NULL DEFAULT true,
  imagen_url   TEXT,
  ...
  PRIMARY KEY (tenant_id, id)
);
```

Mismo patrón para: `categorias`, `clientes`, `pedidos`, `items_pedido`, `insumos`, `receta_insumos`, `movimientos_inventario`, `facturas`, `resenas`, `encuestas`, `alertas_fidelizacion`.

**Claves compuestas `(tenant_id, id)`** → elimina riesgo de colisiones globales y hace el aislamiento parte de la PK (además de RLS).

### 4.3 Configuración por tenant (reemplaza `configuraciones` global)

- Columna `config` (JSONB) en `tenants`: `{ total_mesas, google_review_url, sri_ruc, sri_razon_social, whatsapp_instance, iva, ... }`.
- En MySQL: tabla `tenant_config(tenant_id, clave, valor)`.
- La lectura se hace siempre con el tenant ya resuelto; sin tablas globales.

### 4.4 Mejoras puntuales detectadas en v1

- **`numero_cliente`**: pasar de `Math.random()` a secuencia/`CASE` único por tenant (p. ej. `cli-<tenant>-<seq>`), o eliminar el campo y usar `id`.
- **Índices**: crear índices en `(tenant_id, creado_en)`, `(tenant_id, pedido_id)`, FKs de items/movimientos.
- **Dinero**: manipular siempre en `NUMERIC`/céntimos; totales calculados y validados en el servidor (nunca sumar desde el payload).
- **`pedidosHoy`**: corregir el `count(*)` para filtrar por `creado_en >= today` y por tenant.
- **SRI**: almacenar parámetros por tenant y planificar firma `.p12`.

---

## 5. Seguridad y autorización

1. **Sesión firmada y revocable** (Auth.js/Lucia + DB).
   - Reemplaza la cookie `base64` sin firmar. Nunca autorizar por presunta presencia de cookie.
2. **`requireRole('owner' | 'caja' | 'cocina')`** llamado en **cada** server action y route handler.
   - ESQUEMA: cada action empieza con `const { tenantId, rol } = await requireRole(criterio)`.
3. **Validación con Zod** en el borde de entrada:
   - Precios, cantidades y totales validados contra `platos` de la DB, no desde el cliente.
   - `emitirFactura`, `crearPedido`, `crearPlato`, etc. comparten schemas.
4. **Secrets fuera del código** → variables de entorno + proveedor (Vercel/Cloud Run secrets).
5. **Rate limiting** en login (p. ej. `upstash`/`unkey`, o throttle en middleware) y en endpoints públicos.
6. **Idempotencia** en pedidos/facturas (token de idempotencia por envío) para evitar dobles comandas.
7. **Auditoría**: tabla `logs_accion(tenant_id, usuario_id, accion, ids, created_at)` para cambios administrativos.

---

## 6. Rendimiento y realtime

### Qué cambiar respecto a v1
- **Paginación server-side**: `LIMIT/OFFSET` o cursor por `creado_en` en pedidos, facturas, clientes, reseñas. Eliminar el cruce en memoria.
- **Menú público con ISR + revalidateTag('menu-<tenant>')** al modificar platos → las páginas públicas no golpean DB en cada request.
- **Agregaciones SQL** para dashboard en vez de ~10 queries; bucket por día para ventas.
- **Nuevo corazón de comandas**: por cada cambio de estado se **emite un evento** por WebSocket/SSE (`/api/events`) en lugar de `router.refresh()` cada 4 s. Fallback a polling de 10–15 s si el despliegue no soporta conexiones largas.
- **Imágenes**: mover a Cloud Storage/CDN (Vercel Blob / S3) y servir con optimización de `next/image`; eliminar duplicados de `public/`.

### Diagrama realtime (cocina/caja)
```
[Server Action changeEstado] → transacción + emit "pedido:<tenantId>:actualizado" 
→ WC/SSE → comandas/cocina actualizan en ~0.5 s
```

---

## 7. Facturación SRI y pagos

- **SRI (v2):** además de clave de acceso + XML, integrar **firma electrónica (.p12)** y estado `oficial_sri` real. Parámetros (ruc, razón social, serie, ambiente, tarifa IVA) por tenant en `tenant.config`.
- **Pagos/pos:** mantener opción "comanda + factura"; añadir **Stripe** para pago de pedidos online opcional y para la **suscripción del tenant** (planes).
- **Webhooks**: endpoints `POST /api/webhooks/stripe`, `POST /api/webhooks/sri`, `POST /api/webhooks/whatsapp` con validación de firma y manejo de idempotencia.

---

## 8. Observabilidad, tests y CI/CD

- **Logging estructurado** (pino/console JSON) + `tenant_id` en cada log.
- **Métricas**: trazas en Vercel/OTel para errores y latencia de N+1.
- **Tests**:
  - Unit (Vitest) de servicios y cálculo de IVA/clave SRI.
  - Integration (con DB test) de queries tenant-scoped.
  - E2E (Playwright) de flujo clave: login → pedido mesa → cocina → factura.
- **CI (GitHub Actions)**: lint + typecheck + tests + `drizzle-kit` generate/check + build. Deploy con migraciones (preview → prod).
- **Seeding**: mantener `scripts/seed-*` pero parametrizados por tenant y con datos mínimos vs. demo completos.

---

## 9. Roadmap por fases

### Fase 0 — Fundación segura (sin tocar dominio)
- Auth.js/Lucia + sesiones en DB + `requireRole` + Zod en el borde.
- Secretos fuera de código; rate limiting en login.
- **Hito:** cerrar los 6 hallazgos críticos de la auditoría.

### Fase 1 — Multi-tenant en el modelo
- Migración a PostgreSQL + RLS **o** MySQL con DB por tenant (decisión abierta §11).
- Tablas `tenants`/`planes`/`tenant_miembros`/`sesiones`; añadir `tenant_id` a todas las de dominio; PK compuestas.
- `withTenant()` central; migración Drizzle versionada (sin DDL en runtime de `fidelizacion.ts`).

### Fase 2 — Rendimiento
- Paginación server-side + agregaciones de dashboard.
- ISR + `revalidateTag` para menú/páginas públicas.
- Realtime WebSocket/SSE para comandas (o polling optimizado).

### Fase 3 — Producto SaaS
- Suscripción/planes (Stripe), onboarding de nuevo tenant, marca pública por slug (`/r/roma-loja`).
- Configuración por tenant (mesas, SRI, WhatsApp).

### Fase 4 — SRI y calidad
- Firma electrónica `.p12` y estados reales.
- Tests + CI/CD completos, observabilidad y auditoría.

---

## 10. Plan de migración desde v1

### Paso 0 — Congelar v1
- Tag `v1`.
- Mantener el repo v1 como referencia/fuente de verdad de datos.

### Paso 1 — Desarrollo en paralelo
- Crear rama/estructura v2 (puede ser el **mismo repo** en rama `feat/v2`, o monorepo con `apps/`, `packages/`).
- Portar lógica de negocio (no UI) a una **capa de servicios** reutilizable.

### Paso 2 — Migración de datos (one-time)
- Escribir script que cree `tenant 'roma-loja'` y copie las tablas de dominio con `tenant_id`.
- Preservar `id` originales (guardar mapeo viejo→nuevo) para no romper referencias históricas/QR.
- Migrar `configuraciones` a `tenant.config{...}`.

### Paso 3 — Segundo sistema de "arde de datos"
- Periodo de validación: correr v1 y v2 en paralelo y comparar totales (pedidos/facturas) diariamente.

### Paso 4 — Cutover
- Mantenimiento corto, migración final, DNS/cookie de sesión nueva, monitorizar.
- Prevista la posibilidad de rollback.

### Paso 5 — Retiro
- Desactivar v1 (no borrar datos inmediatamente); archivar scripts `seed-*` de v1.

---

## 11. Riesgos y decisiones abiertas

| Decisión | Opción A | Opción B | Recomendación |
|---|---|---|---|
| **Base de datos** | MySQL (mantener, costo cero) + DB por tenant | **PostgreSQL + RLS** con tenant_id + PK compuesta | **PostgreSQL + RLS** si hay presupuesto/CPD; MySQL+DB por tenant si el costo de hospedaje debe minimizarse. |
| **Ruta de onboarding SaaS** | Reescritura en el mismo repo | Monorepo (`apps/web`, `packages/db`, `packages/services`) | Monorepo si habrá app móvil/futuras apps; si no, mismo repo en rama. |
| **Realtime** | WebSocket/SSE propio | Proveedor (Pusher/Ably) | SSE propio si despliegue serverless tolera; si no, proveedor o polling 10–15 s. |
| **Alcance SRI v2** | Mantener "simulada" + XML | Implementar firma `.p12` oficial | Implementar firma en Fase 4; validar costos/legal. |

**Conflicto a resolver antes de codificar modelos:** la elección PostgreSQL-vs-MySQL condiciona el diseño de multitenancy (RLS vs DB-por-tenant) y es la decisión de mayor impacto de toda la propuesta.