"use client";

interface ReviewItem {
  id: number;
  calificacion: number;
  comentario: string | null;
  esPublica: boolean;
  creadaEn: Date | string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
}

interface AdminReviewsClientProps {
  resenas: ReviewItem[];
}

export default function AdminReviewsClient({ resenas }: AdminReviewsClientProps) {
  const max10 = resenas.slice(0, 10);

  const descargarCSV = () => {
    if (resenas.length === 0) {
      alert("No hay opiniones para exportar.");
      return;
    }

    const encabezados = ["ID", "Fecha", "Cliente", "Telefono", "Calificacion (Estrellas)", "Comentario", "Tipo"];
    const filas = resenas.map((r) => [
      r.id,
      new Date(r.creadaEn).toLocaleDateString("es-EC") + " " + new Date(r.creadaEn).toLocaleTimeString("es-EC"),
      `"${(r.clienteNombre || "Anonimo").replace(/"/g, '""')}"`,
      `"${(r.clienteTelefono || "").replace(/"/g, '""')}"`,
      r.calificacion,
      `"${(r.comentario || "").replace(/"/g, '""')}"`,
      r.calificacion === 5 ? "5 Estrellas (Google)" : "Opinion Privada",
    ]);

    const contenidoCSV =
      "\uFEFF" + [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\n");
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Opiniones_Roma_Restaurante_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-[#8a8078]">
            Mostrando las <strong className="text-white">{max10.length} más recientes</strong> de un total de {resenas.length} opiniones registradas.
          </span>
        </div>
        <button
          onClick={descargarCSV}
          className="inline-flex items-center justify-center gap-2 bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 text-[#c9a84c] border border-[#c9a84c]/40 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span>📥</span> Descargar Todas las Opiniones (CSV / Excel)
        </button>
      </div>

      {resenas.length === 0 ? (
        <div className="text-center py-10 text-[#8a8078] text-xs">
          Aún no se han recibido reseñas. Coloca el código QR en las mesas para empezar a captar clientes y opiniones.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {max10.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-2xl border transition-all ${
                r.calificacion === 5
                  ? "bg-[#0a0908] border-emerald-500/20"
                  : "bg-[#1a130f] border-amber-500/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < r.calificacion ? "text-amber-400" : "text-white/20"}>
                      ★
                    </span>
                  ))}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    r.calificacion === 5
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {r.calificacion === 5 ? "5⭐ Excelente" : `${r.calificacion}⭐ Por Mejorar`}
                </span>
              </div>

              <p className="text-xs text-[#f5f0e8] italic mb-3 min-h-[36px]">
                "{r.comentario || (r.calificacion === 5 ? "¡Excelente servicio y comida!" : "Sin comentario adicional")}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#8a8078] border-t border-white/5 pt-2">
                <span className="font-semibold text-white/80">
                  {r.clienteNombre || "Cliente Roma"}
                </span>
                <span>{new Date(r.creadaEn).toLocaleDateString("es-EC")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
