import "server-only";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://178.238.238.158:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "42a447c1-3d74-4b52-9571-042c174f7621";
const INSTANCE_NAME = "roma_restaurante";
const NUMERO_NOTIFICACION = "593963410409"; // +593 96 341 0409

/**
 * Obtiene el estado de conexión de la instancia de WhatsApp en Evolution API.
 */
export async function getEstadoConexionWhatsApp() {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${INSTANCE_NAME}`, {
      headers: {
        apikey: EVOLUTION_API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { state: "disconnected", instance: INSTANCE_NAME };
    }

    const data = await res.json();
    return {
      state: data?.instance?.state || data?.state || "disconnected",
      instance: INSTANCE_NAME,
    };
  } catch (error) {
    console.error("Error al consultar estado de WhatsApp Evolution API:", error);
    return { state: "error", instance: INSTANCE_NAME };
  }
}

/**
 * Obtiene el código QR para conectar WhatsApp a Evolution API.
 */
export async function getQRCodeWhatsApp() {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${INSTANCE_NAME}`, {
      headers: {
        apikey: EVOLUTION_API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // Intentar crear la instancia si no existiese
      return null;
    }

    const data = await res.json();
    return {
      base64: data?.base64 || data?.qrcode?.base64 || null,
      code: data?.code || data?.qrcode?.code || null,
      pairingCode: data?.pairingCode || null,
    };
  } catch (error) {
    console.error("Error al obtener QR de WhatsApp Evolution API:", error);
    return null;
  }
}

/**
 * Envía un mensaje de texto por WhatsApp mediante Evolution API.
 */
export async function enviarMensajeWhatsApp(numero: string, texto: string) {
  try {
    // Normalizar número (quitar +, espacios, guiones)
    const numeroLimpio = numero.replace(/\D/g, "");

    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: "POST",
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: numeroLimpio,
        text: texto,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error al enviar mensaje por Evolution API (${res.status}):`, errorText);
      return { success: false, error: errorText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Excepción al enviar WhatsApp por Evolution API:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Notificación automática a gerencia (+593 96 341 0409) cuando un cliente califica con 1, 2 o 3 estrellas.
 */
export async function enviarAlertaResenaCritica(params: {
  clienteNombre?: string | null;
  clienteTelefono?: string | null;
  calificacion: number;
  comentario?: string | null;
  platFavorito?: string | null;
}) {
  if (params.calificacion > 3) return; // Solo 1, 2 o 3 estrellas

  const estrellasTexto = "⭐".repeat(params.calificacion);
  const fechaHora = new Date().toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const mensaje = [
    `🚨 *ALERTA DE SATISFACCIÓN - ROMA PIZZERÍA*`,
    ``,
    `Se ha registrado una opinión de atención con calificación baja en el sistema.`,
    ``,
    `⭐ *Calificación:* ${params.calificacion} / 5 (${estrellasTexto})`,
    `👤 *Cliente:* ${params.clienteNombre || "Cliente no identificado"}`,
    `📱 *Teléfono:* ${params.clienteTelefono || "No proporcionado"}`,
    params.platFavorito ? `🍕 *Plato Consumido:* ${params.platFavorito}` : null,
    `📝 *Comentario / Motivo:*`,
    `"${params.comentario || "Sin comentario adicional"}"`,
    ``,
    `🕒 *Fecha y Hora:* ${fechaHora}`,
    ``,
    `⚠️ _Acción sugerida: Se recomienda recontactar al cliente para brindarle una solución inmediata y recuperar su confianza._`,
  ]
    .filter(Boolean)
    .join("\n");

  return await enviarMensajeWhatsApp(NUMERO_NOTIFICACION, mensaje);
}
