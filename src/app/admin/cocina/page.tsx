import { getPedidosCompletos } from "@/db/queries/pedidos";
import CocinaClient from "./CocinaClient";
import LiveAutoRefresh from "../pedidos/LiveAutoRefresh";
import { IconChefHat } from "../pedidos/Icons";

export const dynamic = "force-dynamic";

export default async function AdminCocinaPage() {
  const pedidos = await getPedidosCompletos();

  const pedidosCocina = pedidos
    .filter((p) => p.estado === "en_cocina")
    .map((p) => ({
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

  const pedidosDespachados = pedidos
    .filter((p) => p.estado === "entregado" || p.estado === "listo")
    .slice(0, 12)
    .map((p) => ({
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header Cocina / Horno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141210] border border-[#c62828]/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c62828]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] uppercase tracking-widest text-[#e53935] font-bold">
              Horno de Leña & Cocina
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8] flex items-center gap-3">
            <IconChefHat className="w-7 h-7 text-[#c9a84c]" /> Pantalla de Preparación
          </h1>
          <p className="text-xs text-[#8a8078]">
            Al marcar "Listo y Entregar" la comanda se despacha y se descuentan automáticamente los insumos del stock.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <LiveAutoRefresh />
        </div>
      </div>

      {/* Componente de Pestañas (En Preparación vs Despachadas Recientes) */}
      <CocinaClient
        pedidosCocina={pedidosCocina}
        pedidosDespachados={pedidosDespachados}
      />
    </div>
  );
}
