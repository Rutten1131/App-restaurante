"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "./actions";

const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcLayoutDashboard({ className }: { className?: string }) {
  return <svg {...s} className={className}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
}
function IcFlame({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
}
function IcChefHat({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>;
}
function IcBook({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function IcUsers({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcPackage({ className }: { className?: string }) {
  return <svg {...s} className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function IcFileText({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function IcChevronDown({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="6 9 12 15 18 9"/></svg>;
}
function IcLogOut({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

export interface AdminNavMetrics {
  pedidosNuevos: number;
  pedidosEnCocina: number;
  platosActivos: number;
  totalClientes: number;
  totalInsumos: number;
  totalFacturas: number;
}

interface AdminNavbarProps {
  session: {
    nombre: string;
    rol: string;
    restauranteNombre?: string | null;
    restauranteSlug?: string | null;
  };
  metrics: AdminNavMetrics;
}

export default function AdminNavbar({ session, metrics }: AdminNavbarProps) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/admin/resumen",
      label: "Resumen General",
      sublabel: "Ventas & Métricas",
      subcolor: "text-[#c9a84c]",
      icon: IcLayoutDashboard,
      iconBg: "bg-[#c9a84c]/10 text-[#c9a84c]",
      isActive: pathname === "/admin/resumen",
    },
    {
      href: "/admin/pedidos",
      label: "Comandas (Caja)",
      sublabel: `${metrics.pedidosNuevos} nuevas en caja`,
      subcolor: metrics.pedidosNuevos > 0 ? "text-blue-400 font-bold" : "text-[#8a8078]",
      icon: IcFlame,
      iconBg: "bg-blue-500/10 text-blue-400",
      isActive: pathname.startsWith("/admin/pedidos"),
    },
    {
      href: "/admin/cocina",
      label: "Cocina & Horno",
      sublabel: `${metrics.pedidosEnCocina} en preparación`,
      subcolor: metrics.pedidosEnCocina > 0 ? "text-[#e53935] font-bold" : "text-[#8a8078]",
      icon: IcChefHat,
      iconBg: "bg-[#c62828]/10 text-[#e53935]",
      isActive: pathname.startsWith("/admin/cocina"),
    },
    {
      href: "/admin/menu",
      label: "Menú & Carta",
      sublabel: `${metrics.platosActivos} platos activos`,
      subcolor: "text-[#c9a84c]",
      icon: IcBook,
      iconBg: "bg-[#c9a84c]/10 text-[#c9a84c]",
      isActive: pathname.startsWith("/admin/menu"),
    },
    {
      href: "/admin/clientes",
      label: "Clientes & Opiniones",
      sublabel: `${metrics.totalClientes} en el club`,
      subcolor: "text-[#c9a84c]",
      icon: IcUsers,
      iconBg: "bg-[#c9a84c]/10 text-[#c9a84c]",
      isActive: pathname.startsWith("/admin/clientes"),
    },
    {
      href: "/admin/inventario",
      label: "Inventario & Recetas",
      sublabel: `${metrics.totalInsumos} insumos`,
      subcolor: "text-[#8a8078]",
      icon: IcPackage,
      iconBg: "bg-white/[0.06] text-white/80",
      isActive: pathname.startsWith("/admin/inventario"),
    },
    {
      href: "/admin/facturas",
      label: "Facturación & SRI",
      sublabel: `${metrics.totalFacturas} comprobantes`,
      subcolor: "text-[#c9a84c]",
      icon: IcFileText,
      iconBg: "bg-white/[0.06] text-white/80",
      isActive: pathname.startsWith("/admin/facturas"),
    },
  ];

  // Item actual activo
  const itemActivo = navItems.find((i) => i.isActive) || navItems[1];
  const IconoActivo = itemActivo.icon;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0908]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Lado Izquierdo: Logo & Selector Desplegable */}
          <div className="flex items-center gap-3 sm:gap-6" ref={dropdownRef}>
            <Link href="/admin/pedidos" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#c9a84c]/40 group-hover:border-[#c9a84c] transition-colors bg-gradient-to-br from-[#c9a84c]/20 to-transparent flex items-center justify-center font-bold text-xs text-[#c9a84c]">
                {session.restauranteNombre?.substring(0, 2).toUpperCase() || "RO"}
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-sm font-bold tracking-tight text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors block leading-tight truncate max-w-[150px]">
                  {session.restauranteNombre || "ROMA PIZZERÍA"}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#c9a84c] font-semibold block">
                  Panel Administrativo
                </span>
              </div>
            </Link>

            {/* BOTÓN DESPLEGABLE DE MÓDULOS */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAbierto(!menuAbierto)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                  menuAbierto
                    ? "bg-[#1f1b16] border-[#c9a84c] text-white shadow-lg shadow-[#c9a84c]/10"
                    : "bg-[#141210] border-white/[0.1] hover:border-white/20 text-[#f5f0e8]"
                }`}
              >
                <span className={`p-1 rounded-lg ${itemActivo.iconBg}`}>
                  <IconoActivo className="w-3.5 h-3.5" />
                </span>

                <div className="text-left leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-xs font-bold text-white">
                      {itemActivo.label}
                    </span>
                    <span className={`text-[10px] hidden md:inline font-medium ${itemActivo.subcolor}`}>
                      · {itemActivo.sublabel}
                    </span>
                  </div>
                </div>

                <IcChevronDown
                  className={`w-3.5 h-3.5 text-[#8a8078] transition-transform duration-200 ${
                    menuAbierto ? "rotate-180 text-[#c9a84c]" : ""
                  }`}
                />
              </button>

              {/* MENÚ DESPLEGABLE (POPOVER) */}
              {menuAbierto && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-[#141210] border border-[#c9a84c]/30 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn space-y-1 backdrop-blur-xl">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#8a8078] tracking-wider border-b border-white/[0.06] mb-1">
                    Módulos del Sistema
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuAbierto(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          item.isActive
                            ? "bg-[#1f1b16] border border-[#c9a84c]/40 text-[#c9a84c]"
                            : "hover:bg-white/[0.04] text-[#f5f0e8] border border-transparent"
                        }`}
                      >
                        <span className={`p-2 rounded-lg shrink-0 ${item.iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`font-serif text-xs font-bold block truncate ${
                              item.isActive ? "text-[#c9a84c]" : "text-white"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className={`text-[10px] block truncate ${item.subcolor}`}>
                            {item.sublabel}
                          </span>
                        </div>
                        {item.isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Lado Derecho: Usuario & Cerrar Sesión */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#141210] border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-[#8a8078]">
              <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
              <span className="text-[#f5f0e8] font-medium">{session.nombre}</span>
              <span className="text-[10px] text-[#c9a84c] uppercase font-bold">({session.rol})</span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#c62828]/20 hover:bg-[#c62828] text-white border border-[#c62828]/40 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                title="Cerrar Sesión"
              >
                <IcLogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
