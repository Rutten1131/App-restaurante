import { getPlatosAdmin, getCategorias } from "@/db/queries/menu";
import { getConfiguracion } from "@/db/queries/fidelizacion";
import AdminMenuClient from "./AdminMenuClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  let platos: any[] = [];
  let categorias: any[] = [];
  let totalMesas = 12;

  try {
    const [p, c, mesasConfig] = await Promise.all([
      getPlatosAdmin(),
      getCategorias(),
      getConfiguracion("total_mesas"),
    ]);
    platos = p;
    categorias = c;
    if (mesasConfig && !isNaN(parseInt(mesasConfig, 10))) {
      totalMesas = parseInt(mesasConfig, 10);
    }
  } catch (error) {
    console.error("Error al cargar datos de administración del menú:", error);
  }

  return (
    <AdminMenuClient
      initialPlatos={platos}
      categorias={categorias}
      initialTotalMesas={totalMesas}
    />
  );
}
