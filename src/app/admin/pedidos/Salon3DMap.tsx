"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoAction } from "./actions";
import { emitirFacturaAction } from "../facturas/actions";
import { generarClaveAccesoSRI } from "@/lib/sri/claveAcceso";
import { formatMesa } from "@/lib/formatMesa";
import {
  IconFlame,
  IconShoppingBag,
  IconZap,
} from "./Icons";

export interface ItemPedidoSalon {
  id: number;
  cantidad: number;
  precioUnitario: string | number;
  platoNombre: string | null;
  notas?: string | null;
}

export interface PedidoSalon {
  id: number;
  mesa: string | null;
  total: string | number;
  estado: string;
  creadoEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  items: ItemPedidoSalon[];
}

interface Salon3DMapProps {
  totalMesas: number;
  pedidosNuevos: PedidoSalon[];
  pedidosEnCocina: PedidoSalon[];
}

export default function Salon3DMap({
  totalMesas,
  pedidosNuevos,
  pedidosEnCocina,
}: Salon3DMapProps) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoSalon | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- Facturación rápida state ---
  const [mostrarFactura, setMostrarFactura] = useState(false);
  const [tipoCliente, setTipoCliente] = useState<"consumidor_final" | "con_datos">("consumidor_final");
  const [identificacion, setIdentificacion] = useState("9999999999999");
  const [razonSocial, setRazonSocial] = useState("CONSUMIDOR FINAL");
  const [emailFactura, setEmailFactura] = useState("");
  const [formaPago, setFormaPago] = useState("01");
  const [facturaExito, setFacturaExito] = useState(false);

  const resetFactura = () => {
    setMostrarFactura(false);
    setTipoCliente("consumidor_final");
    setIdentificacion("9999999999999");
    setRazonSocial("CONSUMIDOR FINAL");
    setEmailFactura("");
    setFormaPago("01");
    setFacturaExito(false);
  };

  const handleTipoClienteChange = (tipo: "consumidor_final" | "con_datos") => {
    setTipoCliente(tipo);
    if (tipo === "consumidor_final") {
      setIdentificacion("9999999999999");
      setRazonSocial("CONSUMIDOR FINAL");
      setEmailFactura("");
    } else {
      setIdentificacion("");
      setRazonSocial(
        pedidoSeleccionado?.clienteNombre &&
        pedidoSeleccionado.clienteNombre !== "CONSUMIDOR FINAL"
          ? pedidoSeleccionado.clienteNombre
          : ""
      );
      setEmailFactura("");
    }
  };

  const handleEmitirFactura = () => {
    if (!pedidoSeleccionado) return;
    const totalNum = Number(pedidoSeleccionado.total);
    const subtotal15 = Number((totalNum / 1.15).toFixed(2));
    const iva15 = Number((totalNum - subtotal15).toFixed(2));

    const fd = new FormData();
    fd.append("pedidoId", String(pedidoSeleccionado.id));
    fd.append("total", String(totalNum));
    fd.append("subtotal", String(subtotal15));
    fd.append("iva", String(iva15));
    fd.append("tipoCliente", tipoCliente);
    fd.append("identificacion", identificacion);
    fd.append("razonSocial", razonSocial);
    fd.append("email", emailFactura);
    fd.append("formaPago", formaPago);
    fd.append("estado", "oficial_sri");

    startTransition(async () => {
      await emitirFacturaAction(fd);
      setFacturaExito(true);
      setTimeout(() => {
        resetFactura();
      }, 2000);
    });
  };

  // Extraer número de mesa
  const extraerNumeroMesa = (textoMesa?: string | null): number | null => {
    if (!textoMesa) return null;
    const match = textoMesa.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  const pedidosPorMesa = new Map<number, { nuevo?: PedidoSalon; enCocina?: PedidoSalon }>();
  const pedidosParaLlevar: PedidoSalon[] = [];

  for (const p of pedidosNuevos) {
    const num = extraerNumeroMesa(p.mesa);
    if (num && num >= 1 && num <= totalMesas) {
      const entry = pedidosPorMesa.get(num) || {};
      entry.nuevo = p;
      pedidosPorMesa.set(num, entry);
    } else {
      pedidosParaLlevar.push(p);
    }
  }

  for (const p of pedidosEnCocina) {
    const num = extraerNumeroMesa(p.mesa);
    if (num && num >= 1 && num <= totalMesas) {
      const entry = pedidosPorMesa.get(num) || {};
      entry.enCocina = p;
      pedidosPorMesa.set(num, entry);
    } else {
      pedidosParaLlevar.push(p);
    }
  }

  const arrayMesas = Array.from({ length: totalMesas }, (_, i) => i + 1);

  const handleMandarCocina = (pedidoId: number) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(pedidoId));
      formData.append("estado", "en_cocina");
      await cambiarEstadoAction(formData);
      setPedidoSeleccionado(null);
      resetFactura();
    });
  };

  const handleCancelarPedido = (pedidoId: number) => {
    if (!confirm("¿Deseas cancelar esta comanda?")) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(pedidoId));
      formData.append("estado", "cancelado");
      await cambiarEstadoAction(formData);
      setPedidoSeleccionado(null);
      resetFactura();
    });
  };

  return (
    <div className="space-y-6">
      {/* CUADRÍCULA DIRECTA Y LIMPIA DE MESAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {arrayMesas.map((numMesa) => {
          const info = pedidosPorMesa.get(numMesa);
          const tieneNuevo = !!info?.nuevo;
          const tieneEnCocina = !!info?.enCocina;
          const pedidoActivo = info?.nuevo || info?.enCocina;

          return (
            <div
              key={numMesa}
              onClick={() => pedidoActivo && setPedidoSeleccionado(pedidoActivo)}
              className={`relative p-4 rounded-3xl transition-all duration-200 flex flex-col justify-between select-none ${
                pedidoActivo ? "cursor-pointer" : ""
              } ${
                tieneNuevo
                  ? "bg-[#181f30] border-2 border-blue-500 shadow-xl shadow-blue-500/20 transform -translate-y-1"
                  : tieneEnCocina
                  ? "bg-[#211514] border border-red-500/60 shadow-lg shadow-red-950/30"
                  : "bg-[#141210] border border-white/[0.06] hover:border-white/20"
              }`}
            >
              {/* Baliza si entra pedido nuevo */}
              {tieneNuevo && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-bounce z-10">
                  <IconZap className="w-2.5 h-2.5 fill-current" />
                  <span>Nuevo Pedido</span>
                </div>
              )}

              {/* Cabecera de la mesa */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className={`font-serif text-sm font-bold ${
                  tieneNuevo ? "text-blue-300" : "text-[#f5f0e8]"
                }`}>
                  Mesa {numMesa}
                </span>

                {tieneNuevo ? (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                ) : tieneEnCocina ? (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                )}
              </div>

              {/* Centro de la mesa */}
              <div className="my-4 flex items-center justify-center">
                <div
                  className={`w-20 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                    tieneNuevo
                      ? "bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/30"
                      : tieneEnCocina
                      ? "bg-red-950/50 border-red-500/40"
                      : "bg-[#1c1815] border-white/[0.08]"
                  }`}
                >
                  {tieneNuevo ? (
                    <div className="text-center">
                      <span className="font-mono text-xs font-bold text-white block">
                        ${Number(info.nuevo!.total).toFixed(2)}
                      </span>
                      <span className="text-[9px] text-blue-200 uppercase font-bold block">
                        #{info.nuevo!.id}
                      </span>
                    </div>
                  ) : tieneEnCocina ? (
                    <div className="text-center">
                      <IconFlame className="w-4 h-4 text-red-400 mx-auto animate-pulse" />
                      <span className="text-[9px] text-red-300 font-mono font-bold block">
                        #{info.enCocina!.id}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] text-white/30 font-bold">
                      · {numMesa} ·
                    </span>
                  )}
                </div>
              </div>

              {/* Botón o Estado */}
              <div className="pt-2 border-t border-white/[0.06]">
                {tieneNuevo ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPedidoSeleccionado(info.nuevo!);
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl transition-all text-center flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    <span>Ver Pedido</span>
                    <span>→</span>
                  </button>
                ) : tieneEnCocina ? (
                  <div className="text-center text-[10px] text-red-300 font-medium py-0.5">
                    En Horno (#{info.enCocina!.id})
                  </div>
                ) : (
                  <div className="text-center text-[10px] text-[#8a8078] py-0.5">
                    Sin comanda
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Tarjetas adicionales para pedidos de Delivery o Para Llevar */}
        {pedidosParaLlevar.map((ped) => {
          const esDelivery = ped.mesa?.toLowerCase().includes("delivery");
          const esNuevo = ped.estado === "recibido";

          return (
            <div
              key={`llevar-${ped.id}`}
              onClick={() => setPedidoSeleccionado(ped)}
              className={`relative p-4 rounded-3xl flex flex-col justify-between cursor-pointer transition-all ${
                esNuevo
                  ? "bg-[#1b2234] border-2 border-blue-500 shadow-xl shadow-blue-500/20 transform -translate-y-1"
                  : "bg-[#251514] border border-red-500/60 shadow-lg shadow-red-950/40"
              }`}
            >
              {esNuevo && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-bounce z-10">
                  <IconZap className="w-2.5 h-2.5 fill-current" />
                  <span>{esDelivery ? "Delivery" : "Para Llevar"}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className={`font-serif text-sm font-bold flex items-center gap-1.5 ${
                  esNuevo ? "text-blue-300" : "text-white"
                }`}>
                  <IconShoppingBag className="w-3.5 h-3.5" />
                  <span>{esDelivery ? "Delivery" : "Para Llevar"}</span>
                </span>
                <span className={`w-2 h-2 rounded-full ${esNuevo ? "bg-blue-400 animate-ping" : "bg-red-500"}`} />
              </div>

              <div className="my-3 text-center">
                <span className="text-xs font-semibold text-white block truncate">
                  {ped.clienteNombre || "Cliente Mostrador"}
                </span>
                <span className="font-mono text-sm font-bold text-[#c9a84c] block mt-1">
                  ${Number(ped.total).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                className={`w-full py-1.5 text-white font-bold text-[11px] rounded-xl transition-all text-center uppercase tracking-wider ${
                  esNuevo ? "bg-blue-600 hover:bg-blue-500 shadow-md" : "bg-red-950/40 text-red-300 border border-red-500/30"
                }`}
              >
                {esNuevo ? "Ver Pedido →" : `En Horno (#${ped.id})`}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALLE DEL PEDIDO (AL HACER CLIC EN CUALQUIER MESA CON PEDIDO) */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-fadeIn relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-[#c9a84c]">
                    Comanda #{pedidoSeleccionado.id}
                  </span>
                  <span className="text-xs font-bold text-white bg-white/[0.08] px-3 py-0.5 rounded-lg border border-white/[0.1]">
                    {formatMesa(pedidoSeleccionado.mesa)}
                  </span>
                </div>
                <p className="text-xs text-[#8a8078] mt-1" suppressHydrationWarning>
                  {pedidoSeleccionado.clienteNombre ? `Cliente: ${pedidoSeleccionado.clienteNombre}` : "Pedido Roma"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPedidoSeleccionado(null)}
                className="text-[#8a8078] hover:text-white p-1 text-lg rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Detalle de Platos */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              <span className="text-[10px] uppercase font-bold text-[#c9a84c] tracking-wider block">
                Platos de la Comanda:
              </span>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/[0.06] space-y-2.5">
                {pedidoSeleccionado.items.map((item) => (
                  <div key={item.id} className="space-y-0.5 border-b border-white/[0.04] last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-[#f5f0e8] font-bold">
                        <strong className="text-[#c9a84c] mr-1.5">{item.cantidad}x</strong>
                        {item.platoNombre || "Plato Roma"}
                      </span>
                      <span className="font-mono text-xs text-[#8a8078]">
                        ${(Number(item.precioUnitario) * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                    {item.notas && (
                      <p className="text-[11px] text-amber-300/90 italic pl-5">
                        Obs: {item.notas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span className="text-xs text-[#8a8078] uppercase font-bold">Total a Cobrar</span>
              <span className="font-serif text-2xl font-bold text-[#f5f0e8]">
                ${Number(pedidoSeleccionado.total).toFixed(2)}
              </span>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3 pt-2">
              {/* Facturación Rápida Toggle */}
              {!mostrarFactura && !facturaExito && (
                <button
                  type="button"
                  onClick={() => setMostrarFactura(true)}
                  className="w-full py-2.5 rounded-xl border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Facturar Ahora
                </button>
              )}

              {facturaExito && (
                <div className="w-full py-3 rounded-xl bg-[#2e7d32]/15 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-bold text-center flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ¡Factura emitida con éxito!
                </div>
              )}

              {/* Formulario de Facturación Rápida Inline */}
              {mostrarFactura && !facturaExito && (
                <div className="bg-black/50 border border-[#c9a84c]/20 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-[#c9a84c] tracking-wider">Datos de Facturación</span>
                    <button type="button" onClick={() => setMostrarFactura(false)} className="text-[#8a8078] hover:text-white text-xs">✕</button>
                  </div>

                  {/* Tipo Cliente */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTipoClienteChange("consumidor_final")}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                        tipoCliente === "consumidor_final"
                          ? "bg-[#c9a84c] text-[#0a0908]"
                          : "bg-white/[0.06] text-[#8a8078] hover:text-white"
                      }`}
                    >
                      Consumidor Final
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipoClienteChange("con_datos")}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                        tipoCliente === "con_datos"
                          ? "bg-[#c9a84c] text-[#0a0908]"
                          : "bg-white/[0.06] text-[#8a8078] hover:text-white"
                      }`}
                    >
                      Con Datos
                    </button>
                  </div>

                  {tipoCliente === "con_datos" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="CI / RUC"
                        value={identificacion}
                        onChange={(e) => setIdentificacion(e.target.value)}
                        className="w-full bg-[#0a0908] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Nombre / Razón Social"
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        className="w-full bg-[#0a0908] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={emailFactura}
                        onChange={(e) => setEmailFactura(e.target.value)}
                        className="w-full bg-[#0a0908] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Forma de Pago */}
                  <select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="01">💵 Efectivo</option>
                    <option value="16">💳 Tarjeta de Débito</option>
                    <option value="19">💳 Tarjeta de Crédito</option>
                    <option value="20">📱 Transferencia</option>
                  </select>

                  {/* Resumen rápido */}
                  <div className="flex items-center justify-between text-[11px] text-[#8a8078] border-t border-white/[0.06] pt-2">
                    <span>Subtotal 15%: ${(Number(pedidoSeleccionado.total) / 1.15).toFixed(2)}</span>
                    <span>IVA 15%: ${(Number(pedidoSeleccionado.total) - Number(pedidoSeleccionado.total) / 1.15).toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEmitirFactura}
                    disabled={isPending || (tipoCliente === "con_datos" && !identificacion)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#d4b85a] hover:brightness-110 text-[#0a0908] text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#c9a84c]/20 transition-all disabled:opacity-50"
                  >
                    {isPending ? "Emitiendo..." : "Emitir Factura SRI →"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCancelarPedido(pedidoSeleccionado.id)}
                  disabled={isPending}
                  className="py-3 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Rechazar / Cancelar
                </button>

                {pedidoSeleccionado.estado === "recibido" ? (
                  <button
                    type="button"
                    onClick={() => handleMandarCocina(pedidoSeleccionado.id)}
                    disabled={isPending}
                    className="py-3 px-4 bg-gradient-to-r from-[#c62828] to-[#e53935] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <IconFlame className="w-4 h-4" />
                    <span>{isPending ? "Enviando..." : "Mandar a Cocina →"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setPedidoSeleccionado(null); resetFactura(); }}
                    className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
