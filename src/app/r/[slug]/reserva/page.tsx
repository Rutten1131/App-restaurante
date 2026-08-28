import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReservaClientForm from "./ReservaClientForm";

export const dynamic = "force-dynamic";

export default async function TenantReservaPage({
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
            alt="Reserva"
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
            <span className="text-[#f5f0e8]">Reservar</span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-[#f5f0e8]">
            Reservar <span className="text-[#c9a84c] italic">Mesa</span>
          </h1>
          <p className="text-[15px] text-[#8a8078] mt-2 max-w-md">
            Asegura tu lugar para una velada especial en {restaurante.nombre}.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 lg:px-8 pt-16">
        <ReservaClientForm
          restauranteNombre={restaurante.nombre}
          whatsapp={restaurante.whatsapp || "593987670140"}
        />
      </div>
    </div>
  );
}
