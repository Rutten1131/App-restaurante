"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutSuperAdminAction } from "./actions";

interface SuperAdminNavbarProps {
  session: {
    nombre: string;
    email: string;
    rol: string;
  };
}

export default function SuperAdminNavbar({ session }: SuperAdminNavbarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard Global", href: "/superadmin" },
    { name: "Restaurantes", href: "/superadmin/restaurantes" },
    { name: "+ Nuevo Restaurante", href: "/superadmin/restaurantes/nuevo" },
  ];

  const active = (href: string) => {
    if (href === "/superadmin") return pathname === "/superadmin";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0e0c0a]/95 backdrop-blur-md border-b border-[#c9a84c]/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand SaaS */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#9c7827] flex items-center justify-center text-black font-bold text-lg shadow-md shadow-[#c9a84c]/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wide text-white text-base">
                  PLATAFORMA SAAS
                </span>
                <span className="bg-[#c9a84c]/20 text-[#e8d48b] border border-[#c9a84c]/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <span className="text-[10px] text-[#8a8078] block">
                Gestión Centralizada de Restaurantes
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active(link.href)
                    ? "bg-[#c9a84c] text-black shadow-md shadow-[#c9a84c]/20"
                    : "text-[#d6cec2] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Session & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-semibold text-[#f5f0e8]">
                {session.nombre}
              </span>
              <span className="block text-[10px] text-[#8a8078]">
                {session.email}
              </span>
            </div>

            <form action={logoutSuperAdminAction}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-[#e53935] hover:text-white hover:bg-[#c62828] border border-[#c62828]/40 rounded-xl transition-all"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
