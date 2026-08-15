"use client";

import { useState, useTransition } from "react";
import { generarClaveAccesoSRI } from "@/lib/sri/claveAcceso";
import { generarXMLFacturaSRI } from "@/lib/sri/xmlFactura";
import { emitirFacturaAction } from "./actions";
import { formatMesa } from "@/lib/formatMesa";

interface ItemFactura {
  id: number;
  cantidad: number;
  precioUnitario: string | number;
  platoNombre: string | null;
}

interface FacturaRow {
  id: number;
  pedidoId: number;
  clienteId: number | null;
  emailEnvioDestino: string | null;
  subtotal: string | number;
  iva: string | number;
  total: string | number;
  estado: string;
  creadaEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  pedidoMesa: string | null;
  items: ItemFactura[];
}

interface PedidoParaFacturar {
  id: number;
  mesa: string | null;
  total: string | number;
  creadoEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  items: {
    id: number;
    cantidad: number;
    precioUnitario: string | number;
    platoNombre: string | null;
  }[];
}

interface FacturasClientProps {
  facturas: FacturaRow[];
  pedidosDisponibles: PedidoParaFacturar[];
  rucConfig?: string;
  razonSocialConfig?: string;
}

export default function FacturasClient({
  facturas,
  pedidosDisponibles,
  rucConfig = "1104999999001",
  razonSocialConfig = "ROMA RESTAURANTE PIZZERÍA",
}: FacturasClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoParaFacturar | null>(null);

  // Formulario de emisión
  const [tipoCliente, setTipoCliente] = useState<"consumidor_final" | "con_datos">("consumidor_final");
  const [identificacion, setIdentificacion] = useState("9999999999999");
  const [razonSocial, setRazonSocial] = useState("CONSUMIDOR FINAL");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("Loja, Ecuador");
  const [formaPago, setFormaPago] = useState("01"); // 01 = Efectivo, 19 = Tarjeta, 20 = Transferencia / Deuna

  // Visualizador de comprobante emitido
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

  const [isPending, startTransition] = useTransition();

  // Abrir modal con comanda
  const iniciarFacturacion = (p: PedidoParaFacturar) => {
    setPedidoSeleccionado(p);
    if (p.clienteNombre) {
      setTipoCliente("con_datos");
      setRazonSocial(p.clienteNombre);
      setIdentificacion(p.clienteTelefono ? p.clienteTelefono.replace(/\D/g, "") : "");
    } else {
      setTipoCliente("consumidor_final");
      setIdentificacion("9999999999999");
      setRazonSocial("CONSUMIDOR FINAL");
    }
    setModalOpen(true);
  };

  const handleTipoClienteChange = (tipo: "consumidor_final" | "con_datos") => {
    setTipoCliente(tipo);
    if (tipo === "consumidor_final") {
      setIdentificacion("9999999999999");
      setRazonSocial("CONSUMIDOR FINAL");
    } else {
      setIdentificacion("");
      setRazonSocial(pedidoSeleccionado?.clienteNombre || "");
    }
  };

  // Cálculos tributarios oficiales (IVA 15% desglose)
  const totalNumerico = pedidoSeleccionado ? Number(pedidoSeleccionado.total) : 0;
  // El precio de la carta ya incluye IVA 15% (práctica estándar en restaurantes de Ecuador)
  const subtotal15 = Number((totalNumerico / 1.15).toFixed(2));
  const iva15 = Number((totalNumerico - subtotal15).toFixed(2));

  // Generar Clave de Acceso SRI simulada para el preview
  const secuencialSimulado = facturas.length + 1;
  const { claveAcceso, fechaFormato, secuencialFormato } = generarClaveAccesoSRI({
    fechaEmision: new Date(),
    ruc: rucConfig,
    ambiente: "1",
    secuencial: secuencialSimulado,
  });

  const handleEmitirFactura = () => {
    if (!pedidoSeleccionado) return;

    const fd = new FormData();
    fd.append("pedidoId", String(pedidoSeleccionado.id));
    fd.append("nombreCliente", razonSocial);
    fd.append("identificacionCliente", identificacion);
    fd.append("emailEnvioDestino", email);
    fd.append("subtotal", String(subtotal15));
    fd.append("iva", String(iva15));
    fd.append("total", String(totalNumerico));
    fd.append("formaPago", formaPago);

    startTransition(async () => {
      await emitirFacturaAction(fd);

      // Preparar ticket para imprimir
      setTicketActivo({
        claveAcceso,
        secuencial: secuencialFormato,
        fecha: fechaFormato,
        cliente: razonSocial,
        identificacion,
        mesa: pedidoSeleccionado.mesa,
        items: pedidoSeleccionado.items.map((it) => ({
          cantidad: it.cantidad,
          nombre: it.platoNombre || "Plato Roma",
          precioUnitario: Number(it.precioUnitario),
          total: Number(it.precioUnitario) * it.cantidad,
        })),
        subtotal: subtotal15,
        iva: iva15,
        total: totalNumerico,
      });

      setModalOpen(false);
    });
  };

  const descargarXML = (f: FacturaRow) => {
    const totalF = Number(f.total);
    const subtotalF = Number(f.subtotal);
    const ivaF = Number(f.iva);

    const { claveAcceso: ca, fechaFormato: ff, secuencialFormato: sf } = generarClaveAccesoSRI({
      fechaEmision: new Date(f.creadaEn),
      ruc: rucConfig,
      ambiente: "1",
      secuencial: f.id,
    });

    const xml = generarXMLFacturaSRI({
      ambiente: "1",
      razonSocial: razonSocialConfig,
      nombreComercial: "Roma Restaurante Pizzería",
      ruc: rucConfig,
      claveAcceso: ca,
      establecimiento: "001",
      puntoEmision: "001",
      secuencial: String(f.id).padStart(9, "0"),
      dirMatriz: "Av. Eugenio Espejo 200-100 y Shuaras, Loja, Ecuador",
      fechaEmision: ff,
      tipoIdentificacionComprador: f.clienteNombre ? "05" : "07",
      razonSocialComprador: f.clienteNombre || "CONSUMIDOR FINAL",
      identificacionComprador: "9999999999999",
      emailComprador: f.emailEnvioDestino || "cliente@roma.com",
      totalSinImpuestos: subtotalF,
      totalDescuento: 0,
      subtotal15: subtotalF,
      subtotal0: 0,
      iva15: ivaF,
      importeTotal: totalF,
      items: f.items.map((it) => ({
        codigo: String(it.id),
        descripcion: it.platoNombre || "Plato Roma",
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        tarifaIva: 15,
      })),
    });

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${sf}_${ca}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* ── SECCIÓN 1: COMANDAS DISPONIBLES PARA FACTURAR / COBRAR ────────── */}
      <div className="bg-[#141210] border border-[#c9a84c]/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <span className="text-[#c9a84c]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span>Caja Rápida · Comandas Listas para Facturar ({pedidosDisponibles.length})</span>
            </h2>
            <p className="text-xs text-[#8a8078] mt-0.5">
              Selecciona una orden entregada para generar su comprobante de venta o factura con desglose de IVA (15%).
            </p>
          </div>
        </div>

        {pedidosDisponibles.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8a8078]">
            No hay comandas pendientes de facturar. Las nuevas órdenes entregadas aparecerán aquí.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidosDisponibles.map((p) => (
              <div
                key={p.id}
                className="bg-[#0a0908] border border-white/[0.08] hover:border-[#c9a84c]/50 p-4 rounded-2xl space-y-3 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-[#c9a84c]">
                      Comanda #{p.id}
                    </span>
                    <span className="text-[11px] font-bold text-white bg-white/[0.08] px-2.5 py-0.5 rounded-lg">
                      {formatMesa(p.mesa)}
                    </span>
                  </div>

                  <div className="text-xs text-[#8a8078] space-y-1 border-t border-b border-white/5 py-2 my-2">
                    {p.items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span>{it.cantidad}x {it.platoNombre}</span>
                        <span className="font-mono">${(Number(it.precioUnitario) * it.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-[#8a8078] block uppercase">Total a Cobrar</span>
                    <span className="font-serif font-bold text-base text-[#f5f0e8]">
                      ${Number(p.total).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => iniciarFacturacion(p)}
                    className="px-3.5 py-2 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] text-xs font-bold rounded-xl transition-all uppercase tracking-wider shadow-md shadow-[#c9a84c]/20 flex items-center gap-1.5"
                  >
                    <span>Facturar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECCIÓN 2: HISTORIAL DE COMPROBANTES EMITIDOS ──────────────────── */}
      <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <span className="text-[#c9a84c]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>
              <span>Registro de Facturas & Comprobantes ({facturas.length})</span>
            </h2>
            <p className="text-xs text-[#8a8078] mt-0.5">
              Historial de comprobantes emitidos con desglose de IVA 15% y formato oficial SRI.
            </p>
          </div>
        </div>

        {facturas.length === 0 ? (
          <div className="text-center py-12 text-[#8a8078] text-xs">
            No hay facturas emitidas todavía. Emite una comanda arriba para ver el comprobante.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-2">Factura / Secuencial</th>
                  <th className="pb-3 px-2">Comanda</th>
                  <th className="pb-3 px-2">Cliente / Razón Social</th>
                  <th className="pb-3 px-2">Subtotal (15%)</th>
                  <th className="pb-3 px-2">IVA (15%)</th>
                  <th className="pb-3 px-2">Total</th>
                  <th className="pb-3 px-2">Estado</th>
                  <th className="pb-3 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {facturas.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 font-mono text-[#c9a84c] font-bold">
                      001-001-{String(f.id).padStart(9, "0")}
                    </td>
                    <td className="py-3 px-2 text-[#8a8078]">
                      #{f.pedidoId} {f.pedidoMesa ? `(${formatMesa(f.pedidoMesa)})` : ""}
                    </td>
                    <td className="py-3 px-2 font-semibold text-[#f5f0e8]">
                      {f.clienteNombre || "Consumidor Final"}
                    </td>
                    <td className="py-3 px-2 font-mono text-[#8a8078]">
                      ${Number(f.subtotal).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 font-mono text-[#8a8078]">
                      ${Number(f.iva).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 font-serif font-bold text-sm text-[#f5f0e8]">
                      ${Number(f.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/30">
                        {f.estado === "simulada" ? "Simulada / POS" : f.estado}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            const { claveAcceso: ca, fechaFormato: ff, secuencialFormato: sf } = generarClaveAccesoSRI({
                              fechaEmision: new Date(f.creadaEn),
                              ruc: rucConfig,
                              ambiente: "1",
                              secuencial: f.id,
                            });
                            setTicketActivo({
                              claveAcceso: ca,
                              secuencial: sf,
                              fecha: ff,
                              cliente: f.clienteNombre || "CONSUMIDOR FINAL",
                              identificacion: "9999999999999",
                              mesa: f.pedidoMesa,
                              items: f.items.map((it) => ({
                                cantidad: it.cantidad,
                                nombre: it.platoNombre || "Plato Roma",
                                precioUnitario: Number(it.precioUnitario),
                                total: Number(it.precioUnitario) * it.cantidad,
                              })),
                              subtotal: Number(f.subtotal),
                              iva: Number(f.iva),
                              total: Number(f.total),
                            });
                          }}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition-all"
                        >
                          🖨️ Ticket
                        </button>
                        <button
                          onClick={() => descargarXML(f)}
                          className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-[11px] font-medium transition-all"
                        >
                          📄 XML
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: EMITIR FACTURA DE COMANDA ───────────────────────────────── */}
      {modalOpen && pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#f5f0e8]">
                  Emitir Comprobante de Venta
                </h3>
                <p className="text-xs text-[#8a8078]">Comanda #{pedidoSeleccionado.id} · {formatMesa(pedidoSeleccionado.mesa)}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/40 hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Selector Consumidor Final vs Con Datos */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => handleTipoClienteChange("consumidor_final")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tipoCliente === "consumidor_final"
                    ? "bg-[#c9a84c] text-[#0a0908] shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                👤 Consumidor Final
              </button>
              <button
                type="button"
                onClick={() => handleTipoClienteChange("con_datos")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tipoCliente === "con_datos"
                    ? "bg-[#c9a84c] text-[#0a0908] shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                🏢 Con Datos (RUC / Cédula)
              </button>
            </div>

            {/* Formulario según tipo */}
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
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                      Email (para RIDE)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cliente@gmail.com"
                      className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#c9a84c] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Loja, Ecuador"
                      className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#c9a84c] focus:outline-none"
                    />
                  </div>
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
                <option value="01">Efectivo (Sin utilización del sistema financiero)</option>
                <option value="20">Transferencia / Deuna (Banco Pichincha u otros)</option>
                <option value="19">Tarjeta de Débito / Crédito</option>
              </select>
            </div>

            {/* Desglose Tributario Oficial */}
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
                <span className="font-serif text-[#c9a84c]">${totalNumerico.toFixed(2)}</span>
              </div>
            </div>

            {/* Botón de Emisión */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 border border-white/10 rounded-2xl text-xs font-semibold text-white/60 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmitirFactura}
                disabled={isPending}
                className="flex-[2] py-3 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs rounded-2xl shadow-lg shadow-[#c9a84c]/20 transition-all uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isPending ? "Generando Factura..." : "Emitir Comprobante e Imprimir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TICKET TÉRMICO POS PARA IMPRIMIR ───────────────────────── */}
      {ticketActivo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            {/* Header del Ticket */}
            <div className="text-center space-y-1 border-b-2 border-dashed border-black pb-3">
              <h4 className="font-bold text-base tracking-wider uppercase">ROMA RESTAURANTE PIZZERÍA</h4>
              <p className="text-[10px]">RUC: {rucConfig}</p>
              <p className="text-[10px]">Av. Eugenio Espejo 200-100 y Shuaras, Loja</p>
              <p className="text-[10px]">Tel: 098 767 0140 · Tradición desde 2001</p>
            </div>

            {/* Datos del Comprobante */}
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

            {/* Items */}
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

            {/* Totales */}
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

            {/* Clave de Acceso SRI */}
            <div className="text-[9px] space-y-1 text-center bg-gray-100 p-2 rounded">
              <span className="font-bold block">CLAVE DE ACCESO SRI (49 DÍGITOS):</span>
              <span className="break-all font-mono">{ticketActivo.claveAcceso}</span>
              <span className="block text-[8px] text-gray-500 mt-1">Ambiente: Pruebas/Simulación Oficial</span>
            </div>

            <div className="text-center text-[10px] italic">
              ¡Gracias por preferir Roma Pizzería!
            </div>

            {/* Botones de Acción */}
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
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
