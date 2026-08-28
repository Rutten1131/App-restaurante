import "server-only";
import { db } from "@/db";
import { insumos, movimientosInventario, recetaInsumos, itemsPedido, platos, categorias } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export async function getInsumosInventario(restauranteId = 1) {
  try {
    const listaInsumos = await db
      .select()
      .from(insumos)
      .where(eq(insumos.restauranteId, restauranteId))
      .orderBy(insumos.nombre);
    return listaInsumos;
  } catch (error) {
    console.error("Error al obtener insumos:", error);
    return [];
  }
}

export async function getRecetasPlatos(restauranteId = 1) {
  try {
    const rows = await db
      .select({
        recetaId: recetaInsumos.id,
        platoId: platos.id,
        platoNombre: platos.nombre,
        platoPrecio: platos.precio,
        categoriaNombre: categorias.nombre,
        insumoId: insumos.id,
        insumoNombre: insumos.nombre,
        unidad: insumos.unidad,
        cantidadUsada: recetaInsumos.cantidadUsada,
      })
      .from(platos)
      .leftJoin(recetaInsumos, eq(recetaInsumos.platoId, platos.id))
      .leftJoin(insumos, eq(recetaInsumos.insumoId, insumos.id))
      .leftJoin(categorias, eq(platos.categoriaId, categorias.id))
      .where(eq(platos.restauranteId, restauranteId))
      .orderBy(platos.nombre);

    // Agrupar por plato
    const recetasMap = new Map<number, {
      platoId: number;
      platoNombre: string;
      platoPrecio: string;
      categoriaNombre: string | null;
      insumos: {
        recetaId: number;
        insumoId: number;
        insumoNombre: string;
        unidad: string;
        cantidadUsada: string;
      }[];
    }>();

    for (const row of rows) {
      if (!recetasMap.has(row.platoId)) {
        recetasMap.set(row.platoId, {
          platoId: row.platoId,
          platoNombre: row.platoNombre,
          platoPrecio: row.platoPrecio,
          categoriaNombre: row.categoriaNombre,
          insumos: [],
        });
      }
      if (row.recetaId && row.insumoId && row.insumoNombre) {
        recetasMap.get(row.platoId)!.insumos.push({
          recetaId: row.recetaId,
          insumoId: row.insumoId,
          insumoNombre: row.insumoNombre,
          unidad: row.unidad || "unidades",
          cantidadUsada: row.cantidadUsada || "0",
        });
      }
    }

    return Array.from(recetasMap.values());
  } catch (error) {
    console.error("Error al obtener recetas de platos:", error);
    return [];
  }
}

export async function getMovimientosInventario(limit = 25, restauranteId = 1) {
  try {
    const movimientos = await db
      .select({
        id: movimientosInventario.id,
        tipo: movimientosInventario.tipo,
        cantidad: movimientosInventario.cantidad,
        pedidoId: movimientosInventario.pedidoId,
        creadoEn: movimientosInventario.creadoEn,
        insumoNombre: insumos.nombre,
        unidad: insumos.unidad,
      })
      .from(movimientosInventario)
      .innerJoin(insumos, eq(movimientosInventario.insumoId, insumos.id))
      .where(eq(insumos.restauranteId, restauranteId))
      .orderBy(desc(movimientosInventario.creadoEn))
      .limit(limit);

    return movimientos;
  } catch (error) {
    console.error("Error al obtener movimientos de inventario:", error);
    return [];
  }
}

export async function crearInsumo(data: {
  restauranteId?: number;
  nombre: string;
  unidad: string;
  stockActual: string;
  stockMinimo: string;
}) {
  return await db.insert(insumos).values({
    restauranteId: data.restauranteId ?? 1,
    nombre: data.nombre,
    unidad: data.unidad,
    stockActual: data.stockActual,
    stockMinimo: data.stockMinimo,
  });
}

export async function registrarAjusteStock(insumoId: number, nuevaCantidad: string) {
  return await db
    .update(insumos)
    .set({ stockActual: nuevaCantidad })
    .where(eq(insumos.id, insumoId));
}

export async function agregarInsumoReceta(data: {
  platoId: number;
  insumoId: number;
  cantidadUsada: string;
}) {
  return await db.insert(recetaInsumos).values({
    platoId: data.platoId,
    insumoId: data.insumoId,
    cantidadUsada: data.cantidadUsada,
  });
}

export async function eliminarInsumoReceta(recetaId: number) {
  return await db.delete(recetaInsumos).where(eq(recetaInsumos.id, recetaId));
}

/**
 * Sincroniza la receta completa de un plato (reemplaza o crea los insumos asignados).
 */
export async function sincronizarRecetaPlato(
  platoId: number,
  items: { insumoId: number; cantidadUsada: string | number }[]
) {
  // 1. Eliminar receta previa de este plato
  await db.delete(recetaInsumos).where(eq(recetaInsumos.platoId, platoId));

  // 2. Insertar los nuevos insumos
  if (items && Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      const cant = Number(item.cantidadUsada);
      if (item.insumoId && cant > 0) {
        await db.insert(recetaInsumos).values({
          platoId,
          insumoId: item.insumoId,
          cantidadUsada: String(cant),
        });
      }
    }
  }
}


/**
 * Descuenta automáticamente los insumos utilizados en una comanda
 * según las recetas registradas en receta_insumos.
 */
export async function descontarStockPorPedido(pedidoId: number) {
  try {
    // 1. Verificar si ya se procesó este pedido para evitar doble descuento
    const yaProcesado = await db
      .select({ id: movimientosInventario.id })
      .from(movimientosInventario)
      .where(
        and(
          eq(movimientosInventario.pedidoId, pedidoId),
          eq(movimientosInventario.tipo, "salida_venta")
        )
      )
      .limit(1);

    if (yaProcesado.length > 0) return;

    // 2. Obtener los items del pedido
    const items = await db
      .select({
        platoId: itemsPedido.platoId,
        cantidad: itemsPedido.cantidad,
      })
      .from(itemsPedido)
      .where(eq(itemsPedido.pedidoId, pedidoId));

    for (const item of items) {
      // 3. Obtener los insumos de la receta de este plato
      const recetas = await db
        .select({
          insumoId: recetaInsumos.insumoId,
          cantidadUsada: recetaInsumos.cantidadUsada,
        })
        .from(recetaInsumos)
        .where(eq(recetaInsumos.platoId, item.platoId));

      for (const rec of recetas) {
        const totalADescontar = Number(rec.cantidadUsada) * item.cantidad;

        // Descontar del stock del insumo
        await db
          .update(insumos)
          .set({
            stockActual: sql`GREATEST(0, CAST(${insumos.stockActual} AS DECIMAL(10,2)) - ${totalADescontar})`,
          })
          .where(eq(insumos.id, rec.insumoId));

        // Registrar movimiento
        await db.insert(movimientosInventario).values({
          insumoId: rec.insumoId,
          tipo: "salida_venta",
          cantidad: String(totalADescontar.toFixed(2)),
          pedidoId,
        });
      }
    }
  } catch (error) {
    console.error("Error al descontar stock por pedido:", error);
  }
}
