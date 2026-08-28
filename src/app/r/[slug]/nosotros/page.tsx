import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TenantNosotrosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurante = await getRestaurantePorSlug(slug);

  if (!restaurante) {
    notFound();
  }

  const pilares = [
    {
      titulo: "Cocina Tradicional",
      desc: "Nuestra masa madurada con paciencia alcanza el dorado perfecto y el sabor auténtico de la buena mesa.",
      icono: "🔥",
    },
    {
      titulo: "Preparación Diaria",
      desc: "Elaboramos pastas, salsas y especialidades cada mañana con ingredientes frescos y seleccionados.",
      icono: "🍝",
    },
    {
      titulo: "Ingredientes Locales",
      desc: `Combinamos recetas clásicas con los mejores productos de ${restaurante.ciudad || "nuestra tierra"}.`,
      icono: "🌿",
    },
    {
      titulo: "Tradición Familiar",
      desc: "Somos parte de celebraciones, reencuentros y cenas que se convierten en momentos inolvidables.",
      icono: "👑",
    },
  ];

  return (
    <div className="min-h-screen pb-28">
      {/* Banner */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end pb-12 overflow-hidden grain-overlay">
        <div className="absolute inset-0">
          <Image
            src={restaurante.heroImageUrl || "/images/chef-oven.jpg"}
            alt={restaurante.nombre}
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
            <span className="text-[#f5f0e8]">Nosotros</span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#f5f0e8]">
            Nuestra <span className="text-[#c9a84c] italic">Historia</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-28 grid lg:grid-cols-12 gap-12 lg:gap-6 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="ornament-divider justify-start">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
              Tradición & Sabor
            </span>
          </div>
          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-[#f5f0e8] leading-[1.15]">
            La mesa a la que <span className="text-[#c9a84c]">siempre vuelves</span>
          </h2>
          <p className="text-[15px] text-[#8a8078] leading-[1.8] max-w-lg">
            {restaurante.nombre} nació con un propósito simple: ofrecer una experiencia gastronómica auténtica con el cariño y la calidez de un hogar.
          </p>
          <p className="text-[15px] text-[#8a8078] leading-[1.8] max-w-lg">
            {restaurante.descripcion ||
              "Cada masa se fermenta con paciencia, cada salsa se prepara al amanecer y cada plato que llega a la mesa lleva consigo el orgullo de hacer las cosas bien."}
          </p>

          <div className="p-6 glass rounded-2xl border-l-2 border-[#c62828] space-y-2 max-w-lg">
            <p className="font-serif italic text-[#f5f0e8] text-[15px] leading-relaxed">
              "Para nosotros cocinar no es solo servir comida. Es un arte de paciencia, ingredientes nobles y la alegría de compartir la mesa con nuestros clientes."
            </p>
            <span className="block text-[11px] font-semibold text-[#c9a84c] uppercase tracking-wider">
              — Familia {restaurante.nombre}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 relative h-[480px] rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl">
          <Image
            src={restaurante.heroImageUrl || "/images/chef-oven.jpg"}
            alt={restaurante.nombre}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c9a84c]">
              {restaurante.nombre}
            </span>
            <p className="text-[11px] text-[#8a8078] mt-1">
              {restaurante.direccion || `${restaurante.ciudad || "Ecuador"}`}
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-dark-texture py-28 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <div className="ornament-divider">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
                Nuestra Esencia
              </span>
            </div>
            <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-[#f5f0e8]">
              Pilares de Calidad
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilares.map((p) => (
              <div key={p.titulo} className="card-lift bg-[#141210] border border-white/[0.04] p-8 rounded-2xl space-y-4">
                <div className="text-3xl">{p.icono}</div>
                <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">{p.titulo}</h3>
                <p className="text-[13px] text-[#8a8078] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <div className="py-16 text-center">
        <Link
          href={`/r/${slug}/reserva`}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#c62828] text-white text-[13px] font-semibold uppercase tracking-widest rounded-full hover:bg-[#e53935] transition-all duration-300 shadow-[0_0_30px_-6px_rgba(198,40,40,0.25)]"
        >
          Ven a vivir la experiencia en {restaurante.nombre}
        </Link>
      </div>
    </div>
  );
}
