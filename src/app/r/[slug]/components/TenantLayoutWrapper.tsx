"use client";

import { usePathname } from "next/navigation";
import TenantNavbar from "./TenantNavbar";
import TenantFooter from "./TenantFooter";

interface TenantLayoutWrapperProps {
  children: React.ReactNode;
  slug: string;
  nombre: string;
  descripcion?: string | null;
  logoUrl?: string | null;
  colorPrimario?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
}

export default function TenantLayoutWrapper({
  children,
  slug,
  nombre,
  descripcion,
  logoUrl,
  colorPrimario,
  telefono,
  email,
  direccion,
  ciudad,
}: TenantLayoutWrapperProps) {
  const pathname = usePathname();
  const isStandaloneApp =
    pathname.endsWith("/menu") ||
    pathname.includes("/menu") ||
    pathname.endsWith("/fidelizacion") ||
    pathname.includes("/fidelizacion") ||
    pathname.endsWith("/resena") ||
    pathname.includes("/resena");

  // Si está en la carta o fidelización/reseña, renderizar standalone
  if (isStandaloneApp) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <TenantNavbar
        slug={slug}
        nombre={nombre}
        logoUrl={logoUrl}
        colorPrimario={colorPrimario}
        telefono={telefono}
      />
      <main className="flex-grow pt-[72px]">{children}</main>
      <TenantFooter
        slug={slug}
        nombre={nombre}
        descripcion={descripcion}
        logoUrl={logoUrl}
        telefono={telefono}
        email={email}
        direccion={direccion}
        ciudad={ciudad}
        colorPrimario={colorPrimario}
      />
    </>
  );
}
