import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ContactoClientForm from "./ContactoClientForm";

export const dynamic = "force-dynamic";

export default async function TenantContactoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurante = await getRestaurantePorSlug(slug);

  if (!restaurante) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Banner */}
      <section className="relative h-[45vh] min-h-[340px] flex items-end pb-12 overflow-hidden grain-overlay">
        <div className="absolute inset-0">
          <Image
            src={restaurante.heroImageUrl || "/images/hero-pizza.jpg"}
            alt={`Contacto ${restaurante.nombre}`}
            fill
            className="object-cover animate-slowZoom"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full animate-fadeInUp">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8078] mb-3">
            <Link href={`/r/${slug}`} className="hover:text-[#c9a84c] transition-colors">
              Inicio
            </Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-[#f5f0e8]">Contacto</span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#f5f0e8]">
            Ubicación & <span className="text-[#c9a84c] italic">Contacto</span>
          </h1>
          <p className="text-[15px] text-[#8a8078] mt-2 max-w-md">
            Visítanos en nuestro local o contáctanos para pedidos y eventos especiales.
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
              {restaurante.direccion || `Centro de ${restaurante.ciudad || "la ciudad"}, Ecuador.`}
            </p>
          </div>

          {/* Card 2: Teléfono / WhatsApp */}
          <div className="card-lift bg-[#141210] border border-white/[0.04] p-8 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Teléfono & WhatsApp</h3>
            <p className="text-[13px] text-[#8a8078] leading-relaxed">
              {restaurante.telefono || "098 767 0140"}
            </p>
            <p className="text-[11px] text-[#8a8078]/70">
              Atención telefónica durante horario de servicio.
            </p>
          </div>

          {/* Card 3: Horarios */}
          <div className="card-lift bg-[#141210] border border-white/[0.04] p-8 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#2e7d32]/10 border border-[#2e7d32]/20 flex items-center justify-center text-[#2e7d32]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Horario de Atención</h3>
            <div className="space-y-1 text-[13px] text-[#8a8078]">
              <div className="flex justify-between">
                <span>Martes a Viernes</span>
                <span className="text-[#f5f0e8] font-medium">12:00 – 22:30</span>
              </div>
              <div className="flex justify-between">
                <span>Sábados y Domingos</span>
                <span className="text-[#f5f0e8] font-medium">11:30 – 23:00</span>
              </div>
              <div className="flex justify-between">
                <span>Lunes</span>
                <span className="text-[#c62828] font-medium">Cerrado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Form */}
        <ContactoClientForm
          restauranteNombre={restaurante.nombre}
          whatsapp={restaurante.whatsapp || "593987670140"}
        />
      </div>
    </div>
  );
}
