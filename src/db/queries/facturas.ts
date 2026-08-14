import "server-only";
import { db } from "@/db";
import { facturas, pedidos, clientes, itemsPedido, platos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getFacturasCompletas() {
  try {
    const lista = await db
      .select({
        id: facturas.id,
        pedidoId: facturas.pedidoId,
        clienteId: facturas.clienteId,
        emailEnvioDestino: facturas.emailEnvioDestino,
        subtotal: facturas.subtotal,
        iva: facturas.iva,
        total: facturas.total,
        estado: facturas.estado,
        creadaEn: facturas.creadaEn,
        clienteNombre: clientes.nombre,
        clienteTelefono: clientes.telefono,
        clienteEmail: clientes.email,
        pedidoMesa: pedidos.mesa,
      })
      .from(facturas)
      .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
      .leftJoin(pedidos, eq(facturas.pedidoId, pedidos.id))
      .orderBy(desc(facturas.creadaEn));

    // Obtener items para cada factura
    const items = await db
      .select({
        id: itemsPedido.id,
        pedidoId: itemsPedido.pedidoId,
        cantidad: itemsPedido.cantidad,
        precioUnitario: itemsPedido.precioUnitario,
        platoNombre: platos.nombre,
      })
      .from(itemsPedido)
      .leftJoin(platos, eq(itemsPedido.platoId, platos.id));

    return lista.map((f) => ({
      ...f,
      items: items.filter((it) => it.pedidoId === f.pedidoId),
    }));
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return [];
  }
}

export async function emitirFacturaComanda(data: {
  pedidoId: number;
  clienteId?: number | null;
  nombreCliente: string;
  identificacionCliente: string;
  emailEnvioDestino?: string | null;
  subtotal: number;
  iva: number;
  total: number;
  formaPago?: string;
  estado?: "simulada" | "enviada" | "oficial_sri";
}) {
  const result = await db.insert(facturas).values({
    pedidoId: data.pedidoId,
    clienteId: data.clienteId || null,
    emailEnvioDestino: data.emailEnvioDestino || null,
    subtotal: data.subtotal.toFixed(2),
    iva: data.iva.toFixed(2),
    total: data.total.toFixed(2),
    estado: data.estado || "simulada",
  });

  return Number((result as any)[0]?.insertId ?? 0);
}
