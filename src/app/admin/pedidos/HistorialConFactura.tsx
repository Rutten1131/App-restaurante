"use client";

import { useState, useTransition } from "react";
import { generarClaveAccesoSRI } from "@/lib/sri/claveAcceso";
import { emitirFacturaAction } from "../facturas/actions";
import { formatMesa } from "@/lib/formatMesa";
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
  const [tabFiltro, setTabFiltro] = useState<"todas" | "pendientes" | "facturadas">("todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState<"hoy" | "semana" | "mes" | "todo">("hoy");
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
    setTipoCliente("consumidor_final");
    setIdentificacion("9999999999999");
    setRazonSocial("CONSUMIDOR FINAL");
    setEmail("");
    setFormaPago("01");
  };

  const handleTipoChange = (tipo: "consumidor_final" | "con_datos") => {
    setTipoCliente(tipo);
    if (tipo === "consumidor_final") {
      setIdentificacion("9999999999999");
      setRazonSocial("CONSUMIDOR FINAL");
      setEmail("");
    } else {
      setIdentificacion("");
      setRazonSocial(
        modalPedido?.clienteNombre &&
        !modalPedido.clienteNombre.startsWith("Mesa ") &&
        modalPedido.clienteNombre !== "CONSUMIDOR FINAL" &&
        modalPedido.clienteNombre !== "Cliente Mostrador"
          ? modalPedido.clienteNombre
          : ""
      );
      setEmail("");
    }
  };

  const totalNum = modalPedido ? Number(modalPedido.total) : 0;
  const subtotal15 = Number((totalNum / 1.15).toFixed(2));
  const iva15 = Number((totalNum - subtotal15).toFixed(2));

  const handleEmitir = () => {
    if (!modalPedido) return;

    const fd = new FormData();
    fd.append("pedidoId", String(modalPedido.id));
    fd.append("total", String(modalPedido.total));
    fd.append("subtotal", String(subtotal15));
    fd.append("iva", String(iva15));
    fd.append("tipoCliente", tipoCliente);
    fd.append("identificacion", identificacion);
    fd.append("razonSocial", razonSocial);
    fd.append("email", email);
    fd.append("formaPago", formaPago);
    fd.append("estado", "oficial_sri");

    startTransition(async () => {
      await emitirFacturaAction(fd);

      const sriData = generarClaveAccesoSRI({
        fechaEmision: new Date(),
        tipoComprobante: "01",
        ruc: "1790011234001",
        ambiente: "1",
        establecimiento: "001",
        puntoEmision: "001",
        secuencial: modalPedido.id,
        codigoNumerico: "12345678",
      });

      setTicketActivo({
        claveAcceso: sriData.claveAcceso,
        secuencial: sriData.secuencialFormato,
        fecha: new Date().toLocaleDateString("es-EC") + " " + new Date().toLocaleTimeString("es-EC"),
        cliente: razonSocial || "CONSUMIDOR FINAL",
        identificacion: identificacion || "9999999999999",
        mesa: modalPedido.mesa,
        items: modalPedido.items.map((it) => ({
          cantidad: it.cantidad,
          nombre: it.platoNombre || "Plato Roma",
          precioUnitario: Number(it.precioUnitario),
          total: Number((Number(it.precioUnitario) * it.cantidad).toFixed(2)),
        })),
        subtotal: subtotal15,
        iva: iva15,
        total: totalNum,
      });

      setModalPedido(null);
    });
  };

  const abrirTicketExistente = (p: PedidoFinalizado) => {
    const tot = Number(p.total);
    const sub = Number((tot / 1.15).toFixed(2));
    const iv = Number((tot - sub).toFixed(2));
    const sriData = generarClaveAccesoSRI({
      fechaEmision: new Date(p.creadoEn),
      tipoComprobante: "01",
      ruc: "1790011234001",
      ambiente: "1",
      establecimiento: "001",
      puntoEmision: "001",
      secuencial: p.id,
      codigoNumerico: "12345678",
    });

    setTicketActivo({
      claveAcceso: sriData.claveAcceso,
      secuencial: sriData.secuencialFormato,
      fecha: new Date(p.creadoEn).toLocaleDateString("es-EC") + " " + new Date(p.creadoEn).toLocaleTimeString("es-EC"),
      cliente: p.clienteNombre || "CONSUMIDOR FINAL",
      identificacion: "9999999999999",
      mesa: p.mesa,
      items: p.items.map((it) => ({
        cantidad: it.cantidad,
        nombre: it.platoNombre || "Plato Roma",
        precioUnitario: Number(it.precioUnitario),
        total: Number((Number(it.precioUnitario) * it.cantidad).toFixed(2)),
      })),
      subtotal: sub,
      iva: iv,
      total: tot,
    });
  };

  // Filtrado temporal
  const pedidosFiltradosPorPeriodo = pedidos.filter((p) => {
    if (filtroPeriodo === "todo") return true;
    const fechaP = new Date(p.creadoEn);
    const ahora = new Date();

    if (filtroPeriodo === "hoy") {
      return fechaP.toDateString() === ahora.toDateString();
    }
    if (filtroPeriodo === "semana") {
      const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      return fechaP >= hace7dias;
    }
    if (filtroPeriodo === "mes") {
      return fechaP.getMonth() === ahora.getMonth() && fechaP.getFullYear() === ahora.getFullYear();
    }
    return true;
  });

  const pedidosPendientes = pedidosFiltradosPorPeriodo.filter((p) => !p.facturaId);
  const pedidosFacturados = pedidosFiltradosPorPeriodo.filter((p) => !!p.facturaId);

  const pedidosMostrados =
    tabFiltro === "pendientes"
      ? pedidosPendientes
      : tabFiltro === "facturadas"
      ? pedidosFacturados
      : pedidosFiltradosPorPeriodo;

  const totalMontoFiltrado = pedidosMostrados.reduce((acc, p) => acc + Number(p.total), 0);

  // Función para exportar a Excel (CSV con UTF-8 BOM)
  const exportarExcel = () => {
    const filas = pedidosMostrados.map((p) => {
      const fecha = new Date(p.creadoEn).toLocaleDateString("es-EC");
      const hora = new Date(p.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
      const mesa = formatMesa(p.mesa);
      const cliente = (p.clienteNombre || "Consumidor Final").replace(/;/g, ",");
      const telefono = p.clienteTelefono || "";
      const platos = p.items.map((it) => `${it.cantidad}x ${it.platoNombre || "Plato"}`).join(" | ").replace(/;/g, ",");
      const total = Number(p.total).toFixed(2);
      const estadoFactura = p.facturaId ? "Facturado SRI" : "Pendiente de Factura";

      return `"${p.id}";"${fecha}";"${hora}";"${mesa}";"${cliente}";"${telefono}";"${platos}";"${total}";"${estadoFactura}"`;
    });

    const header = `"ID Comanda";"Fecha";"Hora";"Mesa / Destino";"Cliente";"Teléfono";"Detalle de Platos";"Total ($ USD)";"Estado Facturación"`;
    const csvContent = "\uFEFF" + [header, ...filas].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Historial_Comandas_Roma_${filtroPeriodo}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Selector de Período y Botón de Exportar a Excel */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por fecha */}
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setFiltroPeriodo("hoy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroPeriodo === "hoy"
                  ? "bg-[#c9a84c] text-[#0a0908] font-bold"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setFiltroPeriodo("semana")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroPeriodo === "semana"
                  ? "bg-[#c9a84c] text-[#0a0908] font-bold"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => setFiltroPeriodo("mes")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroPeriodo === "mes"
                  ? "bg-[#c9a84c] text-[#0a0908] font-bold"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => setFiltroPeriodo("todo")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroPeriodo === "todo"
                  ? "bg-[#c9a84c] text-[#0a0908] font-bold"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              Todo el Historial
            </button>
          </div>

          {/* Filtros de Facturación */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTabFiltro("todas")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tabFiltro === "todas"
                  ? "bg-white/[0.12] text-white border border-white/20"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              Todas ({pedidosFiltradosPorPeriodo.length})
            </button>

            <button
              type="button"
              onClick={() => setTabFiltro("pendientes")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tabFiltro === "facturadas"
                  ? "bg-[#2e7d32] text-white shadow-md"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              <IconCheck className="w-3.5 h-3.5" />
              <span>Facturadas ({pedidosFacturados.length})</span>
            </button>
          </div>
        </div>

        {/* Total y Botón Exportar Excel */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-serif font-bold text-white hidden sm:inline">
            Total Período: <strong className="text-[#c9a84c]">${totalMontoFiltrado.toFixed(2)}</strong>
          </span>

          <button
            type="button"
            onClick={exportarExcel}
            className="px-4 py-2 bg-[#2e7d32] hover:bg-[#388e3c] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <IconDownload className="w-3.5 h-3.5" />
            <span>Descargar Excel (CSV)</span>
          </button>
        </div>
      </div>

      {pedidosMostrados.length === 0 ? (
        <div className="text-center py-10 text-xs text-[#8a8078] bg-black/20 rounded-2xl border border-white/[0.04]">
          No hay comandas registradas en el período seleccionado.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#141210] z-10">
              <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2">Comanda</th>
                <th className="pb-3 px-2">Fecha y Hora</th>
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
                    <td className="py-3 px-2 text-[#8a8078]" suppressHydrationWarning>
                      {new Date(p.creadoEn).toLocaleDateString("es-EC")} {new Date(p.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-2 font-semibold text-[#f5f0e8]">
                      {formatMesa(p.mesa)}
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
      )}

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
                  Comanda #{modalPedido.id} · {formatMesa(modalPedido.mesa)}
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

            {/* Tipo de Comprobante */}
            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase text-[#c9a84c] font-bold block">
                Tipo de Cliente
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTipoChange("consumidor_final")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    tipoCliente === "consumidor_final"
                      ? "bg-[#c9a84c]/10 border-[#c9a84c] text-[#c9a84c]"
                      : "bg-black/40 border-white/5 text-[#8a8078] hover:text-white"
                  }`}
                >
                  <IconUser className="w-4 h-4" />
                  <div>
                    <span className="font-bold block text-xs">Consumidor Final</span>
                    <span className="text-[10px] opacity-70">Sin RUC / Cédula</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTipoChange("con_datos")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    tipoCliente === "con_datos"
                      ? "bg-[#c9a84c]/10 border-[#c9a84c] text-[#c9a84c]"
                      : "bg-black/40 border-white/5 text-[#8a8078] hover:text-white"
                  }`}
                >
                  <IconBuilding className="w-4 h-4" />
                  <div>
                    <span className="font-bold block text-xs">Con Datos SRI</span>
                    <span className="text-[10px] opacity-70">RUC o Cédula</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Campos si es Con Datos */}
            {tipoCliente === "con_datos" && (
              <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-2xl text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[#8a8078] font-bold block mb-1">
                    Cédula o RUC *
                  </label>
                  <input
                    type="text"
                    required
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    placeholder="Ej. 1712345678 / 1790011234001"
                    className="w-full bg-[#141210] border border-white/10 rounded-xl px-3.5 py-2 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[#8a8078] font-bold block mb-1">
                    Razón Social / Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="Ej. Juan Pérez / Empresa S.A."
                    className="w-full bg-[#141210] border border-white/10 rounded-xl px-3.5 py-2 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[#8a8078] font-bold block mb-1">
                    Correo para envío de Factura XML/PDF
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full bg-[#141210] border border-white/10 rounded-xl px-3.5 py-2 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Forma de Pago SRI */}
            <div className="space-y-2 text-xs">
              <label className="text-[10px] uppercase text-[#c9a84c] font-bold block">
                Forma de Pago SRI
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormaPago("01")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    formaPago === "01"
                      ? "bg-white/10 border-white text-white font-bold"
                      : "bg-black/30 border-white/5 text-[#8a8078]"
                  }`}
                >
                  <IconBanknotes className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sin Sist. Financiero (Efectivo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormaPago("19")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    formaPago === "19"
                      ? "bg-white/10 border-white text-white font-bold"
                      : "bg-black/30 border-white/5 text-[#8a8078]"
                  }`}
                >
                  <IconCreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tarjeta / Transf. (19)</span>
                </button>
              </div>
            </div>

            {/* Desglose Tributario */}
            <div className="bg-[#0a0908] border border-white/5 rounded-2xl p-3.5 space-y-1 text-xs">
              <div className="flex justify-between text-[#8a8078]">
                <span>Subtotal Gravado (15%):</span>
                <span className="font-mono">${subtotal15.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8a8078]">
                <span>IVA 15%:</span>
                <span className="font-mono">${iva15.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#f5f0e8] font-serif font-bold text-sm pt-1 border-t border-white/5">
                <span>Total Comprobante:</span>
                <span className="text-[#c9a84c]">${totalNum.toFixed(2)}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalPedido(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#8a8078] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmitir}
                disabled={isPending}
                className="flex-1 py-2.5 bg-[#c9a84c] text-[#0a0908] font-bold text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
              >
                <IconCheck className="w-3.5 h-3.5" />
                <span>{isPending ? "Generando..." : "Emitir & Guardar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TICKET TERMICO LISTO PARA IMPRIMIR / DESCARGAR PDF ── */}
      {ticketActivo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 rounded-3xl max-w-sm w-full font-mono text-[11px] space-y-3 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setTicketActivo(null)}
              className="absolute top-4 right-4 text-black/40 hover:text-black text-sm"
            >
              ✕
            </button>

            <div className="text-center border-b border-dashed border-black/30 pb-3 space-y-0.5">
              <span className="font-bold text-sm uppercase block font-serif">ROMA PIZZERÍA</span>
              <span className="text-[10px] text-black/60 block">RUC: 1790011234001</span>
              <span className="text-[10px] text-black/60 block">Av. Principal & Italia, Quito</span>
              <span className="text-[10px] text-black/60 block font-bold text-emerald-800">
                COMPROBANTE ELECTRÓNICO OFICIAL SRI
              </span>
            </div>

            <div className="space-y-1 text-[10px] border-b border-dashed border-black/30 pb-2">
              <div className="flex justify-between">
                <span>No. Factura:</span>
                <span className="font-bold">{ticketActivo.secuencial}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha / Hora:</span>
                <span>{ticketActivo.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span>Destino / Mesa:</span>
                <span className="font-bold">{formatMesa(ticketActivo.mesa)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-bold">{ticketActivo.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span>RUC / Cédula:</span>
                <span>{ticketActivo.identificacion}</span>
              </div>
            </div>

            {/* Platos */}
            <div className="border-b border-dashed border-black/30 pb-2 space-y-1">
              <div className="flex justify-between font-bold text-[10px]">
                <span>Cant / Producto</span>
                <span>Total</span>
              </div>
              {ticketActivo.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span>${it.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between text-black/70">
                <span>Subtotal 15%:</span>
                <span>${ticketActivo.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>IVA 15%:</span>
                <span>${ticketActivo.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-black/20">
                <span>TOTAL USD:</span>
                <span>${ticketActivo.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Clave de Acceso SRI */}
            <div className="pt-2 border-t border-dashed border-black/30 text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-black/60 block">Clave de Acceso SRI</span>
              <div className="text-[8px] bg-black/5 p-1.5 rounded break-all tracking-wider">
                {ticketActivo.claveAcceso}
              </div>
              <span className="text-[9px] text-black/50 block">Autorizado en línea por SRI</span>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-black/80"
              >
                <IconPrinter className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketActivo(null)}
                className="px-4 py-2 border border-black/20 text-xs font-semibold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
