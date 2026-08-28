# Auditoría — Roma App (`roma-app`)

> Fecha: 2025 · Alcance: lectura completa del código fuente, sin modificar el repo.
> Objetivo: base para construir la **v2**, más eficiente, liviana y lista para convertirse en **SaaS**.

---

## Resumen ejecutivo

**Stack actual:** Next.js **16.3** + React **19** + TypeScript (strict) + **Drizzle ORM**/mysql2 sobre **MySQL/MariaDB** + **Tailwind 4**. Toda la mutación se hace con **Server Actions** + componentes cliente enormes. Sin framework de tests, sin CI/CD, sin state management en cliente.

Es un **sistema de gestión single-tenant para un restaurante** con tres caras:

- **Público:** landing (`/`), nosotros, contacto, reserva (solo genera un enlace de WhatsApp, no persiste).
- **QR de mesa / clientes:** `/app/menu` (menú digital + pedido con carrito), `/fidelizacion` y `/resena` (club/loyalty, encuesta y reseñas).
- **Admin:** `/admin` — comandas/caja, cocina, menú y QR de mesas, clientes/fidelización, inventario+recetas, facturación **SRI Ecuador** (IVA 15%) e integración **WhatsApp (Evolution API)**.

---

## 1. 🔴 Hallazgos CRÍTICOS (seguridad)

| # | Hallazgo | Evidencia | Impacto |
|---|----------|-----------|---------|
| 1 | **Sesión admin falsificable (auth bypass).** La cookie `roma_admin_session` es `base64(JSON{id,nombre,email,rol})` sin firma/HMAC. | `src/lib/auth.ts`; `src/middleware.ts` solo comprueba que la cookie exista. | Acceso de administrador total a cualquier corte sin credenciales. |
| 2 | **Credenciales maestras hardcodeadas y visibles.** `admin123` como contraseña maestra; la pantalla de login muestra usuario `Roma` / `admin123`. | `src/lib/auth.ts`; `src/app/admin/login/page.tsx`. | Cuenta de "dueño" conocida por todos. Contraseñas con **SHA-256 sin salt** (débil). |
| 3 | **Secretos en el código.** API key de Evolution e IP pública incrustadas. | `src/lib/evolution/whatsapp.ts`. | Exposición de secretos rotados. |
| 4 | **Server Actions sin autorización.** Las actions no verifican sesión ni rol. | `crearPlatoAction`, `actualizarPlatoAction`, `emitirFacturaAction`, `guardarGoogleReviewUrlAction`, etc. | Cualquiera puede escribir, facturar o borrar. |
| 5 | **Inyección de precios en pedidos.** Se confía en el `precioUnitario` del payload del cliente. | `src/app/app/menu/actions.ts` → `crearPedidoOnlineAction`. | Compras a precio 0 / fraude. |
| 6 | **Sin rate-limiting en login** ni logs de auditoría de cambios en admin. | `src/app/admin/login/actions.ts`. | Fuerza bruta y sin trazabilidad. |

---

## 2. 🟠 Rendimiento y arquitectura de datos

- **N+1 y carga completa en memoria.** `getPedidosCompletos` y `getFacturasCompletas` (en `src/db/queries/*`) cargan todas las filas y todos los items y los cruzan en JS; `getMenuCompleto` filtra platos por categoría en el cliente; el dashboard ejecuta ~10 queries separadas en vez de agregaciones; `descontarStockPorPedido` hace queries en bucles anidados.
- **Polling agresivo.** `router.refresh()` cada 4 s (`LiveAutoRefresh`) re-ejecuta server components completos; WhatsApp se sondea cada 8 s. Sin WebSocket/SSE.
- **`force-dynamic` en todo.** Sin ISR ni caché → cada visita toca la DB.
- **Sin paginación del servidor.** Payload de props a componentes cliente pesado.
- **Bug lógico:** `pedidosHoy` en el dashboard cuenta **todos** los pedidos (`count(*)`) y se etiqueta "hoy".
- **Fallback que oculta errores.** `getDashboardData` devuelve métricas falsas (`totalPlatos:4`, `promedioResenas:5.0`) cuando la DB falla → una caída real queda enmascarada con datos inventados.

---

## 3. 🟡 Calidad de código y mantenibilidad

- **Duplicación masiva de iconos SVG inline** (objeto `s` + `Ic*` repetido en ~8 archivos) en lugar de una librería de íconos.
- **Muchos `as any`** (`(result as any)[0].insertId`) → tipado roto con el driver mysql2 de Drizzle.
- **Gestión de esquema en runtime.** `asegurarTablas()` ejecuta `CREATE TABLE IF NOT EXISTS` de `encuestas` y `configuraciones` en producción; estas tablas **no están** en la migración Drizzle.
- **Inconsistencia en errores** de server actions (`{error}`, `throw`, o `undefined`).
- **Assets duplicados** en `public/` (p. ej. `hero-pizza.jpg` y `hero_pizza_1786…jpg`) y SVGs plantilla sin usar (`next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`).
- **README sin documentar**; componentes cliente gigantes (AppMenuClient 958 líneas, AdminMenuClient ~1.0K+).

---

## 4. 🟢 Esquema y modelo de datos (para SaaS)

- **No hay multitenancy** (sin `tenant_id`); `configuraciones` son claves globales (`total_mesas`, `google_review_url`).
- **`numero_cliente` único** generado con `Math.random()` de 3–4 dígitos (`fid-####`, `cliente-###`, `cli-###`) → colisiones posibles.
- Dinero en `DECIMAL` (ok) pero manipulado con `Number()`/`toFixed` → riesgo de floating point en IVA/redondeos.
- **Faltan índices** en FKs de mucha cardinalidad (`items_pedido.pedido_id`, `pedidos.creado_en`, `facturas.pedido_id`).
- **`alertas_fidelizacion.dias_sin_volver`** parece estático; sin lógica/job que lo recalcule.
- **SRI:** se genera clave de acceso y XML correctamente, pero **sin firma electrónica (.p12)**; `estado` queda en `simulada`. IVA 15% hardcodeado.

---

## 5. Recomendaciones para la v2 SaaS (priorizado)

### Bloqueantes
1. **Auth robusta firmada** (JWT/HMAC o Auth.js/Lucia) + **RBAC por rol** verificado en *cada* action, no solo en middleware.
2. **Eliminar secretos hardcodeados** → `.env` gitignored + proveedor de secretos.
3. **Validar precios/stock en el servidor** al crear pedidos.
4. **Migraciones Drizzle versionadas** incluyendo `encuestas`, `configuraciones` y futuros `tenants`/`plans`.

### Eficiencia / liviandad
5. **Paginación server-side** y queries con `JOIN`/agregaciones; eliminar el cruce en memoria.
6. **Real-time con WebSocket/SSE** en lugar de `router.refresh()` cada 4 s.
7. **Caché + ISR** para rutas públicas/menú; `/admin` dinámico.
8. **Set único de iconos** y depurar CSS; usar `next/font` en vez de `@import` de Google Fonts.

### Modelo SaaS
9. **Multitenancy** (aislar por tenant o DB por cliente), onboarding, suscripción/billing, notificaciones por tenant, observabilidad/logging, rate-limiting, **tests + CI/CD**.