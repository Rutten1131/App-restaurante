"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ContactoPage() {
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
    <div className="min-h-screen pb-28">
      {/* Banner */}
      <section className="relative h-[45vh] min-h-[340px] flex items-end pb-12 overflow-hidden grain-overlay">
        <div className="absolute inset-0">
          <Image src="/images/hero-pizza.jpg" alt="Contacto Roma" fill className="object-cover animate-slowZoom" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full animate-fadeInUp">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8078] mb-3">
            <Link href="/" className="hover:text-[#c9a84c] transition-colors">Inicio</Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-[#f5f0e8]">Contacto</span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#f5f0e8]">
            Ubicación & <span className="text-[#c9a84c] italic">Contacto</span>
          </h1>
          <p className="text-[15px] text-[#8a8078] mt-2 max-w-md">
            Visítanos en nuestro local o contáctanos para pedidos y eventos.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Ubicación */}
          <div className="card-lift bg-[#141210] border border-white/[0.04] p-8 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#c62828]/10 border border-[#c62828]/20 flex items-center justify-center text-[#c62828]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Nuestra Dirección</h3>
            <p className="text-[13px] text-[#8a8078] leading-relaxed">
              Av. Eugenio Espejo 200-100 y Shuaras, junto a la Clínica Medilab, Loja – Ecuador.
            </p>
          </div>

          {/* Card 2: Teléfono & WhatsApp */}
          <div className="card-lift bg-[#141210] border border-white/[0.04] p-8 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#2e7d32]/10 border border-[#2e7d32]/20 flex items-center justify-center text-[#2e7d32]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Pedidos & WhatsApp</h3>
            <p className="text-[13px] text-[#8a8078] leading-relaxed">
              Línea directa: <strong className="text-[#f5f0e8]">098 767 0140</strong>
            </p>
            <a
              href="https://wa.me/593987670140"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[12px] font-semibold text-[#2e7d32] hover:underline"
            >
              Chatear por WhatsApp →
            </a>
          </div>

          {/* Card 3: Horarios */}
          <div className="card-lift bg-[#141210] border border-white/[0.04] p-8 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Horario de Atención</h3>
            <p className="text-[13px] text-[#8a8078] leading-relaxed">
              Lunes a Sábado: <strong className="text-[#c9a84c]">11:00 AM – 8:30 PM</strong> <br />
              Domingos: <span className="text-[#c62828]">Cerrado</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Form */}
          <div className="lg:col-span-6 bg-[#141210] border border-white/[0.04] rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="border-b border-white/[0.04] pb-4">
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8]">Escríbenos un Mensaje</h2>
              <p className="text-[12px] text-[#8a8078] mt-1">¿Tienes preguntas sobre eventos o pedidos corporativos?</p>
            </div>

            {enviado ? (
              <div className="glass p-6 rounded-2xl text-center space-y-3 border border-[#2e7d32]/30">
                <span className="text-3xl">✨</span>
                <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">¡Mensaje Enviado!</h3>
                <p className="text-[12px] text-[#8a8078]">Gracias por contactar a Roma. Te responderemos muy pronto.</p>
                <button
                  onClick={() => setEnviado(false)}
                  className="mt-2 text-[12px] font-semibold text-[#c9a84c] hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={mensajeData.nombre}
                      onChange={(e) => setMensajeData({ ...mensajeData, nombre: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="098 767 0140"
                      value={mensajeData.telefono}
                      onChange={(e) => setMensajeData({ ...mensajeData, telefono: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={mensajeData.email}
                    onChange={(e) => setMensajeData({ ...mensajeData, email: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a84c]">Mensaje *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe tu consulta..."
                    value={mensajeData.mensaje}
                    onChange={(e) => setMensajeData({ ...mensajeData, mensaje: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#c62828] hover:bg-[#e53935] text-white font-semibold text-[13px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_-6px_rgba(198,40,40,0.25)]"
                >
                  Enviar Mensaje
                </button>
              </form>
            )}
          </div>

          {/* Google Maps Embed */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#f5f0e8]">Encuéntranos en Google Maps</h2>
            <div className="rounded-3xl overflow-hidden border border-white/[0.06] h-[400px] shadow-2xl relative">
              <iframe
                title="Ubicación de Roma Restaurante Pizzería en Loja"
                className="w-full h-full border-0 grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                loading="lazy"
                src="https://www.google.com/maps?q=Av.+Eugenio+Espejo+y+Shuaras,+Loja,+Ecuador&output=embed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
