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
 *  RESTAURANTES  (tabla maestra SaaS — cada tenant es un restaurante)
 * =========================================================
 */
export const restaurantes = mysqlTable("restaurantes", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(), // "roma", "otro-rest"
  nombre: varchar("nombre", { length: 200 }).notNull(),
  nombreComercial: varchar("nombre_comercial", { length: 200 }),
  descripcion: text("descripcion"),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  colorPrimario: varchar("color_primario", { length: 20 }).default("#c9a84c"),
  colorFondo: varchar("color_fondo", { length: 20 }).default("#0a0908"),
  telefono: varchar("telefono", { length: 30 }),
  email: varchar("email", { length: 150 }),
  direccion: text("direccion"),
  ciudad: varchar("ciudad", { length: 100 }),
  pais: varchar("pais", { length: 50 }).default("Ecuador"),
  whatsapp: varchar("whatsapp", { length: 30 }),
  horario: text("horario"), // JSON string con horarios
  redesSociales: text("redes_sociales"), // JSON string
  // SRI / Facturación por restaurante
  sriRuc: varchar("sri_ruc", { length: 20 }),
  sriRazonSocial: varchar("sri_razon_social", { length: 200 }),
  sriEstablecimiento: varchar("sri_establecimiento", { length: 5 }),
  sriPuntoEmision: varchar("sri_punto_emision", { length: 5 }),
  sriDirMatriz: text("sri_dir_matriz"),
  // Estado
  activo: boolean("activo").default(true).notNull(),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  MENÚ  (fuente única: la usan el sitio público y /app)
 * =========================================================
 */
export const categorias = mysqlTable("categorias", {
  id: int("id").autoincrement().primaryKey(),
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  orden: int("orden").default(0).notNull(),
});

export const platos = mysqlTable("platos", {
  id: int("id").autoincrement().primaryKey(),
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
  categoriaId: int("categoria_id").references(() => categorias.id),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  descripcion: text("descripcion"),
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
  imagenUrl: text("imagen_url"),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
  restauranteId: int("restaurante_id").notNull().references(() => restaurantes.id),
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
 *  USUARIOS DE /admin  y  /superadmin
 * =========================================================
 */
export const usuariosAdmin = mysqlTable("usuarios_admin", {
  id: int("id").autoincrement().primaryKey(),
  restauranteId: int("restaurante_id").references(() => restaurantes.id), // null para super_admin
  nombre: varchar("nombre", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  rol: mysqlEnum("rol", ["super_admin", "owner", "caja", "cocina"]).default("caja").notNull(),
  creadoEn: timestamp("creado_en").defaultNow().notNull(),
});

/**
 * =========================================================
 *  RELACIONES
 * =========================================================
 */
export const restaurantesRelations = relations(restaurantes, ({ many }) => ({
  categorias: many(categorias),
  platos: many(platos),
  clientes: many(clientes),
  pedidos: many(pedidos),
  insumos: many(insumos),
  facturas: many(facturas),
  usuarios: many(usuariosAdmin),
  resenas: many(resenas),
  encuestas: many(encuestas),
  alertas: many(alertasFidelizacion),
}));

export const categoriasRelations = relations(categorias, ({ one, many }) => ({
  restaurante: one(restaurantes, {
    fields: [categorias.restauranteId],
    references: [restaurantes.id],
  }),
  platos: many(platos),
}));

export const platosRelations = relations(platos, ({ one, many }) => ({
  restaurante: one(restaurantes, {
    fields: [platos.restauranteId],
    references: [restaurantes.id],
  }),
  categoria: one(categorias, {
    fields: [platos.categoriaId],
    references: [categorias.id],
  }),
  itemsPedido: many(itemsPedido),
  receta: many(recetaInsumos),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  restaurante: one(restaurantes, {
    fields: [pedidos.restauranteId],
    references: [restaurantes.id],
  }),
  cliente: one(clientes, {
    fields: [pedidos.clienteId],
    references: [clientes.id],
  }),
  items: many(itemsPedido),
  factura: many(facturas),
}));

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  restaurante: one(restaurantes, {
    fields: [clientes.restauranteId],
    references: [restaurantes.id],
  }),
  pedidos: many(pedidos),
  resenas: many(resenas),
  alertas: many(alertasFidelizacion),
  encuestas: many(encuestas),
}));

export const facturasRelations = relations(facturas, ({ one }) => ({
  restaurante: one(restaurantes, {
    fields: [facturas.restauranteId],
    references: [restaurantes.id],
  }),
  pedido: one(pedidos, {
    fields: [facturas.pedidoId],
    references: [pedidos.id],
  }),
  cliente: one(clientes, {
    fields: [facturas.clienteId],
    references: [clientes.id],
  }),
}));

export const insumosRelations = relations(insumos, ({ one, many }) => ({
  restaurante: one(restaurantes, {
    fields: [insumos.restauranteId],
    references: [restaurantes.id],
  }),
  recetas: many(recetaInsumos),
  movimientos: many(movimientosInventario),
}));

export const usuariosAdminRelations = relations(usuariosAdmin, ({ one }) => ({
  restaurante: one(restaurantes, {
    fields: [usuariosAdmin.restauranteId],
    references: [restaurantes.id],
  }),
}));

export const resenasRelations = relations(resenas, ({ one }) => ({
  restaurante: one(restaurantes, {
    fields: [resenas.restauranteId],
    references: [restaurantes.id],
  }),
  cliente: one(clientes, {
    fields: [resenas.clienteId],
    references: [clientes.id],
  }),
}));

export const encuestasRelations = relations(encuestas, ({ one }) => ({
  restaurante: one(restaurantes, {
    fields: [encuestas.restauranteId],
    references: [restaurantes.id],
  }),
  cliente: one(clientes, {
    fields: [encuestas.clienteId],
    references: [clientes.id],
  }),
}));

export const alertasFidelizacionRelations = relations(alertasFidelizacion, ({ one }) => ({
  restaurante: one(restaurantes, {
    fields: [alertasFidelizacion.restauranteId],
    references: [restaurantes.id],
  }),
  cliente: one(clientes, {
    fields: [alertasFidelizacion.clienteId],
    references: [clientes.id],
  }),
}));
