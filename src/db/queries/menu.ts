import "server-only";
import { db } from "@/db";
import { categorias, platos } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export interface CrearPlatoInput {
  restauranteId?: number;
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
 * Obtiene todas las categorías ordenadas por `orden`, incluyendo sus platos disponibles para un restaurante dado.
 */
export async function getMenuCompleto(restauranteId = 1) {
  // 1. Obtener todas las categorías del restaurante
  const cats = await db
    .select()
    .from(categorias)
    .where(eq(categorias.restauranteId, restauranteId))
    .orderBy(asc(categorias.orden), asc(categorias.id));

  // 2. Obtener todos los platos disponibles con su categoría
  const platosDisponibles = await db
    .select()
    .from(platos)
    .where(
      and(
        eq(platos.restauranteId, restauranteId),
        eq(platos.disponible, true)
      )
    )
    .orderBy(desc(platos.creadoEn));

  // 3. Agrupar platos por categoría manualmente
  const result = cats.map((cat) => ({
    ...cat,
    platos: platosDisponibles.filter((p) => p.categoriaId === cat.id),
  }));

  return result;
}

/**
 * Obtiene los platos disponibles más recientes (destacados para el homepage) por restaurante.
 */
export async function getPlatosDestacados(limit = 4, restauranteId = 1) {
  const items = await db
    .select({
      id: platos.id,
      restauranteId: platos.restauranteId,
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
    .where(
      and(
        eq(platos.restauranteId, restauranteId),
        eq(platos.disponible, true)
      )
    )
    .orderBy(desc(platos.creadoEn))
    .limit(limit);

  return items.map((row) => ({
    id: row.id,
    restauranteId: row.restauranteId,
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
 * Obtiene todas las categorías disponibles de un restaurante.
 */
export async function getCategorias(restauranteId = 1) {
  return await db
    .select()
    .from(categorias)
    .where(eq(categorias.restauranteId, restauranteId))
    .orderBy(asc(categorias.orden), asc(categorias.id));
}

/**
 * Obtiene todos los platos para el panel de administración (incluyendo inactivos) por restaurante.
 */
export async function getPlatosAdmin(restauranteId = 1) {
  const items = await db
    .select({
      id: platos.id,
      restauranteId: platos.restauranteId,
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
    .where(eq(platos.restauranteId, restauranteId))
    .orderBy(desc(platos.creadoEn));

  return items.map((row) => ({
    id: row.id,
    restauranteId: row.restauranteId,
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
 * Inserta un nuevo plato en la base de datos asociado a un restaurante.
 */
export async function crearPlato(data: CrearPlatoInput) {
  const result = await db.insert(platos).values({
    restauranteId: data.restauranteId ?? 1,
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    precio: data.precio,
    categoriaId: data.categoriaId ?? null,
    imagenUrl: data.imagenUrl ?? null,
    videoUrl: data.videoUrl ?? null,
    disponible: data.disponible ?? true,
  });

  return Number((result as any)[0]?.insertId ?? 0);
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
 * Crea una nueva categoría para un restaurante.
 */
export async function crearCategoria(nombre: string, orden = 0, restauranteId = 1) {
  const result = await db.insert(categorias).values({
    restauranteId,
    nombre,
    orden,
  });

  return result;
}

export interface BulkCategoriaItem {
  categoria: string;
  platos: {
    nombre: string;
    precio: number | string;
    descripcion?: string;
    imagenUrl?: string;
    disponible?: boolean;
  }[];
}

/**
 * Importa categorías y platos masivamente para un restaurante a partir de un arreglo estructurado.
 */
export async function importarMenuMasivo(restauranteId: number, data: BulkCategoriaItem[]) {
  let platosInsertados = 0;
  let categoriasCreadas = 0;

  // Obtener categorías existentes del restaurante
  const existingCats = await db
    .select()
    .from(categorias)
    .where(eq(categorias.restauranteId, restauranteId));

  const catMap = new Map<string, number>();
  existingCats.forEach((c) => catMap.set(c.nombre.toLowerCase().trim(), c.id));

  let maxOrden = existingCats.reduce((max, c) => Math.max(max, c.orden || 0), 0);

  for (const catItem of data) {
    const catNombre = catItem.categoria.trim();
    if (!catNombre) continue;

    let catId = catMap.get(catNombre.toLowerCase());

    if (!catId) {
      maxOrden += 10;
      const resCat = await db.insert(categorias).values({
        restauranteId,
        nombre: catNombre,
        orden: maxOrden,
      });
      catId = Number((resCat as any)[0]?.insertId ?? 0);
      catMap.set(catNombre.toLowerCase(), catId);
      categoriasCreadas++;
    }

    if (Array.isArray(catItem.platos) && catItem.platos.length > 0) {
      for (const p of catItem.platos) {
        if (!p.nombre || !p.nombre.trim()) continue;
        const precioFormatted = Number(p.precio || 0).toFixed(2);

        await db.insert(platos).values({
          restauranteId,
          categoriaId: catId,
          nombre: p.nombre.trim(),
          descripcion: p.descripcion ? p.descripcion.trim() : null,
          precio: precioFormatted,
          imagenUrl: p.imagenUrl ? p.imagenUrl.trim() : null,
          disponible: p.disponible !== false,
        });
        platosInsertados++;
      }
    }
  }

  return { categoriasCreadas, platosInsertados };
}

