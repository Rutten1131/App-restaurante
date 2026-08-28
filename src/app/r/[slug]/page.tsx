import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { getPlatosDestacados } from "@/db/queries/menu";
import { notFound } from "next/navigation";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurante = await getRestaurantePorSlug(slug);

  if (!restaurante) {
    notFound();
  }

  let platosDb: any[] = [];
  try {
    platosDb = await getPlatosDestacados(4, restaurante.id);
  } catch (error) {
    console.error(`Error al cargar platos para ${slug}:`, error);
  }

  return (
    <HomeClient
      initialPlatos={platosDb}
      restauranteNombre={restaurante.nombre}
      restauranteSlug={restaurante.slug}
      restauranteTagline={restaurante.descripcion || undefined}
      restauranteCiudad={restaurante.ciudad || "Loja"}
      restauranteTelefono={restaurante.telefono || "098 767 0140"}
      restauranteWhatsapp={restaurante.whatsapp || "593987670140"}
    />
  );
}
