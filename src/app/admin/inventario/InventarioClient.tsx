"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  crearInsumoAction,
  actualizarStockAction,
  guardarRecetaInventarioAction,
  crearPlatoYRecetaAction,
} from "./actions";
import RecipeEditorField, { InsumoOption } from "@/components/RecipeEditorField";

interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: string;
  stockMinimo: string;
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

interface Movimiento {
  id: number;
  tipo: string;
  cantidad: string;
  pedidoId: number | null;
  creadoEn: Date | string;
  insumoNombre: string;
  unidad: string;
}

// Iconos SVG limpios y profesionales
const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcPackage({ className }: { className?: string }) {
  return <svg {...s} className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function IcBookOpen({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function IcActivity({ className }: { className?: string }) {
  return <svg {...s} className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function IcPlus({ className }: { className?: string }) {
  return <svg {...s} className={className} strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IcAlertTriangle({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IcSearch({ className }: { className?: string }) {
  return <svg {...s} className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IcExternalLink({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}

export default function InventarioClient({
  insumos,
  recetas: initialRecetas,
  movimientos,
}: {
  insumos: Insumo[];
  recetas: RecetaPlato[];
  movimientos: Movimiento[];
}) {
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState<"insumos" | "recetas" | "movimientos">("recetas");
  const [recetasList, setRecetasList] = useState<RecetaPlato[]>(initialRecetas);
  const [busquedaReceta, setBusquedaReceta] = useState("");
  const [editingRecetaPlato, setEditingRecetaPlato] = useState<RecetaPlato | null>(null);
  const [showNuevoPlatoModal, setShowNuevoPlatoModal] = useState(false);
  const [isSavingReceta, setIsSavingReceta] = useState(false);
  const [isCreatingPlato, setIsCreatingPlato] = useState(false);

  const insumosBajoStock = insumos.filter((i) => Number(i.stockActual) <= Number(i.stockMinimo));
  const platosConRecetaCount = recetasList.filter((r) => r.insumos.length > 0).length;

  const recetasFiltradas = recetasList.filter((r) =>
    r.platoNombre.toLowerCase().includes(busquedaReceta.toLowerCase()) ||
    (r.categoriaNombre && r.categoriaNombre.toLowerCase().includes(busquedaReceta.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Navegación por Tabs principales */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTabActiva("insumos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tabActiva === "insumos"
                ? "bg-[#c9a84c] text-[#0a0908] shadow-lg shadow-[#c9a84c]/20"
                : "bg-[#141210] text-[#8a8078] hover:text-white border border-white/[0.06]"
            }`}
          >
            <IcPackage className="w-4 h-4" />
            <span>Stock de Insumos ({insumos.length})</span>
            {insumosBajoStock.length > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${tabActiva === "insumos" ? "bg-[#c62828] text-white" : "bg-[#c62828]/20 text-[#e53935]"}`}>
                {insumosBajoStock.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("recetas")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tabActiva === "recetas"
                ? "bg-[#c9a84c] text-[#0a0908] shadow-lg shadow-[#c9a84c]/20"
                : "bg-[#141210] text-[#8a8078] hover:text-white border border-white/[0.06]"
            }`}
          >
            <IcBookOpen className="w-4 h-4" />
            <span>Recetas de Platos ({recetasList.length})</span>
            {platosConRecetaCount < recetasList.length && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${tabActiva === "recetas" ? "bg-[#0a0908] text-[#c9a84c]" : "bg-[#ff9800]/20 text-[#ffb74d]"}`}>
                {platosConRecetaCount} listas
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("movimientos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tabActiva === "movimientos"
                ? "bg-[#c9a84c] text-[#0a0908] shadow-lg shadow-[#c9a84c]/20"
                : "bg-[#141210] text-[#8a8078] hover:text-white border border-white/[0.06]"
            }`}
          >
            <IcActivity className="w-4 h-4" />
            <span>Auditoría de Consumo & Pedidos</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8a8078]">
          <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
          <span>Conectado con Comandas en Vivo</span>
        </div>
      </div>

      {/* ── TAB 1: STOCK DE INSUMOS ────────────────────────────────────────── */}
      {tabActiva === "insumos" && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario Registrar Insumo */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 space-y-5 shadow-xl h-fit">
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <IcPlus className="w-4 h-4 text-[#c9a84c]" /> Registrar Insumo
            </h2>

            <form action={crearInsumoAction} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej. Mozzarella Fior di Latte"
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                  Unidad de Medida *
                </label>
                <input
                  type="text"
                  name="unidad"
                  required
                  placeholder="Kg, Litros, Unidades..."
                  className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="stockActual"
                    required
                    placeholder="10.0"
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase text-[#c9a84c]">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="stockMinimo"
                    required
                    placeholder="3.0"
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#c9a84c]/20"
              >
                Guardar Insumo
              </button>
            </form>
          </div>

          {/* Tabla de Insumos */}
          <div className="lg:col-span-2 bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                  <IcPackage className="w-4.5 h-4.5 text-[#c9a84c]" /> Inventario de Insumos ({insumos.length})
                </h2>
                <p className="text-xs text-[#8a8078] mt-0.5">
                  Actualiza el stock manualmente o revisa los niveles deducidos por comandas.
                </p>
              </div>
            </div>

            {insumos.length === 0 ? (
              <div className="text-center py-12 text-[#8a8078] text-xs">
                No hay insumos registrados en inventario.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-2">Insumo</th>
                      <th className="pb-3 px-2">Stock Actual</th>
                      <th className="pb-3 px-2">Mínimo</th>
                      <th className="pb-3 px-2">Estado</th>
                      <th className="pb-3 px-2 text-right">Ajuste de Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {insumos.map((ins) => {
                      const esBajo = Number(ins.stockActual) <= Number(ins.stockMinimo);

                      return (
                        <tr key={ins.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-2 font-semibold text-[#f5f0e8]">
                            {ins.nombre}
                          </td>
                          <td className="py-3.5 px-2 font-mono font-bold text-[#f5f0e8]">
                            {ins.stockActual} {ins.unidad}
                          </td>
                          <td className="py-3.5 px-2 text-[#8a8078] font-mono">
                            {ins.stockMinimo} {ins.unidad}
                          </td>
                          <td className="py-3.5 px-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                esBajo
                                  ? "bg-[#d32f2f]/20 text-[#d32f2f] border border-[#d32f2f]/30"
                                  : "bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/30"
                              }`}
                            >
                              {esBajo ? <><IcAlertTriangle className="w-3 h-3" /> Bajo Stock</> : "Normal"}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <form action={actualizarStockAction} className="inline-flex items-center gap-1.5 justify-end">
                              <input type="hidden" name="insumoId" value={ins.id} />
                              <input
                                type="number"
                                step="0.1"
                                name="nuevaCantidad"
                                defaultValue={ins.stockActual}
                                className="w-20 bg-[#0a0908] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-[#f5f0e8] text-right font-mono focus:border-[#c9a84c] focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="px-2.5 py-1 bg-white/[0.05] hover:bg-[#c9a84c] hover:text-[#0a0908] text-[#f5f0e8] rounded-lg border border-white/[0.08] text-[11px] font-semibold transition-colors"
                              >
                                Guardar
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: RECETAS & GASTO DE INSUMOS POR PLATO ──────────────────── */}
      {tabActiva === "recetas" && (
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
                  <IcBookOpen className="w-4.5 h-4.5 text-[#c9a84c]" /> Fichas Técnicas & Recetas de Insumos por Plato
                </h2>
                <span className="text-[10px] font-mono bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 px-2 py-0.5 rounded-full font-bold">
                  {platosConRecetaCount}/{recetasList.length} con receta
                </span>
              </div>
              <p className="text-xs text-[#8a8078] mt-0.5">
                Configura qué insumos y en qué cantidad consume cada plato al entrar la orden a cocina.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Buscar plato..."
                  value={busquedaReceta}
                  onChange={(e) => setBusquedaReceta(e.target.value)}
                  className="w-full bg-[#0a0908] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                />
                <IcSearch className="w-3.5 h-3.5 text-[#8a8078] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setShowNuevoPlatoModal(true)}
                className="px-4 py-2 bg-[#c9a84c] hover:bg-[#e8c770] text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#c9a84c]/20 uppercase tracking-wider"
              >
                <span>+</span> Crear Plato & Receta
              </button>

              <Link
                href="/admin/menu"
                className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>Menú</span>
                <IcExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {recetasList.length === 0 ? (
            /* Estado cuando el restaurante aún no tiene platos creados */
            <div className="p-8 sm:p-12 text-center bg-black/40 border border-dashed border-white/15 rounded-3xl space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                🥗
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-white">
                  Aún no hay platos registrados en este restaurante
                </h3>
                <p className="text-xs text-[#8a8078] leading-relaxed">
                  Para descontar inventario automáticamente en cocina, primero registra tus platos y asígnales sus insumos y cantidades.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNuevoPlatoModal(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#c9a84c] hover:bg-[#e8c770] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#c9a84c]/20"
                >
                  ⚡ Crear Primer Plato con su Receta
                </button>
                <Link
                  href="/admin/menu"
                  className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors"
                >
                  Ir al Catálogo de Menú →
                </Link>
              </div>
            </div>
          ) : recetasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-[#8a8078] text-xs space-y-2">
              <p>No se encontraron platos con los términos de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recetasFiltradas.map((r) => {
                const tieneReceta = r.insumos && r.insumos.length > 0;

                return (
                  <div
                    key={r.platoId}
                    className={`bg-[#0a0908] border rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between ${
                      tieneReceta
                        ? "border-white/[0.06] hover:border-[#c9a84c]/40"
                        : "border-[#ff9800]/30 hover:border-[#ff9800] bg-[#ff9800]/[0.02]"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-white/[0.04] pb-2.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#c9a84c] tracking-wider block">
                            {r.categoriaNombre || "Plato Principal"}
                          </span>
                          <h3 className="font-serif font-bold text-sm text-[#f5f0e8]">
                            {r.platoNombre}
                          </h3>
                        </div>
                        <span className="font-mono font-bold text-xs text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded-lg shrink-0">
                          ${Number(r.platoPrecio).toFixed(2)}
                        </span>
                      </div>

                      {tieneReceta ? (
                        <div className="space-y-1.5 text-xs">
                          <span className="text-[10px] text-[#8a8078] uppercase font-bold tracking-wider block">
                            Insumos Consumidos por Unidad:
                          </span>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {r.insumos.map((ins) => (
                              <div
                                key={ins.recetaId || `${ins.insumoId}-${ins.cantidadUsada}`}
                                className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/[0.02] border border-white/[0.03]"
                              >
                                <span className="text-[#f5f0e8] truncate max-w-[140px]">{ins.insumoNombre}</span>
                                <span className="font-mono font-bold text-[#c9a84c]">
                                  {ins.cantidadUsada} {ins.unidad}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#ff9800]/10 border border-[#ff9800]/20 rounded-xl space-y-1 text-center">
                          <span className="text-xs text-[#ffb74d] font-bold block">
                            ⚠️ Sin receta asignada
                          </span>
                          <span className="text-[10px] text-[#8a8078] block">
                            Este plato no descontará inventario al venderse.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex justify-between items-center text-[11px] gap-2">
                      <span className="text-[#8a8078]">
                        {tieneReceta ? `${r.insumos.length} ingrediente(s)` : "Pendiente"}
                      </span>

                      <button
                        type="button"
                        onClick={() => setEditingRecetaPlato(r)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shadow-md ${
                          tieneReceta
                            ? "bg-white/[0.06] hover:bg-[#c9a84c] text-white hover:text-black border border-white/10"
                            : "bg-[#c9a84c] hover:bg-[#e8c770] text-black shadow-[#c9a84c]/20"
                        }`}
                      >
                        <span>{tieneReceta ? "✏️ Modificar Receta" : "+ Asignar Receta"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: EDITAR / ASIGNAR RECETA A UN PLATO EXISTENTE ──────────── */}
      {editingRecetaPlato && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c9a84c] tracking-wider block">
                  {editingRecetaPlato.categoriaNombre || "Plato Principal"}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                  Receta: {editingRecetaPlato.platoNombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecetaPlato(null)}
                className="text-[#8a8078] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingReceta(true);
                const fd = new FormData(e.currentTarget);
                fd.set("platoId", String(editingRecetaPlato.platoId));

                const res = await guardarRecetaInventarioAction(fd);
                if (res?.success) {
                  const recetaJson = fd.get("recetaJson") as string;
                  const newItems = JSON.parse(recetaJson || "[]");

                  // Actualizar estado local
                  setRecetasList((prev) =>
                    prev.map((r) =>
                      r.platoId === editingRecetaPlato.platoId
                        ? {
                            ...r,
                            insumos: newItems.map((item: any) => {
                              const ins = insumos.find((i) => i.id === item.insumoId);
                              return {
                                recetaId: Date.now() + Math.random(),
                                insumoId: item.insumoId,
                                insumoNombre: ins?.nombre || "Insumo",
                                unidad: ins?.unidad || "unidades",
                                cantidadUsada: String(item.cantidadUsada),
                              };
                            }),
                          }
                        : r
                    )
                  );
                  setEditingRecetaPlato(null);
                  router.refresh();
                } else {
                  alert(res?.error || "Error al guardar la receta");
                }
                setIsSavingReceta(false);
              }}
              className="space-y-4"
            >
              <RecipeEditorField
                insumosDisponibles={insumos}
                recetaInicial={editingRecetaPlato.insumos.map((i) => ({
                  insumoId: i.insumoId,
                  insumoNombre: i.insumoNombre,
                  unidad: i.unidad,
                  cantidadUsada: i.cantidadUsada,
                }))}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRecetaPlato(null)}
                  disabled={isSavingReceta}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-[#8a8078] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingReceta}
                  className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#e8c770] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-50"
                >
                  {isSavingReceta ? "Guardando..." : "Guardar Receta del Plato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CREAR NUEVO PLATO CON SU RECETA DESDE INVENTARIO ──────── */}
      {showNuevoPlatoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <span>🥗</span> Crear Nuevo Plato con Receta
                </h3>
                <p className="text-xs text-[#8a8078]">
                  Crea un plato y define de inmediato los insumos que consumirá en inventario.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNuevoPlatoModal(false)}
                className="text-[#8a8078] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsCreatingPlato(true);
                const fd = new FormData(e.currentTarget);

                const res = await crearPlatoYRecetaAction(fd);
                if (res?.success && res.platoId) {
                  const nombre = fd.get("nombre") as string;
                  const precio = fd.get("precio") as string;
                  const recetaJson = fd.get("recetaJson") as string;
                  const newItems = JSON.parse(recetaJson || "[]");

                  const nuevoPlatoReceta: RecetaPlato = {
                    platoId: res.platoId,
                    platoNombre: nombre,
                    platoPrecio: precio,
                    categoriaNombre: "General",
                    insumos: newItems.map((item: any) => {
                      const ins = insumos.find((i) => i.id === item.insumoId);
                      return {
                        recetaId: Date.now() + Math.random(),
                        insumoId: item.insumoId,
                        insumoNombre: ins?.nombre || "Insumo",
                        unidad: ins?.unidad || "unidades",
                        cantidadUsada: String(item.cantidadUsada),
                      };
                    }),
                  };

                  setRecetasList((prev) => [nuevoPlatoReceta, ...prev]);
                  setShowNuevoPlatoModal(false);
                  router.refresh();
                } else {
                  alert(res?.error || "Error al crear el plato y receta");
                }
                setIsCreatingPlato(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-white">Nombre del Plato *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej. Pizza Fugazzeta Especial"
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-white">Precio ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    required
                    placeholder="12.50"
                    className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white">Descripción (Opcional)</label>
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Detalles de preparación..."
                  className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              {/* Selector de Receta */}
              <RecipeEditorField
                insumosDisponibles={insumos}
                recetaInicial={[]}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNuevoPlatoModal(false)}
                  disabled={isCreatingPlato}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-[#8a8078] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPlato}
                  className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#e8c770] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-50"
                >
                  {isCreatingPlato ? "Creando Plato..." : "+ Guardar Plato y Receta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: AUDITORÍA DE MOVIMIENTOS & DEDUCCIÓN EN VIVO ────────────── */}
      {tabActiva === "movimientos" && (
        <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2">
              <IcActivity className="w-4.5 h-4.5 text-[#c9a84c]" /> Historial de Movimientos & Consumo Automático
            </h2>
            <p className="text-xs text-[#8a8078] mt-0.5">
              Auditoría en tiempo real de cada deducción de stock generada al pasar pedidos a cocina.
            </p>
          </div>

          {movimientos.length === 0 ? (
            <div className="text-center py-12 text-[#8a8078] text-xs">
              No hay movimientos de consumo registrados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">Fecha y Hora</th>
                    <th className="pb-3 px-2">Tipo de Movimiento</th>
                    <th className="pb-3 px-2">Insumo Afectado</th>
                    <th className="pb-3 px-2">Cantidad Deducida</th>
                    <th className="pb-3 px-2 text-right">Referencia Comanda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 text-[#8a8078]">
                        {new Date(m.creadoEn).toLocaleString("es-EC", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          m.tipo === "salida_venta"
                            ? "bg-[#c62828]/20 text-[#c62828] border border-[#c62828]/30"
                            : m.tipo === "entrada"
                            ? "bg-[#2e7d32]/20 text-[#2e7d32] border border-[#2e7d32]/30"
                            : "bg-white/[0.06] text-[#8a8078]"
                        }`}>
                          {m.tipo === "salida_venta" ? "Salida Venta Cocina" : m.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-[#f5f0e8]">
                        {m.insumoNombre}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-[#f5f0e8]">
                        -{m.cantidad} {m.unidad}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {m.pedidoId ? (
                          <Link
                            href="/admin/pedidos"
                            className="font-mono text-xs text-[#c9a84c] hover:underline font-bold"
                          >
                            Comanda #{m.pedidoId} →
                          </Link>
                        ) : (
                          <span className="text-[#8a8078]">Ajuste Manual</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
