"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MesasQRManager from "./MesasQRManager";
import RecipeEditorField, { InsumoOption, IngredienteReceta } from "@/components/RecipeEditorField";
import ImageUploadField from "@/components/ImageUploadField";
import {
  crearPlatoAction,
  actualizarPlatoAction,
  eliminarPlatoAction,
  toggleDisponibleAction,
  crearCategoriaAction,
} from "./actions";

interface Categoria {
  id: number;
  nombre: string;
  orden: number;
}

interface Plato {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  imagenUrl: string | null;
  videoUrl: string | null;
  disponible: boolean;
  categoriaId: number | null;
  categoria?: { id: number; nombre: string } | null;
}

interface RecetaPlato {
  platoId: number;
  platoNombre: string;
  platoPrecio: string;
  categoriaNombre: string | null;
  insumos: {
    recetaId: number;
    insumoId: number;
    insumoNombre: string;
    unidad: string;
    cantidadUsada: string;
  }[];
}

interface AdminMenuClientProps {
  initialPlatos: Plato[];
  categorias: Categoria[];
  insumosDisponibles?: InsumoOption[];
  recetasPlatos?: RecetaPlato[];
  initialTotalMesas?: number;
  restauranteSlug?: string;
  restauranteNombre?: string;
}

export default function AdminMenuClient({
  initialPlatos,
  categorias,
  insumosDisponibles = [],
  recetasPlatos = [],
  initialTotalMesas = 12,
  restauranteSlug = "roma",
  restauranteNombre = "Roma Pizzería",
}: AdminMenuClientProps) {
  const [tabPrincipal, setTabPrincipal] = useState<"platos" | "mesas">("platos");
  const [platos, setPlatos] = useState<Plato[]>(initialPlatos);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtros del catálogo y paginación
  const [filtroCategoria, setFiltroCategoria] = useState<number | "todas">("todas");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "disponibles" | "agotados">("todos");
  const [limitePlatos, setLimitePlatos] = useState(10);

  // Filtrado de platos
  const platosFiltrados = platos.filter((plato) => {
    const matchBusqueda =
      plato.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      (plato.descripcion && plato.descripcion.toLowerCase().includes(filtroBusqueda.toLowerCase()));

    const matchCategoria =
      filtroCategoria === "todas" ? true : plato.categoriaId === filtroCategoria;

    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "disponibles"
        ? plato.disponible
        : !plato.disponible;

    return matchBusqueda && matchCategoria && matchEstado;
  });

  // Toggle de disponibilidad con actualización instantánea
  const handleToggleDisponible = async (platoId: number) => {
    setPlatos((prev) =>
      prev.map((p) => (p.id === platoId ? { ...p, disponible: !p.disponible } : p))
    );
    const formData = new FormData();
    formData.append("id", String(platoId));
    await toggleDisponibleAction(formData);
  };

  // Eliminar con actualización instantánea
  const handleEliminar = async (platoId: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}" del menú?`)) return;
    setPlatos((prev) => prev.filter((p) => p.id !== platoId));
    const formData = new FormData();
    formData.append("id", String(platoId));
    await eliminarPlatoAction(formData);
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f0e8] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8a8078] mb-1">
              <Link href="/admin/resumen" className="hover:text-[#c9a84c] transition-colors">
                ← Ver Dashboard & Métricas
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#f5f0e8]">
              Administración de Menú & Carta
            </h1>
            <p className="text-xs text-[#8a8078] mt-1">
              Crea platos, actualiza precios, sube fotos y gestiona los códigos QR de cada mesa.
            </p>
          </div>

          {tabPrincipal === "platos" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e0c878] hover:brightness-110 text-[#0a0908] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c9a84c]/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>+ Registrar Nuevo Plato</span>
              </button>
            </div>
          )}
        </div>

        {/* Tabs de Navegación del Módulo */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-[#141210] border border-white/[0.08] rounded-2xl">
            <button
              type="button"
              onClick={() => setTabPrincipal("platos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                tabPrincipal === "platos"
                  ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              <span>Carta & Platos ({platos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTabPrincipal("mesas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                tabPrincipal === "mesas"
                  ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                  : "text-[#8a8078] hover:text-white"
              }`}
            >
              <span>Mesas & Códigos QR ({initialTotalMesas})</span>
            </button>
          </div>

          {tabPrincipal === "platos" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2.5 bg-white/[0.04] border border-[#c9a84c]/40 text-[#c9a84c] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#c9a84c] hover:text-[#0a0908] transition-all"
              >
                + Nueva Categoría
              </button>
            </div>
          )}
        </div>

        {tabPrincipal === "mesas" ? (
          <MesasQRManager
            initialTotalMesas={initialTotalMesas}
            restauranteSlug={restauranteSlug}
            restauranteNombre={restauranteNombre}
          />
        ) : (
          <div className="space-y-10">
            {/* Sección: Catálogo de Platos con Filtros */}
            <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#f5f0e8]">
                    Platos en el Menú ({Math.min(limitePlatos, platosFiltrados.length)} de {platos.length})
                  </h2>
                  <p className="text-xs text-[#8a8078] mt-0.5">
                    Modifica precios, fotos o cambia la disponibilidad con un solo clic.
                  </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Buscar plato..."
                    value={filtroBusqueda}
                    onChange={(e) => {
                      setFiltroBusqueda(e.target.value);
                      setLimitePlatos(10);
                    }}
                    className="bg-[#0a0908] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none w-44"
                  />

                  <select
                    value={filtroCategoria}
                    onChange={(e) => {
                      setFiltroCategoria(e.target.value === "todas" ? "todas" : Number(e.target.value));
                      setLimitePlatos(10);
                    }}
                    className="bg-[#0a0908] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value as any);
                      setLimitePlatos(10);
                    }}
                    className="bg-[#0a0908] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="disponibles">Solo disponibles</option>
                    <option value="agotados">Agotados</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Platos */}
              {platosFiltrados.length === 0 ? (
                <div className="py-12 text-center text-[#8a8078] text-xs">
                  No se encontraron platos con los filtros seleccionados.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                          <th className="pb-3 px-2">Foto</th>
                          <th className="pb-3 px-2">Plato</th>
                          <th className="pb-3 px-2">Categoría</th>
                          <th className="pb-3 px-2 text-right">Precio</th>
                          <th className="pb-3 px-2 text-center">Disponibilidad</th>
                          <th className="pb-3 px-2 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {platosFiltrados.slice(0, limitePlatos).map((plato) => (
                          <tr key={plato.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-2">
                              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-white/[0.06]">
                                <Image
                                  src={plato.imagenUrl || "/images/hero-pizza.jpg"}
                                  alt={plato.nombre}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>

                            <td className="py-3 px-2">
                              <span className="font-semibold text-white block">{plato.nombre}</span>
                              {plato.descripcion && (
                                <span className="text-[#8a8078] text-[11px] line-clamp-1 max-w-xs">
                                  {plato.descripcion}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-2 text-[#c9a84c] font-medium">
                              {plato.categoria?.nombre || "Sin categoría"}
                            </td>

                            <td className="py-3 px-2 text-right font-serif font-bold text-white">
                              ${Number(plato.precio).toFixed(2)}
                            </td>

                            <td className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleDisponible(plato.id)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                  plato.disponible
                                    ? "bg-[#2e7d32]/20 text-[#2e7d32] border-[#2e7d32]/30 hover:bg-[#2e7d32]/30"
                                    : "bg-[#c62828]/20 text-[#e53935] border-[#c62828]/30 hover:bg-[#c62828]/30"
                                }`}
                              >
                                {plato.disponible ? "Disponible" : "Agotado"}
                              </button>
                            </td>

                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingPlato(plato)}
                                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#f5f0e8] rounded-lg border border-white/[0.06] transition-colors text-[11px]"
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEliminar(plato.id, plato.nombre)}
                                  className="px-3 py-1.5 bg-[#c62828]/15 hover:bg-[#c62828]/30 text-[#c62828] rounded-lg border border-[#c62828]/30 transition-colors text-[11px]"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Botón Ver Más Platos */}
                  {platosFiltrados.length > limitePlatos && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
                      <span className="text-xs text-[#8a8078]">
                        Mostrando {limitePlatos} de {platosFiltrados.length} platos
                      </span>
                      <button
                        type="button"
                        onClick={() => setLimitePlatos((prev) => prev + 10)}
                        className="px-5 py-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 text-[#c9a84c] border border-[#c9a84c]/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Ver más platos (+10) ↓
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Editar Plato con Datos Existentes Asegurados */}
      {editingPlato && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                Editar Plato: {editingPlato.nombre}
              </h3>
              <button
                onClick={() => setEditingPlato(null)}
                className="text-[#8a8078] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              key={editingPlato.id}
              action={async (formData) => {
                setIsUpdating(true);
                try {
                  const updatedNombre = formData.get("nombre") as string;
                  const updatedPrecio = formData.get("precio") as string;
                  const updatedCatIdRaw = formData.get("categoriaId") as string;
                  const updatedCatId = updatedCatIdRaw ? parseInt(updatedCatIdRaw, 10) : null;
                  const updatedImg = (formData.get("imagenUrl") as string) || null;
                  const updatedVideo = (formData.get("videoUrl") as string) || null;
                  const updatedDesc = (formData.get("descripcion") as string) || null;
                  const updatedDisp = formData.get("disponible") === "true";
                  const catObj = categorias.find((c) => c.id === updatedCatId);

                  setPlatos((prev) =>
                    prev.map((p) =>
                      p.id === editingPlato.id
                        ? {
                            ...p,
                            nombre: updatedNombre,
                            precio: updatedPrecio,
                            categoriaId: updatedCatId,
                            categoria: catObj ? { id: catObj.id, nombre: catObj.nombre } : null,
                            imagenUrl: updatedImg,
                            videoUrl: updatedVideo,
                            descripcion: updatedDesc,
                            disponible: updatedDisp,
                          }
                        : p
                    )
                  );

                  await actualizarPlatoAction(formData);
                  setEditingPlato(null);
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <input type="hidden" name="id" value={editingPlato.id} />

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  defaultValue={editingPlato.nombre}
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">Precio ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    required
                    defaultValue={editingPlato.precio}
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">Categoría</label>
                  <select
                    name="categoriaId"
                    defaultValue={editingPlato.categoriaId ?? ""}
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Imagen del Plato (Base64 o URL) */}
              <ImageUploadField
                name="imagenUrl"
                label="Foto del Plato"
                defaultValue={editingPlato.imagenUrl ?? ""}
                placeholder="/images/hero-pizza.jpg"
              />

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">URL de Video / Reel (IG, TikTok, FB)</label>
                <input
                  type="text"
                  name="videoUrl"
                  defaultValue={editingPlato.videoUrl ?? ""}
                  placeholder="https://www.instagram.com/reel/... o https://www.tiktok.com/@.../video/..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
                <p className="text-[10px] text-[#8a8078]">
                  Pega el enlace del reel de Instagram, TikTok o Facebook. Se mostrará como link directo en la carta.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">Descripción / Ingredientes</label>
                <textarea
                  name="descripcion"
                  rows={2}
                  defaultValue={editingPlato.descripcion ?? ""}
                  placeholder="Detalles de la preparación..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">Disponibilidad</label>
                <select
                  name="disponible"
                  defaultValue={editingPlato.disponible ? "true" : "false"}
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                >
                  <option value="true">Disponible</option>
                  <option value="false">Agotado / No disponible</option>
                </select>
              </div>

              {/* Editor de Receta - descuento de inventario */}
              <RecipeEditorField
                insumosDisponibles={insumosDisponibles}
                recetaInicial={
                  recetasPlatos
                    .find((r) => r.platoId === editingPlato.id)
                    ?.insumos.map((ins) => ({
                      insumoId: ins.insumoId,
                      insumoNombre: ins.insumoNombre,
                      unidad: ins.unidad,
                      cantidadUsada: ins.cantidadUsada,
                    })) || []
                }
              />

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPlato(null)}
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-[#8a8078] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-[#c9a84c] text-[#0a0908] font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Guardando..." : "Actualizar Plato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                Crear Nueva Categoría
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-[#8a8078] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await crearCategoriaAction(formData);
                setShowCategoryModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej. Postres & Bebidas"
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  name="orden"
                  defaultValue={categorias.length + 1}
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-[#8a8078] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#c9a84c] text-[#0a0908] font-bold uppercase tracking-wider"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Registrar Nuevo Plato */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                <span className="text-[#c9a84c]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </span>
                <span>Registrar Nuevo Plato</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8a8078] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await crearPlatoAction(formData);
                  setShowCreateModal(false);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-5 text-xs"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                    Nombre del Plato *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej. Pizza Quattro Formaggi"
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                {/* Precio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    required
                    placeholder="8.50"
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                    Categoría
                  </label>
                  <select
                    name="categoriaId"
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="">Sin categoría asignada</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre} (Orden {cat.orden})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disponibilidad inicial */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                    Estado Inicial
                  </label>
                  <select
                    name="disponible"
                    defaultValue="true"
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="true">Disponible de Inmediato</option>
                    <option value="false">Agotado / Desactivado</option>
                  </select>
                </div>

              </div>

              {/* Imagen del Plato (Base64 o URL) */}
              <ImageUploadField
                name="imagenUrl"
                label="Foto del Plato"
                defaultValue=""
                placeholder="/images/hero-pizza.jpg"
              />

              {/* URL de Video / Reel */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                  URL de Video / Reel (IG, TikTok, FB) — Opcional
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  placeholder="https://www.instagram.com/reel/... o https://www.tiktok.com/@.../video/..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
                <p className="text-[10px] text-[#8a8078]">
                  Pega el enlace del reel de Instagram, TikTok o Facebook. Se mostrará como link directo en la carta.
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                  Descripción & Ingredientes Principales
                </label>
                <textarea
                  name="descripcion"
                  rows={2}
                  placeholder="Masa madre, salsa pomodoro italiana, mozzarella fior di latte..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              {/* Receta de Inventario */}
              <RecipeEditorField
                insumosDisponibles={insumosDisponibles}
                recetaInicial={[]
              }/>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-[#8a8078] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e0c878] hover:brightness-110 text-[#0a0908] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#c9a84c]/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando Plato..." : "+ Guardar Plato en Carta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
