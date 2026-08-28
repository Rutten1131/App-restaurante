"use server";

import { registrarCliente } from "@/db/queries/clientes";
import { buscarClientePorTelefono } from "@/db/queries/fidelizacion";
import { normalizarTelefono } from "@/lib/normalizarTelefono";
import {
  getEstadoConexionWhatsApp,
  getQRCodeWhatsApp,
  enviarMensajeWhatsApp,
} from "@/lib/evolution/whatsapp";
import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";

export async function crearClienteAction(formData: FormData) {
  const session = await getAdminSession();
  const restauranteId = session?.restauranteId ?? 1;

  const nombre = formData.get("nombre") as string;
  const telefonoRaw = formData.get("telefono") as string;
  const email = formData.get("email") as string;

  if (!nombre) return;

  const telefonoNorm = normalizarTelefono(telefonoRaw);

  // Verificar si ya existe un cliente con ese teléfono (normalizado)
  if (telefonoNorm) {
    const existente = await buscarClientePorTelefono(telefonoNorm, restauranteId);
    if (existente) {
      // Ya existe, no duplicar
      revalidatePath("/admin/clientes");
      return;
    }
  }

  const randomNum = Math.floor(100 + Math.random() * 900);
  const numeroCliente = `cliente-${randomNum}`;

  await registrarCliente({
    restauranteId,
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

/**
 * Consulta el estado de conexión de WhatsApp en Evolution API.
 */
export async function consultarEstadoWhatsAppAction() {
  return await getEstadoConexionWhatsApp();
}

/**
 * Obtiene el código QR para conectar WhatsApp en Evolution API.
 */
export async function obtenerQRWhatsAppAction() {
  return await getQRCodeWhatsApp();
}

/**
 * Envía un mensaje de prueba a +593 96 341 0409.
 */
export async function enviarPruebaWhatsAppAction() {
  const mensaje = [
    `🍕 *ROMA PIZZERÍA - PRUEBA DE CONEXIÓN WHATSAPP*`,
    ``,
    `✅ La integración con Evolution API está conectada y funcionando correctamente.`,
    `🔔 Las opiniones críticas (1, 2 y 3 estrellas) llegarán a este número automáticamente en tiempo real.`,
    ``,
    `🕒 ${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC")}`,
  ].join("\n");

  return await enviarMensajeWhatsApp("593963410409", mensaje);
}
