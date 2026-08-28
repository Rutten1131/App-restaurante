import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { getMenuCompleto } from "@/db/queries/menu";
import { notFound } from "next/navigation";
import AppMenuClient from "@/app/app/menu/AppMenuClient";

export const dynamic = "force-dynamic";

export default async function TenantMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const restaurante = await getRestaurantePorSlug(slug);

  if (!restaurante) {
    notFound();
  }

  let categoriasConPlatos: any[] = [];
  try {
    categoriasConPlatos = await getMenuCompleto(restaurante.id);
  } catch (error) {
    console.error(`Error cargando menú para restaurante ${slug}:`, error);
  }

  return (
    <AppMenuClient
      categorias={categoriasConPlatos}
      initialMesa={resolvedSearchParams?.mesa}
      restauranteId={restaurante.id}
      restauranteNombre={restaurante.nombre}
      restauranteSlug={restaurante.slug}
      logoUrl={restaurante.logoUrl}
      colorPrimario={restaurante.colorPrimario || "#c9a84c"}
      backUrl={`/r/${restaurante.slug}`}
    />
  );
}
