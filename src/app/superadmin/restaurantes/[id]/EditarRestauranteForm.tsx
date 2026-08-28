"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { actualizarRestauranteAction } from "../../actions";
import ImageUploadField from "@/components/ImageUploadField";
import MenuBulkImporterModal from "@/components/MenuBulkImporterModal";

interface Restaurante {
  id: number;
  slug: string;
  nombre: string;
  nombreComercial: string | null;
  descripcion: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  colorPrimario: string | null;
  colorFondo: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  pais: string | null;
  whatsapp: string | null;
  sriRuc: string | null;
  sriRazonSocial: string | null;
  sriEstablecimiento: string | null;
  sriPuntoEmision: string | null;
  sriDirMatriz: string | null;
  activo: boolean;
}

interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export default function EditarRestauranteForm({
  restaurante,
  adminUser,
}: {
  restaurante: Restaurante;
  adminUser?: AdminUser | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Estados visuales para preview en tiempo real
  const [nombre, setNombre] = useState(restaurante.nombre);
  const [slug, setSlug] = useState(restaurante.slug);
  const [colorPrimario, setColorPrimario] = useState(restaurante.colorPrimario || "#c9a84c");
  const [colorFondo, setColorFondo] = useState(restaurante.colorFondo || "#0a0908");
  const [activo, setActivo] = useState(restaurante.activo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("activo", String(activo));

    const res = await actualizarRestauranteAction(restaurante.id, formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-[#c62828]/15 border border-[#c62828]/40 rounded-2xl text-xs text-[#ff6b6b]">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#2e7d32]/15 border border-[#2e7d32]/40 rounded-2xl text-xs text-[#81c784]">
          ✅ Configuración guardada con éxito.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Sección 1: Datos de la Marca */}
          <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
                1. Información de la Marca
              </h2>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="rounded accent-[#c9a84c]"
                />
                <span className={activo ? "text-[#81c784] font-semibold" : "text-[#e57373]"}>
                  {activo ? "Restaurante Activo" : "Inactivo / Pausado"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Nombre del Restaurante *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Slug / URL Identificador *
                </label>
                <div className="flex items-center">
                  <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-xl px-2.5 py-2.5 text-xs text-[#8a8078] font-mono">
                    /r/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="w-full bg-[#080706] border border-white/10 rounded-r-xl px-3.5 py-2.5 text-xs text-[#c9a84c] font-mono focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-white">
                Descripción o Eslogan
              </label>
              <textarea
                name="descripcion"
                rows={2}
                defaultValue={restaurante.descripcion || ""}
                className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Razón Social / Nombre Comercial
                </label>
                <input
                  type="text"
                  name="nombreComercial"
                  defaultValue={restaurante.nombreComercial || ""}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Ciudad / Ubicación
                </label>
                <input
                  type="text"
                  name="ciudad"
                  defaultValue={restaurante.ciudad || "Loja"}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Identidad Visual */}
          <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] border-b border-white/10 pb-2">
              2. Identidad Visual y Colores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Color Primario (Acento / Botones)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    name="colorPrimario"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Color de Fondo (Tema)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    name="colorFondo"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploadField
                name="logoUrl"
                label="Logo del Restaurante"
                defaultValue={restaurante.logoUrl || "/images/logo-roma.jpg"}
                aspectRatio="square"
                maxDimension={400}
              />

              <ImageUploadField
                name="heroImageUrl"
                label="Imagen Hero / Portada Principal"
                defaultValue={restaurante.heroImageUrl || "/images/hero-pizza.jpg"}
                aspectRatio="video"
                maxDimension={1200}
              />
            </div>
          </div>

          {/* Sección 3: Contacto & SRI */}
          <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] border-b border-white/10 pb-2">
              3. Contacto & Facturación SRI Ecuador
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Teléfono / Celular
                </label>
                <input
                  type="text"
                  name="telefono"
                  defaultValue={restaurante.telefono || ""}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  WhatsApp Alertas
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  defaultValue={restaurante.whatsapp || ""}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={restaurante.email || ""}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-white">
                Dirección Física
              </label>
              <input
                type="text"
                name="direccion"
                defaultValue={restaurante.direccion || ""}
                className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  RUC SRI (13 dígitos)
                </label>
                <input
                  type="text"
                  name="sriRuc"
                  defaultValue={restaurante.sriRuc || ""}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Establecimiento
                </label>
                <input
                  type="text"
                  name="sriEstablecimiento"
                  defaultValue={restaurante.sriEstablecimiento || "001"}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Punto Emisión
                </label>
                <input
                  type="text"
                  name="sriPuntoEmision"
                  defaultValue={restaurante.sriPuntoEmision || "001"}
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Credenciales de Acceso al Panel Admin */}
          <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                <span>🔐</span> 4. Acceso del Dueño/Administrador (/admin)
              </h2>
              <span className="text-[10px] text-[#8a8078] bg-white/5 px-2 py-0.5 rounded-full">
                Credenciales de Login
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Nombre del Administrador
                </label>
                <input
                  type="text"
                  name="adminNombre"
                  defaultValue={adminUser?.nombre || `${nombre} Admin`}
                  placeholder="Ej. Gerente General"
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Usuario / Correo de Login *
                </label>
                <input
                  type="text"
                  name="adminUsuario"
                  defaultValue={adminUser?.email || restaurante.slug || "admin"}
                  placeholder="Ej. trattoria o admin@trattoria.com"
                  required
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#c9a84c] font-mono focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">
                  Nueva Contraseña (Opcional)
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  placeholder="Dejar vacío para no cambiar"
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#c9a84c] focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#8a8078]">
              {adminUser
                ? `Usuario actual: ${adminUser.email}. Ingresa una nueva contraseña si deseas restablecerla.`
                : "Aún no tiene usuario creado. Completa los campos para crear su acceso inmediato a /admin."}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/superadmin/restaurantes"
              className="px-5 py-3 text-xs font-semibold text-[#8a8078] hover:text-white"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#c9a84c] hover:bg-[#e8d48b] text-black font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-50"
            >
              {loading ? "Guardando Cambios..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

        {/* Preview en vivo y acciones rápidas */}
        <div className="space-y-4">
          <div className="sticky top-24 space-y-4">
            {/* Botón de Carga Masiva de Menú */}
            <div className="bg-[#12100e] border border-white/15 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
                <span>📋</span> Gestión de Menú
              </div>
              <p className="text-[11px] text-[#8a8078]">
                ¿Tienes la lista de platos en texto o JSON? Impórtala en 1 segundo:
              </p>
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="w-full py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c770] hover:brightness-110 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c9a84c]/20 uppercase tracking-wider"
              >
                <span>⚡</span> Cargar Menú Masivo (JSON / Texto)
              </button>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8078] block">
              Vista Previa en Vivo
            </span>

            <div
              className="rounded-3xl p-6 border border-white/15 space-y-4 shadow-2xl transition-all"
              style={{ backgroundColor: colorFondo }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border border-white/20"
                  style={{ backgroundColor: `${colorPrimario}20`, color: colorPrimario }}
                >
                  {nombre.substring(0, 2).toUpperCase() || "RE"}
                </div>
                <div>
                  <h3 className="font-serif font-black text-white text-base leading-tight">
                    {nombre || "Nombre"}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: colorPrimario }}>
                    Restaurante & Carta
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-[#b8afa3] space-y-1">
                <div className="flex justify-between">
                  <span>URL Web:</span>
                  <span className="font-mono text-white">/r/{slug}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color Primario:</span>
                  <span className="font-mono" style={{ color: colorPrimario }}>{colorPrimario}</span>
                </div>
              </div>

              <a
                href={`/r/${slug}`}
                target="_blank"
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-transform block text-center"
                style={{ backgroundColor: colorPrimario }}
              >
                Abrir Sitio Web ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Importación Masiva */}
      <MenuBulkImporterModal
        restauranteId={restaurante.id}
        restauranteNombre={restaurante.nombre}
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </form>
  );
}
