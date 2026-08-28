import "server-only";
import { db } from "@/db";
import {
  restaurantes,
  platos,
  pedidos,
  clientes,
  usuariosAdmin,
  facturas,
} from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface CrearRestauranteInput {
  slug: string;
  nombre: string;
  nombreComercial?: string;
  descripcion?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  colorPrimario?: string;
  colorFondo?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  whatsapp?: string;
  horario?: string;
  redesSociales?: string;
  sriRuc?: string;
  sriRazonSocial?: string;
  sriEstablecimiento?: string;
  sriPuntoEmision?: string;
  sriDirMatriz?: string;
}

export interface ActualizarRestauranteInput {
  slug?: string;
  nombre?: string;
  nombreComercial?: string;
  descripcion?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  colorPrimario?: string;
  colorFondo?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  whatsapp?: string;
  horario?: string;
  redesSociales?: string;
  sriRuc?: string;
  sriRazonSocial?: string;
  sriEstablecimiento?: string;
  sriPuntoEmision?: string;
  sriDirMatriz?: string;
  activo?: boolean;
}

/**
 * Obtiene todos los restaurantes (para el panel SuperAdmin).
 */
export async function getTodosRestaurantes() {
  try {
    const list = await db
      .select()
      .from(restaurantes)
      .orderBy(desc(restaurantes.creadoEn));
    return list;
  } catch (error) {
    console.error("Error al obtener todos los restaurantes:", error);
    return [];
  }
}

/**
 * Obtiene un restaurante por su SLUG (para las webs públicas /r/[slug]).
 */
export async function getRestaurantePorSlug(slug: string) {
  try {
    const [rest] = await db
      .select()
      .from(restaurantes)
      .where(eq(restaurantes.slug, slug))
      .limit(1);
    return rest ?? null;
  } catch (error) {
    console.error("Error al buscar restaurante por slug:", error);
    return null;
  }
}

/**
 * Obtiene un restaurante por su ID.
 */
export async function getRestaurantePorId(id: number) {
  try {
    const [rest] = await db
      .select()
      .from(restaurantes)
      .where(eq(restaurantes.id, id))
      .limit(1);
    return rest ?? null;
  } catch (error) {
    console.error("Error al buscar restaurante por ID:", error);
    return null;
  }
}

/**
 * Crea un nuevo restaurante en la plataforma SaaS.
 */
export async function crearRestaurante(data: CrearRestauranteInput) {
  const result = await db.insert(restaurantes).values({
    slug: data.slug.toLowerCase().trim(),
    nombre: data.nombre.trim(),
    nombreComercial: data.nombreComercial ?? null,
    descripcion: data.descripcion ?? null,
    logoUrl: data.logoUrl ?? "/images/logo-roma.jpg",
    heroImageUrl: data.heroImageUrl ?? "/images/hero-pizza.jpg",
    colorPrimario: data.colorPrimario || "#c9a84c",
    colorFondo: data.colorFondo || "#0a0908",
    telefono: data.telefono ?? null,
    email: data.email ?? null,
    direccion: data.direccion ?? null,
    ciudad: data.ciudad ?? null,
    pais: data.pais || "Ecuador",
    whatsapp: data.whatsapp ?? null,
    horario: data.horario ?? null,
    redesSociales: data.redesSociales ?? null,
    sriRuc: data.sriRuc ?? null,
    sriRazonSocial: data.sriRazonSocial ?? null,
    sriEstablecimiento: data.sriEstablecimiento ?? "001",
    sriPuntoEmision: data.sriPuntoEmision ?? "001",
    sriDirMatriz: data.sriDirMatriz ?? null,
    activo: true,
  });

  return Number((result as any)[0]?.insertId ?? 0);
}

/**
 * Actualiza los datos de un restaurante.
 */
export async function actualizarRestaurante(
  id: number,
  data: ActualizarRestauranteInput
) {
  return await db
    .update(restaurantes)
    .set({
      ...(data.slug && { slug: data.slug.toLowerCase().trim() }),
      ...(data.nombre && { nombre: data.nombre.trim() }),
      ...(data.nombreComercial !== undefined && { nombreComercial: data.nombreComercial }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.heroImageUrl !== undefined && { heroImageUrl: data.heroImageUrl }),
      ...(data.colorPrimario !== undefined && { colorPrimario: data.colorPrimario }),
      ...(data.colorFondo !== undefined && { colorFondo: data.colorFondo }),
      ...(data.telefono !== undefined && { telefono: data.telefono }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.direccion !== undefined && { direccion: data.direccion }),
      ...(data.ciudad !== undefined && { ciudad: data.ciudad }),
      ...(data.pais !== undefined && { pais: data.pais }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.horario !== undefined && { horario: data.horario }),
      ...(data.redesSociales !== undefined && { redesSociales: data.redesSociales }),
      ...(data.sriRuc !== undefined && { sriRuc: data.sriRuc }),
      ...(data.sriRazonSocial !== undefined && { sriRazonSocial: data.sriRazonSocial }),
      ...(data.sriEstablecimiento !== undefined && { sriEstablecimiento: data.sriEstablecimiento }),
      ...(data.sriPuntoEmision !== undefined && { sriPuntoEmision: data.sriPuntoEmision }),
      ...(data.sriDirMatriz !== undefined && { sriDirMatriz: data.sriDirMatriz }),
      ...(data.activo !== undefined && { activo: data.activo }),
    })
    .where(eq(restaurantes.id, id));
}

/**
 * Métricas globales para el Dashboard del Super Administrador SaaS.
 */
export async function getSuperAdminDashboardMetrics() {
  try {
    const [totalRests] = await db
      .select({ count: sql<number>`count(*)` })
      .from(restaurantes);

    const [restsActivos] = await db
      .select({ count: sql<number>`count(*)` })
      .from(restaurantes)
      .where(eq(restaurantes.activo, true));

    const [totalPedidos] = await db
      .select({
        count: sql<number>`count(*)`,
        totalIngresos: sql<number>`COALESCE(SUM(CAST(${pedidos.total} AS DECIMAL(10,2))), 0)`,
      })
      .from(pedidos);

    const [totalPlatos] = await db
      .select({ count: sql<number>`count(*)` })
      .from(platos);

    const [totalClientes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientes);

    const [totalFacturas] = await db
      .select({ count: sql<number>`count(*)` })
      .from(facturas);

    const ultimosRestaurantes = await db
      .select()
      .from(restaurantes)
      .orderBy(desc(restaurantes.creadoEn))
      .limit(6);

    return {
      totalRestaurantes: Number(totalRests?.count || 0),
      restaurantesActivos: Number(restsActivos?.count || 0),
      totalPedidosGlobal: Number(totalPedidos?.count || 0),
      ingresosGlobales: Number(totalPedidos?.totalIngresos || 0),
      totalPlatosGlobal: Number(totalPlatos?.count || 0),
      totalClientesGlobal: Number(totalClientes?.count || 0),
      totalFacturasGlobal: Number(totalFacturas?.count || 0),
      ultimosRestaurantes,
    };
  } catch (error) {
    console.error("Error al obtener métricas de SuperAdmin:", error);
    return {
      totalRestaurantes: 0,
      restaurantesActivos: 0,
      totalPedidosGlobal: 0,
      ingresosGlobales: 0,
      totalPlatosGlobal: 0,
      totalClientesGlobal: 0,
      totalFacturasGlobal: 0,
      ultimosRestaurantes: [],
    };
  }
}

/**
 * Obtiene el usuario administrador asignado a un restaurante.
 */
export async function getUsuarioAdminPorRestaurante(restauranteId: number) {
  try {
    const [user] = await db
      .select({
        id: usuariosAdmin.id,
        nombre: usuariosAdmin.nombre,
        email: usuariosAdmin.email,
        rol: usuariosAdmin.rol,
        restauranteId: usuariosAdmin.restauranteId,
      })
      .from(usuariosAdmin)
      .where(eq(usuariosAdmin.restauranteId, restauranteId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Error getUsuarioAdminPorRestaurante:", error);
    return null;
  }
}

/**
 * Crea o actualiza el usuario administrador de un restaurante.
 */
export async function upsertUsuarioAdminRestaurante(data: {
  restauranteId: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol?: "owner" | "caja" | "cocina" | "super_admin";
}) {
  const existing = await getUsuarioAdminPorRestaurante(data.restauranteId);

  if (existing) {
    await db
      .update(usuariosAdmin)
      .set({
        nombre: data.nombre.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
        rol: data.rol || "owner",
      })
      .where(eq(usuariosAdmin.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(usuariosAdmin).values({
      restauranteId: data.restauranteId,
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      rol: data.rol || "owner",
    });
    return Number((result as any)[0]?.insertId ?? 0);
  }
}

