import Link from "next/link";
import { getFacturasCompletas } from "@/db/queries/facturas";
import { getPedidosCompletos } from "@/db/queries/pedidos";
import FacturasClient from "./FacturasClient";

export const dynamic = "force-dynamic";

export default async function AdminFacturasPage() {
  const [facturas, todosLosPedidos] = await Promise.all([
    getFacturasCompletas(),
    getPedidosCompletos(),
  ]);

  // Comandas disponibles para facturar (las entregadas o las recibidas que no tengan factura aún)
  const facturasPedidoIds = new Set(facturas.map((f) => f.pedidoId));
  const pedidosDisponibles = todosLosPedidos
    .filter((p) => !facturasPedidoIds.has(p.id) && p.estado !== "cancelado")
    .map((p) => ({
      id: p.id,
      mesa: p.mesa,
      total: p.total,
      creadoEn: p.creadoEn,
      clienteNombre: p.clienteNombre,
      clienteTelefono: p.clienteTelefono,
      items: p.items.map((it) => ({
        id: it.id,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        platoNombre: it.platoNombre,
      })),
    }));

  const rucConfig = process.env.SRI_RUC || "1104999999001";
  const razonSocialConfig = process.env.SRI_RAZON_SOCIAL || "ROMA RESTAURANTE PIZZERÍA";

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
            Facturación, Caja & SRI Ecuador
          </h1>
          <p className="text-xs text-[#8a8078] mt-1">
            Emisión de comprobantes, desglose de IVA (15%), tickets térmicos para clientes y exportación XML oficial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#141210] border border-white/[0.06] px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] text-[#8a8078] uppercase font-semibold">IVA Vigente</span>
            <span className="text-lg font-bold text-[#c9a84c]">15.0%</span>
          </div>
          <div className="bg-[#141210] border border-white/[0.06] px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] text-[#8a8078] uppercase font-semibold">Comprobantes</span>
            <span className="text-lg font-bold text-[#f5f0e8]">{facturas.length}</span>
          </div>
        </div>
      </div>

      {/* Interfaz de Facturación y Caja */}
      <FacturasClient
        facturas={facturas}
        pedidosDisponibles={pedidosDisponibles}
        rucConfig={rucConfig}
        razonSocialConfig={razonSocialConfig}
      />
    </div>
  );
}
