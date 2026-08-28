import Link from "next/link";
import { getInsumosInventario, getRecetasPlatos, getMovimientosInventario } from "@/db/queries/inventario";
import InventarioClient from "./InventarioClient";

import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminInventarioPage() {
  const session = await getAdminSession();
  const restId = session?.restauranteId ?? 1;

  const [insumos, recetas, movimientos] = await Promise.all([
    getInsumosInventario(restId),
    getRecetasPlatos(restId),
    getMovimientosInventario(30, restId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8a8078] mb-1">
            <Link href="/admin/resumen" className="hover:text-[#c9a84c] transition-colors">
              ← Ver Dashboard & Métricas
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#f5f0e8]">
            Control de Inventario, Insumos & Recetas
          </h1>
          <p className="text-xs text-[#8a8078] mt-1">
            Control de stock en tiempo real, fichas técnicas de consumo por plato y auditoría de cocina.
          </p>
        </div>
      </div>

      <InventarioClient
        insumos={insumos}
        recetas={recetas}
        movimientos={movimientos}
      />
    </div>
  );
}
