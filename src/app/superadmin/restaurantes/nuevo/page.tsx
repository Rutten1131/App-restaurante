"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearRestauranteAction } from "../../actions";
import ImageUploadField from "@/components/ImageUploadField";

export default function NuevoRestaurantePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados visuales para preview en tiempo real
  const [nombre, setNombre] = useState("Trattoria Bella");
  const [slug, setSlug] = useState("trattoria-bella");
  const [colorPrimario, setColorPrimario] = useState("#e65100");
  const [colorFondo, setColorFondo] = useState("#0f0c08");

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombre(val);
    // Auto-generar slug amigable
    const autoSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await crearRestauranteAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/superadmin/restaurantes");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/superadmin/restaurantes"
          className="text-xs text-[#8a8078] hover:text-white"
        >
          ← Volver a Restaurantes
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Crear Nuevo Restaurante
          </h1>
          <p className="text-xs text-[#8a8078]">
            Completa la información para inicializar una nueva marca con su propio sitio web, carta QR y panel admin.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#c62828]/15 border border-[#c62828]/40 rounded-2xl text-xs text-[#ff6b6b]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda & Centro: Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sección 1: Información Básica */}
            <div className="bg-[#12100e] border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] border-b border-white/10 pb-2">
                1. Información de la Marca
              </h2>

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
                    onChange={handleNombreChange}
                    placeholder="Ej. Trattoria Bella"
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
                      placeholder="trattoria-bella"
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
                  placeholder="Ej. Auténtica cocina toscana, pastas hechas a mano y pizzas crujientes."
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
                    placeholder="Ej. TRATTORIA BELLA CIA. LTDA."
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
                    defaultValue="Loja"
                    placeholder="Ej. Loja, Cuenca, Quito"
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Identidad Visual & Colores */}
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
                  defaultValue="/images/logo-roma.jpg"
                  aspectRatio="square"
                  maxDimension={400}
                />

                <ImageUploadField
                  name="heroImageUrl"
                  label="Imagen Hero / Portada Principal"
                  defaultValue="/images/hero-pizza.jpg"
                  aspectRatio="video"
                  maxDimension={1200}
                />
              </div>
            </div>

            {/* Sección 3: Contacto y Facturación SRI */}
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
                    placeholder="0987654321"
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
                    placeholder="593987654321"
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
                    placeholder="contacto@restaurante.com"
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
                  placeholder="Av. Principal 123 y Secundaria, Loja"
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
                    placeholder="1103421531001"
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
                    defaultValue="001"
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
                    defaultValue="001"
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
                  Login para este restaurante
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
                    defaultValue={`${nombre} Admin`}
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
                    defaultValue={slug || "admin"}
                    placeholder="Ej. trattoria o admin@trattoria.com"
                    required
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#c9a84c] font-mono focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-white">
                    Contraseña Inicial *
                  </label>
                  <input
                    type="text"
                    name="adminPassword"
                    defaultValue="admin123"
                    placeholder="admin123"
                    required
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#8a8078]">
                El dueño o personal de este local usará este usuario y contraseña para ingresar a <strong>/admin</strong> y gestionar sus comandas, mesas y cocina.
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
                {loading ? "Creando Restaurante..." : "Crear e Inicializar Restaurante"}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa en Vivo */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8078] block">
                Vista Previa de Marca
              </span>

              {/* Tarjeta de Preview */}
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
                      {nombre || "Nombre Restaurante"}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: colorPrimario }}>
                      Restaurante & Carta
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-[#b8afa3] space-y-1">
                  <div className="flex justify-between">
                    <span>URL Web:</span>
                    <span className="font-mono text-white">/r/{slug || "slug"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color Primario:</span>
                    <span className="font-mono" style={{ color: colorPrimario }}>{colorPrimario}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-transform"
                  style={{ backgroundColor: colorPrimario }}
                >
                  Ver Menú Digital
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-[#8a8078] space-y-2">
                <p className="font-semibold text-white">¿Qué se crea automáticamente?</p>
                <ul className="list-disc list-inside space-y-1 text-[10px]">
                  <li>Página Web dedicada en <code>/r/{slug}</code></li>
                  <li>Carta QR y pedidos de mesa</li>
                  <li>Módulo de reseñas y fidelización</li>
                  <li>Base de datos aislada por tenant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
