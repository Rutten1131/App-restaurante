import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { getConfiguracion } from "@/db/queries/fidelizacion";
import { notFound } from "next/navigation";
import FidelizacionClient from "@/app/fidelizacion/FidelizacionClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurante = await getRestaurantePorSlug(slug);
  if (!restaurante) return {};

  return {
    title: `Club de Fidelización & Experiencia – ${restaurante.nombre}`,
    description: `Únete al Club ${restaurante.nombre}, responde una pequeña encuesta, califica tu experiencia y recibe una sorpresa especial.`,
  };
}

export default async function TenantFidelizacionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurante = await getRestaurantePorSlug(slug);

  if (!restaurante) {
    notFound();
  }

  const googleReviewUrl =
    (await getConfiguracion(`google_review_url_${restaurante.id}`)) ||
    (await getConfiguracion("google_review_url")) ||
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    "https://search.google.com/local/writereview";

  return (
    <FidelizacionClient
      googleReviewUrl={googleReviewUrl}
      restauranteId={restaurante.id}
      restauranteNombre={restaurante.nombre}
      restauranteSlug={restaurante.slug}
      logoUrl={restaurante.logoUrl}
      colorPrimario={restaurante.colorPrimario || "#c9a84c"}
      ciudad={restaurante.ciudad || "Ecuador"}
    />
  );
}
