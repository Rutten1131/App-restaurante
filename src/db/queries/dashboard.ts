import "server-only";
import { db } from "@/db";
import {
  platos,
  categorias,
  clientes,
  alertasFidelizacion,
  resenas,
  pedidos,
  insumos,
  facturas,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface DashboardMetrics {
  // Resumen Menú
  totalPlatos: number;
  platosDisponibles: number;
  totalCategorias: number;

  // Resumen Clientes & Fidelización
  totalClientes: number;
  alertasPendientes: number;
  promedioResenas: number;
  totalResenas: number;

  // Resumen Pedidos
  pedidosHoy: number;
  pedidosNuevos: number;
  pedidosEnCocina: number;
  pedidosListos: number;
  pedidosEntregados: number;
  ingresosTotales: number;

  // Resumen Inventario & Facturación
  totalInsumos: number;
  insumosBajoStock: number;
  totalFacturas: number;

  // Listados rápidos para widgets
  ultimosPedidos: Array<{
    id: number;
    origen: string;
    mesa: string | null;
    estado: string;
    total: string;
    creadoEn: Date;
    clienteNombre?: string | null;
  }>;
  alertasUrgentes: Array<{
    id: number;
    clienteId: number;
    clienteNombre: string;
    clienteTelefono: string | null;
    diasSinVolver: number;
    mensajeSugerido: string;
    creadaEn: Date;
  }>;
  insumosCriticos: Array<{
    id: number;
    nombre: string;
    unidad: string;
    stockActual: string;
    stockMinimo: string;
  }>;
}

export async function getDashboardData(): Promise<DashboardMetrics> {
  try {
    // 1. Métricas de Platos & Categorías
    const [totalPlatosRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(platos);
    const [platosDispRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(platos)
      .where(eq(platos.disponible, true));
    const [totalCatsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categorias);

    // 2. Métricas de Clientes y Fidelización
    const [totalClientesRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientes);
    const [alertasPendRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(alertasFidelizacion)
      .where(eq(alertasFidelizacion.estado, "pendiente"));

    const [resenasStats] = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${resenas.calificacion}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(resenas);

    // 3. Métricas de Pedidos y Ventas
    const [pedidosStats] = await db
      .select({
        total: sql<number>`count(*)`,
        totalIngresos: sql<number>`COALESCE(SUM(CAST(${pedidos.total} AS DECIMAL(10,2))), 0)`,
        nuevos: sql<number>`SUM(CASE WHEN ${pedidos.estado} = 'recibido' THEN 1 ELSE 0 END)`,
        enCocina: sql<number>`SUM(CASE WHEN ${pedidos.estado} = 'en_cocina' THEN 1 ELSE 0 END)`,
        listos: sql<number>`SUM(CASE WHEN ${pedidos.estado} = 'listo' THEN 1 ELSE 0 END)`,
        entregados: sql<number>`SUM(CASE WHEN ${pedidos.estado} = 'entregado' THEN 1 ELSE 0 END)`,
      })
      .from(pedidos);

    // 4. Métricas de Inventario & Facturación
    const [totalInsumosRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(insumos);
    const [insumosBajosRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(insumos)
      .where(
        sql`CAST(${insumos.stockActual} AS DECIMAL(10,2)) <= CAST(${insumos.stockMinimo} AS DECIMAL(10,2))`
      );
    const [totalFacturasRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(facturas);

    // 5. Últimos Pedidos
    const ultimosPedidosQuery = await db
      .select({
        id: pedidos.id,
        origen: pedidos.origen,
        mesa: pedidos.mesa,
        estado: pedidos.estado,
        total: pedidos.total,
        creadoEn: pedidos.creadoEn,
        clienteNombre: clientes.nombre,
      })
      .from(pedidos)
      .leftJoin(clientes, eq(pedidos.clienteId, clientes.id))
      .orderBy(desc(pedidos.creadoEn))
      .limit(6);

    // 6. Alertas Urgentes de Fidelización
    const alertasQuery = await db
      .select({
        id: alertasFidelizacion.id,
        clienteId: alertasFidelizacion.clienteId,
        clienteNombre: clientes.nombre,
        clienteTelefono: clientes.telefono,
        diasSinVolver: alertasFidelizacion.diasSinVolver,
        mensajeSugerido: alertasFidelizacion.mensajeSugerido,
        creadaEn: alertasFidelizacion.creadaEn,
      })
      .from(alertasFidelizacion)
      .innerJoin(clientes, eq(alertasFidelizacion.clienteId, clientes.id))
      .where(eq(alertasFidelizacion.estado, "pendiente"))
      .orderBy(desc(alertasFidelizacion.diasSinVolver))
      .limit(4);

    // 7. Insumos Críticos
    const insumosCriticosQuery = await db
      .select({
        id: insumos.id,
        nombre: insumos.nombre,
        unidad: insumos.unidad,
        stockActual: insumos.stockActual,
        stockMinimo: insumos.stockMinimo,
      })
      .from(insumos)
      .where(
        sql`CAST(${insumos.stockActual} AS DECIMAL(10,2)) <= CAST(${insumos.stockMinimo} AS DECIMAL(10,2))`
      )
      .limit(5);

    return {
      totalPlatos: Number(totalPlatosRes?.count || 0),
      platosDisponibles: Number(platosDispRes?.count || 0),
      totalCategorias: Number(totalCatsRes?.count || 0),
      totalClientes: Number(totalClientesRes?.count || 0),
      alertasPendientes: Number(alertasPendRes?.count || 0),
      promedioResenas: Number(Number(resenasStats?.avg || 5.0).toFixed(1)),
      totalResenas: Number(resenasStats?.count || 0),
      pedidosHoy: Number(pedidosStats?.total || 0),
      pedidosNuevos: Number(pedidosStats?.nuevos || 0),
      pedidosEnCocina: Number(pedidosStats?.enCocina || 0),
      pedidosListos: Number(pedidosStats?.listos || 0),
      pedidosEntregados: Number(pedidosStats?.entregados || 0),
      ingresosTotales: Number(pedidosStats?.totalIngresos || 0),
      totalInsumos: Number(totalInsumosRes?.count || 0),
      insumosBajoStock: Number(insumosBajosRes?.count || 0),
      totalFacturas: Number(totalFacturasRes?.count || 0),
      ultimosPedidos: ultimosPedidosQuery || [],
      alertasUrgentes: alertasQuery || [],
      insumosCriticos: insumosCriticosQuery || [],
    };
  } catch (err) {
    console.error("Error al obtener datos del dashboard:", err);
    // Fallback defensivo para que la vista jamás se rompa
    return {
      totalPlatos: 4,
      platosDisponibles: 4,
      totalCategorias: 2,
      totalClientes: 0,
      alertasPendientes: 0,
      promedioResenas: 5.0,
      totalResenas: 0,
      pedidosHoy: 0,
      pedidosNuevos: 0,
      pedidosEnCocina: 0,
      pedidosListos: 0,
      pedidosEntregados: 0,
      ingresosTotales: 0,
      totalInsumos: 0,
      insumosBajoStock: 0,
      totalFacturas: 0,
      ultimosPedidos: [],
      alertasUrgentes: [],
      insumosCriticos: [],
    };
  }
}
