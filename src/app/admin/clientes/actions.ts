"use server";

import { registrarCliente } from "@/db/queries/clientes";
import { revalidatePath } from "next/cache";

export async function crearClienteAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const telefono = formData.get("telefono") as string;
  const email = formData.get("email") as string;

  if (!nombre) return;

  const randomNum = Math.floor(100 + Math.random() * 900);
  const numeroCliente = `cliente-${randomNum}`;

  await registrarCliente({
    numeroCliente,
    nombre,
    telefono,
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

