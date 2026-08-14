"use server";

import {
  upsertClienteFidelizacion,
  insertarEncuesta,
  insertarResena,
} from "@/db/queries/fidelizacion";
import { revalidatePath } from "next/cache";

type ActionResult<T = object> = T | { error: string };

/**
 * Paso 1 – Guardar datos básicos del cliente.
 * Devuelve clienteId para usar en los siguientes pasos.
 */
export async function registrarClienteAction(
  formData: FormData
): Promise<ActionResult<{ clienteId: number; isNew: boolean }>> {
  const nombre = (formData.get("nombre") as string)?.trim();
  const telefono = (formData.get("telefono") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const cumpleanios = (formData.get("cumpleanios") as string)?.trim() || null;

  if (!nombre || !telefono) {
    return { error: "Nombre y teléfono son obligatorios." };
  }

  try {
    const clienteId = await upsertClienteFidelizacion({
      nombre,
      telefono,
      email,
      cumpleanios,
    });

    revalidatePath("/admin/clientes");
    revalidatePath("/admin");

    return { clienteId, isNew: true };
  } catch (err) {
    console.error("Error registrarClienteAction:", err);
    return { error: "No pudimos guardar tus datos. Intenta de nuevo." };
  }
}

/**
 * Paso 2 (solo QR fidelización) – Guardar respuestas de la encuesta.
 */
export async function guardarEncuestaAction(
  formData: FormData
): Promise<ActionResult<{ ok: true }>> {
  const clienteId = Number(formData.get("clienteId"));
  if (!clienteId) return { error: "Sesión inválida. Vuelve al paso 1." };

  try {
    await insertarEncuesta({
      clienteId,
      platFavorito: (formData.get("platFavorito") as string) || null,
      frecuenciaVisita: (formData.get("frecuenciaVisita") as string) || null,
      comoNosConocio: (formData.get("comoNosConocio") as string) || null,
      ocasionVisita: (formData.get("ocasionVisita") as string) || null,
      nosRecomendaria: formData.get("nosRecomendaria") !== "no",
      sugerencias: (formData.get("sugerencias") as string) || null,
    });

    return { ok: true };
  } catch (err) {
    console.error("Error guardarEncuestaAction:", err);
    return { error: "Error al guardar la encuesta. Intenta de nuevo." };
  }
}

/**
 * Paso 3 (fidelización) / Paso 2 (reseña) – Guardar calificación del servicio.
 */
export async function guardarResenaAction(
  formData: FormData
): Promise<ActionResult<{ ok: true; calificacion: number }>> {
  const clienteId = Number(formData.get("clienteId")) || null;
  const calificacion = Number(formData.get("calificacion"));
  const comentario = (formData.get("comentario") as string)?.trim() || null;

  if (!calificacion || calificacion < 1 || calificacion > 5) {
    return { error: "Por favor selecciona una calificación." };
  }

  try {
    await insertarResena({ clienteId, calificacion, comentario });

    revalidatePath("/admin/clientes");
    revalidatePath("/admin");

    return { ok: true, calificacion };
  } catch (err) {
    console.error("Error guardarResenaAction:", err);
    return { error: "Error al guardar calificación. Intenta de nuevo." };
  }
}
