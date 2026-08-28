import Link from "next/link";
import { getSuperAdminDashboardMetrics } from "@/db/queries/restaurantes";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboardPage() {
  const metrics = await getSuperAdminDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#171410] via-[#1f1a14] to-[#171410] border border-[#c9a84c]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#c9a84c] px-3 py-1 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full inline-block">
            Panel de Control Central SaaS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Plataforma Multi-Restaurante
          </h1>
          <p className="text-xs text-[#b8afa3] max-w-xl">
            Crea, configura y supervisa múltiples marcas y perfiles de restaurantes independientes desde este panel unificado.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/superadmin/restaurantes/nuevo"
            className="px-5 py-3 bg-[#c9a84c] hover:bg-[#e8d48b] text-black font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-[#c9a84c]/20 inline-flex items-center gap-2"
          >
            <span>+</span> Crear Nuevo Restaurante
          </Link>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#12100e] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8a8078] font-semibold">
              Restaurantes
            </span>
            <span className="text-base">🏢</span>
          </div>
          <div className="text-3xl font-serif font-black text-white">
            {metrics.totalRestaurantes}
          </div>
          <span className="text-[10px] text-[#2e7d32] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
            {metrics.restaurantesActivos} activos en plataforma
          </span>
        </div>

        <div className="bg-[#12100e] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8a8078] font-semibold">
              Ventas Totales
            </span>
            <span className="text-base">💰</span>
          </div>
          <div className="text-3xl font-serif font-black text-[#c9a84c]">
            ${metrics.ingresosGlobales.toFixed(2)}
          </div>
          <span className="text-[10px] text-[#8a8078]">
            {metrics.totalPedidosGlobal} pedidos procesados
          </span>
        </div>

        <div className="bg-[#12100e] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8a8078] font-semibold">
              Platos en Carta
            </span>
            <span className="text-base">🍕</span>
          </div>
          <div className="text-3xl font-serif font-black text-white">
            {metrics.totalPlatosGlobal}
          </div>
          <span className="text-[10px] text-[#8a8078]">
            Catálogo global de productos
          </span>
        </div>

        <div className="bg-[#12100e] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8a8078] font-semibold">
              Clientes & Fidelización
            </span>
            <span className="text-base">👥</span>
          </div>
          <div className="text-3xl font-serif font-black text-white">
            {metrics.totalClientesGlobal}
          </div>
          <span className="text-[10px] text-[#8a8078]">
            {metrics.totalFacturasGlobal} comprobantes generados
          </span>
        </div>
      </div>

      {/* Restaurantes Recientes Table */}
      <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">
              Restaurantes Registrados
            </h2>
            <p className="text-xs text-[#8a8078]">
              Perfiles creados con su propia web, carta y administración.
            </p>
          </div>
          <Link
            href="/superadmin/restaurantes"
            className="text-xs text-[#c9a84c] hover:underline font-semibold"
          >
            Ver todos ({metrics.totalRestaurantes}) →
          </Link>
        </div>

        {metrics.ultimosRestaurantes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl space-y-3">
            <span className="text-4xl">🍕</span>
            <p className="text-sm font-semibold text-white">No hay restaurantes aún</p>
            <p className="text-xs text-[#8a8078] max-w-sm mx-auto">
              Comienza creando el primer restaurante para asignar su URL, carta y panel.
            </p>
            <Link
              href="/superadmin/restaurantes/nuevo"
              className="inline-block px-4 py-2 bg-[#c9a84c] text-black font-bold text-xs rounded-xl"
            >
              + Crear Restaurante
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8a8078] uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Restaurante</th>
                  <th className="pb-3">Slug / URL Pública</th>
                  <th className="pb-3">Contacto</th>
                  <th className="pb-3">Ciudad</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.ultimosRestaurantes.map((rest) => (
                  <tr key={rest.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: rest.colorFondo || "#0a0908", color: rest.colorPrimario || "#c9a84c" }}
                        >
                          {rest.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-white text-sm">
                            {rest.nombre}
                          </span>
                          <span className="block text-[10px] text-[#8a8078]">
                            {rest.nombreComercial || "Sin razón social"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/r/${rest.slug}`}
                        target="_blank"
                        className="font-mono text-[#c9a84c] hover:underline bg-[#c9a84c]/10 px-2 py-1 rounded-md border border-[#c9a84c]/30 inline-block"
                      >
                        /r/{rest.slug} ↗
                      </Link>
                    </td>
                    <td className="py-4 text-[#b8afa3]">
                      <div>{rest.telefono || "Sin teléfono"}</div>
                      <div className="text-[10px] text-[#8a8078]">{rest.email || "-"}</div>
                    </td>
                    <td className="py-4 text-[#b8afa3]">
                      {rest.ciudad || "Loja"}, {rest.pais || "Ecuador"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rest.activo
                            ? "bg-[#2e7d32]/20 text-[#81c784] border border-[#2e7d32]/40"
                            : "bg-[#c62828]/20 text-[#e57373] border border-[#c62828]/40"
                        }`}
                      >
                        {rest.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Link
                        href={`/superadmin/restaurantes/${rest.id}`}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors text-[11px]"
                      >
                        Configurar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
