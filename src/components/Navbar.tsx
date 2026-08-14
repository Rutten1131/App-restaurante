"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { name: "Inicio", href: "/" },
    { name: "Carta", href: "/app/menu" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Reservar", href: "/reserva" },
    { name: "Contacto", href: "/contacto" },
  ];

  const active = (p: string) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0908]/90 backdrop-blur-xl shadow-[0_2px_40px_-12px_rgba(0,0,0,0.7)] border-b border-white/[0.04]"
          : "bg-transparent"
      }`}
    >
      {/* Thin top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#c9a84c]/30 group-hover:ring-[#c9a84c]/70 transition-all duration-500">
              <Image
                src="/images/logo-roma.jpg"
                alt="Roma"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="block font-serif text-lg font-bold tracking-wide text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors duration-300">
                ROMA
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-[#8a8078] -mt-0.5">
                Pizzería · Loja
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.name}
                href={l.href}
                className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-300 rounded-full ${
                  active(l.href)
                    ? "text-[#c9a84c]"
                    : "text-[#f5f0e8]/70 hover:text-[#f5f0e8]"
                }`}
              >
                {l.name}
                {active(l.href) && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c9a84c]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Phone pill — desktop only */}
            <a
              href="tel:0987670140"
              className="hidden lg:flex items-center gap-2 text-[11px] font-medium text-[#8a8078] hover:text-[#c9a84c] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
              098 767 0140
            </a>

            {/* CTA */}
            <Link
              href="/reserva"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#0a0908] bg-[#c9a84c] rounded-full hover:bg-[#e8d48b] transition-all duration-300 shadow-[0_0_20px_-4px_rgba(201,168,76,0.3)]"
            >
              Reservar mesa
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#f5f0e8] hover:text-[#c9a84c] transition-colors"
              aria-label="Menú"
            >
              <div className="w-5 flex flex-col gap-[5px]">
                <span
                  className={`block h-[1.5px] bg-current transition-all duration-300 origin-center ${
                    mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-current transition-all duration-300 ${
                    mobileOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-current transition-all duration-300 origin-center ${
                    mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0a0908]/95 backdrop-blur-xl border-t border-white/[0.04] px-5 pt-4 pb-8 space-y-1">
          {links.map((l) => (
            <Link
              key={l.name}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active(l.href)
                  ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                  : "text-[#f5f0e8]/80 hover:bg-white/[0.03]"
              }`}
            >
              {l.name}
            </Link>
          ))}
          <div className="pt-4">
            <Link
              href="/reserva"
              onClick={() => setMobileOpen(false)}
              className="block text-center py-3 text-xs font-semibold uppercase tracking-widest text-[#0a0908] bg-[#c9a84c] rounded-xl"
            >
              Reservar Mesa
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
