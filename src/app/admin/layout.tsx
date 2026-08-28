import { getAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/db/queries/dashboard";
import AdminNavbar from "./AdminNavbar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Si no hay sesión (ej. página de login), solo renderizar el contenido
  if (!session) {
    return <div className="min-h-screen bg-[#0a0908] text-[#f5f0e8]">{children}</div>;
  }

  const data = await getDashboardData(session.restauranteId ?? 1);
  const metrics = {
    pedidosNuevos: data.pedidosNuevos,
    pedidosEnCocina: data.pedidosEnCocina,
    platosActivos: data.platosDisponibles,
    totalClientes: data.totalClientes,
    totalInsumos: data.totalInsumos,
    totalFacturas: data.totalFacturas,
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f0e8] flex flex-col font-sans">
      {/* Barra de Navegación Unificada Superior en todo /admin */}
      <AdminNavbar session={session} metrics={metrics} />

      {/* Contenido Principal de cada módulo */}
      <main className="flex-grow">{children}</main>
    </div>
  );
}
