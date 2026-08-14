import Link from "next/link";
import { getDashboardData } from "@/db/queries/dashboard";

export const dynamic = "force-dynamic";

// Inline SVG icons – minimal, clean, professional
const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcDollar({ className }: { className?: string }) {
  return <svg {...s} className={className}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function IcFlame({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
}
function IcUsers({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcBook({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function IcPackage({ className }: { className?: string }) {
  return <svg {...s} className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function IcClipboard({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function IcFileText({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function IcMessageCircle({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
}
function IcAlertTriangle({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IcChevronRight({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="9 18 15 12 9 6"/></svg>;
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. Header & Live Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c62828]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-[#c9a84c] font-bold">
              Sistema Operativo · En Vivo
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#f5f0e8]">
            Dashboard Roma Pizzería
          </h1>
        </div>
      </div>

      {/* 2. Métricas Clave (Izquierda) + Accesos Rápidos Compactos (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Lado Izquierdo: 5 KPIs en cuadrícula */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* KPI 1: Ventas / Ingresos */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8a8078] uppercase tracking-wider">
                Ventas Totales
              </span>
              <span className="p-1.5 bg-[#2e7d32]/10 text-[#2e7d32] rounded-lg">
                <IcDollar className="w-4 h-4" />
              </span>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
              ${data.ingresosTotales.toFixed(2)}
            </p>
            <span className="text-[10px] text-[#2e7d32] block font-medium">
              Registrado en comandas
            </span>
          </div>

          {/* KPI 2: Comandas Activas */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8a8078] uppercase tracking-wider">
                Comandas Activas
              </span>
              <span className="p-1.5 bg-[#c62828]/10 text-[#c62828] rounded-lg">
                <IcFlame className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
                {data.pedidosEnCocina + data.pedidosListos}
              </p>
              <span className="text-xs text-[#8a8078]">/ {data.pedidosHoy} hoy</span>
            </div>
            <span className="text-[10px] text-[#c9a84c] block font-medium">
              {data.pedidosEnCocina} en cocina · {data.pedidosListos} listos
            </span>
          </div>

          {/* KPI 3: Clientes Registrados */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8a8078] uppercase tracking-wider">
                Clientes & Club
              </span>
              <span className="p-1.5 bg-[#c9a84c]/10 text-[#c9a84c] rounded-lg">
                <IcUsers className="w-4 h-4" />
              </span>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
              {data.totalClientes}
            </p>
            <span className={`text-[10px] font-medium block ${data.alertasPendientes > 0 ? "text-[#e53935]" : "text-[#2e7d32]"}`}>
              {data.alertasPendientes} alertas de inactividad
            </span>
          </div>

          {/* KPI 4: Platos en Menú */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8a8078] uppercase tracking-wider">
                Carta Digital
              </span>
              <span className="p-1.5 bg-white/[0.04] text-[#f5f0e8] rounded-lg">
                <IcBook className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
                {data.platosDisponibles}
              </p>
              <span className="text-xs text-[#8a8078]">/ {data.totalPlatos}</span>
            </div>
            <span className="text-[10px] text-[#2e7d32] block font-medium">
              En {data.totalCategorias} categorías
            </span>
          </div>

          {/* KPI 5: Estado de Inventario */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8a8078] uppercase tracking-wider">
                Stock Insumos
              </span>
              <span className="p-1.5 bg-[#d32f2f]/10 text-[#d32f2f] rounded-lg">
                <IcPackage className="w-4 h-4" />
              </span>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
              {data.totalInsumos}
            </p>
            <span className={`text-[10px] font-medium block ${data.insumosBajoStock > 0 ? "text-[#d32f2f] font-bold" : "text-[#2e7d32]"}`}>
              {data.insumosBajoStock > 0 ? `${data.insumosBajoStock} bajo mínimo` : "Niveles estables"}
            </span>
          </div>
        </div>

        {/* Lado Derecho: Accesos Rápidos uno sobre otro */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-2.5">
          <Link
            href="/admin/pedidos"
            className="group flex items-center justify-between bg-[#141210] border border-white/[0.06] hover:border-[#c62828]/60 rounded-2xl p-3 px-4 transition-all duration-200 shadow-md flex-1"
          >
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-[#c62828]/10 text-[#c62828] rounded-lg">
                <IcFlame className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="font-serif text-xs font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors block">
                  Comandas
                </span>
                <span className="text-[10px] text-[#c62828] font-bold">
                  {data.pedidosEnCocina} en cocina
                </span>
              </div>
            </div>
            <IcChevronRight className="w-4 h-4 text-[#8a8078] group-hover:text-[#c9a84c] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/menu"
            className="group flex items-center justify-between bg-[#141210] border border-white/[0.06] hover:border-[#c9a84c]/50 rounded-2xl p-3 px-4 transition-all duration-200 shadow-md flex-1"
          >
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-[#c9a84c]/10 text-[#c9a84c] rounded-lg">
                <IcBook className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="font-serif text-xs font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors block">
                  Menú & Carta
                </span>
                <span className="text-[10px] text-[#c9a84c] font-bold">
                  {data.platosDisponibles} activos
                </span>
              </div>
            </div>
            <IcChevronRight className="w-4 h-4 text-[#8a8078] group-hover:text-[#c9a84c] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/clientes"
            className="group flex items-center justify-between bg-[#141210] border border-white/[0.06] hover:border-[#c9a84c]/50 rounded-2xl p-3 px-4 transition-all duration-200 shadow-md flex-1"
          >
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-[#c9a84c]/10 text-[#c9a84c] rounded-lg">
                <IcUsers className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="font-serif text-xs font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors block">
                  Clientes
                </span>
                <span className="text-[10px] text-[#c9a84c] font-bold">
                  {data.totalClientes} en club
                </span>
              </div>
            </div>
            <IcChevronRight className="w-4 h-4 text-[#8a8078] group-hover:text-[#c9a84c] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/inventario"
            className="group flex items-center justify-between bg-[#141210] border border-white/[0.06] hover:border-[#c9a84c]/50 rounded-2xl p-3 px-4 transition-all duration-200 shadow-md flex-1"
          >
            <div className="flex items-center gap-3">
              <span className={`p-1.5 rounded-lg ${data.insumosBajoStock > 0 ? "bg-[#d32f2f]/10 text-[#d32f2f]" : "bg-white/[0.04] text-[#8a8078]"}`}>
                <IcPackage className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="font-serif text-xs font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors block">
                  Inventario
                </span>
                <span className={`text-[10px] font-bold ${data.insumosBajoStock > 0 ? "text-[#d32f2f]" : "text-[#8a8078]"}`}>
                  {data.insumosBajoStock > 0 ? `${data.insumosBajoStock} bajo stock` : `${data.totalInsumos} insumos`}
                </span>
              </div>
            </div>
            <IcChevronRight className="w-4 h-4 text-[#8a8078] group-hover:text-[#c9a84c] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/admin/facturas"
            className="group flex items-center justify-between bg-[#141210] border border-white/[0.06] hover:border-[#c9a84c]/50 rounded-2xl p-3 px-4 transition-all duration-200 shadow-md flex-1"
          >
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-white/[0.04] text-[#8a8078] rounded-lg">
                <IcFileText className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="font-serif text-xs font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors block">
                  Facturación & SRI
                </span>
                <span className="text-[10px] text-[#c9a84c] font-bold">
                  {data.totalFacturas} comprobantes
                </span>
              </div>
            </div>
            <IcChevronRight className="w-4 h-4 text-[#8a8078] group-hover:text-[#c9a84c] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* 4. Tablas de Acción Inmediata: Últimas Comandas + Alertas de Fidelización */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Comandas Recientes */}
        <div className="lg:col-span-2 bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="space-y-0.5">
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                <IcClipboard className="w-4.5 h-4.5 text-[#c9a84c]" /> Comandas y Pedidos Recientes
              </h3>
              <p className="text-xs text-[#8a8078]">
                Flujo de órdenes ingresadas desde mesas QR, salón y caja.
              </p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs text-[#c9a84c] hover:underline font-semibold"
            >
              Ver todas →
            </Link>
          </div>

          {data.ultimosPedidos.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-[#8a8078]">No hay pedidos registrados en la jornada de hoy.</p>
              <Link
                href="/app/mesa"
                target="_blank"
                className="inline-block text-xs text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/30 px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/20 transition-colors"
              >
                Hacer un pedido de prueba desde Mesa QR
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">ID</th>
                    <th className="pb-3 px-2">Origen / Mesa</th>
                    <th className="pb-3 px-2">Cliente</th>
                    <th className="pb-3 px-2">Total</th>
                    <th className="pb-3 px-2">Estado</th>
                    <th className="pb-3 px-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.ultimosPedidos.map((ped) => (
                    <tr key={ped.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 font-mono text-[#c9a84c]">
                        #{ped.id}
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-[#f5f0e8]">
                          {ped.mesa ? `Mesa ${ped.mesa}` : "Para Llevar / Caja"}
                        </span>
                        <span className="block text-[10px] text-[#8a8078] uppercase">
                          {ped.origen}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[#8a8078]">
                        {ped.clienteNombre || "Cliente General"}
                      </td>
                      <td className="py-3 px-2 font-serif font-bold text-[#f5f0e8]">
                        ${Number(ped.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            ped.estado === "en_cocina"
                              ? "bg-[#c62828]/20 text-[#c62828] border border-[#c62828]/30"
                              : ped.estado === "listo"
                              ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30"
                              : ped.estado === "entregado"
                              ? "bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/30"
                              : "bg-white/[0.06] text-[#8a8078]"
                          }`}
                        >
                          {ped.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href="/admin/pedidos"
                          className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-[#f5f0e8] rounded-lg border border-white/[0.06] text-[11px]"
                        >
                          Gestionar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Columna Derecha (1/3): Alertas de Fidelización & Stock */}
        <div className="space-y-6">
          {/* Widget Alertas Fidelización */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-serif text-base font-bold text-[#f5f0e8] flex items-center gap-2">
                <IcUsers className="w-4 h-4 text-[#c9a84c]" /> Alertas Tío Roma
              </h3>
              <span className="text-[10px] bg-[#c9a84c]/10 text-[#c9a84c] px-2 py-0.5 rounded-full font-bold">
                {data.alertasPendientes} pendientes
              </span>
            </div>

            {data.alertasUrgentes.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8a8078]">
                No hay clientes con alertas de inactividad pendientes.
              </div>
            ) : (
              <div className="space-y-3">
                {data.alertasUrgentes.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-3.5 bg-[#0a0908] border border-white/[0.05] rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#f5f0e8]">
                        {alerta.clienteNombre}
                      </span>
                      <span className="text-[10px] text-[#e53935] font-bold bg-[#e53935]/10 px-2 py-0.5 rounded-full">
                        {alerta.diasSinVolver} días ausente
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8a8078] line-clamp-2">
                      &ldquo;{alerta.mensajeSugerido}&rdquo;
                    </p>
                    {alerta.clienteTelefono && (
                      <a
                        href={`https://wa.me/${alerta.clienteTelefono.replace(/\D/g, "")}?text=${encodeURIComponent(alerta.mensajeSugerido)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#2e7d32] font-semibold hover:underline pt-1"
                      >
                        <IcMessageCircle className="w-3.5 h-3.5" /> Enviar mensaje por WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-center border-t border-white/[0.04]">
              <Link
                href="/admin/clientes"
                className="text-xs text-[#c9a84c] hover:underline font-semibold"
              >
                Ver módulo completo de clientes →
              </Link>
            </div>
          </div>

          {/* Widget Alerta de Inventario Crítico */}
          {data.insumosCriticos.length > 0 && (
            <div className="bg-[#141210] border border-[#d32f2f]/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="font-serif text-base font-bold text-[#f5f0e8] flex items-center gap-2">
                  <IcAlertTriangle className="w-4 h-4 text-[#d32f2f]" /> Stock Bajo Mínimo
                </h3>
                <span className="text-[10px] bg-[#d32f2f]/20 text-[#d32f2f] px-2 py-0.5 rounded-full font-bold">
                  {data.insumosCriticos.length} insumos
                </span>
              </div>

              <div className="space-y-2.5">
                {data.insumosCriticos.map((ins) => (
                  <div
                    key={ins.id}
                    className="flex items-center justify-between text-xs p-2.5 bg-[#0a0908] rounded-xl border border-white/[0.04]"
                  >
                    <div>
                      <span className="font-medium text-[#f5f0e8] block">
                        {ins.nombre}
                      </span>
                      <span className="text-[10px] text-[#8a8078]">
                        Mínimo requerido: {ins.stockMinimo} {ins.unidad}
                      </span>
                    </div>
                    <span className="font-bold text-[#d32f2f] bg-[#d32f2f]/10 px-2 py-1 rounded-lg">
                      {ins.stockActual} {ins.unidad}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-white/[0.04]">
                <Link
                  href="/admin/inventario"
                  className="text-xs text-[#c9a84c] hover:underline font-semibold"
                >
                  Registrar entrada de insumos →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
