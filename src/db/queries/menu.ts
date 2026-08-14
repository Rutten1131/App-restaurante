import "server-only";
import { db } from "@/db";
import { categorias, platos } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface CrearPlatoInput {
  nombre: string;
  descripcion?: string;
  precio: string;
  categoriaId?: number | null;
  imagenUrl?: string;
  videoUrl?: string;
  disponible?: boolean;
}

export interface ActualizarPlatoInput {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  categoriaId?: number | null;
  imagenUrl?: string;
  videoUrl?: string;
  disponible?: boolean;
}

/**
 * Obtiene todas las categorías ordenadas por `orden`, incluyendo sus platos disponibles.
 * Usa JOIN estándar compatible con MariaDB (sin LATERAL).
 */
export async function getMenuCompleto() {
  // 1. Obtener todas las categorías
  const cats = await db
    .select()
    .from(categorias)
    .orderBy(asc(categorias.orden), asc(categorias.id));

  // 2. Obtener todos los platos disponibles con su categoría
  const platosDisponibles = await db
    .select()
    .from(platos)
    .where(eq(platos.disponible, true))
    .orderBy(desc(platos.creadoEn));

  // 3. Agrupar platos por categoría manualmente
  const result = cats.map((cat) => ({
    ...cat,
    platos: platosDisponibles.filter((p) => p.categoriaId === cat.id),
  }));

  return result;
}

/**
 * Obtiene los platos disponibles más recientes (destacados para el homepage).
 * Usa LEFT JOIN estándar compatible con MariaDB.
 */
export async function getPlatosDestacados(limit = 4) {
  const items = await db
    .select({
      id: platos.id,
      categoriaId: platos.categoriaId,
      nombre: platos.nombre,
      descripcion: platos.descripcion,
      precio: platos.precio,
      imagenUrl: platos.imagenUrl,
      videoUrl: platos.videoUrl,
      disponible: platos.disponible,
      creadoEn: platos.creadoEn,
      categoriaNombre: categorias.nombre,
      categoriaOrden: categorias.orden,
      categoriaIdRef: categorias.id,
    })
    .from(platos)
    .leftJoin(categorias, eq(platos.categoriaId, categorias.id))
    .where(eq(platos.disponible, true))
    .orderBy(desc(platos.creadoEn))
    .limit(limit);

  // Reestructurar para mantener la misma interfaz que antes
  return items.map((row) => ({
    id: row.id,
    categoriaId: row.categoriaId,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: row.precio,
    imagenUrl: row.imagenUrl,
    videoUrl: row.videoUrl,
    disponible: row.disponible,
    creadoEn: row.creadoEn,
    categoria: row.categoriaIdRef
      ? {
          id: row.categoriaIdRef,
          nombre: row.categoriaNombre,
          orden: row.categoriaOrden,
        }
      : null,
  }));
}

/**
 * Obtiene todas las categorías disponibles.
 */
export async function getCategorias() {
  return await db.select().from(categorias).orderBy(asc(categorias.orden), asc(categorias.id));
}

/**
 * Obtiene todos los platos para el panel de administración (incluyendo inactivos).
 * Usa LEFT JOIN estándar compatible con MariaDB.
 */
export async function getPlatosAdmin() {
  const items = await db
    .select({
      id: platos.id,
      categoriaId: platos.categoriaId,
      nombre: platos.nombre,
      descripcion: platos.descripcion,
      precio: platos.precio,
      imagenUrl: platos.imagenUrl,
      videoUrl: platos.videoUrl,
      disponible: platos.disponible,
      creadoEn: platos.creadoEn,
      categoriaNombre: categorias.nombre,
      categoriaOrden: categorias.orden,
      categoriaIdRef: categorias.id,
    })
    .from(platos)
    .leftJoin(categorias, eq(platos.categoriaId, categorias.id))
    .orderBy(desc(platos.creadoEn));

  return items.map((row) => ({
    id: row.id,
    categoriaId: row.categoriaId,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: row.precio,
    imagenUrl: row.imagenUrl,
    videoUrl: row.videoUrl,
    disponible: row.disponible,
    creadoEn: row.creadoEn,
    categoria: row.categoriaIdRef
      ? {
          id: row.categoriaIdRef,
          nombre: row.categoriaNombre,
          orden: row.categoriaOrden,
        }
      : null,
  }));
}

/**
 * Inserta un nuevo plato en la base de datos.
 */
export async function crearPlato(data: CrearPlatoInput) {
  const result = await db.insert(platos).values({
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    precio: data.precio,
    categoriaId: data.categoriaId ?? null,
    imagenUrl: data.imagenUrl ?? null,
    videoUrl: data.videoUrl ?? null,
    disponible: data.disponible ?? true,
  });

  return result;
}

/**
 * Actualiza los datos de un plato existente.
 */
export async function actualizarPlato(id: number, data: ActualizarPlatoInput) {
  const result = await db
    .update(platos)
    .set({
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.precio !== undefined && { precio: data.precio }),
      ...(data.categoriaId !== undefined && { categoriaId: data.categoriaId }),
      ...(data.imagenUrl !== undefined && { imagenUrl: data.imagenUrl }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.disponible !== undefined && { disponible: data.disponible }),
    })
    .where(eq(platos.id, id));

  return result;
}

/**
 * Elimina un plato por su ID.
 */
export async function eliminarPlato(id: number) {
  return await db.delete(platos).where(eq(platos.id, id));
}

/**
 * Alterna el estado disponible de un plato.
 */
export async function toggleDisponible(id: number) {
  const [plato] = await db
    .select({ disponible: platos.disponible })
    .from(platos)
    .where(eq(platos.id, id))
    .limit(1);

  if (!plato) {
    throw new Error(`Plato con id ${id} no encontrado`);
  }

  const nuevoEstado = !plato.disponible;
  await db
    .update(platos)
    .set({ disponible: nuevoEstado })
    .where(eq(platos.id, id));

  return nuevoEstado;
}

/**
 * Crea una nueva categoría.
 */
export async function crearCategoria(nombre: string, orden = 0) {
  const result = await db.insert(categorias).values({
    nombre,
    orden,
  });

  return result;
}
