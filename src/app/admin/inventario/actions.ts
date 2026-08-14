"use server";

import { crearInsumo, registrarAjusteStock } from "@/db/queries/inventario";
import { revalidatePath } from "next/cache";

export async function crearInsumoAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const unidad = formData.get("unidad") as string;
  const stockActual = formData.get("stockActual") as string;
  const stockMinimo = formData.get("stockMinimo") as string;

  if (!nombre || !unidad) return;

  await crearInsumo({
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
