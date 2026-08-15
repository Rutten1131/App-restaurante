import Link from "next/link";
import { getDashboardData } from "@/db/queries/dashboard";
import { formatMesa } from "@/lib/formatMesa";

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
function IcMessageCircle({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
}
function IcAlertTriangle({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IcChevronRight({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="9 18 15 12 9 6"/></svg>;
}

export default async function AdminResumenPage() {
  const data = await getDashboardData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">
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
            Resumen General del Restaurante
          </h1>
          <p className="text-xs text-[#8a8078]">
            Visión global del restaurante: ventas totales, comanda en curso, clientes registrados y stock de insumos.
          </p>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas (5 Columnas Completas) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Métrica 1: Ventas / Ingresos */}
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

        {/* Métrica 2: Comandas Activas */}
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
              {data.pedidosNuevos + data.pedidosEnCocina}
            </p>
            <span className="text-xs text-[#8a8078]">/ {data.pedidosHoy} hoy</span>
          </div>
          <span className="text-[10px] text-[#c9a84c] block font-medium">
            {data.pedidosNuevos} en caja · {data.pedidosEnCocina} en horno
          </span>
        </div>

        {/* Métrica 3: Clientes Registrados */}
        <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8a8078] uppercase tracking-wider">
              Clientes en Club
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

        {/* Métrica 4: Platos en Menú */}
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

        {/* Métrica 5: Estado de Inventario */}
        <div className="bg-[#141210] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-1.5 hover:border-[#c9a84c]/40 transition-colors col-span-2 sm:col-span-1">
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

      {/* 3. Tablas y Alertas Operativas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2 cols): Últimas Comandas en Vivo */}
        <div className="lg:col-span-2 bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                <IcClipboard className="w-4.5 h-4.5 text-[#c9a84c]" /> Actividad Reciente de Comandas
              </h2>
              <p className="text-xs text-[#8a8078] mt-0.5">
                Últimos pedidos registrados en el sistema en tiempo real.
              </p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs text-[#c9a84c] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver Comandas</span>
              <IcChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-2">Comanda</th>
                  <th className="pb-3 px-2">Hora</th>
                  <th className="pb-3 px-2">Destino / Cliente</th>
                  <th className="pb-3 px-2">Estado</th>
                  <th className="pb-3 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.ultimosPedidos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#8a8078]">
                      Sin comandas recientes registradas
                    </td>
                  </tr>
                ) : (
                  data.ultimosPedidos.map((ped) => (
                    <tr key={ped.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-[#c9a84c]">
                        #{ped.id}
                      </td>
                      <td className="py-3 px-2 text-[#8a8078]">
                        {new Date(ped.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-2 text-[#f5f0e8]">
                        <span className="font-semibold">{formatMesa(ped.mesa)}</span>
                        {ped.clienteNombre && (
                          <span className="text-[#8a8078] text-[10px] block truncate max-w-[120px]">
                            {ped.clienteNombre}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ped.estado === "recibido"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : ped.estado === "en_cocina"
                              ? "bg-[#c62828]/20 text-[#e53935] border border-[#c62828]/30"
                              : ped.estado === "listo"
                              ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30"
                              : "bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/30"
                          }`}
                        >
                          {ped.estado === "recibido"
                            ? "Recibido"
                            : ped.estado === "en_cocina"
                            ? "En Cocina"
                            : ped.estado === "listo"
                            ? "Listo"
                            : "Entregado"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-serif font-bold text-[#f5f0e8]">
                        ${Number(ped.total).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha (1 col): Inactividad de Clientes & Alertas */}
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                  <IcAlertTriangle className="w-4.5 h-4.5 text-[#e53935]" /> Fidelización & Alertas
                </h2>
                <p className="text-xs text-[#8a8078] mt-0.5">
                  Clientes que no han vuelto recientemente.
                </p>
              </div>
              <Link
                href="/admin/clientes"
                className="text-xs text-[#c9a84c] hover:underline font-semibold"
              >
                Ver Club
              </Link>
            </div>

            {data.alertasUrgentes.length === 0 ? (
              <div className="py-10 text-center text-[#8a8078] text-xs">
                Excelente. No hay clientes con alertas de inactividad pendientes.
              </div>
            ) : (
              <div className="space-y-3">
                {data.alertasUrgentes.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] space-y-2 hover:border-[#c9a84c]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#f5f0e8]">
                        {alerta.clienteNombre}
                      </span>
                      <span className="text-[10px] font-bold text-[#e53935] bg-[#e53935]/10 px-2 py-0.5 rounded-full border border-[#e53935]/20">
                        {alerta.diasSinVolver} días sin visita
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8a8078] italic line-clamp-2">
                      "{alerta.mensajeSugerido}"
                    </p>

                    {alerta.clienteTelefono && (
                      <div className="pt-1 flex justify-end">
                        <a
                          href={`https://wa.me/${alerta.clienteTelefono.replace(/\D/g, "")}?text=${encodeURIComponent(alerta.mensajeSugerido)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] bg-[#2e7d32]/15 text-[#2e7d32] border border-[#2e7d32]/30 px-3 py-1 rounded-xl hover:bg-[#2e7d32]/30 transition-colors font-medium"
                        >
                          <IcMessageCircle className="w-3.5 h-3.5" />
                          <span>Enviar Promo WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8a8078]">
            <span>Calificación Promedio:</span>
            <span className="text-[#c9a84c] font-bold font-mono">
              ★ {data.promedioResenas} ({data.totalResenas} opiniones)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
