"use server";

import { cambiarEstadoPedido, EstadoPedido } from "@/db/queries/pedidos";
import { descontarStockPorPedido } from "@/db/queries/inventario";
import { revalidatePath } from "next/cache";

export async function cambiarEstadoAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const nuevoEstado = formData.get("estado") as EstadoPedido;

  if (!id || !nuevoEstado) return;

  await cambiarEstadoPedido(id, nuevoEstado);

  // Si entra a cocina o se prepara, descontar stock de insumos automáticamente
  if (nuevoEstado === "en_cocina" || nuevoEstado === "listo" || nuevoEstado === "entregado") {
    await descontarStockPorPedido(id);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
}
