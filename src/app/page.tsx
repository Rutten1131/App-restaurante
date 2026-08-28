import { getRestaurantePorId } from "@/db/queries/restaurantes";
import { getPlatosDestacados } from "@/db/queries/menu";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let restaurante = await getRestaurantePorId(1);
  let platosDb: any[] = [];

  try {
    platosDb = await getPlatosDestacados(4, 1);
  } catch (error) {
    console.error("Error al cargar platos destacados de la base de datos:", error);
  }

  return (
    <HomeClient
      initialPlatos={platosDb}
      restauranteNombre={restaurante?.nombre || "Roma Restaurante Pizzería"}
      restauranteSlug={restaurante?.slug || "roma"}
      restauranteTagline={restaurante?.descripcion || undefined}
      restauranteCiudad={restaurante?.ciudad || "Loja"}
      restauranteTelefono={restaurante?.telefono || "098 767 0140"}
      restauranteWhatsapp={restaurante?.whatsapp || "593987670140"}
    />
  );
}
