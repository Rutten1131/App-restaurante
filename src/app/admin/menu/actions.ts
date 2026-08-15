"use server";

import { revalidatePath } from "next/cache";
import {
  crearPlato,
  actualizarPlato,
  eliminarPlato,
  toggleDisponible,
  crearCategoria,
} from "@/db/queries/menu";

export async function crearPlatoAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const descripcion = (formData.get("descripcion") as string) || undefined;
  const precio = formData.get("precio") as string;
  const categoriaIdRaw = formData.get("categoriaId") as string;
  const imagenUrl = (formData.get("imagenUrl") as string) || undefined;
  const videoUrl = (formData.get("videoUrl") as string) || undefined;
  const disponible = formData.get("disponible") === "true";

  if (!nombre || !precio) {
    throw new Error("Nombre y precio son obligatorios");
  }

  const categoriaId = categoriaIdRaw ? parseInt(categoriaIdRaw, 10) : undefined;

  await crearPlato({
    nombre,
    descripcion,
    precio,
    categoriaId: isNaN(categoriaId!) ? undefined : categoriaId,
    imagenUrl,
    videoUrl,
    disponible,
  });

  revalidatePath("/admin/menu");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
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

  revalidatePath("/admin/menu");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
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
  const nombre = formData.get("nombre") as string;
  const ordenRaw = formData.get("orden") as string;

  if (!nombre) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const orden = ordenRaw ? parseInt(ordenRaw, 10) : 0;
  await crearCategoria(nombre, isNaN(orden) ? 0 : orden);

  revalidatePath("/admin/menu");
  revalidatePath("/app/menu");
  revalidatePath("/app/mesa");
  revalidatePath("/menu");
  revalidatePath("/");
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

