import Link from "next/link";
import { getClientesConAlertas } from "@/db/queries/clientes";
import { getConfiguracion } from "@/db/queries/fidelizacion";
import { crearClienteAction, guardarGoogleReviewUrlAction } from "./actions";
import AdminReviewsClient from "./AdminReviewsClient";
import QRCodeCard from "./QRCodeCard";

export const dynamic = "force-dynamic";

// Clean inline SVGs
const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcStar({ className }: { className?: string }) {
  return <svg {...s} className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none"/></svg>;
}
function IcLink({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function IcQrCode({ className }: { className?: string }) {
  return <svg {...s} className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IcGift({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
}
function IcMessageSquare({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IcUserPlus({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}
function IcUsers({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}


export default async function AdminClientesPage() {
  const { clientes, alertas, resenas } = await getClientesConAlertas();
  const googleReviewUrl =
    (await getConfiguracion("google_review_url")) ||
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    "https://search.google.com/local/writereview?placeid=ChIJXXXXXXXXXXXXXXXXXXXX";

  // Métricas
  const totalResenas = resenas.length;
  const promedioEstrellas =
    totalResenas > 0
      ? (
          resenas.reduce((acc, r) => acc + r.calificacion, 0) / totalResenas
        ).toFixed(1)
      : "5.0";

  const conteo5 = resenas.filter((r) => r.calificacion === 5).length;
  const conteo4 = resenas.filter((r) => r.calificacion === 4).length;
  const conteo3 = resenas.filter((r) => r.calificacion === 3).length;
  const conteo2o1 = resenas.filter((r) => r.calificacion <= 2).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8a8078] mb-1">
            <Link href="/admin" className="hover:text-[#c9a84c] transition-colors">
              ← Volver al Dashboard
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#f5f0e8]">
            Clientes, Fidelización & Reseñas
          </h1>
          <p className="text-xs text-[#8a8078] mt-1">
            Gestión del Club Roma, Código QR unificado, opiniones de clientes y configuración de Google Reviews.
          </p>
        </div>

        {/* Resumen rápido de satisfacción */}
        <div className="flex items-center gap-3">
          <div className="bg-[#141210] border border-white/[0.06] px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] text-[#8a8078] uppercase font-semibold">Promedio</span>
            <span className="text-lg font-bold text-[#c9a84c] flex items-center justify-center gap-1.5">
              <IcStar className="w-4 h-4 text-[#c9a84c]" /> {promedioEstrellas}
            </span>
          </div>
          <div className="bg-[#141210] border border-white/[0.06] px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] text-[#8a8078] uppercase font-semibold">Total Opiniones</span>
            <span className="text-lg font-bold text-[#f5f0e8]">{totalResenas}</span>
          </div>
          <div className="bg-[#141210] border border-white/[0.06] px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] text-[#8a8078] uppercase font-semibold">Clientes Club</span>
            <span className="text-lg font-bold text-[#f5f0e8]">{clientes.length}</span>
          </div>
        </div>
      </div>

      {/* CONFIGURACIÓN DEL ENLACE DE GOOGLE REVIEWS */}
      <div className="bg-[#141210] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
              <IcLink className="w-4 h-4 text-[#c9a84c]" /> Configuración: Enlace de Reseñas de Google Maps
            </h2>
            <p className="text-xs text-[#8a8078] mt-0.5">
              Cuando un cliente califique con 5 Estrellas, este será el enlace directo al que se le invitará a opinar.
            </p>
          </div>
        </div>

        <form action={guardarGoogleReviewUrlAction} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            name="googleReviewUrl"
            defaultValue={googleReviewUrl}
            placeholder="https://g.page/r/... o https://search.google.com/local/writereview?placeid=..."
            required
            className="flex-1 bg-[#0a0908] border border-white/[0.1] rounded-2xl px-4 py-3 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs rounded-2xl transition-all shadow-md shadow-[#c9a84c]/20 uppercase tracking-wider"
          >
            Guardar Enlace
          </button>
        </form>
      </div>

      {/* CÓDIGO QR UNIFICADO OFICIAL */}
      <div className="bg-gradient-to-br from-[#1c1917] via-[#141210] to-[#0a0908] border border-[#c9a84c]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30">
              <IcQrCode className="w-3.5 h-3.5" /> Código QR Oficial Único de Mesas & Barra
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
              Un solo Código QR para Todo: Fidelización, Promo Pizza & Reseñas
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8078] leading-relaxed">
              Tus clientes escanean este único código QR en su mesa. Ingresan su <strong className="text-white">Nombre y Teléfono</strong> (identificador del club) y pueden elegir:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl">
                <p className="text-xs font-bold text-[#c9a84c] flex items-center gap-1.5">
                  <IcGift className="w-3.5 h-3.5" /> Opción A: Encuesta + Promo 1 Pizza
                </p>
                <p className="text-[11px] text-[#8a8078] mt-1">
                  Responden preguntas sobre gustos, califican y reciben su cupón de pizza gratis.
                </p>
              </div>
              <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl">
                <p className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <IcStar className="w-3.5 h-3.5" /> Opción B: Calificación Rápida
                </p>
                <p className="text-[11px] text-[#8a8078] mt-1">
                  Van directo a estrellas. Si es 5 estrellas va a Google Maps; si es menor queda como opinión privada.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta del QR imprimible */}
          <QRCodeCard />
        </div>
      </div>

      {/* FEEDBACK & RESEÑAS RECIBIDAS (DESGLOSE DE ESTRELLAS + MAX 10 + EXPORTAR CSV) */}
      <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <IcMessageSquare className="w-4.5 h-4.5 text-[#c9a84c]" /> Calificaciones & Opiniones de Clientes ({resenas.length})
            </h2>
            <p className="text-xs text-[#8a8078] mt-0.5">
              Registro de todas las calificaciones ingresadas en el sistema.
            </p>
          </div>

          {/* Desglose de estrellas real */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-medium flex items-center gap-1">
              <IcStar className="w-3 h-3" /> 5 Estrellas: <strong>{conteo5}</strong>
            </span>
            <span className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-xl font-medium flex items-center gap-1">
              <IcStar className="w-3 h-3 text-white/60" /> 4 Estrellas: <strong>{conteo4}</strong>
            </span>
            <span className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-xl font-medium flex items-center gap-1">
              <IcStar className="w-3 h-3 text-white/40" /> 3 Estrellas: <strong>{conteo3}</strong>
            </span>
            <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium flex items-center gap-1">
              <IcStar className="w-3 h-3 text-red-400" /> 1-2 Estrellas: <strong>{conteo2o1}</strong>
            </span>
          </div>
        </div>

        {/* Componente Cliente con máximo 10 y botón de Descarga CSV */}
        <AdminReviewsClient resenas={resenas} />
      </div>

      {/* DIRECTORIO DE CLIENTES + REGISTRO MANUAL */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulario para registrar cliente manual */}
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 space-y-5 shadow-xl h-fit">
          <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <IcUserPlus className="w-4 h-4 text-[#c9a84c]" /> Registrar Cliente Manual
          </h2>

          <form action={crearClienteAction} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                required
                placeholder="Ej. María Augusta Loaiza"
                className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                Teléfono / WhatsApp * (Identificador)
              </label>
              <input
                type="tel"
                name="telefono"
                required
                placeholder="0991234567"
                className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="cliente@gmail.com"
                className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#c9a84c]/20"
            >
              Guardar en Club Roma
            </button>
          </form>
        </div>

        {/* Listado de Clientes Registrados */}
        <div className="lg:col-span-2 bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                <IcUsers className="w-4.5 h-4.5 text-[#c9a84c]" /> Directorio de Clientes ({clientes.length})
              </h2>
              <p className="text-xs text-[#8a8078] mt-0.5">
                Se registran automáticamente al pedir desde la web/mesa o al escanear el QR de fidelización.
              </p>
            </div>
          </div>

          {clientes.length === 0 ? (
            <div className="text-center py-12 text-[#8a8078] text-xs">
              No hay clientes registrados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#141210]">
                  <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">Código</th>
                    <th className="pb-3 px-2">Nombre</th>
                    <th className="pb-3 px-2">Contacto</th>
                    <th className="pb-3 px-2">Fecha Registro</th>
                    <th className="pb-3 px-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 font-mono text-[#c9a84c]">
                        {c.numeroCliente}
                      </td>
                      <td className="py-3 px-2 font-semibold text-[#f5f0e8]">
                        {c.nombre}
                      </td>
                      <td className="py-3 px-2 text-[#8a8078]">
                        <div className="font-mono text-white/90">{c.telefono || "Sin teléfono"}</div>
                        <div className="text-[10px]">{c.email}</div>
                      </td>
                      <td className="py-3 px-2 text-[#8a8078]">
                        {new Date(c.creadoEn).toLocaleDateString("es-EC")}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {c.telefono ? (
                          <a
                            href={`https://wa.me/${c.telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(c.nombre)},%20te%20saludamos%20desde%20Roma%20Restaurante%20Pizzer%C3%ADa!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] bg-[#2e7d32]/15 text-[#2e7d32] border border-[#2e7d32]/30 px-2.5 py-1 rounded-lg hover:bg-[#2e7d32]/30 transition-colors font-medium"
                          >
                            <IcMessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-[#8a8078] text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
