import Link from "next/link";
import { getPedidosCompletos } from "@/db/queries/pedidos";
import { getFacturasCompletas } from "@/db/queries/facturas";
import { getConfiguracion } from "@/db/queries/fidelizacion";
import HistorialConFactura from "./HistorialConFactura";
import LiveAutoRefresh from "./LiveAutoRefresh";
import Salon3DMap from "./Salon3DMap";
import { IconClipboardList } from "./Icons";

import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const session = await getAdminSession();
  const restId = session?.restauranteId ?? 1;

  const [pedidos, facturas, mesasConfig] = await Promise.all([
    getPedidosCompletos(restId),
    getFacturasCompletas(restId),
    getConfiguracion("total_mesas"),
  ]);

  const totalMesas = mesasConfig && !isNaN(parseInt(mesasConfig, 10))
    ? parseInt(mesasConfig, 10)
    : 12;

  const pedidosNuevos = pedidos.filter((p) => p.estado === "recibido").map((p) => ({
    id: p.id,
    mesa: p.mesa,
    total: p.total,
    estado: p.estado,
    creadoEn: p.creadoEn,
    clienteNombre: p.clienteNombre,
    clienteTelefono: p.clienteTelefono,
    items: p.items.map((it) => ({
      id: it.id,
      cantidad: it.cantidad,
      precioUnitario: it.precioUnitario,
      platoNombre: it.platoNombre,
      notas: it.notas,
    })),
  }));

  const pedidosEnCocina = pedidos.filter((p) => p.estado === "en_cocina").map((p) => ({
    id: p.id,
    mesa: p.mesa,
    total: p.total,
    estado: p.estado,
    creadoEn: p.creadoEn,
    clienteNombre: p.clienteNombre,
    clienteTelefono: p.clienteTelefono,
    items: p.items.map((it) => ({
      id: it.id,
      cantidad: it.cantidad,
      precioUnitario: it.precioUnitario,
      platoNombre: it.platoNombre,
      notas: it.notas,
    })),
  }));

  const pedidosFinalizados = pedidos.filter((p) => p.estado === "entregado" || p.estado === "listo");

  // Mapear qué pedidos ya tienen factura
  const facturasPorPedido = new Map(facturas.map((f) => [f.pedidoId, f]));

  const pedidosConFacturaInfo = pedidosFinalizados.map((p) => {
    const factura = facturasPorPedido.get(p.id);
    return {
      id: p.id,
      mesa: p.mesa,
      total: p.total,
      creadoEn: p.creadoEn,
      clienteNombre: p.clienteNombre,
      clienteTelefono: p.clienteTelefono,
      facturaId: factura?.id ?? null,
      facturaEstado: factura?.estado ?? null,
      items: p.items.map((it) => ({
        id: it.id,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        platoNombre: it.platoNombre,
      })),
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8a8078] mb-1">
            <Link href="/admin/resumen" className="hover:text-[#c9a84c] transition-colors">
              ← Ver Resumen & Ventas
            </Link>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
            Recepción de Comandas
          </h1>
        </div>

        <LiveAutoRefresh />
      </div>

      {/* MESAS DEL SALÓN (DIRECTO, LIMPIO, SIN SUB-PESTAÑAS NI TEXTOS EXTRA) */}
      <Salon3DMap
        totalMesas={totalMesas}
        pedidosNuevos={pedidosNuevos}
        pedidosEnCocina={pedidosEnCocina}
      />

      {/* HISTORIAL / DATA DE COMANDAS ENTREGADAS + FACTURACIÓN */}
      <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
              <IconClipboardList className="w-4.5 h-4.5 text-[#c9a84c]" /> Historial de Comandas Finalizadas ({pedidosFinalizados.length})
            </h2>
            <p className="text-xs text-[#8a8078] mt-0.5">
              Órdenes completadas y entregadas. Factura directamente desde aquí.
            </p>
          </div>
        </div>

        <HistorialConFactura pedidos={pedidosConFacturaInfo} />
      </div>
    </div>
  );
}
