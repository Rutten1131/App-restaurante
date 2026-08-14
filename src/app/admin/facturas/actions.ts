"use server";

import { emitirFacturaComanda } from "@/db/queries/facturas";
import { revalidatePath } from "next/cache";

export async function emitirFacturaAction(formData: FormData) {
  const pedidoId = Number(formData.get("pedidoId"));
  const clienteId = Number(formData.get("clienteId")) || null;
  const nombreCliente = (formData.get("nombreCliente") as string)?.trim() || "CONSUMIDOR FINAL";
  const identificacionCliente = (formData.get("identificacionCliente") as string)?.trim() || "9999999999999";
  const emailEnvioDestino = (formData.get("emailEnvioDestino") as string)?.trim() || null;
  const subtotal = Number(formData.get("subtotal")) || 0;
  const iva = Number(formData.get("iva")) || 0;
  const total = Number(formData.get("total")) || 0;
  const formaPago = (formData.get("formaPago") as string) || "01";

  if (!pedidoId || total <= 0) {
    return { error: "Datos de comanda inválidos." };
  }

  try {
    const facturaId = await emitirFacturaComanda({
      pedidoId,
      clienteId,
      nombreCliente,
      identificacionCliente,
      emailEnvioDestino,
      subtotal,
      iva,
      total,
      formaPago,
      estado: "simulada", // Inicialmente simulada hasta conectar el .p12 oficial
    });

    revalidatePath("/admin/facturas");
    revalidatePath("/admin");

    return { ok: true, facturaId };
  } catch (err) {
    console.error("Error emitirFacturaAction:", err);
    return { error: "Error al emitir el comprobante." };
  }
}
