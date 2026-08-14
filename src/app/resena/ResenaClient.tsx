"use client";

import { useState, useTransition } from "react";
import {
  registrarClienteAction,
  guardarResenaAction,
} from "../fidelizacion/actions";

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ??
  "https://search.google.com/local/writereview?placeid=ChIJXXXXXXXXXXXXXXXXXXXX";

type Step = 1 | 2 | "done";

export default function ResenaClient() {
  const [step, setStep] = useState<Step>(1);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [finalRating, setFinalRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Step 1
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // Step 2
  const [comentario, setComentario] = useState("");

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-all text-sm";
  const labelCls =
    "block text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c] mb-1.5";

  const handleStep1 = () => {
    if (!nombre.trim() || !telefono.trim()) {
      setError("Por favor completa nombre y teléfono.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("nombre", nombre);
    fd.append("telefono", telefono);

    startTransition(async () => {
      const res = await registrarClienteAction(fd);
      if ("error" in res) {
        setError(res.error);
      } else {
        setClienteId(res.clienteId);
        setStep(2);
      }
    });
  };

  const handleStep2 = () => {
    const stars = finalRating || hoverRating;
    if (!stars) {
      setError("Por favor selecciona una calificación.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("clienteId", String(clienteId));
    fd.append("calificacion", String(stars));
    fd.append("comentario", comentario);

    startTransition(async () => {
      const res = await guardarResenaAction(fd);
      if ("error" in res) {
        setError(res.error);
      } else {
        setFinalRating(stars);
        setStep("done");
      }
    });
  };

  const stepNum = step === "done" ? 2 : (step as number);

  return (
    <div className="min-h-screen bg-[#0a0908] flex flex-col items-center justify-start px-4 py-8 pb-16">
      {/* Header */}
      <div className="text-center mb-6 mt-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 mb-3">
          <span className="text-3xl">⭐</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#f5f0e8] italic tracking-tight">
          Roma Pizzería
        </h1>
        <p className="text-xs text-[#8a8078] mt-0.5">Califica tu experiencia</p>
      </div>

      {/* Progress */}
      {step !== "done" && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-center gap-6 mb-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    stepNum >= s
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                      : "border-white/20 text-white/30"
                  }`}
                >
                  {stepNum > s ? "✓" : s}
                </div>
                <span
                  className={`text-[10px] ${stepNum >= s ? "text-[#c9a84c]" : "text-white/20"}`}
                >
                  {s === 1 ? "Tus Datos" : "Calificación"}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-white/10 rounded-full">
            <div
              className="absolute h-full bg-gradient-to-r from-[#c9a84c] to-[#e8c770] rounded-full transition-all duration-500"
              style={{ width: `${((stepNum - 1) / 1) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md bg-[#141210] border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8] italic">
                Antes de calificar...
              </h2>
              <p className="text-xs text-[#8a8078] mt-1">
                Solo necesitamos dos datos para personalizar tu reseña.
              </p>
            </div>

            <div>
              <label className={labelCls}>Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className={inputCls}
                autoComplete="name"
              />
            </div>

            <div>
              <label className={labelCls}>Teléfono / WhatsApp *</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="0991234567"
                className={inputCls}
                autoComplete="tel"
              />
            </div>

            <button
              onClick={handleStep1}
              disabled={isPending}
              className="w-full py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c770] text-[#0a0908] font-bold rounded-2xl shadow-lg shadow-[#c9a84c]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Continuar →"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8] italic">
                ¿Cómo fue tu experiencia?
              </h2>
              <p className="text-xs text-[#8a8078] mt-1">
                Tu opinión es muy importante para nosotros.
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFinalRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-4xl transition-all hover:scale-125 active:scale-110"
                >
                  {s <= (hoverRating || finalRating) ? "⭐" : "☆"}
                </button>
              ))}
            </div>

            {(finalRating || hoverRating) > 0 && (
              <p className="text-center text-sm text-[#c9a84c] font-semibold -mt-2">
                {["", "Muy malo 😞", "Malo 😕", "Regular 😐", "Bueno 😊", "¡Excelente! 🤩"][
                  finalRating || hoverRating
                ]}
              </p>
            )}

            {/* Feedback privado solo si < 5 */}
            {finalRating > 0 && finalRating < 5 && (
              <div>
                <label className={labelCls}>
                  ¿Qué podemos mejorar para llegar a 5 estrellas?
                </label>
                <textarea
                  rows={4}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Cuéntanos qué falló o qué podemos hacer mejor..."
                  className={inputCls + " resize-none"}
                />
              </div>
            )}

            {finalRating === 5 && (
              <div>
                <label className={labelCls}>Añade un comentario (opcional)</label>
                <textarea
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="¿Qué fue lo que más te gustó?"
                  className={inputCls + " resize-none"}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(1); setError(null); }}
                className="flex-1 py-3 border border-white/10 text-white/60 rounded-2xl hover:border-white/30 transition-all text-sm"
              >
                ← Atrás
              </button>
              <button
                onClick={handleStep2}
                disabled={isPending || (!finalRating && !hoverRating)}
                className="flex-[2] py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c770] text-[#0a0908] font-bold rounded-2xl shadow-lg shadow-[#c9a84c]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Enviando..." : "Enviar calificación"}
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="text-center space-y-5 py-4">
            <div className="text-5xl mb-2">{finalRating === 5 ? "🥳" : "🙏"}</div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#f5f0e8] italic">
                {finalRating === 5
                  ? "¡Gracias, nos alegras el día!"
                  : "¡Gracias por tu honestidad!"}
              </h2>
              <p className="text-xs text-[#8a8078] mt-2">
                {finalRating === 5
                  ? "¿Podrías compartir esa experiencia en Google? Nos ayuda muchísimo a crecer."
                  : "Tu retroalimentación llega directo a nuestro equipo. Prometemos mejorar para ti."}
              </p>
            </div>

            {/* Google link (5 estrellas) */}
            {finalRating === 5 && (
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35 11.1H12v2.82h5.35c-.47 2.48-2.68 4.25-5.35 4.25-3.3 0-5.97-2.67-5.97-5.97s2.67-5.97 5.97-5.97c1.47 0 2.8.53 3.83 1.4l2.1-2.1C16.29 4.13 14.26 3.2 12 3.2 7.16 3.2 3.2 7.16 3.2 12s3.96 8.8 8.8 8.8 8.4-3.26 8.4-8.4c0-.56-.06-1.1-.05-1.3z" />
                </svg>
                Dejar reseña en Google Maps
              </a>
            )}

            {/* Feedback < 5 estrellas — agradecimiento */}
            {finalRating < 5 && (
              <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-2xl p-4">
                <p className="text-xs text-[#8a8078]">
                  Tu opinión privada ha sido enviada al equipo de Roma. Trabajaremos para merecer tus 5 estrellas la próxima vez. 🍕
                </p>
              </div>
            )}

            <p className="text-[10px] text-[#8a8078]">
              Roma Restaurante Pizzería · Loja, Ecuador · Desde 2001
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
