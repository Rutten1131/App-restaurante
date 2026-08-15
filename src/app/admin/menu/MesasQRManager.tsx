"use client";

import { useState, useEffect } from "react";
import { guardarConfiguracionMesasAction } from "./actions";

interface MesasQRManagerProps {
  initialTotalMesas: number;
}

const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcQrCode({ className }: { className?: string }) {
  return <svg {...s} className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="7" y="7" width="1" height="1"/><rect x="17" y="7" width="1" height="1"/><rect x="7" y="17" width="1" height="1"/></svg>;
}
function IcDownload({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IcExternalLink({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}
function IcCopy({ className }: { className?: string }) {
  return <svg {...s} className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function IcCheck({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcPrinter({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
}

export default function MesasQRManager({ initialTotalMesas }: MesasQRManagerProps) {
  const [totalMesas, setTotalMesas] = useState(initialTotalMesas || 12);
  const [origin, setOrigin] = useState("https://app-restaurante-rose.vercel.app");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [mesaSeleccionadaQR, setMesaSeleccionadaQR] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleGuardarTotal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito(null);

    const formData = new FormData();
    formData.append("totalMesas", String(totalMesas));

    try {
      await guardarConfiguracionMesasAction(formData);
      setMensajeExito(`¡Configuración guardada! ${totalMesas} mesas activas.`);
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err: any) {
      alert("Error al guardar: " + (err.message || "Error desconocido"));
    } finally {
      setGuardando(false);
    }
  };

  const handleCopiarEnlace = (numMesa: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiadoIdx(numMesa);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  const arrayMesas = Array.from({ length: totalMesas }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* 1. Panel de Configuración de Cantidad de Mesas */}
      <div className="bg-[#141210] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#c9a84c]/10 text-[#c9a84c] rounded-lg">
                <IcQrCode className="w-5 h-5" />
              </span>
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8]">
                Configuración de Mesas & Códigos QR
              </h2>
            </div>
            <p className="text-xs text-[#8a8078] max-w-xl">
              Configura cuántas mesas tiene el restaurante. Haz clic sobre cualquier mesa para abrir, probar o descargar su código QR oficial en alta definición.
            </p>
          </div>

          {/* Formulario de Cantidad de Mesas */}
          <form onSubmit={handleGuardarTotal} className="flex flex-wrap items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <label htmlFor="inputTotalMesas" className="text-xs font-semibold text-[#c9a84c] whitespace-nowrap">
                Total de Mesas:
              </label>
              <div className="flex items-center bg-[#0a0908] border border-white/[0.1] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTotalMesas((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 text-sm font-bold transition-colors"
                >
                  -
                </button>
                <input
                  id="inputTotalMesas"
                  type="number"
                  min={1}
                  max={50}
                  value={totalMesas}
                  onChange={(e) => setTotalMesas(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 bg-transparent text-center text-sm font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTotalMesas((prev) => Math.min(50, prev + 1))}
                  className="px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 text-sm font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 bg-[#c9a84c] text-[#0a0908] font-bold text-xs rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar Mesas"}
            </button>
          </form>
        </div>

        {mensajeExito && (
          <div className="p-3 rounded-xl bg-[#2e7d32]/20 border border-[#2e7d32]/40 text-[#2e7d32] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <IcCheck className="w-4 h-4" />
            <span>{mensajeExito}</span>
          </div>
        )}
      </div>

      {/* 2. Cuadrícula Limpia de Mesas (Sin los 12 QRs gigantes a la vista) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {arrayMesas.map((numMesa) => {
          const mesaParam = String(numMesa);
          const targetUrl = `${origin}/app/menu?mesa=${mesaParam}`;

          return (
            <div
              key={numMesa}
              onClick={() => setMesaSeleccionadaQR(numMesa)}
              className="bg-[#141210] border border-white/[0.08] hover:border-[#c9a84c] rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:-translate-y-1"
            >
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="font-serif text-sm font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors">
                    Mesa {numMesa}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#c9a84c]/50 group-hover:bg-[#c9a84c]" />
                </div>

                {/* Ícono de QR minimalista */}
                <div className="w-14 h-14 mx-auto rounded-2xl bg-black/40 border border-white/[0.06] group-hover:border-[#c9a84c]/40 flex items-center justify-center text-[#c9a84c] transition-colors">
                  <IcQrCode className="w-7 h-7" />
                </div>

                <div className="text-[10px] font-mono text-[#8a8078] truncate">
                  /app/menu?mesa={numMesa}
                </div>
              </div>

              {/* Botón de acción */}
              <button
                type="button"
                className="w-full py-2 bg-white/[0.04] group-hover:bg-[#c9a84c] text-[#c9a84c] group-hover:text-[#0a0908] font-bold text-xs rounded-xl border border-[#c9a84c]/30 transition-all flex items-center justify-center gap-1.5"
              >
                <IcQrCode className="w-3.5 h-3.5" />
                <span>Ver Código QR</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL / POPUP PARA VER Y DESCARGAR EL QR DE LA MESA SELECCIONADA */}
      {mesaSeleccionadaQR !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl animate-fadeIn relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                  Código QR · Mesa {mesaSeleccionadaQR}
                </h3>
                <p className="text-xs text-[#8a8078]">
                  Roma Pizzería · Menú Digital
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMesaSeleccionadaQR(null)}
                className="text-[#8a8078] hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Código QR en grande */}
            <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-2xl aspect-square max-w-[240px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${origin}/app/menu?mesa=${mesaSeleccionadaQR}`)}`}
                alt={`Código QR Mesa ${mesaSeleccionadaQR}`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-[11px] font-mono text-[#c9a84c] bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 truncate text-center">
              {origin}/app/menu?mesa={mesaSeleccionadaQR}
            </div>

            {/* Acciones */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&data=${encodeURIComponent(`${origin}/app/menu?mesa=${mesaSeleccionadaQR}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`QR_Mesa_${mesaSeleccionadaQR}_Roma.png`}
                  className="py-2.5 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-[#c9a84c]/20"
                >
                  <IcDownload className="w-3.5 h-3.5" />
                  <span>Descargar PNG</span>
                </a>

                <a
                  href={`${origin}/app/menu?mesa=${mesaSeleccionadaQR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs rounded-xl border border-white/[0.08] transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <IcExternalLink className="w-3.5 h-3.5" />
                  <span>Probar Menú</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleCopiarEnlace(mesaSeleccionadaQR, `${origin}/app/menu?mesa=${mesaSeleccionadaQR}`)}
                className="w-full py-2 bg-black/40 hover:bg-black/80 text-[#8a8078] hover:text-white rounded-xl text-xs font-medium border border-white/[0.04] transition-all flex items-center justify-center gap-1.5"
              >
                {copiadoIdx === mesaSeleccionadaQR ? (
                  <>
                    <IcCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
                    <span className="text-[#2e7d32] font-semibold">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <IcCopy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace Directo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
