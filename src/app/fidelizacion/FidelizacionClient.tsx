"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  registrarClienteAction,
  guardarEncuestaAction,
  guardarResenaAction,
} from "./actions";

const FRECUENCIAS = [
  { value: "primera_vez", label: "Es mi primera vez en Roma 🌟" },
  { value: "mensual", label: "Vengo mensualmente" },
  { value: "semanal", label: "Vengo casi todas las semanas 🔥" },
  { value: "siempre", label: "Cliente habitual / Frecuente 👑" },
];

const OCASIONES = [
  "En familia",
  "Cita o pareja",
  "Con amigos",
  "Reunión de trabajo",
  "Cumpleaños / Celebración",
  "Almuerzo / Cena casual",
];

const COMO_CONOCIO = [
  "Recomendación de un amigo",
  "Redes sociales (Instagram / Facebook / TikTok)",
  "Pasé por el local (Av. Eugenio Espejo)",
  "Google Maps / Búsqueda web",
  "Ya los conocía de hace años",
];

type ModoFlujo = "promo_encuesta" | "solo_calificar";
type Step = 1 | 2 | 3 | "done";

interface FidelizacionClientProps {
  googleReviewUrl: string;
}

export default function FidelizacionClient({ googleReviewUrl }: FidelizacionClientProps) {
  const [modo, setModo] = useState<ModoFlujo>("promo_encuesta");
  const [step, setStep] = useState<Step>(1);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [finalRating, setFinalRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Paso 1: Datos básicos ──────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [cumpleanios, setCumpleanios] = useState("");

  // ── Paso 2: Encuesta ───────────────────────────────────────────────
  const [frecuencia, setFrecuencia] = useState("");
  const [platFavorito, setPlatFavorito] = useState("");
  const [comoNosConocio, setComoNosConocio] = useState("");
  const [ocasiones, setOcasiones] = useState<string[]>([]);
  const [nosRecomendaria, setNosRecomendaria] = useState<"si" | "no" | "">("");
  const [sugerencias, setSugerencias] = useState("");

  // ── Paso 3: Calificación ───────────────────────────────────────────
  const [comentario, setComentario] = useState("");

  const toggleOcasion = (o: string) =>
    setOcasiones((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
    );

  // ── Handlers ───────────────────────────────────────────────────────
  const handleStep1 = () => {
    if (!nombre.trim() || !telefono.trim()) {
      setError("Por favor ingresa tu Nombre y Teléfono/WhatsApp.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("nombre", nombre);
    fd.append("telefono", telefono);
    fd.append("email", email);
    fd.append("cumpleanios", cumpleanios);

    startTransition(async () => {
      const res = await registrarClienteAction(fd);
      if ("error" in res) {
        setError(res.error);
      } else {
        setClienteId(res.clienteId);
        if (modo === "solo_calificar") {
          setStep(3);
        } else {
          setStep(2);
        }
      }
    });
  };

  const handleStep2 = () => {
    if (!frecuencia) {
      setError("Por favor cuéntanos con qué frecuencia nos visitas.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("clienteId", String(clienteId));
    fd.append("frecuenciaVisita", frecuencia);
    fd.append("platFavorito", platFavorito);
    fd.append("comoNosConocio", comoNosConocio);
    fd.append("ocasionVisita", ocasiones.join(", "));
    fd.append("nosRecomendaria", nosRecomendaria === "no" ? "no" : "si");
    fd.append("sugerencias", sugerencias);

    startTransition(async () => {
      const res = await guardarEncuestaAction(fd);
      if ("error" in res) {
        // Continuamos de todas formas a calificación si hubo error de tabla secundaria
        setStep(3);
      } else {
        setStep(3);
      }
    });
  };

  const handleStep3 = () => {
    const stars = finalRating || hoverRating;
    if (!stars) {
      setError("Por favor selecciona cuántas estrellas le das a tu experiencia.");
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

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-all text-sm";
  const labelCls =
    "block text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c] mb-1.5";

  return (
    <div className="min-h-screen bg-[#0a0908] flex flex-col items-center justify-start px-4 py-8 pb-20">
      {/* Botón Volver al Menú */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Link
          href="/app/menu"
          className="inline-flex items-center gap-1.5 text-xs text-[#8a8078] hover:text-[#c9a84c] transition-colors py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
          <span>←</span> Volver al Menú
        </Link>
        <span className="text-[10px] text-[#8a8078] uppercase tracking-wider">Roma Loja</span>
      </div>

      {/* Header Marca con Logo Real */}
      <div className="text-center mb-6 max-w-md w-full flex flex-col items-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#c9a84c]/40 shadow-2xl mb-3 bg-[#141210]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-roma.jpg"
            alt="Roma Restaurante Pizzería Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8] italic tracking-tight">
          Roma Restaurante Pizzería
        </h1>
        <p className="text-xs text-[#8a8078] mt-1">Club de Fidelización & Experiencia</p>
      </div>

      {/* Progress */}
      {step !== "done" && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step >= 1
                    ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                    : "border-white/20 text-white/30"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-[10px] ${step >= 1 ? "text-[#c9a84c]" : "text-white/20"}`}>
                Tus Datos
              </span>
            </div>

            {modo === "promo_encuesta" && (
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    step >= 2
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                      : "border-white/20 text-white/30"
                  }`}
                >
                  {step > 2 ? "✓" : "2"}
                </div>
                <span className={`text-[10px] ${step >= 2 ? "text-[#c9a84c]" : "text-white/20"}`}>
                  Encuesta
                </span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step === 3
                    ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                    : "border-white/20 text-white/30"
                }`}
              >
                {modo === "promo_encuesta" ? "3" : "2"}
              </div>
              <span className={`text-[10px] ${step === 3 ? "text-[#c9a84c]" : "text-white/20"}`}>
                Calificación
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card Principal */}
      <div className="w-full max-w-md bg-[#141210] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-2xl">
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl px-4 py-3 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── PASO 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8] italic">
                ¡Bienvenido a Roma!
              </h2>
              <p className="text-xs text-[#8a8078] mt-1">
                Ingresa tus datos para registrarte en el Club de Fidelización.
              </p>
            </div>

            <div>
              <label className={labelCls}>Nombre Completo *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. María Loaiza"
                className={inputCls}
                autoComplete="name"
              />
            </div>

            <div>
              <label className={labelCls}>Teléfono / WhatsApp * (Identificador de Cliente)</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="0991234567"
                className={inputCls}
                autoComplete="tel"
              />
            </div>

            {/* Selector de Experiencia / Modo */}
            <div className="pt-2">
              <label className={labelCls}>¿Qué deseas hacer hoy? *</label>
              <div className="space-y-2.5">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    modo === "promo_encuesta"
                      ? "border-[#c9a84c] bg-[#c9a84c]/10 ring-1 ring-[#c9a84c]/40"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1 accent-[#c9a84c]"
                    name="modo"
                    checked={modo === "promo_encuesta"}
                    onChange={() => setModo("promo_encuesta")}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#f5f0e8]">
                      <span>🎁</span> Responder Encuesta & Reclamar Promo Pizza
                    </div>
                    <p className="text-[11px] text-[#8a8078] mt-0.5 leading-relaxed">
                      Responde unas preguntas breves de gustos, califícanos y recibe un cupón para 1 pizza gratis.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    modo === "solo_calificar"
                      ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1 accent-blue-500"
                    name="modo"
                    checked={modo === "solo_calificar"}
                    onChange={() => setModo("solo_calificar")}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#f5f0e8]">
                      <span>⭐</span> Solo Calificar el Servicio (Rápido)
                    </div>
                    <p className="text-[11px] text-[#8a8078] mt-0.5 leading-relaxed">
                      Salta la encuesta y déjanos tu calificación y opinión directa sobre la atención de hoy.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleStep1}
              disabled={isPending}
              className="w-full py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c770] text-[#0a0908] font-bold text-sm rounded-2xl shadow-lg shadow-[#c9a84c]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isPending ? "Guardando datos..." : modo === "promo_encuesta" ? "Comenzar Encuesta →" : "Ir a Calificar →"}
            </button>
          </div>
        )}

        {/* ── PASO 2 ── */}
        {step === 2 && modo === "promo_encuesta" && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c] bg-[#c9a84c]/10 px-2.5 py-1 rounded-md border border-[#c9a84c]/20">
                Paso 2 de 3 · Recolección de Datos
              </span>
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8] italic mt-2">
                Queremos conocerte mejor
              </h2>
              <p className="text-xs text-[#8a8078] mt-0.5">
                Tus respuestas nos ayudan a preparar las mejores recetas para ti.
              </p>
            </div>

            <div>
              <label className={labelCls}>¿Con qué frecuencia nos visitas? *</label>
              <div className="space-y-2">
                {FRECUENCIAS.map((f) => (
                  <label
                    key={f.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      frecuencia === f.value
                        ? "border-[#c9a84c] bg-[#c9a84c]/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      className="accent-[#c9a84c]"
                      value={f.value}
                      checked={frecuencia === f.value}
                      onChange={() => setFrecuencia(f.value)}
                    />
                    <span className="text-xs text-[#f5f0e8]">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>¿Cuál es tu pizza o plato favorito de Roma?</label>
              <input
                type="text"
                value={platFavorito}
                onChange={(e) => setPlatFavorito(e.target.value)}
                placeholder="Ej. Pizza Roma Especial, Lasaña de Carne, etc."
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>¿Cómo nos conociste?</label>
              <select
                value={comoNosConocio}
                onChange={(e) => setComoNosConocio(e.target.value)}
                className={inputCls}
              >
                <option value="">Selecciona una opción...</option>
                {COMO_CONOCIO.map((c) => (
                  <option key={c} value={c} className="bg-[#141210] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>¿En qué ocasión sueles venir a Roma?</label>
              <div className="flex flex-wrap gap-2">
                {OCASIONES.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggleOcasion(o)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      ocasiones.includes(o)
                        ? "border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c] font-semibold"
                        : "border-white/10 text-white/50 hover:border-white/30"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>¿Nos recomendarías con tus amigos o familia?</label>
              <div className="flex gap-3">
                {(["si", "no"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setNosRecomendaria(v)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      nosRecomendaria === v
                        ? v === "si"
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-red-500 bg-red-500/20 text-red-400"
                        : "border-white/10 text-white/40 hover:border-white/30"
                    }`}
                  >
                    {v === "si" ? "👍 Sí, por supuesto" : "👎 Por ahora no"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setStep(1); setError(null); }}
                className="flex-1 py-3.5 border border-white/10 text-white/60 rounded-2xl hover:border-white/30 transition-all text-xs font-semibold"
              >
                ← Atrás
              </button>
              <button
                onClick={handleStep2}
                disabled={isPending}
                className="flex-[2] py-3.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c770] text-[#0a0908] font-bold text-xs rounded-2xl shadow-lg shadow-[#c9a84c]/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Paso Final: Calificar →"}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3 ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c] bg-[#c9a84c]/10 px-2.5 py-1 rounded-md border border-[#c9a84c]/20">
                Calificación del Servicio
              </span>
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8] italic mt-2">
                ¿Cómo calificarías tu experiencia hoy?
              </h2>
              <p className="text-xs text-[#8a8078] mt-0.5">
                Toca las estrellas para calificar nuestro servicio y comida.
              </p>
            </div>

            {/* Estrellas */}
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
              <p className="text-center text-xs text-[#c9a84c] font-bold uppercase tracking-wider">
                {["", "1 ⭐ · Necesitamos mejorar 😞", "2 ⭐ · Regular 😕", "3 ⭐ · Bueno 😐", "4 ⭐ · Muy Bueno 😊", "5 ⭐ · ¡Excelente servicio! 🤩"][
                  finalRating || hoverRating
                ]}
              </p>
            )}

            {(finalRating || hoverRating) === 5 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-emerald-400">✨ ¡Nos alegra que te haya encantado!</p>
                <p className="text-[11px] text-emerald-200/70">
                  Al enviar te invitaremos a compartir estas 5 estrellas en Google Maps para apoyar al restaurante.
                </p>
              </div>
            ) : (finalRating || hoverRating) > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-amber-400">
                  💬 ¿Qué podemos mejorar para que tu próxima visita sea de 5 estrellas?
                </p>
                <p className="text-[11px] text-amber-200/70">
                  Tu opinión es privada y será enviada directamente a la administración para corregirlo de inmediato.
                </p>
              </div>
            ) : null}

            <div>
              <label className={labelCls}>
                {(finalRating || hoverRating) === 5
                  ? "Añade un comentario (opcional)"
                  : "¿Tienes sugerencias o detalles que podamos mejorar?"}
              </label>
              <textarea
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe aquí tu opinión..."
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setStep(modo === "promo_encuesta" ? 2 : 1);
                  setError(null);
                }}
                className="flex-1 py-3.5 border border-white/10 text-white/60 rounded-2xl hover:border-white/30 transition-all text-xs font-semibold"
              >
                ← Atrás
              </button>
              <button
                onClick={handleStep3}
                disabled={isPending || (!finalRating && !hoverRating)}
                className="flex-[2] py-3.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c770] text-[#0a0908] font-bold text-xs rounded-2xl shadow-lg shadow-[#c9a84c]/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Enviando..."
                  : modo === "promo_encuesta"
                  ? "🎁 Enviar & Reclamar Pizza"
                  : "⭐ Enviar Calificación"}
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="text-center space-y-5 py-4">
            <div className="text-5xl animate-bounce">
              {finalRating === 5 ? "🥳" : "🙏"}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#f5f0e8] italic">
                {finalRating === 5
                  ? "¡Muchísimas Gracias!"
                  : "¡Gracias por tu sinceridad!"}
              </h2>
              <p className="text-xs text-[#8a8078] mt-2 leading-relaxed">
                {finalRating === 5
                  ? "Tu calificación de 5 estrellas nos llena de orgullo. ¿Nos apoyarías publicándola en Google Maps?"
                  : "Tu retroalimentación fue registrada de forma confidencial. Nuestro equipo trabajará para darte una experiencia de 5 estrellas en tu próxima visita."}
              </p>
            </div>

            {modo === "promo_encuesta" && (
              <div className="bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border-2 border-dashed border-[#c9a84c] rounded-2xl p-5 text-center shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c] bg-[#0a0908] px-3 py-1 rounded-full border border-[#c9a84c]/30">
                  Cupón Reclamado
                </span>
                <p className="text-2xl font-bold text-white mt-2">🍕 1 Pizza Gratis</p>
                <p className="text-xs text-[#8a8078] mt-1">
                  Muestra esta pantalla al personal de Roma al pagar o ordenar tu cuenta.
                </p>
              </div>
            )}

            {finalRating === 5 && (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35 11.1H12v2.82h5.35c-.47 2.48-2.68 4.25-5.35 4.25-3.3 0-5.97-2.67-5.97-5.97s2.67-5.97 5.97-5.97c1.47 0 2.8.53 3.83 1.4l2.1-2.1C16.29 4.13 14.26 3.2 12 3.2 7.16 3.2 3.2 7.16 3.2 12s3.96 8.8 8.8 8.8 8.4-3.26 8.4-8.4c0-.56-.06-1.1-.05-1.3z" />
                </svg>
                Publicar Reseña en Google Maps ↗
              </a>
            )}

            <div className="pt-2">
              <Link
                href="/app/menu"
                className="text-xs text-[#c9a84c] underline hover:text-[#e8c770] transition-colors"
              >
                Volver a la Carta / Menú
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
