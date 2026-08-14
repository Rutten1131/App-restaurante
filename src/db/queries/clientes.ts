import "server-only";
import { db } from "@/db";
import { clientes, alertasFidelizacion, resenas } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getClientesConAlertas() {
  try {
    const listaClientes = await db
      .select()
      .from(clientes)
      .orderBy(desc(clientes.creadoEn));

    const alertas = await db
      .select()
      .from(alertasFidelizacion)
      .where(eq(alertasFidelizacion.estado, "pendiente"))
      .orderBy(desc(alertasFidelizacion.diasSinVolver));

    const listaResenas = await db
      .select({
        id: resenas.id,
        calificacion: resenas.calificacion,
        comentario: resenas.comentario,
        esPublica: resenas.esPublica,
        creadaEn: resenas.creadaEn,
        clienteNombre: clientes.nombre,
        clienteTelefono: clientes.telefono,
      })
      .from(resenas)
      .leftJoin(clientes, eq(resenas.clienteId, clientes.id))
      .orderBy(desc(resenas.creadaEn))
      .limit(30);

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
