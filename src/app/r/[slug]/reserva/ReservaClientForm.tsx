"use client";

import { useState } from "react";

export default function ReservaClientForm({
  restauranteNombre,
  whatsapp,
}: {
  restauranteNombre: string;
  whatsapp: string;
}) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    fecha: "",
    hora: "19:30",
    personas: "2 personas",
    zona: "Salón Principal",
    comentarios: "",
  });
  const [done, setDone] = useState(false);

  const cleanWhatsapp = whatsapp.replace(/\D/g, "") || "593987670140";

  const whatsappUrl = () => {
    const msg = `Hola ${restauranteNombre}! Quisiera reservar una mesa:
• Nombre: ${form.nombre}
• Tel: ${form.telefono}
• Fecha: ${form.fecha}
• Hora: ${form.hora}
• Personas: ${form.personas}
• Zona: ${form.zona}
• Notas: ${form.comentarios || "—"}`;
    return `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return done ? (
    <div className="glass rounded-3xl p-8 sm:p-12 text-center space-y-6 animate-scaleIn border border-[#c9a84c]/20">
      <div className="w-14 h-14 rounded-full bg-[#2e7d32]/10 border border-[#2e7d32]/30 flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-[#2e7d32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl font-bold text-[#f5f0e8]">¡Reserva lista!</h2>
      <p className="text-[13px] text-[#8a8078] max-w-sm mx-auto">
        Confirma tu reserva por WhatsApp para que nuestro equipo la tenga registrada de inmediato.
      </p>
      <div className="p-4 bg-[#141210] rounded-xl text-left text-xs text-[#8a8078] space-y-1 max-w-xs mx-auto border border-white/[0.04]">
        <div><strong className="text-[#f5f0e8]">Nombre:</strong> {form.nombre}</div>
        <div><strong className="text-[#f5f0e8]">Fecha:</strong> {form.fecha} a las {form.hora}</div>
        <div><strong className="text-[#f5f0e8]">Personas:</strong> {form.personas} ({form.zona})</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2e7d32] text-white text-[13px] font-semibold uppercase tracking-widest rounded-full hover:bg-[#388e3c] transition-all shadow-[0_0_30px_-6px_rgba(46,125,50,0.4)]"
        >
          Confirmar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="px-6 py-4 text-xs text-[#8a8078] hover:text-[#f5f0e8] transition-colors"
        >
          Modificar datos
        </button>
      </div>
    </div>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="bg-[#141210] border border-white/[0.04] rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/40 focus:border-[#c9a84c] focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
            Teléfono / WhatsApp *
          </label>
          <input
            type="tel"
            required
            placeholder="098 765 4321"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/40 focus:border-[#c9a84c] focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
            Fecha *
          </label>
          <input
            type="date"
            required
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
            Hora *
          </label>
          <select
            value={form.hora}
            onChange={(e) => setForm({ ...form, hora: e.target.value })}
            className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none transition-colors"
          >
            {["12:00", "12:30", "13:00", "13:30", "14:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
            Personas *
          </label>
          <select
            value={form.personas}
            onChange={(e) => setForm({ ...form, personas: e.target.value })}
            className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none transition-colors"
          >
            {["1 persona", "2 personas", "3 personas", "4 personas", "5 personas", "6 personas", "7+ personas"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
          Zona Preferida
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["Salón Principal", "Junto al Horno", "Área Familiar"].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setForm({ ...form, zona: z })}
              className={`py-3 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                form.zona === z
                  ? "bg-[#c9a84c]/10 border-[#c9a84c] text-[#c9a84c]"
                  : "bg-[#0a0908] border-white/[0.08] text-[#8a8078] hover:text-[#f5f0e8]"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
          Notas especiales (opcional)
        </label>
        <textarea
          rows={3}
          placeholder="¿Celebración de cumpleaños? ¿Alergias alimentarias? ¿Algún pedido especial?"
          value={form.comentarios}
          onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
          className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/40 focus:border-[#c9a84c] focus:outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-[#c9a84c] text-[#0a0908] text-[13px] font-semibold uppercase tracking-widest rounded-xl hover:bg-[#e8d48b] transition-all duration-300 shadow-[0_0_25px_-4px_rgba(201,168,76,0.3)]"
      >
        Continuar con la Reserva
      </button>
    </form>
  );
}
