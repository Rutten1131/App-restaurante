import Link from "next/link";
import { getTodosRestaurantes } from "@/db/queries/restaurantes";

export const dynamic = "force-dynamic";

export default async function SuperAdminRestaurantesPage() {
  const restaurantesList = await getTodosRestaurantes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Directorio de Restaurantes
          </h1>
          <p className="text-xs text-[#8a8078]">
            Gestiona los perfiles, colores, logos, accesos y configuración fiscal de cada restaurante.
          </p>
        </div>
        <Link
          href="/superadmin/restaurantes/nuevo"
          className="px-4 py-2.5 bg-[#c9a84c] hover:bg-[#e8d48b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2 self-start"
        >
          <span>+</span> Crear Nuevo Restaurante
        </Link>
      </div>

      <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 overflow-hidden">
        {restaurantesList.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl">🏢</span>
            <p className="text-sm font-semibold text-white">No hay restaurantes creados</p>
            <Link
              href="/superadmin/restaurantes/nuevo"
              className="inline-block px-4 py-2 bg-[#c9a84c] text-black font-bold text-xs rounded-xl"
            >
              Crear primer restaurante
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8a8078] uppercase text-[10px] tracking-wider">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Restaurante</th>
                  <th className="pb-3">URL Pública</th>
                  <th className="pb-3">Datos SRI</th>
                  <th className="pb-3">Contacto</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {restaurantesList.map((rest) => (
                  <tr key={rest.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 font-mono text-[#8a8078]">#{rest.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: rest.colorFondo || "#0a0908",
                            color: rest.colorPrimario || "#c9a84c",
                          }}
                        >
                          {rest.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-white text-sm">
                            {rest.nombre}
                          </span>
                          <span className="block text-[10px] text-[#8a8078]">
                            {rest.nombreComercial || "Sin nombre comercial"}
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
                      <div>RUC: {rest.sriRuc || "No configurado"}</div>
                      <div className="text-[10px] text-[#8a8078]">
                        Punto: {rest.sriEstablecimiento || "001"}-{rest.sriPuntoEmision || "001"}
                      </div>
                    </td>
                    <td className="py-4 text-[#b8afa3]">
                      <div>{rest.telefono || "-"}</div>
                      <div className="text-[10px] text-[#8a8078]">{rest.email || "-"}</div>
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
                        className="px-3 py-1.5 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 text-[#c9a84c] rounded-lg border border-[#c9a84c]/30 transition-colors text-[11px] font-semibold"
                      >
                        Editar
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
