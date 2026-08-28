import type { Metadata } from "next";
import { getConfiguracion } from "@/db/queries/fidelizacion";
import { getRestaurantePorId } from "@/db/queries/restaurantes";
import FidelizacionClient from "./FidelizacionClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Club de Fidelización & Experiencia – Roma Restaurante Pizzería",
  description:
    "Únete al Club Roma, responde una pequeña encuesta, califica tu experiencia y recibe 1 pizza gratis. 25 años de tradición en Loja, Ecuador.",
};

export default async function FidelizacionPage() {
  const restaurante = await getRestaurantePorId(1);

  const googleReviewUrl =
    (await getConfiguracion("google_review_url")) ||
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    "https://search.google.com/local/writereview";

  return (
    <FidelizacionClient
      googleReviewUrl={googleReviewUrl}
      restauranteId={1}
      restauranteNombre={restaurante?.nombre || "Roma Restaurante Pizzería"}
      restauranteSlug={restaurante?.slug || "roma"}
      logoUrl={restaurante?.logoUrl || "/images/logo-roma.jpg"}
      colorPrimario={restaurante?.colorPrimario || "#c9a84c"}
      ciudad={restaurante?.ciudad || "Loja"}
    />
  );
}
