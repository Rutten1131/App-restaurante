"use server";

import { db } from "@/db";
import { pedidos, itemsPedido, clientes, facturas } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export interface ItemPedidoInput {
  platoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: string;
  notas?: string;
}

export interface CrearPedidoOnlineInput {
  modalidad: "mesa" | "llevar" | "delivery";
  mesa?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  direccion?: string;
  metodoPago?: string;
  notas?: string;
  items: ItemPedidoInput[];
}

export async function crearPedidoOnlineAction(input: CrearPedidoOnlineInput) {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "El pedido no contiene platos seleccionados." };
  }

  try {
    // 1. Manejo del Cliente (CRM & Fidelización)
    let clienteId: number | null = null;
    const nombre = input.nombreCliente?.trim() || (input.modalidad === "mesa" ? `Mesa ${input.mesa || "Local"}` : "Cliente Mostrador");
    const telefono = input.telefonoCliente?.trim() || null;

    if (telefono) {
      // Buscar si ya existe por teléfono
      const [clienteExistente] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.telefono, telefono))
        .limit(1);

      if (clienteExistente) {
        clienteId = clienteExistente.id;
        // Actualizar última visita
        await db
          .update(clientes)
          .set({ ultimaVisita: new Date() })
          .where(eq(clientes.id, clienteId));
      }
    }

    if (!clienteId && (input.nombreCliente || input.telefonoCliente)) {
      // Crear nuevo cliente para el club de fidelización
      const randomNum = Math.floor(100 + Math.random() * 900);
      const numeroCliente = `cli-${randomNum}`;

      const [resCliente] = await db.insert(clientes).values({
        numeroCliente,
        nombre: nombre,
        telefono: telefono,
        ultimaVisita: new Date(),
      });

      clienteId = (resCliente as any).insertId || null;
    }

    // 2. Calcular Total
    let total = 0;
    for (const it of input.items) {
      total += Number(it.precioUnitario) * it.cantidad;
    }

    // 3. Determinar origen y mesa
    const origen: "qr_mesa" | "caja" | "mesero" = input.modalidad === "mesa" ? "qr_mesa" : "caja";
    let textoMesa = "Local";

    if (input.modalidad === "mesa") {
      textoMesa = input.mesa ? `Mesa ${input.mesa}` : "Mesa Local";
    } else if (input.modalidad === "llevar") {
      textoMesa = "Para Llevar";
    } else {
      textoMesa = "Delivery";
    }

    // 4. Insertar Pedido
    const [resPedido] = await db.insert(pedidos).values({
      clienteId: clienteId,
      origen: origen,
      mesa: textoMesa,
      estado: "recibido",
      total: total.toFixed(2),
    });

    const pedidoId = (resPedido as any).insertId;

    if (!pedidoId) {
      throw new Error("No se pudo generar el ID del pedido");
    }

    // 5. Insertar Items del Pedido
    for (const it of input.items) {
      const notasItem = [
        it.notas,
        input.modalidad === "delivery" && input.direccion ? `Dir: ${input.direccion}` : null,
        input.metodoPago ? `Pago: ${input.metodoPago}` : null,
        input.notas ? `Obs: ${input.notas}` : null,
      ].filter(Boolean).join(" | ");

      await db.insert(itemsPedido).values({
        pedidoId: pedidoId,
        platoId: it.platoId,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario).toFixed(2),
        notas: notasItem ? notasItem.substring(0, 250) : null,
      });
    }

    // 6. Generar Registro de Factura Simulada
    const subtotal = total / 1.15;
    const iva = total - subtotal;

    await db.insert(facturas).values({
      pedidoId: pedidoId,
      clienteId: clienteId,
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2),
      estado: "simulada",
    });

    // 7. Revalidar vistas del Admin en tiempo real
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    revalidatePath("/admin/clientes");
    revalidatePath("/admin/facturas");

    return {
      success: true,
      pedidoId,
      total: total.toFixed(2),
      textoMesa,
    };
  } catch (error: any) {
    console.error("Error al procesar pedido en base de datos:", error);
    return {
      success: false,
      error: error.message || "Error al registrar el pedido en el sistema.",
    };
  }
}
