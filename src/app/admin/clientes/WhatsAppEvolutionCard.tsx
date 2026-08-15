"use client";

import { useState, useEffect, useTransition } from "react";
import {
  consultarEstadoWhatsAppAction,
  obtenerQRWhatsAppAction,
  enviarPruebaWhatsAppAction,
} from "./actions";

const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcPhone({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function IcCheck({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcQrCode({ className }: { className?: string }) {
  return <svg {...s} className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IcRefresh({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function IcSend({ className }: { className?: string }) {
  return <svg {...s} className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}

export default function WhatsAppEvolutionCard() {
  const [estado, setEstado] = useState<string>("verificando");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [cargandoQR, setCargandoQR] = useState(false);
  const [mensajePrueba, setMensajePrueba] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cargarEstado = async () => {
    try {
      const res = await consultarEstadoWhatsAppAction();
      setEstado(res?.state || "disconnected");
      if (res?.state !== "open") {
        cargarQR();
      }
    } catch {
      setEstado("disconnected");
    }
  };

  const cargarQR = async () => {
    setCargandoQR(true);
    try {
      const qrData = await obtenerQRWhatsAppAction();
      if (qrData?.base64) {
        setQrBase64(qrData.base64);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoQR(false);
    }
  };

  useEffect(() => {
    cargarEstado();
    const interval = setInterval(() => {
      consultarEstadoWhatsAppAction().then((res) => {
        if (res?.state) setEstado(res.state);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleEnviarPrueba = () => {
    setMensajePrueba(null);
    startTransition(async () => {
      const res = await enviarPruebaWhatsAppAction();
      if (res.success) {
        setMensajePrueba("¡Mensaje enviado al +593 96 341 0409!");
      } else {
        setMensajePrueba(`Error: ${res.error || "Verifica conexión"}`);
      }
      setTimeout(() => setMensajePrueba(null), 4000);
    });
  };

  const estaConectado = estado === "open";

  return (
    <div className="bg-[#141210] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#2e7d32]/15 text-[#2e7d32] rounded-lg">
            <IcPhone className="w-4 h-4" />
          </span>
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#f5f0e8]">
            Alertas WhatsApp (Evolution API)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {estaConectado ? (
            <span className="px-2.5 py-1 rounded-xl bg-[#2e7d32]/20 border border-[#2e7d32]/40 text-[#2e7d32] font-bold text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
              <span>Conectado</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Escanear QR</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              cargarEstado();
              cargarQR();
            }}
            title="Actualizar"
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg border border-white/[0.08] transition-colors text-xs"
          >
            <IcRefresh className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!estaConectado ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/[0.06]">
          <div className="flex-1 space-y-1.5 text-xs text-[#8a8078]">
            <span className="text-[11px] font-bold text-[#c9a84c] uppercase tracking-wider block">
              Vincular Dispositivo
            </span>
            <p className="leading-relaxed">
              Escanea este QR desde WhatsApp (<strong>Dispositivos vinculados</strong>) en tu celular para activar las alertas automáticas.
            </p>
          </div>

          <div className="p-2 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center shrink-0">
            {cargandoQR ? (
              <div className="w-28 h-28 flex items-center justify-center text-[11px] text-black/60">
                Generando...
              </div>
            ) : qrBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrBase64}
                alt="QR WhatsApp Evolution API"
                className="w-28 h-28 object-contain"
              />
            ) : (
              <button
                type="button"
                onClick={cargarQR}
                className="w-28 h-28 flex flex-col items-center justify-center gap-1 text-[11px] text-black/80 font-bold hover:bg-black/5 rounded-lg"
              >
                <IcQrCode className="w-6 h-6" />
                <span>Generar QR</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 bg-[#2e7d32]/10 border border-[#2e7d32]/30 p-3.5 rounded-2xl">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <IcCheck className="w-4 h-4 text-[#2e7d32]" /> Instancia activa y lista
          </span>

          <button
            type="button"
            onClick={handleEnviarPrueba}
            disabled={isPending}
            className="px-3.5 py-1.5 bg-[#2e7d32] hover:bg-[#388e3c] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <IcSend className="w-3 h-3" />
            <span>{isPending ? "Enviando..." : "Mensaje de Prueba"}</span>
          </button>
        </div>
      )}

      {mensajePrueba && (
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white flex items-center gap-2 animate-fadeIn">
          <span>{mensajePrueba}</span>
        </div>
      )}
    </div>
  );
}
