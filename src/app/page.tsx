import { getPlatosDestacados } from "@/db/queries/menu";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let platosDb: any[] = [];

  try {
    platosDb = await getPlatosDestacados(4);
  } catch (error) {
    console.error("Error al cargar platos destacados de la base de datos:", error);
    // Si la DB falla o no hay conexión, platosDb queda vacío y HomeClient usará el fallback sin romper el sitio
  }

  return <HomeClient initialPlatos={platosDb} />;
}
