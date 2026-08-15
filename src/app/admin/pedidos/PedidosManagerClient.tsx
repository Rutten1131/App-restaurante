"use client";

import { useState } from "react";
import Salon3DMap, { PedidoSalon } from "./Salon3DMap";
import { cambiarEstadoAction } from "./actions";
import { formatMesa } from "@/lib/formatMesa";
import {
  IconFlame,
  IconMapPin,
  IconShoppingBag,
  IconZap,
  IconBell,
} from "./Icons";

interface PedidosManagerClientProps {
  totalMesas: number;
  pedidosNuevos: PedidoSalon[];
  pedidosEnCocina: PedidoSalon[];
}

export default function PedidosManagerClient({
  totalMesas,
  pedidosNuevos,
  pedidosEnCocina,
}: PedidosManagerClientProps) {
  const [vista, setVista] = useState<"salon3d" | "lista">("salon3d");

  return (
    <div className="space-y-6">
      {/* Selector de Modo de Visualización */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-[#141210] border border-white/[0.08] rounded-2xl">
          <button
            type="button"
            onClick={() => setVista("salon3d")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              vista === "salon3d"
                ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                : "text-[#8a8078] hover:text-white"
            }`}
          >
            <span>Plano de Salón & Mesas ({totalMesas})</span>
            {pedidosNuevos.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setVista("lista")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              vista === "lista"
                ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                : "text-[#8a8078] hover:text-white"
            }`}
          >
            <span>Vista de Tarjetas / Lista ({pedidosNuevos.length})</span>
          </button>
        </div>

        <span className="text-xs text-[#8a8078] hidden sm:inline">
          {pedidosNuevos.length} comandas nuevas por mandar a cocina
        </span>
      </div>

      {/* VISTA 1: SALÓN 3D DE MESAS */}
      {vista === "salon3d" ? (
        <Salon3DMap
          totalMesas={totalMesas}
          pedidosNuevos={pedidosNuevos}
          pedidosEnCocina={pedidosEnCocina}
        />
      ) : (
        /* VISTA 2: LISTA TRADICIONAL DE TARJETAS */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <IconZap className="w-5 h-5 text-blue-400" /> 1. Nuevos Pedidos Recibidos ({pedidosNuevos.length})
            </h2>
            <span className="text-xs text-[#8a8078]">
              {pedidosNuevos.length} pendientes por enviar a cocina
            </span>
          </div>

          {pedidosNuevos.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-[#8a8078] bg-[#141210] border border-dashed border-white/[0.08] rounded-3xl p-6 shadow-xl">
              <IconBell className="w-8 h-8 mb-2 opacity-40 text-blue-400" />
              <span className="font-semibold text-sm text-white/90">Sin comandas nuevas pendientes</span>
              <p className="text-xs text-[#8a8078] mt-1 max-w-sm">
                Cuando un cliente haga un pedido desde su mesa o la web, aparecerá aquí inmediatamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidosNuevos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-[#141210] border border-blue-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl hover:border-blue-500/60 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#c9a84c]">
                          #{pedido.id}
                        </span>
                        <span className="text-[11px] text-[#8a8078]" suppressHydrationWarning>
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

                    {pedido.clienteNombre && (
                      <div className="text-xs text-[#8a8078]">
                        Cliente: <strong className="text-white">{pedido.clienteNombre}</strong>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/[0.04]">
                      <span className="text-[10px] uppercase font-bold text-[#8a8078] tracking-wider block">
                        Detalle del Pedido:
                      </span>
                      {pedido.items.map((item) => (
                        <div key={item.id} className="space-y-0.5 border-b border-white/[0.03] last:border-0 pb-1.5 last:pb-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#f5f0e8] font-semibold">
                              <strong className="text-[#c9a84c] text-sm">{item.cantidad}x</strong>{" "}
                              {item.platoNombre || "Plato Roma"}
                            </span>
                            <span className="text-[#8a8078] font-mono text-xs">
                              ${(Number(item.precioUnitario) * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                          {item.notas && (
                            <p className="text-[10px] text-amber-300/80 italic pl-4">
                              Obs: {item.notas}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total y Acción Enviar a Cocina */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#8a8078] uppercase font-semibold">Total a Cobrar</span>
                      <span className="font-serif font-bold text-xl text-[#f5f0e8]">
                        ${Number(pedido.total).toFixed(2)}
                      </span>
                    </div>

                    <form action={cambiarEstadoAction}>
                      <input type="hidden" name="id" value={pedido.id} />
                      <input type="hidden" name="estado" value="en_cocina" />
                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-[#c62828] to-[#e53935] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2"
                      >
                        <IconFlame className="w-4 h-4" />
                        <span>Mandar a Cocina →</span>
                      </button>
                    </form>
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
