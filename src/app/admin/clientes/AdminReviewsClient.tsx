"use client";

import { useState } from "react";

const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcStar({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg {...s} className={className}>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
      />
    </svg>
  );
}
function IcDownload({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IcGift({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
}
function IcClipboard({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function IcX({ className }: { className?: string }) {
  return <svg {...s} className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IcCheck({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="20 6 9 17 4 12"/></svg>;
}

export interface ReviewItem {
  id: number;
  clienteId?: number | null;
  calificacion: number;
  comentario: string | null;
  esPublica: boolean;
  creadaEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  clienteEmail?: string | null;
  // Campos de encuesta
  platFavorito?: string | null;
  frecuenciaVisita?: string | null;
  comoNosConocio?: string | null;
  ocasionVisita?: string | null;
  nosRecomendaria?: boolean | null;
  sugerencias?: string | null;
  pizzaPromoReclamada?: boolean | null;
}

interface AdminReviewsClientProps {
  resenas: ReviewItem[];
}

export default function AdminReviewsClient({ resenas }: AdminReviewsClientProps) {
  const [filtro, setFiltro] = useState<"todas" | "encuestas" | "rapidas">("todas");
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<ReviewItem | null>(null);

  const filtradas = resenas.filter((r) => {
    if (filtro === "encuestas") return !!r.platFavorito || !!r.frecuenciaVisita || !!r.comoNosConocio;
    if (filtro === "rapidas") return !r.platFavorito && !r.frecuenciaVisita;
    return true;
  });

  const max12 = filtradas.slice(0, 12);

  const descargarCSV = () => {
    if (resenas.length === 0) {
      alert("No hay opiniones para exportar.");
      return;
    }

    const encabezados = [
      "ID",
      "Fecha",
      "Cliente",
      "Telefono",
      "Email",
      "Calificacion (Estrellas)",
      "Comentario",
      "Tipo",
      "Plato Favorito (Encuesta)",
      "Frecuencia Visita",
      "Como nos conocio",
      "Ocasion Visita",
      "Nos Recomendaria",
      "Sugerencias",
      "Promo Pizza Reclamada",
    ];

    const filas = resenas.map((r) => [
      r.id,
      new Date(r.creadaEn).toLocaleDateString("es-EC") + " " + new Date(r.creadaEn).toLocaleTimeString("es-EC"),
      `"${(r.clienteNombre || "Cliente Roma").replace(/"/g, '""')}"`,
      `"${(r.clienteTelefono || "").replace(/"/g, '""')}"`,
      `"${(r.clienteEmail || "").replace(/"/g, '""')}"`,
      r.calificacion,
      `"${(r.comentario || "").replace(/"/g, '""')}"`,
      r.platFavorito ? "Encuesta Fidelizacion (Opcion A)" : "Calificacion Rapida (Opcion B)",
      `"${(r.platFavorito || "N/A").replace(/"/g, '""')}"`,
      `"${(r.frecuenciaVisita || "N/A").replace(/"/g, '""')}"`,
      `"${(r.comoNosConocio || "N/A").replace(/"/g, '""')}"`,
      `"${(r.ocasionVisita || "N/A").replace(/"/g, '""')}"`,
      r.nosRecomendaria === false ? "No" : "Si",
      `"${(r.sugerencias || "").replace(/"/g, '""')}"`,
      r.pizzaPromoReclamada ? "Si (Cupon Emitido)" : "No",
    ]);

    const contenidoCSV =
      "\uFEFF" + [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\n");
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Opiniones_y_Encuestas_Roma_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Controles de Filtro & Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/[0.05]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFiltro("todas")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filtro === "todas"
                ? "bg-[#c9a84c] text-[#0a0908] font-bold shadow-sm"
                : "bg-white/5 text-[#8a8078] hover:text-white"
            }`}
          >
            Todas ({resenas.length})
          </button>
          <button
            onClick={() => setFiltro("encuestas")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              filtro === "encuestas"
                ? "bg-[#c9a84c] text-[#0a0908] font-bold shadow-sm"
                : "bg-white/5 text-[#8a8078] hover:text-white"
            }`}
          >
            <IcGift className="w-3.5 h-3.5" />
            <span>Encuestas con Promo ({resenas.filter((r) => r.platFavorito).length})</span>
          </button>
          <button
            onClick={() => setFiltro("rapidas")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filtro === "rapidas"
                ? "bg-[#c9a84c] text-[#0a0908] font-bold shadow-sm"
                : "bg-white/5 text-[#8a8078] hover:text-white"
            }`}
          >
            Opiniones Rápidas ({resenas.filter((r) => !r.platFavorito).length})
          </button>
        </div>

        <button
          onClick={descargarCSV}
          className="inline-flex items-center justify-center gap-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 text-[#c9a84c] border border-[#c9a84c]/30 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <IcDownload className="w-3.5 h-3.5" />
          <span>Descargar Todo (CSV / Excel con Encuestas)</span>
        </button>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-12 text-[#8a8078] text-xs bg-black/20 rounded-2xl border border-white/5">
          No hay registros en esta categoría todavía.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {max12.map((r) => {
            const tieneEncuesta = !!r.platFavorito || !!r.frecuenciaVisita;
            return (
              <div
                key={r.id}
                onClick={() => setDetalleSeleccionado(r)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] relative group ${
                  tieneEncuesta
                    ? "bg-[#141210] border-[#c9a84c]/30 hover:border-[#c9a84c]"
                    : r.calificacion === 5
                    ? "bg-[#0f1410] border-emerald-500/20 hover:border-emerald-500/40"
                    : "bg-[#17110e] border-amber-500/20 hover:border-amber-500/40"
                }`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-xs text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IcStar key={i} filled={i < r.calificacion} className="w-3.5 h-3.5" />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tieneEncuesta && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30 flex items-center gap-1">
                        <IcGift className="w-2.5 h-2.5" /> Encuesta
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        r.calificacion === 5
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {r.calificacion === 5 ? "5 Estrellas" : `${r.calificacion} Estrellas`}
                    </span>
                  </div>
                </div>

                {/* Comentario principal */}
                <p className="text-xs text-[#f5f0e8] italic mb-3 min-h-[32px] line-clamp-2">
                  "{r.comentario || r.sugerencias || (r.calificacion === 5 ? "¡Excelente servicio y comida!" : "Sin comentario adicional")}"
                </p>

                {/* Respuestas clave de la encuesta en miniatura */}
                {tieneEncuesta && (
                  <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 mb-3 space-y-1 text-[11px]">
                    {r.platFavorito && (
                      <div className="text-[#c9a84c] flex items-center justify-between">
                        <span className="text-[#8a8078]">Plato favorito:</span>
                        <strong className="text-white truncate max-w-[140px]">{r.platFavorito}</strong>
                      </div>
                    )}
                    {r.frecuenciaVisita && (
                      <div className="text-[#8a8078] flex items-center justify-between">
                        <span>Frecuencia:</span>
                        <span className="text-white/80">{r.frecuenciaVisita}</span>
                      </div>
                    )}
                    {r.comoNosConocio && (
                      <div className="text-[#8a8078] flex items-center justify-between">
                        <span>Conoció por:</span>
                        <span className="text-white/80">{r.comoNosConocio}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer con datos del cliente y botón ver */}
                <div className="flex items-center justify-between text-[11px] text-[#8a8078] border-t border-white/5 pt-2">
                  <div>
                    <span className="font-semibold text-white/90 block">
                      {r.clienteNombre || "Cliente Roma"}
                    </span>
                    {r.clienteTelefono && (
                      <span className="text-[10px] font-mono text-[#8a8078]">{r.clienteTelefono}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#c9a84c] group-hover:underline flex items-center gap-1">
                    Ver respuestas →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALLE COMPLETO DE RESPUESTAS DE LA ENCUESTA */}
      {detalleSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-[#c9a84c]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-fadeIn">
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">
                  {detalleSeleccionado.platFavorito ? "Encuesta de Fidelización (Opción A)" : "Calificación del Servicio"}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#f5f0e8]">
                  {detalleSeleccionado.clienteNombre || "Cliente Roma"}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#8a8078] mt-1 font-mono">
                  {detalleSeleccionado.clienteTelefono && (
                    <span>Tel: {detalleSeleccionado.clienteTelefono}</span>
                  )}
                  {detalleSeleccionado.clienteEmail && (
                    <span>{detalleSeleccionado.clienteEmail}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setDetalleSeleccionado(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <IcX className="w-4 h-4" />
              </button>
            </div>

            {/* Calificación en Estrellas */}
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8a8078] block">Calificación otorgada:</span>
                <div className="flex text-amber-400 gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IcStar
                      key={i}
                      filled={i < detalleSeleccionado.calificacion}
                      className="w-4 h-4"
                    />
                  ))}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                  detalleSeleccionado.calificacion === 5
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {detalleSeleccionado.calificacion === 5 ? "5 Estrellas (Google)" : `${detalleSeleccionado.calificacion} Estrellas (Privada)`}
              </span>
            </div>

            {/* Preguntas y Respuestas de la Encuesta */}
            <div className="space-y-3 text-xs">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <IcClipboard className="w-3.5 h-3.5 text-[#c9a84c]" /> Respuestas del Formulario:
              </h4>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#8a8078] text-[11px] block">Plato Favorito:</span>
                    <strong className="text-white text-xs">
                      {detalleSeleccionado.platFavorito || "No especificado"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8a8078] text-[11px] block">Frecuencia de Visita:</span>
                    <strong className="text-white text-xs">
                      {detalleSeleccionado.frecuenciaVisita || "No especificado"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8a8078] text-[11px] block">¿Cómo nos conoció?:</span>
                    <strong className="text-white text-xs">
                      {detalleSeleccionado.comoNosConocio || "No especificado"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8a8078] text-[11px] block">Ocasión de Visita:</span>
                    <strong className="text-white text-xs">
                      {detalleSeleccionado.ocasionVisita || "No especificado"}
                    </strong>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <span className="text-[#8a8078] text-[11px] block">¿Nos recomendaría con amigos o familia?:</span>
                  <strong className="text-emerald-400 flex items-center gap-1 mt-0.5">
                    <IcCheck className="w-3.5 h-3.5" />
                    {detalleSeleccionado.nosRecomendaria === false ? "No" : "Sí, definitivamente"}
                  </strong>
                </div>

                {(detalleSeleccionado.comentario || detalleSeleccionado.sugerencias) && (
                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[#8a8078] text-[11px] block">Comentarios / Sugerencias:</span>
                    <p className="text-white/90 italic mt-1 bg-black/30 p-2.5 rounded-xl border border-white/5">
                      "{detalleSeleccionado.comentario || detalleSeleccionado.sugerencias}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con WhatsApp */}
            <div className="flex gap-3 border-t border-white/[0.08] pt-4">
              {detalleSeleccionado.clienteTelefono ? (
                <a
                  href={`https://wa.me/${detalleSeleccionado.clienteTelefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(detalleSeleccionado.clienteNombre || "")},%20gracias%20por%20visitarnos%20en%20Roma%20Restaurante%20Pizzer%C3%ADa!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-[#2e7d32] hover:bg-[#388e3c] text-white font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Contactar por WhatsApp</span>
                </a>
              ) : null}
              <button
                onClick={() => setDetalleSeleccionado(null)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all"
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
