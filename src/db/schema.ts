import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  mysqlEnum,
  date,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * =========================================================
 *  MENÚ  (fuente única: la usan el sitio público y /app)
 * =========================================================
 */
export const categorias = mysqlTable("categorias", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  orden: int("orden").default(0).notNull(),
});

export const platos = mysqlTable("platos", {
  id: int("id").autoincrement().primaryKey(),
  categoriaId: int("categoria_id").references(() => categorias.id),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  descripcion: text("descripcion"),
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
  imagenUrl: varchar("imagen_url", { length: 500 }),
  videoUrl: varchar("video_url", { length: 500 }),
  disponible: boolean("disponible").default(true).notNull(),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  CLIENTES Y FIDELIZACIÓN
 * =========================================================
 */
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  numeroCliente: varchar("numero_cliente", { length: 20 }).notNull().unique(), // ej. "cliente 047"
  nombre: varchar("nombre", { length: 150 }).notNull(),
  telefono: varchar("telefono", { length: 30 }),
  email: varchar("email", { length: 150 }),
  cumpleanios: date("cumpleanios"),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
  ultimaVisita: timestamp("ultima_visita"),
});

export const alertasFidelizacion = mysqlTable("alertas_fidelizacion", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").notNull().references(() => clientes.id),
  diasSinVolver: int("dias_sin_volver").notNull(),
  mensajeSugerido: text("mensaje_sugerido").notNull(),
  estado: mysqlEnum("estado", ["pendiente", "enviada", "descartada"])
    .default("pendiente")
    .notNull(),
  creadaEn: timestamp("creada_en").defaultNow().notNull(),
});

export const resenas = mysqlTable("resenas", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").references(() => clientes.id),
  calificacion: int("calificacion").notNull(), // 1-5
  comentario: text("comentario"),
  // 5 estrellas -> se invita a Google; <5 -> queda privada
  esPublica: boolean("es_publica").default(false).notNull(),
  creadaEn: timestamp("creada_en").defaultNow().notNull(),
});

/**
 * Encuesta de recolección de datos (QR fidelización con promo pizza)
 */
export const encuestas = mysqlTable("encuestas", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").references(() => clientes.id),
  platFavorito: varchar("plat_favorito", { length: 150 }),
  frecuenciaVisita: varchar("frecuencia_visita", { length: 80 }),
  comoNosConocio: varchar("como_nos_conocio", { length: 100 }),
  ocasionVisita: varchar("ocasion_visita", { length: 250 }),
  nosRecomendaria: boolean("nos_recomendaria").default(true),
  sugerencias: text("sugerencias"),
  pizzaPromoReclamada: boolean("pizza_promo_reclamada").default(false).notNull(),
  creadaEn: timestamp("creada_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  PEDIDOS / COMANDAS  (QR de mesa, mesero, caja -> misma cola)
 * =========================================================
 */
export const pedidos = mysqlTable("pedidos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("cliente_id").references(() => clientes.id),
  origen: mysqlEnum("origen", ["qr_mesa", "mesero", "caja"]).notNull(),
  mesa: varchar("mesa", { length: 20 }),
  estado: mysqlEnum("estado", [
    "recibido",
    "en_cocina",
    "listo",
    "entregado",
    "cancelado",
  ])
    .default("recibido")
    .notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0.00").notNull(),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
});

export const itemsPedido = mysqlTable("items_pedido", {
  id: int("id").autoincrement().primaryKey(),
  pedidoId: int("pedido_id").notNull().references(() => pedidos.id),
  platoId: int("plato_id").notNull().references(() => platos.id),
  cantidad: int("cantidad").default(1).notNull(),
  precioUnitario: decimal("precio_unitario", { precision: 10, scale: 2 }).notNull(),
  notas: varchar("notas", { length: 255 }),
});

/**
 * =========================================================
 *  INVENTARIO
 * =========================================================
 */
export const insumos = mysqlTable("insumos", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  unidad: varchar("unidad", { length: 30 }).notNull(), // kg, litros, unidades...
  stockActual: decimal("stock_actual", { precision: 10, scale: 2 }).default("0.00").notNull(),
  stockMinimo: decimal("stock_minimo", { precision: 10, scale: 2 }).default("0.00").notNull(),
});

// Receta: qué insumos y en qué cantidad consume cada plato
export const recetaInsumos = mysqlTable("receta_insumos", {
  id: int("id").autoincrement().primaryKey(),
  platoId: int("plato_id").notNull().references(() => platos.id),
  insumoId: int("insumo_id").notNull().references(() => insumos.id),
  cantidadUsada: decimal("cantidad_usada", { precision: 10, scale: 2 }).notNull(),
});

export const movimientosInventario = mysqlTable("movimientos_inventario", {
  id: int("id").autoincrement().primaryKey(),
  insumoId: int("insumo_id").notNull().references(() => insumos.id),
  tipo: mysqlEnum("tipo", ["entrada", "salida_venta", "ajuste"]).notNull(),
  cantidad: decimal("cantidad", { precision: 10, scale: 2 }).notNull(),
  pedidoId: int("pedido_id").references(() => pedidos.id),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  FACTURACIÓN
 * =========================================================
 */
export const facturas = mysqlTable("facturas", {
  id: int("id").autoincrement().primaryKey(),
  pedidoId: int("pedido_id").notNull().references(() => pedidos.id),
  clienteId: int("cliente_id").references(() => clientes.id),
  emailEnvioDestino: varchar("email_envio_destino", { length: 150 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  iva: decimal("iva", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  estado: mysqlEnum("estado", ["simulada", "enviada", "oficial_sri"])
    .default("simulada")
    .notNull(),
  creadaEn: timestamp("creada_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  USUARIOS DE /admin
 * =========================================================
 */
export const usuariosAdmin = mysqlTable("usuarios_admin", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  rol: mysqlEnum("rol", ["owner", "caja", "cocina"]).default("caja").notNull(),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  RELACIONES
 * =========================================================
 */
export const categoriasRelations = relations(categorias, ({ many }) => ({
  platos: many(platos),
}));

export const platosRelations = relations(platos, ({ one, many }) => ({
  categoria: one(categorias, {
    fields: [platos.categoriaId],
    references: [categorias.id],
  }),
  itemsPedido: many(itemsPedido),
  receta: many(recetaInsumos),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [pedidos.clienteId],
    references: [clientes.id],
  }),
  items: many(itemsPedido),
  factura: many(facturas),
}));

export const clientesRelations = relations(clientes, ({ many }) => ({
  pedidos: many(pedidos),
  resenas: many(resenas),
  alertas: many(alertasFidelizacion),
  encuestas: many(encuestas),
}));


