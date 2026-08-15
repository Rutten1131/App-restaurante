import "server-only";
import { db } from "@/db";
import { clientes, alertasFidelizacion, resenas, encuestas } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getClientesConAlertas() {
  try {
    const listaClientes = await db
      .select({
        id: clientes.id,
        numeroCliente: clientes.numeroCliente,
        nombre: clientes.nombre,
        telefono: clientes.telefono,
        email: clientes.email,
        cumpleanios: clientes.cumpleanios,
        creadoEn: clientes.creadoEn,
        ultimaVisita: clientes.ultimaVisita,
        // Datos de encuesta si existe
        encuestaId: encuestas.id,
        platFavorito: encuestas.platFavorito,
        frecuenciaVisita: encuestas.frecuenciaVisita,
        comoNosConocio: encuestas.comoNosConocio,
        ocasionVisita: encuestas.ocasionVisita,
        nosRecomendaria: encuestas.nosRecomendaria,
        sugerencias: encuestas.sugerencias,
        pizzaPromoReclamada: encuestas.pizzaPromoReclamada,
      })
      .from(clientes)
      .leftJoin(encuestas, eq(clientes.id, encuestas.clienteId))
      .orderBy(desc(clientes.creadoEn));

    const alertas = await db
      .select()
      .from(alertasFidelizacion)
      .where(eq(alertasFidelizacion.estado, "pendiente"))
      .orderBy(desc(alertasFidelizacion.diasSinVolver));

    const listaResenas = await db
      .select({
        id: resenas.id,
        clienteId: resenas.clienteId,
        calificacion: resenas.calificacion,
        comentario: resenas.comentario,
        esPublica: resenas.esPublica,
        creadaEn: resenas.creadaEn,
        clienteNombre: clientes.nombre,
        clienteTelefono: clientes.telefono,
        clienteEmail: clientes.email,
        // Datos de encuesta vinculados al cliente
        platFavorito: encuestas.platFavorito,
        frecuenciaVisita: encuestas.frecuenciaVisita,
        comoNosConocio: encuestas.comoNosConocio,
        ocasionVisita: encuestas.ocasionVisita,
        nosRecomendaria: encuestas.nosRecomendaria,
        sugerencias: encuestas.sugerencias,
        pizzaPromoReclamada: encuestas.pizzaPromoReclamada,
      })
      .from(resenas)
      .leftJoin(clientes, eq(resenas.clienteId, clientes.id))
      .leftJoin(encuestas, eq(clientes.id, encuestas.clienteId))
      .orderBy(desc(resenas.creadaEn))
      .limit(50);

    return {
      clientes: listaClientes,
      alertas: alertas,
      resenas: listaResenas,
    };
  } catch (error) {
    console.error("Error al obtener clientes y reseñas:", error);
    return { clientes: [], alertas: [], resenas: [] };
  }
}

export async function registrarCliente(data: {
  numeroCliente: string;
  nombre: string;
  telefono?: string;
  email?: string;
  cumpleanios?: string;
}) {
  return await db.insert(clientes).values({
    numeroCliente: data.numeroCliente,
    nombre: data.nombre,
    telefono: data.telefono || null,
    email: data.email || null,
  });
}
