"use client";

import { useState } from "react";

export default function ContactoClientForm({
  restauranteNombre,
  whatsapp,
}: {
  restauranteNombre: string;
  whatsapp: string;
}) {
  const [enviado, setEnviado] = useState(false);
  const [mensajeData, setMensajeData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "Consulta General",
    mensaje: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="bg-[#141210] border border-white/[0.04] rounded-3xl p-8 sm:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <div className="ornament-divider">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
              Escríbenos
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
            Envíanos un Mensaje
          </h2>
          <p className="text-[13px] text-[#8a8078]">
            Responderemos a tu solicitud lo más pronto posible.
          </p>
        </div>

        {enviado ? (
          <div className="glass rounded-2xl p-8 text-center space-y-4 animate-scaleIn border border-[#2e7d32]/30">
            <div className="w-12 h-12 rounded-full bg-[#2e7d32]/10 border border-[#2e7d32]/30 flex items-center justify-center mx-auto text-[#2e7d32]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#f5f0e8]">
              ¡Mensaje Recibido!
            </h3>
            <p className="text-[13px] text-[#8a8078] max-w-sm mx-auto">
              Gracias {mensajeData.nombre}. Nos comunicaremos contigo al{" "}
              {mensajeData.telefono || mensajeData.email}.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsapp}?text=Hola%20${encodeURIComponent(restauranteNombre)},%20mi%20nombre%20es%20${encodeURIComponent(mensajeData.nombre)}.%20${encodeURIComponent(mensajeData.mensaje)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-lg"
              >
                Abrir en WhatsApp directo
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={mensajeData.nombre}
                  onChange={(e) => setMensajeData({ ...mensajeData, nombre: e.target.value })}
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
                  value={mensajeData.telefono}
                  onChange={(e) => setMensajeData({ ...mensajeData, telefono: e.target.value })}
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/40 focus:border-[#c9a84c] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={mensajeData.email}
                  onChange={(e) => setMensajeData({ ...mensajeData, email: e.target.value })}
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/40 focus:border-[#c9a84c] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
                  Tipo de Consulta
                </label>
                <select
                  value={mensajeData.asunto}
                  onChange={(e) => setMensajeData({ ...mensajeData, asunto: e.target.value })}
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none transition-colors"
                >
                  <option value="Consulta General">Consulta General</option>
                  <option value="Eventos & Cumpleaños">Eventos & Cumpleaños</option>
                  <option value="Pedidos Especiales">Pedidos Especiales</option>
                  <option value="Sugerencias">Sugerencias</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#8a8078] uppercase tracking-wider">
                Mensaje *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Escribe tu mensaje o consulta..."
                value={mensajeData.mensaje}
                onChange={(e) => setMensajeData({ ...mensajeData, mensaje: e.target.value })}
                className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/40 focus:border-[#c9a84c] focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#c9a84c] text-[#0a0908] text-[13px] font-semibold uppercase tracking-widest rounded-xl hover:bg-[#e8d48b] transition-all duration-300 shadow-[0_0_25px_-4px_rgba(201,168,76,0.3)]"
            >
              Enviar Mensaje
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
