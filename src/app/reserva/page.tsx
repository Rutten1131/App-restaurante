"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ReservaPage() {
  const [form, setForm] = useState({
    nombre: "", telefono: "", fecha: "", hora: "19:30",
    personas: "2 personas", zona: "Salón Principal", comentarios: "",
  });
  const [done, setDone] = useState(false);

  const whatsappUrl = () => {
    const msg = `Hola Roma! Quisiera reservar:
• Nombre: ${form.nombre}
• Tel: ${form.telefono}
• Fecha: ${form.fecha}
• Hora: ${form.hora}
• Personas: ${form.personas}
• Zona: ${form.zona}
• Notas: ${form.comentarios || "—"}`;
    return `https://wa.me/593987670140?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Banner */}
      <section className="relative h-[45vh] min-h-[340px] flex items-end pb-12 overflow-hidden grain-overlay">
        <div className="absolute inset-0">
          <Image src="/images/hero-pizza.jpg" alt="Reserva" fill className="object-cover animate-slowZoom" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full animate-fadeInUp">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8078] mb-3">
            <Link href="/" className="hover:text-[#c9a84c] transition-colors">Inicio</Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-[#f5f0e8]">Reservar</span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#f5f0e8]">
            Reservar <span className="text-[#c9a84c] italic">Mesa</span>
          </h1>
          <p className="text-[15px] text-[#8a8078] mt-2 max-w-md">
            Asegura tu lugar para una noche especial en Roma.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 lg:px-8 pt-16">
        {done ? (
          <div className="glass rounded-3xl p-8 sm:p-12 text-center space-y-6 animate-scaleIn border border-[#c9a84c]/20">
            <div className="w-14 h-14 rounded-full bg-[#2e7d32]/10 border border-[#2e7d32]/30 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[#2e7d32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#f5f0e8]">¡Reserva lista!</h2>
            <p className="text-[13px] text-[#8a8078] max-w-sm mx-auto">
              Confirma tu reserva por WhatsApp para que nuestro equipo la tenga registrada.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 bg-[#2e7d32] text-white text-[12px] font-semibold uppercase tracking-widest rounded-full hover:bg-[#388e3c] transition-all"
              >
                Confirmar por WhatsApp
              </a>
              <button
                onClick={() => setDone(false)}
                className="px-7 py-3.5 text-[12px] font-semibold text-[#8a8078] border border-white/[0.06] rounded-full hover:text-[#f5f0e8] transition-colors"
              >
                Modificar
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setDone(true); }}
            className="bg-[#141210] border border-white/[0.04] rounded-3xl p-8 sm:p-10 space-y-7"
          >
            <div className="border-b border-white/[0.04] pb-4 mb-2">
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8]">Datos de Reservación</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: "Nombre", key: "nombre" as const, type: "text", placeholder: "Carlos Loayza", required: true },
                { label: "Teléfono", key: "telefono" as const, type: "tel", placeholder: "098 767 0140", required: true },
                { label: "Fecha", key: "fecha" as const, type: "date", placeholder: "", required: true },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
                  />
                </div>
              ))}

              {[
                { label: "Hora", key: "hora" as const, options: ["12:00 PM", "13:30 PM", "18:30 PM", "19:30 PM", "20:00 PM"] },
                { label: "Personas", key: "personas" as const, options: ["1 persona", "2 personas", "4 personas", "6 personas", "8+ personas"] },
                { label: "Zona", key: "zona" as const, options: ["Salón Principal", "Terraza", "Zona Reservada"] },
              ].map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">{s.label}</label>
                  <select
                    value={form[s.key]}
                    onChange={(e) => setForm({ ...form, [s.key]: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
                  >
                    {s.options.map((o) => (
                      <option key={o} value={o} className="bg-[#141210]">{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">Comentarios</label>
              <textarea
                rows={3}
                placeholder="Cumpleaños, silla para bebé, preferencia..."
                value={form.comentarios}
                onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#c9a84c] text-[#0a0908] font-semibold text-[13px] uppercase tracking-widest rounded-xl hover:bg-[#e8d48b] transition-all shadow-[0_0_30px_-6px_rgba(201,168,76,0.3)]"
            >
              Confirmar Reservación
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
