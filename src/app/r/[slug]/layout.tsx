import { getRestaurantePorSlug } from "@/db/queries/restaurantes";
import { notFound } from "next/navigation";
import TenantLayoutWrapper from "./components/TenantLayoutWrapper";

export const dynamic = "force-dynamic";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurante = await getRestaurantePorSlug(slug);

  if (!restaurante) {
    notFound();
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-[#c9a84c]/20"
      style={{
        backgroundColor: restaurante.colorFondo || "#0a0908",
        color: "#f5f0e8",
      }}
    >
      <TenantLayoutWrapper
        slug={restaurante.slug}
        nombre={restaurante.nombre}
        descripcion={restaurante.descripcion}
        logoUrl={restaurante.logoUrl}
        colorPrimario={restaurante.colorPrimario}
        telefono={restaurante.telefono}
        email={restaurante.email}
        direccion={restaurante.direccion}
        ciudad={restaurante.ciudad}
      >
        {children}
      </TenantLayoutWrapper>
    </div>
  );
}
