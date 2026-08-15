"use server";

import { registrarCliente } from "@/db/queries/clientes";
import { buscarClientePorTelefono } from "@/db/queries/fidelizacion";
import { normalizarTelefono } from "@/lib/normalizarTelefono";
import { revalidatePath } from "next/cache";

export async function crearClienteAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const telefonoRaw = formData.get("telefono") as string;
  const email = formData.get("email") as string;

  if (!nombre) return;

  const telefonoNorm = normalizarTelefono(telefonoRaw);

  // Verificar si ya existe un cliente con ese teléfono (normalizado)
  if (telefonoNorm) {
    const existente = await buscarClientePorTelefono(telefonoNorm);
    if (existente) {
      // Ya existe, no duplicar
      revalidatePath("/admin/clientes");
      return;
    }
  }

  const randomNum = Math.floor(100 + Math.random() * 900);
  const numeroCliente = `cliente-${randomNum}`;

  await registrarCliente({
    numeroCliente,
    nombre,
    telefono: telefonoNorm || undefined,
    email,
  });

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
}

export async function guardarGoogleReviewUrlAction(formData: FormData) {
  const { setConfiguracion } = await import("@/db/queries/fidelizacion");
  const url = (formData.get("googleReviewUrl") as string)?.trim() || "";
  if (url) {
    await setConfiguracion("google_review_url", url);
    revalidatePath("/admin/clientes");
    revalidatePath("/fidelizacion");
  }
}
