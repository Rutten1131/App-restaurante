"use server";

import { crearInsumo, registrarAjusteStock } from "@/db/queries/inventario";
import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";

export async function crearInsumoAction(formData: FormData) {
  const session = await getAdminSession();
  const restauranteId = session?.restauranteId ?? 1;

  const nombre = formData.get("nombre") as string;
  const unidad = formData.get("unidad") as string;
  const stockActual = formData.get("stockActual") as string;
  const stockMinimo = formData.get("stockMinimo") as string;

  if (!nombre || !unidad) return;

  await crearInsumo({
    restauranteId,
    nombre,
    unidad,
    stockActual: stockActual || "0",
    stockMinimo: stockMinimo || "0",
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
}

export async function actualizarStockAction(formData: FormData) {
  const insumoId = Number(formData.get("insumoId"));
  const nuevaCantidad = formData.get("nuevaCantidad") as string;

  if (!insumoId || !nuevaCantidad) return;

  await registrarAjusteStock(insumoId, nuevaCantidad);
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
}

export async function guardarRecetaInventarioAction(formData: FormData) {
  const { sincronizarRecetaPlato } = await import("@/db/queries/inventario");
  const platoIdRaw = formData.get("platoId") as string;
  const platoId = parseInt(platoIdRaw, 10);
  if (isNaN(platoId)) throw new Error("ID de plato inválido");

  const recetaJson = formData.get("recetaJson") as string;
  if (!recetaJson) throw new Error("Datos de receta vacíos");

  try {
    const items = JSON.parse(recetaJson);
    if (Array.isArray(items)) {
      await sincronizarRecetaPlato(platoId, items);
    }
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: any) {
    console.error("Error guardarRecetaInventarioAction:", error);
    return { error: error.message || "Error al guardar receta" };
  }
}

export async function crearPlatoYRecetaAction(formData: FormData) {
  const session = await getAdminSession();
  const restauranteId = session?.restauranteId ?? 1;

  const { crearPlato } = await import("@/db/queries/menu");
  const { sincronizarRecetaPlato } = await import("@/db/queries/inventario");

  const nombre = (formData.get("nombre") as string)?.trim();
  const precio = (formData.get("precio") as string)?.trim() || "0.00";
  const descripcion = (formData.get("descripcion") as string)?.trim() || undefined;
  const recetaJson = (formData.get("recetaJson") as string)?.trim();

  if (!nombre) {
    return { error: "El nombre del plato es obligatorio" };
  }

  try {
    const platoId = await crearPlato({
      restauranteId,
      nombre,
      precio,
      descripcion,
      disponible: true,
    });

    if (platoId && recetaJson) {
      const items = JSON.parse(recetaJson);
      if (Array.isArray(items)) {
        await sincronizarRecetaPlato(platoId, items);
      }
    }

    revalidatePath("/admin/inventario");
    revalidatePath("/admin/menu");
    return { success: true, platoId };
  } catch (error: any) {
    console.error("Error crearPlatoYRecetaAction:", error);
    return { error: error.message || "Error al crear plato y receta" };
  }
}


