"use client";

import { useState, useTransition } from "react";
import { generarClaveAccesoSRI } from "@/lib/sri/claveAcceso";
import { emitirFacturaAction } from "../facturas/actions";
import {
  IconAlertTriangle,
  IconCheck,
  IconDownload,
  IconLightbulb,
  IconUser,
  IconBuilding,
  IconBanknotes,
  IconCreditCard,
  IconPrinter,
  IconX,
} from "./Icons";

interface PedidoFinalizado {
  id: number;
  mesa: string | null;
  total: string | number;
  creadoEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  facturaId: number | null;
  facturaEstado: string | null;
  items: {
    id: number;
    cantidad: number;
    precioUnitario: string | number;
    platoNombre: string | null;
  }[];
}

export default function HistorialConFactura({
  pedidos,
}: {
  pedidos: PedidoFinalizado[];
}) {
  const [modalPedido, setModalPedido] = useState<PedidoFinalizado | null>(null);
  const [tipoCliente, setTipoCliente] = useState<"consumidor_final" | "con_datos">("consumidor_final");
  const [identificacion, setIdentificacion] = useState("9999999999999");
  const [razonSocial, setRazonSocial] = useState("CONSUMIDOR FINAL");
  const [email, setEmail] = useState("");
  const [formaPago, setFormaPago] = useState("01");
  const [isPending, startTransition] = useTransition();

  // Ticket modal
  const [ticketActivo, setTicketActivo] = useState<{
    claveAcceso: string;
    secuencial: string;
    fecha: string;
    cliente: string;
    identificacion: string;
    mesa: string | null;
    items: { cantidad: number; nombre: string; precioUnitario: number; total: number }[];
    subtotal: number;
    iva: number;
    total: number;
  } | null>(null);

  const abrirModal = (p: PedidoFinalizado) => {
    setModalPedido(p);
    if (p.clienteNombre && p.clienteNombre !== "CONSUMIDOR FINAL") {
      setTipoCliente("con_datos");
      setRazonSocial(p.clienteNombre);
      setIdentificacion(p.clienteTelefono?.replace(/\D/g, "") || "");
    } else {
      setTipoCliente("consumidor_final");
      setIdentificacion("9999999999999");
      setRazonSocial("CONSUMIDOR FINAL");
    }
    setEmail("");
    setFormaPago("01");
  };

  const handleTipoChange = (tipo: "consumidor_final" | "con_datos") => {
    setTipoCliente(tipo);
    if (tipo === "consumidor_final") {
      setIdentificacion("9999999999999");
      setRazonSocial("CONSUMIDOR FINAL");
    } else {
      setIdentificacion("");
      setRazonSocial(modalPedido?.clienteNombre || "");
    }
  };

  const totalNum = modalPedido ? Number(modalPedido.total) : 0;
  const subtotal15 = Number((totalNum / 1.15).toFixed(2));
  const iva15 = Number((totalNum - subtotal15).toFixed(2));

  const handleEmitir = () => {
    if (!modalPedido) return;

    const fd = new FormData();
    fd.append("pedidoId", String(modalPedido.id));
    fd.append("nombreCliente", razonSocial);
    fd.append("identificacionCliente", identificacion);
    fd.append("emailEnvioDestino", email);
    fd.append("subtotal", String(subtotal15));
    fd.append("iva", String(iva15));
    fd.append("total", String(totalNum));
    fd.append("formaPago", formaPago);

    const { claveAcceso, fechaFormato, secuencialFormato } = generarClaveAccesoSRI({
      fechaEmision: new Date(),
      ruc: "1104999999001",
      ambiente: "1",
      secuencial: modalPedido.id,
    });

    startTransition(async () => {
      await emitirFacturaAction(fd);

      setTicketActivo({
        claveAcceso,
        secuencial: secuencialFormato,
        fecha: fechaFormato,
        cliente: razonSocial,
        identificacion,
        mesa: modalPedido.mesa,
        items: modalPedido.items.map((it) => ({
          cantidad: it.cantidad,
          nombre: it.platoNombre || "Plato Roma",
          precioUnitario: Number(it.precioUnitario),
          total: Number(it.precioUnitario) * it.cantidad,
        })),
        subtotal: subtotal15,
        iva: iva15,
        total: totalNum,
      });

      setModalPedido(null);
    });
  };

  const [tabFiltro, setTabFiltro] = useState<"todas" | "pendientes" | "facturadas">("todas");

  const abrirTicketExistente = (p: PedidoFinalizado) => {
    const tot = Number(p.total);
    const sub = Number((tot / 1.15).toFixed(2));
    const iv = Number((tot - sub).toFixed(2));

    const { claveAcceso, fechaFormato, secuencialFormato } = generarClaveAccesoSRI({
      fechaEmision: new Date(p.creadoEn),
      ruc: "1104999999001",
      ambiente: "1",
      secuencial: p.id,
    });

    setTicketActivo({
      claveAcceso,
      secuencial: secuencialFormato,
      fecha: fechaFormato,
      cliente: p.clienteNombre || "CONSUMIDOR FINAL",
      identificacion: p.clienteTelefono?.replace(/\D/g, "") || "9999999999999",
      mesa: p.mesa,
      items: p.items.map((it) => ({
        cantidad: it.cantidad,
        nombre: it.platoNombre || "Plato Roma",
        precioUnitario: Number(it.precioUnitario),
        total: Number(it.precioUnitario) * it.cantidad,
      })),
      subtotal: sub,
      iva: iv,
      total: tot,
    });
  };

  const pedidosPendientes = pedidos.filter((p) => !p.facturaId);
  const pedidosFacturados = pedidos.filter((p) => !!p.facturaId);

  const pedidosMostrados =
    tabFiltro === "pendientes"
      ? pedidosPendientes
      : tabFiltro === "facturadas"
      ? pedidosFacturados
      : pedidos;

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-[#8a8078]">
        No hay comandas entregadas registradas hoy.
      </div>
    );
  }

  return (
    <>
      {/* Selector de Tabs / Alertas de Facturación */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTabFiltro("todas")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tabFiltro === "todas"
                ? "bg-white/[0.12] text-white border border-white/20"
                : "text-[#8a8078] hover:text-white"
            }`}
          >
            Todas ({pedidos.length})
          </button>

          <button
            type="button"
            onClick={() => setTabFiltro("pendientes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabFiltro === "pendientes"
                ? "bg-[#c62828] text-white shadow-md shadow-red-900/30"
                : pedidosPendientes.length > 0
                ? "bg-[#c62828]/15 text-[#e53935] border border-[#c62828]/30 hover:bg-[#c62828]/25"
                : "text-[#8a8078] hover:text-white"
            }`}
          >
            <IconAlertTriangle className="w-3.5 h-3.5" />
            <span>Falta Facturar ({pedidosPendientes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTabFiltro("facturadas")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabFiltro === "facturadas"
                ? "bg-[#2e7d32] text-white shadow-md"
                : "text-[#8a8078] hover:text-white"
            }`}
          >
            <IconCheck className="w-3.5 h-3.5" />
            <span>Facturadas ({pedidosFacturados.length})</span>
          </button>
        </div>

        {pedidosPendientes.length > 0 && (
          <span className="text-[11px] text-[#c9a84c] font-semibold bg-[#c9a84c]/10 border border-[#c9a84c]/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <IconLightbulb className="w-3.5 h-3.5" /> Tienes {pedidosPendientes.length} comanda(s) lista(s) para emitir factura
          </span>
        )}
      </div>

      <div className="overflow-x-auto max-h-[420px]">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#141210] z-10">
            <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
              <th className="pb-3 px-2">Comanda</th>
              <th className="pb-3 px-2">Hora</th>
              <th className="pb-3 px-2">Destino / Mesa</th>
              <th className="pb-3 px-2">Detalle de Platos</th>
              <th className="pb-3 px-2 text-right">Total</th>
              <th className="pb-3 px-2 text-center">Estado</th>
              <th className="pb-3 px-2 text-center">Factura & Descarga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {pedidosMostrados.map((p) => {
              const yaFacturado = !!p.facturaId;

              return (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-[#c9a84c]">
                    #{p.id}
                  </td>
                  <td className="py-3 px-2 text-[#8a8078]">
                    {new Date(p.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3 px-2 font-semibold text-[#f5f0e8]">
                    {p.mesa ? `Mesa ${p.mesa}` : "Para Llevar / Domicilio"}
                  </td>
                  <td className="py-3 px-2 text-[#8a8078] max-w-[240px] truncate">
                    {p.items.map((it) => `${it.cantidad}x ${it.platoNombre}`).join(", ")}
                  </td>
                  <td className="py-3 px-2 text-right font-serif font-bold text-[#f5f0e8]">
                    ${Number(p.total).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/30 inline-flex items-center gap-1">
                      <IconCheck className="w-3 h-3" /> Entregado
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {yaFacturado ? (
                      <button
                        type="button"
                        onClick={() => abrirTicketExistente(p)}
                        className="px-3 py-1 bg-white/[0.06] hover:bg-[#c9a84c] hover:text-[#0a0908] text-[#c9a84c] text-[11px] font-bold rounded-xl border border-[#c9a84c]/40 transition-all flex items-center gap-1.5 mx-auto"
                        title="Ver e Imprimir / Descargar Factura"
                      >
                        <IconDownload className="w-3.5 h-3.5" /> Ver / Descargar Ticket
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => abrirModal(p)}
                        className="px-3.5 py-1.5 bg-[#c62828] hover:bg-[#e53935] text-white text-[11px] font-bold rounded-xl transition-all shadow-md shadow-red-900/30 flex items-center gap-1.5 mx-auto animate-pulse"
                      >
                        <IconAlertTriangle className="w-3.5 h-3.5" /> Falta Facturar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: EMITIR FACTURA DESDE PEDIDOS ─────────────────── */}
      {modalPedido && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#f5f0e8]">
                  Emitir Comprobante de Venta
                </h3>
                <p className="text-xs text-[#8a8078]">
                  Comanda #{modalPedido.id} {modalPedido.mesa ? `· Mesa ${modalPedido.mesa}` : "· Para Llevar"}
                </p>
              </div>
              <button onClick={() => setModalPedido(null)} className="text-white/40 hover:text-white p-1">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Detalle de la Comanda */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-1 text-xs">
              <span className="text-[10px] uppercase text-[#8a8078] font-bold block mb-1">Detalle de Platos</span>
              {modalPedido.items.map((it) => (
                <div key={it.id} className="flex justify-between text-[#f5f0e8]">
                  <span>{it.cantidad}x {it.platoNombre || "Plato Roma"}</span>
                  <span className="font-mono text-[#8a8078]">${(Number(it.precioUnitario) * it.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Selector Consumidor Final vs Con Datos */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => handleTipoChange("consumidor_final")}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tipoCliente === "consumidor_final"
                    ? "bg-[#c9a84c] text-[#0a0908] shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <IconUser className="w-3.5 h-3.5" /> Consumidor Final
              </button>
              <button
                type="button"
                onClick={() => handleTipoChange("con_datos")}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tipoCliente === "con_datos"
                    ? "bg-[#c9a84c] text-[#0a0908] shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <IconBuilding className="w-3.5 h-3.5" /> Con Datos (RUC / Cédula)
              </button>
            </div>

            {/* Formulario datos del cliente */}
            {tipoCliente === "con_datos" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                    Cédula o RUC (10 o 13 dígitos) *
                  </label>
                  <input
                    type="text"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    placeholder="Ej. 1104567890 o 1104567890001"
                    className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                  {identificacion.length > 0 && identificacion.length !== 10 && identificacion.length !== 13 && (
                    <span className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                      <IconAlertTriangle className="w-3 h-3" /> Debe tener 10 dígitos (Cédula) o 13 dígitos (RUC)
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                    Razón Social / Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                  {razonSocial.trim().length === 0 && (
                    <span className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                      <IconAlertTriangle className="w-3 h-3" /> El nombre o razón social es obligatorio
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                    Email (para enviar el RIDE / comprobante electrónico)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@gmail.com"
                    className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Forma de Pago */}
            <div className="text-xs space-y-1">
              <label className="block text-[10px] uppercase font-bold text-[#c9a84c]">
                Forma de Pago
              </label>
              <select
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
              >
                <option value="01">Efectivo</option>
                <option value="20">Transferencia / Deuna</option>
                <option value="19">Tarjeta de Débito / Crédito</option>
              </select>
            </div>

            {/* Desglose Tributario */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#8a8078]">
                <span>Subtotal Tarifa 15%</span>
                <span className="font-mono">${subtotal15.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8a8078]">
                <span>IVA 15%</span>
                <span className="font-mono">${iva15.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#f5f0e8] border-t border-white/10 pt-1.5">
                <span>Total a Facturar</span>
                <span className="font-serif text-[#c9a84c]">${totalNum.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalPedido(null)}
                className="flex-1 py-3 border border-white/10 rounded-2xl text-xs font-semibold text-white/60 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmitir}
                disabled={isPending || (tipoCliente === "con_datos" && (razonSocial.trim().length === 0 || (identificacion.length !== 10 && identificacion.length !== 13)))}
                className="flex-[2] py-3 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs rounded-2xl shadow-lg shadow-[#c9a84c]/20 transition-all uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isPending ? "Generando..." : <><IconCheck className="w-4 h-4" /> Emitir Comprobante e Imprimir</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TICKET TÉRMICO ─────────────────────────────── */}
      {ticketActivo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-1 border-b-2 border-dashed border-black pb-3">
              <h4 className="font-bold text-base tracking-wider uppercase">ROMA RESTAURANTE PIZZERÍA</h4>
              <p className="text-[10px]">RUC: 1104999999001</p>
              <p className="text-[10px]">Av. Eugenio Espejo 200-100 y Shuaras, Loja</p>
              <p className="text-[10px]">Tel: 098 767 0140 · Tradición desde 2001</p>
            </div>

            <div className="space-y-0.5 text-[11px] border-b border-dashed border-black pb-2">
              <div className="flex justify-between">
                <span>FACTURA:</span>
                <span className="font-bold">{ticketActivo.secuencial}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{ticketActivo.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-bold truncate max-w-[180px]">{ticketActivo.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span>RUC/C.I.:</span>
                <span>{ticketActivo.identificacion}</span>
              </div>
              {ticketActivo.mesa && (
                <div className="flex justify-between">
                  <span>UBICACIÓN:</span>
                  <span className="font-bold">Mesa {ticketActivo.mesa}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 border-b-2 border-dashed border-black pb-3 text-[11px]">
              <div className="flex justify-between font-bold border-b border-black pb-1">
                <span>CANT / DESCRIPCIÓN</span>
                <span>TOTAL</span>
              </div>
              {ticketActivo.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span>${it.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] border-b-2 border-dashed border-black pb-3">
              <div className="flex justify-between">
                <span>SUBTOTAL (15%):</span>
                <span>${ticketActivo.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (15%):</span>
                <span>${ticketActivo.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                <span>TOTAL A PAGAR:</span>
                <span>${ticketActivo.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[9px] space-y-1 text-center bg-gray-100 p-2 rounded">
              <span className="font-bold block">CLAVE DE ACCESO SRI (49 DÍGITOS):</span>
              <span className="break-all font-mono">{ticketActivo.claveAcceso}</span>
              <span className="block text-[8px] text-gray-500 mt-1">Ambiente: Pruebas/Simulación</span>
            </div>

            <div className="text-center text-[10px] italic">
              ¡Gracias por preferir Roma Pizzería!
            </div>

            <div className="flex gap-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setTicketActivo(null)}
                className="flex-1 py-2 border border-gray-400 rounded-xl text-xs font-semibold hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-black text-white font-bold rounded-xl text-xs hover:bg-gray-800 flex items-center justify-center gap-1.5"
              >
                <IconPrinter className="w-3.5 h-3.5" /> Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
