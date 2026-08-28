import "server-only";
import { db } from "@/db";
import { pedidos, itemsPedido, platos, clientes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type EstadoPedido = "recibido" | "en_cocina" | "listo" | "entregado" | "cancelado";

export async function getPedidosCompletos(restauranteId = 1) {
  try {
    // 1. Obtener todos los pedidos del restaurante
    const listaPedidos = await db
      .select({
        id: pedidos.id,
        restauranteId: pedidos.restauranteId,
        clienteId: pedidos.clienteId,
        origen: pedidos.origen,
        mesa: pedidos.mesa,
        estado: pedidos.estado,
        total: pedidos.total,
        creadoEn: pedidos.creadoEn,
        clienteNombre: clientes.nombre,
        clienteTelefono: clientes.telefono,
      })
      .from(pedidos)
      .leftJoin(clientes, eq(pedidos.clienteId, clientes.id))
      .where(eq(pedidos.restauranteId, restauranteId))
      .orderBy(desc(pedidos.creadoEn));

    // 2. Obtener items con nombre de plato
    const items = await db
      .select({
        id: itemsPedido.id,
        pedidoId: itemsPedido.pedidoId,
        platoId: itemsPedido.platoId,
        cantidad: itemsPedido.cantidad,
        precioUnitario: itemsPedido.precioUnitario,
        notas: itemsPedido.notas,
        platoNombre: platos.nombre,
      })
      .from(itemsPedido)
      .leftJoin(platos, eq(itemsPedido.platoId, platos.id));

    // 3. Vincular items a cada pedido
    return listaPedidos.map((ped) => ({
      ...ped,
      items: items.filter((it) => it.pedidoId === ped.id),
    }));
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return [];
  }
}

export async function cambiarEstadoPedido(id: number, nuevoEstado: EstadoPedido) {
  return await db
    .update(pedidos)
    .set({ estado: nuevoEstado })
    .where(eq(pedidos.id, id));
}

export async function crearPedidoDirecto(data: {
  restauranteId?: number;
  clienteId?: number | null;
  origen: "qr_mesa" | "mesero" | "caja";
  mesa?: string;
  total: string;
}) {
  const result = await db.insert(pedidos).values({
    restauranteId: data.restauranteId ?? 1,
    clienteId: data.clienteId ?? null,
    origen: data.origen,
    mesa: data.mesa ?? null,
    total: data.total,
  });

  return Number((result as any)[0]?.insertId ?? 0);
}
