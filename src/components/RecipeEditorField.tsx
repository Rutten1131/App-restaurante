"use client";

import { useState, useTransition } from "react";
import { crearInsumoRapidoAction } from "@/app/admin/menu/actions";

export interface InsumoOption {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: string;
  stockMinimo: string;
}

export interface IngredienteReceta {
  insumoId: number;
  insumoNombre: string;
  unidad: string;
  cantidadUsada: string;
}

interface RecipeEditorFieldProps {
  insumosDisponibles: InsumoOption[];
  recetaInicial?: IngredienteReceta[];
  onChange?: (receta: IngredienteReceta[]) => void;
}

export default function RecipeEditorField({
  insumosDisponibles: initialInsumos,
  recetaInicial = [],
  onChange,
}: RecipeEditorFieldProps) {
  const [insumosList, setInsumosList] = useState<InsumoOption[]>(initialInsumos);
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>(recetaInicial);

  // Estados para añadir ingrediente
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>("");
  const [cantidadInput, setCantidadInput] = useState<string>("1");

  // Estado para modal/formulario de creación rápida de insumo
  const [showNuevoInsumo, setShowNuevoInsumo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaUnidad, setNuevaUnidad] = useState("kg");
  const [nuevoStock, setNuevoStock] = useState("10.00");
  const [nuevoStockMin, setNuevoStockMin] = useState("2.00");
  const [isPending, startTransition] = useTransition();
  const [errorNuevoInsumo, setErrorNuevoInsumo] = useState<string | null>(null);

  const updateIngredientes = (newList: IngredienteReceta[]) => {
    setIngredientes(newList);
    if (onChange) onChange(newList);
  };

  const handleAddIngrediente = () => {
    const numId = parseInt(selectedInsumoId, 10);
    const cant = parseFloat(cantidadInput);

    if (isNaN(numId) || numId <= 0) {
      alert("Por favor selecciona un insumo de la lista.");
      return;
    }
    if (isNaN(cant) || cant <= 0) {
      alert("Por favor ingresa una cantidad válida mayor a 0.");
      return;
    }

    const insumo = insumosList.find((i) => i.id === numId);
    if (!insumo) return;

    // Si ya existe, actualizar cantidad
    const existingIdx = ingredientes.findIndex((i) => i.insumoId === numId);
    if (existingIdx >= 0) {
      const updated = [...ingredientes];
      updated[existingIdx].cantidadUsada = String(cant);
      updateIngredientes(updated);
    } else {
      updateIngredientes([
        ...ingredientes,
        {
          insumoId: insumo.id,
          insumoNombre: insumo.nombre,
          unidad: insumo.unidad,
          cantidadUsada: String(cant),
        },
      ]);
    }

    setSelectedInsumoId("");
    setCantidadInput("1");
  };

  const handleRemoveIngrediente = (insumoId: number) => {
    updateIngredientes(ingredientes.filter((i) => i.insumoId !== insumoId));
  };

  const handleUpdateCantidad = (insumoId: number, newCant: string) => {
    updateIngredientes(
      ingredientes.map((i) =>
        i.insumoId === insumoId ? { ...i, cantidadUsada: newCant } : i
      )
    );
  };

  const handleCrearInsumoRapido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      setErrorNuevoInsumo("El nombre del insumo es obligatorio");
      return;
    }
    setErrorNuevoInsumo(null);

    const fd = new FormData();
    fd.append("nombre", nuevoNombre);
    fd.append("unidad", nuevaUnidad);
    fd.append("stockActual", nuevoStock);
    fd.append("stockMinimo", nuevoStockMin);

    startTransition(async () => {
      const res = await crearInsumoRapidoAction(fd);
      if (res?.error) {
        setErrorNuevoInsumo(res.error);
      } else if (res?.insumo) {
        const created: InsumoOption = res.insumo;
        setInsumosList((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        // Auto seleccionarlo
        setSelectedInsumoId(String(created.id));
        setShowNuevoInsumo(false);
        setNuevoNombre("");
      }
    });
  };

  return (
    <div className="space-y-3 bg-[#0d0c0a] border border-white/10 rounded-2xl p-4">
      {/* Input oculto para viajar en FormData */}
      <input
        type="hidden"
        name="recetaJson"
        value={JSON.stringify(
          ingredientes.map((i) => ({
            insumoId: i.insumoId,
            cantidadUsada: i.cantidadUsada,
          }))
        )}
      />

      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-1.5">
            <span>🥗</span> Receta & Descuento de Inventario
          </h4>
          <p className="text-[10px] text-[#8a8078]">
            Insumos que se descontarán automáticamente del stock al vender este plato.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-2 py-0.5 rounded-full">
          {ingredientes.length} ingrediente{ingredientes.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Lista de ingredientes actuales en la receta */}
      {ingredientes.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ingredientes.map((ing) => (
            <div
              key={ing.insumoId}
              className="flex items-center justify-between gap-2 p-2.5 bg-black/40 border border-white/[0.06] rounded-xl text-xs"
            >
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-white truncate block">
                  {ing.insumoNombre}
                </span>
                <span className="text-[10px] text-[#8a8078]">
                  Unidad: {ing.unidad}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-[#8a8078]">Consume:</span>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={ing.cantidadUsada}
                  onChange={(e) => handleUpdateCantidad(ing.insumoId, e.target.value)}
                  className="w-20 bg-[#141210] border border-white/15 rounded-lg px-2 py-1 text-xs text-right text-[#c9a84c] font-mono font-bold focus:border-[#c9a84c] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-white/70 w-8">
                  {ing.unidad}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveIngrediente(ing.insumoId)}
                  className="p-1 text-[#8a8078] hover:text-[#ff6b6b] transition-colors text-sm"
                  title="Quitar de la receta"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-black/20 border border-dashed border-white/10 rounded-xl text-center text-[11px] text-[#8a8078]">
          Sin insumos vinculados. Este plato no descontará inventario hasta agregar su receta.
        </div>
      )}

      {/* Selector para agregar insumo a la receta */}
      {!showNuevoInsumo ? (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <select
              value={selectedInsumoId}
              onChange={(e) => setSelectedInsumoId(e.target.value)}
              className="flex-1 bg-[#141210] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
            >
              <option value="">-- Seleccionar Insumo del Inventario --</option>
              {insumosList.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.nombre} ({ins.unidad}) — Stock: {ins.stockActual}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                placeholder="Cant."
                className="w-16 bg-[#141210] border border-white/10 rounded-xl px-2 py-2 text-xs text-right text-white font-mono focus:border-[#c9a84c] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddIngrediente}
                className="px-3 py-2 bg-[#c9a84c] hover:bg-[#e8c770] text-black font-bold text-xs rounded-xl transition-all shadow-md"
              >
                + Añadir
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#8a8078]">¿No encuentras el insumo?</span>
            <button
              type="button"
              onClick={() => setShowNuevoInsumo(true)}
              className="text-[#c9a84c] hover:underline font-semibold"
            >
              + Crear nuevo insumo en inventario
            </button>
          </div>
        </div>
      ) : (
        /* Formulario rápido para crear insumo */
        <div className="p-3 bg-black/60 border border-[#c9a84c]/30 rounded-xl space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-[#c9a84c]">
            <span>➕ Crear Nuevo Insumo al Vuelo</span>
            <button
              type="button"
              onClick={() => setShowNuevoInsumo(false)}
              className="text-[#8a8078] hover:text-white"
            >
              ✕ Cancelar
            </button>
          </div>

          {errorNuevoInsumo && (
            <div className="p-2 bg-[#c62828]/20 border border-[#c62828]/40 rounded-lg text-[10px] text-[#ff6b6b]">
              {errorNuevoInsumo}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] text-[#8a8078]">Nombre del Insumo *</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Mozzarella en bloque"
                className="w-full bg-[#141210] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#8a8078]">Unidad</label>
              <select
                value={nuevaUnidad}
                onChange={(e) => setNuevaUnidad(e.target.value)}
                className="w-full bg-[#141210] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="kg">kg (Kilogramos)</option>
                <option value="g">g (Gramos)</option>
                <option value="litros">litros (L)</option>
                <option value="ml">ml (Mililitros)</option>
                <option value="unidades">unidades</option>
                <option value="porciones">porciones</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#8a8078]">Stock Inicial</label>
              <input
                type="number"
                step="0.01"
                value={nuevoStock}
                onChange={(e) => setNuevoStock(e.target.value)}
                className="w-full bg-[#141210] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleCrearInsumoRapido}
            className="w-full py-1.5 bg-[#c9a84c] hover:bg-[#e8c770] text-black font-bold text-xs rounded-lg transition-all disabled:opacity-50"
          >
            {isPending ? "Guardando Insumo..." : "Guardar Insumo y Añadir a Receta"}
          </button>
        </div>
      )}
    </div>
  );
}
