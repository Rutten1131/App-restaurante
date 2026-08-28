import Link from "next/link";
import Image from "next/image";

interface TenantFooterProps {
  slug: string;
  nombre: string;
  descripcion?: string | null;
  logoUrl?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  colorPrimario?: string | null;
}

export default function TenantFooter({
  slug,
  nombre,
  descripcion,
  logoUrl,
  telefono,
  email,
  direccion,
  ciudad,
  colorPrimario = "#c9a84c",
}: TenantFooterProps) {
  return (
    <footer className="relative bg-[#080706] text-[#8a8078] overflow-hidden border-t border-white/5">
      {/* Top ornamental line */}
      <div
        className="h-px w-full opacity-40"
        style={{
          background: `linear-gradient(to right, transparent, ${colorPrimario}, transparent)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link href={`/r/${slug}`} className="inline-flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                {logoUrl ? (
                  <Image src={logoUrl} alt={nombre} fill className="object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${colorPrimario}30`, color: colorPrimario || "#c9a84c" }}
                  >
                    {nombre.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <span className="block font-serif text-xl font-bold tracking-wide text-[#f5f0e8]">
                  {nombre}
                </span>
                <span className="block text-[9px] uppercase tracking-[0.2em]" style={{ color: colorPrimario || "#c9a84c" }}>
                  Restaurante & Experiencia
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#8a8078] leading-relaxed max-w-sm">
              {descripcion || "Platos elaborados con ingredientes de primera calidad, recetas tradicionales y pasión por el buen sabor."}
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="md:col-span-3 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-white">
              Navegación
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/r/${slug}`} className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href={`/r/${slug}/menu`} className="hover:text-white transition-colors">
                  Carta Digital & Menú
                </Link>
              </li>
              <li>
                <Link href={`/r/${slug}/nosotros`} className="hover:text-white transition-colors">
                  Nuestra Historia
                </Link>
              </li>
              <li>
                <Link href={`/r/${slug}/reserva`} className="hover:text-white transition-colors">
                  Reservaciones
                </Link>
              </li>
              <li>
                <Link href={`/r/${slug}/contacto`} className="hover:text-white transition-colors">
                  Contacto y Ubicación
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-4 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-white">
              Contacto y Horarios
            </span>
            <div className="space-y-2 text-xs text-[#b8afa3]">
              {direccion && <p>📍 {direccion}</p>}
              {ciudad && <p>🏙️ {ciudad}, Ecuador</p>}
              {telefono && <p>📞 {telefono}</p>}
              {email && <p>✉️ {email}</p>}
              <p className="pt-2 text-[11px] text-[#8a8078]">
                Atención: Martes a Domingo de 12:00 a 22:30
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8a8078]">
          <p>© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:underline text-[#c9a84c]">
              Panel Restaurante
            </Link>
            <span>•</span>
            <Link href="/superadmin/login" className="hover:underline text-[#8a8078]">
              Acceso SaaS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
