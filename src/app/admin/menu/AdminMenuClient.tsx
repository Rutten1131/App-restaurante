"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

interface AdminMenuClientProps {
  initialPlatos: Plato[];
  categorias: Categoria[];
}

export default function AdminMenuClient({
  initialPlatos,
  categorias,
}: AdminMenuClientProps) {
  const [platos, setPlatos] = useState<Plato[]>(initialPlatos);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtros del catálogo
  const [filtroCategoria, setFiltroCategoria] = useState<number | "todas">("todas");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "disponibles" | "agotados">("todos");

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
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header con navegación de retorno */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8a8078] mb-1">
              <Link href="/admin" className="hover:text-[#c9a84c] transition-colors">
                ← Volver al Panel de Control
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#f5f0e8]">
              Administración de Menú & Carta
            </h1>
            <p className="text-xs text-[#8a8078] mt-1">
              Crea, actualiza precios, sube fotos y gestiona la disponibilidad de los platos en tiempo real.
            </p>
          </div>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2.5 bg-white/[0.04] border border-[#c9a84c]/40 text-[#c9a84c] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#c9a84c] hover:text-[#0a0908] transition-all"
          >
            + Nueva Categoría
          </button>
        </div>

        {/* Sección 1: Formulario de Creación de Plato */}
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <span className="text-[#c9a84c]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <span>Registrar Nuevo Plato</span>
            </h2>
            <span className="text-[11px] text-[#8a8078]">
              {categorias.length} categorías disponibles
            </span>
          </div>

          <form
            action={async (formData) => {
              setIsSubmitting(true);
              try {
                await crearPlatoAction(formData);
                const form = document.getElementById("crear-plato-form") as HTMLFormElement;
                if (form) form.reset();
              } finally {
                setIsSubmitting(false);
              }
            }}
            id="crear-plato-form"
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

              {/* URL de Imagen */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="text"
                  name="imagenUrl"
                  placeholder="/images/hero-pizza.jpg o https://..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              {/* URL de Video */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                  URL de Video / Reel (Opcional)
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  placeholder="https://..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              {/* Estado Inicial */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                  Disponibilidad
                </label>
                <select
                  name="disponible"
                  defaultValue="true"
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                >
                  <option value="true">Activo / Disponible</option>
                  <option value="false">Agotado / No disponible</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                Descripción de Ingredientes / Receta
              </label>
              <textarea
                name="descripcion"
                rows={2}
                placeholder="Detalla los ingredientes y preparación de la casa..."
                className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#c62828] hover:bg-[#e53935] text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#c62828]/20 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Plato"}
            </button>
          </form>
        </div>

        {/* Sección 2: Tabla de Platos Existentes con Filtros Avanzados */}
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
                <span className="text-[#c9a84c]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </span>
                <span>Catálogo de Platos ({platos.length})</span>
              </h2>
              <p className="text-xs text-[#8a8078] mt-0.5">
                Mostrando {platosFiltrados.length} de {platos.length} platos
              </p>
            </div>

            {/* Barra de Filtros: Búsqueda, Categoría y Estado */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  placeholder="Buscar plato..."
                  className="bg-[#0a0908] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#f5f0e8] placeholder-[#8a8078] focus:border-[#c9a84c] focus:outline-none w-44 sm:w-52"
                />
                {filtroBusqueda && (
                  <button
                    onClick={() => setFiltroBusqueda("")}
                    className="absolute right-2.5 top-1.5 text-xs text-[#8a8078] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Selector de Categoría */}
              <select
                value={filtroCategoria}
                onChange={(e) =>
                  setFiltroCategoria(
                    e.target.value === "todas" ? "todas" : parseInt(e.target.value, 10)
                  )
                }
                className="bg-[#0a0908] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
              >
                <option value="todas">Todas las categorías ({categorias.length})</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>

              {/* Selector de Estado */}
              <select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value as "todos" | "disponibles" | "agotados")
                }
                className="bg-[#0a0908] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="disponibles">Solo Disponibles</option>
                <option value="agotados">Solo Agotados</option>
              </select>
            </div>
          </div>

          {platosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-[#8a8078] text-xs space-y-2">
              <p>No se encontraron platos con los filtros seleccionados.</p>
              {(filtroBusqueda || filtroCategoria !== "todas" || filtroEstado !== "todos") && (
                <button
                  onClick={() => {
                    setFiltroBusqueda("");
                    setFiltroCategoria("todas");
                    setFiltroEstado("todos");
                  }}
                  className="text-[#c9a84c] hover:underline font-semibold text-xs"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Plato</th>
                    <th className="pb-3 px-3">Categoría</th>
                    <th className="pb-3 px-3">Precio</th>
                    <th className="pb-3 px-3">Estado</th>
                    <th className="pb-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {platosFiltrados.map((plato) => (
                    <tr key={plato.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Plato & Foto */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#181515] border border-white/[0.08] shrink-0">
                            <Image
                              src={plato.imagenUrl || "/images/hero-pizza.jpg"}
                              alt={plato.nombre}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-[#f5f0e8] block text-sm">
                              {plato.nombre}
                            </span>
                            {plato.descripcion && (
                              <span className="text-[11px] text-[#8a8078] block line-clamp-1 max-w-xs">
                                {plato.descripcion}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-3">
                        <span className="bg-white/[0.04] text-[#c9a84c] px-2.5 py-1 rounded-md border border-white/[0.06] text-[11px]">
                          {plato.categoria?.nombre || "Sin Categoría"}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="py-3.5 px-3 font-serif font-bold text-sm text-[#f5f0e8]">
                        ${Number(plato.precio).toFixed(2)}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDisponible(plato.id)}
                          title="Haz clic para alternar estado"
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                            plato.disponible
                              ? "bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/40 hover:bg-[#2e7d32]/30"
                              : "bg-[#c62828]/20 text-[#c62828] border border-[#c62828]/40 hover:bg-[#c62828]/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              plato.disponible ? "bg-[#2e7d32]" : "bg-[#c62828]"
                            }`}
                          />
                          {plato.disponible ? "Disponible" : "Agotado"}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-3 text-right">
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
          )}
        </div>
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

                  // Actualización instantánea en el estado local
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

                  // Guardar en la base de datos
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">URL de Imagen</label>
                  <input
                    type="text"
                    name="imagenUrl"
                    defaultValue={editingPlato.imagenUrl ?? ""}
                    placeholder="/images/..."
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">URL de Video / Reel</label>
                  <input
                    type="text"
                    name="videoUrl"
                    defaultValue={editingPlato.videoUrl ?? ""}
                    placeholder="https://..."
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
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
    </div>
  );
}
