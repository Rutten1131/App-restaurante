import { getMenuCompleto } from "@/db/queries/menu";
import AppMenuClient from "./AppMenuClient";

export const dynamic = "force-dynamic";

export default async function AppMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ mesa?: string }>;
}) {
  const resolvedParams = await searchParams;
  let categoriasConPlatos: any[] = [];

  try {
    categoriasConPlatos = await getMenuCompleto();
  } catch (error) {
    console.error("Error cargando menú en /app/menu:", error);
  }

  return (
    <AppMenuClient
      categorias={categoriasConPlatos}
      initialMesa={resolvedParams?.mesa}
    />
  );
}
