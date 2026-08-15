"use client";

import { useState } from "react";
import { cambiarEstadoAction } from "../pedidos/actions";
import { formatMesa } from "@/lib/formatMesa";
import {
  IconFlame,
  IconCheck,
  IconMapPin,
  IconShoppingBag,
  IconChefHat,
  IconClipboardList,
} from "../pedidos/Icons";

export interface PedidoItemCocina {
  id: number;
  cantidad: number;
  precioUnitario: string | number;
  platoNombre: string | null;
  notas?: string | null;
}

export interface PedidoCocina {
  id: number;
  mesa: string | null;
  total: string | number;
  estado: string;
  creadoEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  items: PedidoItemCocina[];
}

interface CocinaClientProps {
  pedidosCocina: PedidoCocina[];
  pedidosDespachados: PedidoCocina[];
}

export default function CocinaClient({
  pedidosCocina,
  pedidosDespachados,
}: CocinaClientProps) {
  const [tabActiva, setTabActiva] = useState<"en_preparacion" | "despachadas">("en_preparacion");

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas Simple */}
      <div className="flex items-center gap-2 p-1.5 bg-[#141210] border border-white/[0.08] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setTabActiva("en_preparacion")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabActiva === "en_preparacion"
              ? "bg-[#c62828] text-white shadow-md shadow-red-950/40"
              : "text-[#8a8078] hover:text-white"
          }`}
        >
          <IconFlame className="w-3.5 h-3.5" />
          <span>En Horno / Cocina ({pedidosCocina.length})</span>
          {pedidosCocina.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("despachadas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabActiva === "despachadas"
              ? "bg-[#2e7d32] text-white shadow-md shadow-emerald-950/40"
              : "text-[#8a8078] hover:text-white"
          }`}
        >
          <IconCheck className="w-3.5 h-3.5" />
          <span>Despachadas Recientes ({pedidosDespachados.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: EN PREPARACIÓN */}
      {tabActiva === "en_preparacion" && (
        <div className="space-y-4">
          {pedidosCocina.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[#8a8078] bg-[#141210] border border-dashed border-white/[0.08] rounded-3xl p-8 shadow-xl">
              <IconChefHat className="w-12 h-12 mb-3 text-[#c9a84c] opacity-60" />
              <h3 className="font-serif text-lg font-bold text-white mb-1">Cocina y Horno Libres</h3>
              <p className="text-xs max-w-sm text-[#8a8078]">
                No hay comandas pendientes de elaboración en este momento. Las nuevas comandas enviadas desde Caja aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidosCocina.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-[#141210] border-2 border-[#c62828]/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#e53935] transition-all"
                >
                  <div className="space-y-3">
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-bold text-[#c9a84c]">
                          #{pedido.id}
                        </span>
                        <span className="text-xs text-red-400 font-semibold px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
                          {new Date(pedido.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-white bg-white/[0.08] px-3 py-1 rounded-xl border border-white/[0.1] flex items-center gap-1.5 shadow-sm">
                        {pedido.mesa ? (
                          <><IconMapPin className="w-3.5 h-3.5 text-[#c9a84c]" /> {formatMesa(pedido.mesa)}</>
                        ) : (
                          <><IconShoppingBag className="w-3.5 h-3.5 text-blue-400" /> Para Llevar</>
                        )}
                      </span>
                    </div>

                    {/* Cliente si existe */}
                    {pedido.clienteNombre && (
                      <div className="text-xs text-[#8a8078]">
                        Cliente: <strong className="text-white">{pedido.clienteNombre}</strong>
                      </div>
                    )}

                    {/* Detalle de Platos a Preparar */}
                    <div className="space-y-2 bg-black/40 p-3.5 rounded-2xl border border-white/[0.04]">
                      <span className="text-[10px] uppercase font-bold text-[#8a8078] tracking-wider block">
                        Platos a Elaborar:
                      </span>
                      {pedido.items.map((item) => (
                        <div key={item.id} className="space-y-1 border-b border-white/[0.03] last:border-0 pb-1.5 last:pb-0">
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-[#f5f0e8] font-bold flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 font-mono text-xs flex items-center justify-center font-black">
                                {item.cantidad}x
                              </span>
                              <span>{item.platoNombre || "Plato Roma"}</span>
                            </span>
                          </div>
                          {item.notas && (
                            <p className="text-[11px] text-amber-300/90 italic pl-8">
                              Obs: {item.notas}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón de Despacho Listo */}
                  <form action={cambiarEstadoAction} className="pt-2">
                    <input type="hidden" name="id" value={pedido.id} />
                    <input type="hidden" name="estado" value="entregado" />
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-[#2e7d32] to-[#388e3c] hover:brightness-110 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-[0.98]"
                    >
                      <IconCheck className="w-5 h-5 stroke-[2.5]" />
                      <span>✓ Listo y Entregar</span>
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: DESPACHADAS RECIENTES (TAB SENCILLA) */}
      {tabActiva === "despachadas" && (
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
              <IconClipboardList className="w-4 h-4 text-[#2e7d32]" /> Historial Reciente de Comandas Entregadas
            </h2>
            <span className="text-xs text-[#8a8078]">Total: {pedidosDespachados.length}</span>
          </div>

          {pedidosDespachados.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8a8078]">
              Aún no se han despachado comandas en este turno.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pedidosDespachados.map((ped) => (
                <div key={ped.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#c9a84c]">#{ped.id}</span>
                      <span className="font-semibold text-white/90">{formatMesa(ped.mesa)}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                      <IconCheck className="w-3 h-3" /> Despachado
                    </span>
                  </div>

                  <p className="text-white/80 font-medium line-clamp-2">
                    {ped.items.map((it) => `${it.cantidad}x ${it.platoNombre}`).join(", ")}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#8a8078] border-t border-white/5 pt-1.5">
                    <span>{new Date(ped.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="font-mono font-semibold text-white/70">${Number(ped.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
