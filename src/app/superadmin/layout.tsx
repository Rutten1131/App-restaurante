import { getSuperAdminSession } from "@/lib/auth";
import SuperAdminNavbar from "./SuperAdminNavbar";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSuperAdminSession();

  // Si no hay sesión (ej. página de login /superadmin/login), solo renderizar contenido
  if (!session) {
    return <div className="min-h-screen bg-[#080706] text-[#f5f0e8]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#080706] text-[#f5f0e8] flex flex-col font-sans">
      <SuperAdminNavbar session={session} />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
