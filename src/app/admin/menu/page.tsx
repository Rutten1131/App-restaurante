import { getPlatosAdmin, getCategorias } from "@/db/queries/menu";
import AdminMenuClient from "./AdminMenuClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  let platos: any[] = [];
  let categorias: any[] = [];

  try {
    [platos, categorias] = await Promise.all([
      getPlatosAdmin(),
      getCategorias(),
    ]);
  } catch (error) {
    console.error("Error al cargar datos de administración del menú:", error);
  }

  return (
    <AdminMenuClient
      initialPlatos={platos}
      categorias={categorias}
    />
  );
}
