import Link from "next/link";
import { getPedidosCompletos } from "@/db/queries/pedidos";
import { getFacturasCompletas } from "@/db/queries/facturas";
import { cambiarEstadoAction } from "./actions";
import HistorialConFactura from "./HistorialConFactura";
import LiveAutoRefresh from "./LiveAutoRefresh";
import {
  IconSmartphone,
  IconZap,
  IconBell,
  IconMapPin,
  IconShoppingBag,
  IconFlame,
  IconChefHat,
  IconCheck,
  IconClipboardList,
} from "./Icons";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const [pedidos, facturas] = await Promise.all([
    getPedidosCompletos(),
    getFacturasCompletas(),
  ]);

  const pedidosNuevos = pedidos.filter((p) => p.estado === "recibido");
  const pedidosCocina = pedidos.filter((p) => p.estado === "en_cocina");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8a8078] mb-1">
            <Link href="/admin" className="hover:text-[#c9a84c] transition-colors">
              ← Volver al Dashboard
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#f5f0e8]">
            Comandas & Monitor de Cocina en Vivo
          </h1>
          <p className="text-xs text-[#8a8078] mt-1">
            Flujo directo y activo: Caja recibe el pedido → Pasa a Cocina → Cocina despacha y entrega.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LiveAutoRefresh />
          <Link
            href="/app/menu"
            target="_blank"
            className="px-4 py-2.5 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/40 text-[#c9a84c] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <IconSmartphone className="w-3.5 h-3.5" /> Abrir Menú Digital
          </Link>
        </div>
      </div>

      {/* MONITOR DE COMANDAS ACTIVAS (2 Columnas Directas) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
            <IconZap className="w-5 h-5 text-[#c9a84c]" /> Comandas en Activo ({pedidosNuevos.length + pedidosCocina.length})
          </h2>
          <span className="text-xs text-[#8a8078]">
            {pedidosNuevos.length} por aceptar · {pedidosCocina.length} en cocina
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1: Nuevos Pedidos (Caja / QR) */}
          <div className="bg-[#141210] border border-blue-500/30 rounded-3xl p-5 flex flex-col min-h-[420px] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-blue-500/40 text-blue-400 bg-blue-500/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                1. Nuevos Pedidos (Caja / QR)
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {pedidosNuevos.length} pendientes
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {pedidosNuevos.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-[#8a8078]/60 border border-dashed border-white/[0.05] rounded-2xl p-4">
                  <IconBell className="w-7 h-7 mb-2 opacity-40" />
                  <span>Sin comandas nuevas pendientes</span>
                </div>
              ) : (
                pedidosNuevos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="bg-[#0a0908] border border-blue-500/20 rounded-2xl p-4 space-y-3 shadow-lg hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#c9a84c]">
                          #{pedido.id}
                        </span>
                        <span className="text-[10px] text-[#8a8078]">
                          {new Date(pedido.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white bg-white/[0.08] px-3 py-0.5 rounded-lg border border-white/[0.1] flex items-center gap-1">
                        {pedido.mesa ? (
                          <><IconMapPin className="w-3 h-3" /> Mesa {pedido.mesa}</>
                        ) : (
                          <><IconShoppingBag className="w-3 h-3" /> Para Llevar / Domicilio</>
                        )}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 border-t border-b border-white/[0.04] py-2">
                      {pedido.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#f5f0e8]">
                            <strong className="text-[#c9a84c] text-sm">{item.cantidad}x</strong>{" "}
                            {item.platoNombre || "Plato Roma"}
                          </span>
                          <span className="text-[#8a8078] font-mono">
                            ${(Number(item.precioUnitario) * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total y Acción */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-[#8a8078] uppercase block">Total</span>
                        <span className="font-serif font-bold text-base text-[#f5f0e8]">
                          ${Number(pedido.total).toFixed(2)}
                        </span>
                      </div>

                      <form action={cambiarEstadoAction}>
                        <input type="hidden" name="id" value={pedido.id} />
                        <input type="hidden" name="estado" value="en_cocina" />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-[#c62828] to-[#e53935] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center gap-1.5"
                        >
                          <IconFlame className="w-3.5 h-3.5" /> Mandar a Cocina →
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 2: En Cocina */}
          <div className="bg-[#141210] border border-[#c62828]/40 rounded-3xl p-5 flex flex-col min-h-[420px] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#c62828]/40 text-[#e53935] bg-[#c62828]/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                2. En Cocina
              </span>
              <span className="text-xs font-mono font-bold text-[#e53935]">
                {pedidosCocina.length} en cocina
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {pedidosCocina.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-[#8a8078]/60 border border-dashed border-white/[0.05] rounded-2xl p-4">
                  <IconChefHat className="w-7 h-7 mb-2 opacity-40" />
                  <span>Cocina libre / Sin órdenes en preparación</span>
                </div>
              ) : (
                pedidosCocina.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="bg-[#0a0908] border border-[#c62828]/30 rounded-2xl p-4 space-y-3 shadow-lg hover:border-[#c62828]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#c9a84c]">
                          #{pedido.id}
                        </span>
                        <span className="text-[10px] text-red-400/80 font-semibold">
                          En preparación
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white bg-white/[0.08] px-3 py-0.5 rounded-lg border border-white/[0.1] flex items-center gap-1">
                        {pedido.mesa ? (
                          <><IconMapPin className="w-3 h-3" /> Mesa {pedido.mesa}</>
                        ) : (
                          <><IconShoppingBag className="w-3 h-3" /> Para Llevar</>
                        )}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 border-t border-b border-white/[0.04] py-2">
                      {pedido.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#f5f0e8]">
                            <strong className="text-[#c9a84c] text-sm">{item.cantidad}x</strong>{" "}
                            {item.platoNombre || "Plato Roma"}
                          </span>
                          <span className="text-[#8a8078] font-mono">
                            ${(Number(item.precioUnitario) * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total y Acción Final */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-[#8a8078] uppercase block">Total</span>
                        <span className="font-serif font-bold text-base text-[#f5f0e8]">
                          ${Number(pedido.total).toFixed(2)}
                        </span>
                      </div>

                      <form action={cambiarEstadoAction}>
                        <input type="hidden" name="id" value={pedido.id} />
                        <input type="hidden" name="estado" value="entregado" />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-[#2e7d32] to-[#388e3c] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                        >
                          <IconCheck className="w-3.5 h-3.5" /> Listo y Entregar
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
