"use server";

import { revalidatePath } from "next/cache";
import {
  crearPlato,
  actualizarPlato,
  eliminarPlato,
  toggleDisponible,
  crearCategoria,
} from "@/db/queries/menu";
import {
  sincronizarRecetaPlato,
  crearInsumo,
} from "@/db/queries/inventario";

import { getAdminSession } from "@/lib/auth";

export async function crearPlatoAction(formData: FormData) {
  const session = await getAdminSession();
  const restauranteId = session?.restauranteId ?? 1;

  const nombre = formData.get("nombre") as string;
  const descripcion = (formData.get("descripcion") as string) || undefined;
  const precio = formData.get("precio") as string;
  const categoriaIdRaw = formData.get("categoriaId") as string;
  const imagenUrl = (formData.get("imagenUrl") as string) || undefined;
  const videoUrl = (formData.get("videoUrl") as string) || undefined;
  const disponible = formData.get("disponible") === "true";
  const recetaJson = formData.get("recetaJson") as string;

  if (!nombre || !precio) {
    throw new Error("Nombre y precio son obligatorios");
  }

  const categoriaId = categoriaIdRaw ? parseInt(categoriaIdRaw, 10) : undefined;

  const platoId = await crearPlato({
    restauranteId,
    nombre,
    descripcion,
    precio,
    categoriaId: isNaN(categoriaId!) ? undefined : categoriaId,
    imagenUrl,
    videoUrl,
    disponible,
  });

  // Guardar receta si se enviaron insumos
  if (platoId && recetaJson) {
    try {
      const items = JSON.parse(recetaJson);
      if (Array.isArray(items)) {
        await sincronizarRecetaPlato(platoId, items);
      }
    } catch (e) {
      console.error("Error al parsear recetaJson en crearPlatoAction:", e);
    }
  }

  revalidatePath("/admin/menu");
  revalidatePath("/admin/inventario");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
  if (session?.restauranteSlug) {
    revalidatePath(`/r/${session.restauranteSlug}`);
    revalidatePath(`/r/${session.restauranteSlug}/menu`);
  }

  return { success: true, platoId };
}

export async function actualizarPlatoAction(formData: FormData) {
  const idRaw = formData.get("id") as string;
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) throw new Error("ID inválido");

  const nombre = (formData.get("nombre") as string) || undefined;
  const descripcion = (formData.get("descripcion") as string) || undefined;
  const precio = (formData.get("precio") as string) || undefined;
  const categoriaIdRaw = formData.get("categoriaId") as string;
  const imagenUrl = (formData.get("imagenUrl") as string) || undefined;
  const videoUrl = (formData.get("videoUrl") as string) || undefined;
  const disponibleRaw = formData.get("disponible") as string;
  const recetaJson = formData.get("recetaJson") as string;

  const categoriaId = categoriaIdRaw ? parseInt(categoriaIdRaw, 10) : undefined;
  const disponible = disponibleRaw !== null && disponibleRaw !== undefined ? disponibleRaw === "true" : undefined;

  await actualizarPlato(id, {
    nombre,
    descripcion,
    precio,
    categoriaId: isNaN(categoriaId!) ? undefined : categoriaId,
    imagenUrl,
    videoUrl,
    disponible,
  });

  // Sincronizar receta
  if (recetaJson !== undefined && recetaJson !== null) {
    try {
      const items = JSON.parse(recetaJson);
      if (Array.isArray(items)) {
        await sincronizarRecetaPlato(id, items);
      }
    } catch (e) {
      console.error("Error al parsear recetaJson en actualizarPlatoAction:", e);
    }
  }

  revalidatePath("/admin/menu");
  revalidatePath("/admin/inventario");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
  return { success: true };
}

export async function guardarRecetaPlatoAction(formData: FormData) {
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
    revalidatePath("/admin/menu");
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (error: any) {
    console.error("Error guardarRecetaPlatoAction:", error);
    return { error: error.message || "Error al guardar receta" };
  }
}

export async function crearInsumoRapidoAction(formData: FormData) {
  const session = await getAdminSession();
  const restauranteId = session?.restauranteId ?? 1;

  const nombre = (formData.get("nombre") as string)?.trim();
  const unidad = (formData.get("unidad") as string)?.trim() || "unidades";
  const stockActual = (formData.get("stockActual") as string)?.trim() || "0.00";
  const stockMinimo = (formData.get("stockMinimo") as string)?.trim() || "0.00";

  if (!nombre) {
    return { error: "El nombre del insumo es obligatorio" };
  }

  try {
    const result = await crearInsumo({
      restauranteId,
      nombre,
      unidad,
      stockActual,
      stockMinimo,
    });

    const newId = Number((result as any)[0]?.insertId ?? 0);

    revalidatePath("/admin/menu");
    revalidatePath("/admin/inventario");

    return {
      success: true,
      insumo: {
        id: newId,
        nombre,
        unidad,
        stockActual,
        stockMinimo,
      },
    };
  } catch (error: any) {
    console.error("Error crearInsumoRapidoAction:", error);
    return { error: error.message || "Error al crear insumo" };
  }
}

export async function eliminarPlatoAction(formData: FormData) {
  const idRaw = formData.get("id") as string;
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) throw new Error("ID inválido");

  await eliminarPlato(id);

  revalidatePath("/admin/menu");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function toggleDisponibleAction(formData: FormData) {
  const idRaw = formData.get("id") as string;
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) throw new Error("ID inválido");

  await toggleDisponible(id);

  revalidatePath("/admin/menu");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function crearCategoriaAction(formData: FormData) {
  const session = await getAdminSession();
  const restauranteId = session?.restauranteId ?? 1;

  const nombre = formData.get("nombre") as string;
  const ordenRaw = formData.get("orden") as string;

  if (!nombre) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const orden = ordenRaw ? parseInt(ordenRaw, 10) : 0;
  await crearCategoria(nombre, isNaN(orden) ? 0 : orden, restauranteId);

  revalidatePath("/admin/menu");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
  if (session?.restauranteSlug) {
    revalidatePath(`/r/${session.restauranteSlug}`);
    revalidatePath(`/r/${session.restauranteSlug}/menu`);
  }
}

export async function guardarConfiguracionMesasAction(formData: FormData) {
  const { setConfiguracion } = await import("@/db/queries/fidelizacion");
  const totalMesasRaw = formData.get("totalMesas") as string;
  const totalMesas = parseInt(totalMesasRaw, 10);
  
  const valorFinal = isNaN(totalMesas) || totalMesas < 1 ? 12 : Math.min(totalMesas, 50);
  await setConfiguracion("total_mesas", String(valorFinal));

  revalidatePath("/admin/menu");
  revalidatePath("/admin/pedidos");
  revalidatePath("/app/menu");
  return { success: true, totalMesas: valorFinal };
}

