import "server-only";
import { db } from "@/db";
import { clientes, encuestas, resenas } from "@/db/schema";
import { desc, eq, or, sql } from "drizzle-orm";
import { normalizarTelefono } from "@/lib/normalizarTelefono";

let tablasIniciadas = false;

async function asegurarTablas() {
  if (tablasIniciadas) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS \`encuestas\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`cliente_id\` int(11) DEFAULT NULL,
        \`plat_favorito\` varchar(150) DEFAULT NULL,
        \`frecuencia_visita\` varchar(80) DEFAULT NULL,
        \`como_nos_conocio\` varchar(100) DEFAULT NULL,
        \`ocasion_visita\` varchar(250) DEFAULT NULL,
        \`nos_recomendaria\` tinyint(1) DEFAULT 1,
        \`sugerencias\` text DEFAULT NULL,
        \`pizza_promo_reclamada\` tinyint(1) NOT NULL DEFAULT 0,
        \`creada_en\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS \`configuraciones\` (
        \`clave\` varchar(100) NOT NULL PRIMARY KEY,
        \`valor\` text NOT NULL,
        \`actualizado_en\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    tablasIniciadas = true;
  } catch (err) {
    console.error("Aviso al verificar tablas:", err);
  }
}

/**
 * Obtiene el valor de una configuración (ej. link de Google Review).
 */
export async function getConfiguracion(clave: string): Promise<string | null> {
  await asegurarTablas();
  try {
    const result: any = await db.execute(
      sql`SELECT valor FROM configuraciones WHERE clave = ${clave} LIMIT 1`
    );
    const rows = result?.[0] || result;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0]?.valor || null;
    }
    return null;
  } catch (err) {
    console.error(`Error al leer configuracion ${clave}:`, err);
    return null;
  }
}

/**
 * Guarda o actualiza una configuración del sistema.
 */
export async function setConfiguracion(clave: string, valor: string) {
  await asegurarTablas();
  try {
    await db.execute(sql`
      INSERT INTO configuraciones (clave, valor)
      VALUES (${clave}, ${valor})
      ON DUPLICATE KEY UPDATE valor = ${valor}
    `);
    return true;
  } catch (err) {
    console.error(`Error al guardar configuracion ${clave}:`, err);
    return false;
  }
}

/**
 * Busca cliente por teléfono normalizado (soporta 593..., 09..., 9...).
 */
export async function buscarClientePorTelefono(telefonoRaw: string) {
  const telefonoNorm = normalizarTelefono(telefonoRaw);
  if (!telefonoNorm) return null;

  // Buscar con las 3 posibles variantes que pudieron haberse guardado
  const sinCero = telefonoNorm.startsWith("0") ? telefonoNorm.slice(1) : telefonoNorm;
  const con593 = "593" + sinCero;

  const [found] = await db
    .select()
    .from(clientes)
    .where(
      or(
        eq(clientes.telefono, telefonoNorm),
        eq(clientes.telefono, sinCero),
        eq(clientes.telefono, con593),
      )
    )
    .limit(1);

  // Si encontramos uno guardado con formato viejo, actualizamos al formato normalizado
  if (found && found.telefono !== telefonoNorm) {
    await db
      .update(clientes)
      .set({ telefono: telefonoNorm })
      .where(eq(clientes.id, found.id));
  }

  return found ?? null;
}

/**
 * Crea un nuevo cliente fidelización o actualiza el existente por teléfono.
 * Devuelve el clienteId.
 */
export async function upsertClienteFidelizacion(data: {
  nombre: string;
  telefono: string;
  email?: string | null;
  cumpleanios?: string | null;
}): Promise<number> {
  const telefonoNorm = normalizarTelefono(data.telefono);
  if (!telefonoNorm) {
    throw new Error("Teléfono inválido");
  }

  const existing = await buscarClientePorTelefono(telefonoNorm);

  if (existing) {
    await db
      .update(clientes)
      .set({ nombre: data.nombre, ultimaVisita: new Date(), telefono: telefonoNorm })
      .where(eq(clientes.id, existing.id));
    return existing.id;
  }

  const randomNum = String(Math.floor(1000 + Math.random() * 9000));
  const numeroCliente = `fid-${randomNum}`;

  const result = await db.insert(clientes).values({
    numeroCliente,
    nombre: data.nombre,
    telefono: telefonoNorm,
    email: data.email || null,
    cumpleanios: data.cumpleanios ? new Date(data.cumpleanios) : null,
    ultimaVisita: new Date(),
  });

  return Number((result as any)[0]?.insertId ?? 0);
}

/**
 * Guarda la encuesta de datos del QR de fidelización asegurando que la tabla exista.
 */
export async function insertarEncuesta(data: {
  clienteId: number;
  platFavorito?: string | null;
  frecuenciaVisita?: string | null;
  comoNosConocio?: string | null;
  ocasionVisita?: string | null;
  nosRecomendaria?: boolean;
  sugerencias?: string | null;
}) {
  await asegurarTablas();
  try {
    return await db.insert(encuestas).values({
      clienteId: data.clienteId,
      platFavorito: data.platFavorito || null,
      frecuenciaVisita: data.frecuenciaVisita || null,
      comoNosConocio: data.comoNosConocio || null,
      ocasionVisita: data.ocasionVisita || null,
      nosRecomendaria: data.nosRecomendaria ?? true,
      sugerencias: data.sugerencias || null,
      pizzaPromoReclamada: true,
    });
  } catch (err) {
    console.error("Error al insertar en encuestas:", err);
    return null;
  }
}

/**
 * Guarda una reseña/calificación de servicio.
 * esPublica = true si calificacion === 5
 */
export async function insertarResena(data: {
  clienteId?: number | null;
  calificacion: number;
  comentario?: string | null;
}) {
  return await db.insert(resenas).values({
    clienteId: data.clienteId || null,
    calificacion: data.calificacion,
    comentario: data.comentario || null,
    esPublica: data.calificacion === 5,
  });
}

/**
 * Obtiene todas las reseñas recientes con datos del cliente.
 */
export async function getResenasRecientes(limit = 100) {
  const rows = await db
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
    .limit(limit);

  return rows;
}
