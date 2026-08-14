import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "./actions";

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

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f0e8] flex flex-col font-sans relative">
      {/* Botón flotante superior de sesión (sin header cargado ni enlaces redundantes) */}
      <div className="absolute top-4 right-6 z-50 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-[#141210]/80 backdrop-blur-md border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-[#8a8078]">
          <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
          <span className="text-[#f5f0e8] font-medium">{session.nombre}</span>
          <span className="text-[10px] text-[#c9a84c] uppercase font-bold">({session.rol})</span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#c62828]/20 hover:bg-[#c62828] text-white border border-[#c62828]/40 text-xs font-semibold rounded-xl transition-all shadow-md"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-2">{children}</main>
    </div>
  );
}
