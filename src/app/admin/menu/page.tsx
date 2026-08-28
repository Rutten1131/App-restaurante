import { getPlatosAdmin, getCategorias } from "@/db/queries/menu";
import { getConfiguracion } from "@/db/queries/fidelizacion";
import { getInsumosInventario, getRecetasPlatos } from "@/db/queries/inventario";
import AdminMenuClient from "./AdminMenuClient";

import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await getAdminSession();
  const restId = session?.restauranteId ?? 1;

  let platos: any[] = [];
  let categorias: any[] = [];
  let insumos: any[] = [];
  let recetas: any[] = [];
  let totalMesas = 12;

  try {
    const [p, c, ins, recs, mesasConfig] = await Promise.all([
      getPlatosAdmin(restId),
      getCategorias(restId),
      getInsumosInventario(restId),
      getRecetasPlatos(restId),
      getConfiguracion("total_mesas"),
    ]);
    platos = p;
    categorias = c;
    insumos = ins;
    recetas = recs;
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
      insumosDisponibles={insumos}
      recetasPlatos={recetas}
      initialTotalMesas={totalMesas}
      restauranteSlug={session?.restauranteSlug || "roma"}
      restauranteNombre={session?.restauranteNombre || "Roma Pizzería"}
    />
  );
}
