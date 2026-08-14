import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-[#080706] text-[#8a8078] overflow-hidden">
      {/* Top ornamental border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-12">
        {/* Upper section: Brand + Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#c9a84c]/20">
                <Image
                  src="/images/logo-roma.jpg"
                  alt="Roma"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="block font-serif text-xl font-bold tracking-wide text-[#f5f0e8]">
                  ROMA
                </span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-[#c9a84c] -mt-0.5">
                  Restaurante – Pizzería
                </span>
              </div>
            </Link>

            <p className="text-[13px] leading-relaxed max-w-xs text-[#8a8078]">
              Veinticinco años llevando la tradición italiana a la mesa lojana, con el fuego de nuestro horno de leña y el alma de nuestra tierra.
            </p>

            {/* Social */}
            <div className="flex gap-3 pt-1">
              <a
                href="https://www.facebook.com/romarestaurantepizzerialoja"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8a8078] hover:text-[#c9a84c] hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/5 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://wa.me/593987670140"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8a8078] hover:text-[#2e7d32] hover:border-[#2e7d32]/30 hover:bg-[#2e7d32]/5 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2 space-y-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
              Explorar
            </h4>
            <ul className="space-y-3 text-[13px]">
              {[
                { name: "Inicio", href: "/" },
                { name: "Nuestra Carta", href: "/app/menu" },
                { name: "Sobre Roma", href: "/nosotros" },
                { name: "Reservar Mesa", href: "/reserva" },
                { name: "Contacto", href: "/contacto" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-[#f5f0e8] transition-colors duration-300"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-3 space-y-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
              Horarios
            </h4>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span>Lunes – Sábado</span>
                <span className="text-[#f5f0e8] font-medium">11 am – 8:30 pm</span>
              </div>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex justify-between">
                <span>Domingo</span>
                <span className="text-[#c62828] text-xs font-medium">Cerrado</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 space-y-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
              Contacto
            </h4>
            <div className="space-y-3 text-[13px]">
              <p>Av. Eugenio Espejo 200-100<br />y Shuaras, Loja – Ecuador</p>
              <a href="tel:0987670140" className="block hover:text-[#f5f0e8] transition-colors">
                098 767 0140
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8a8078]/70">
          <span>© {new Date().getFullYear()} Roma Restaurante Pizzería · Loja, Ecuador</span>
          <span className="font-serif italic text-[#c9a84c]/50 text-xs">
            "La mesa a la que siempre quieres volver"
          </span>
        </div>
      </div>
    </footer>
  );
}
