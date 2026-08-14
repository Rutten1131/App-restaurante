"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { crearPedidoOnlineAction } from "./actions";

interface Plato {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: string | number;
  imagenUrl?: string | null;
  disponible?: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
  orden: number;
  platos: Plato[];
}

interface AppMenuClientProps {
  categorias: Categoria[];
  initialMesa?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Mariscos": "",
  "Promociones": "",
  "Pizzas": "",
  "Ensaladas": "",
  "Paninos": "",
  "Spaghettis": "",
  "Lasagnas": "",
  "Sugerencias del Chef": "",
  "Postres": "",
  "Vinos": "",
  "Bebidas Frías": "",
  "Gaseosas": "",
  "Cervezas": "",
  "Bebidas Calientes": "",
  "Línea Económica": "",
};

// Agrupación visual de categorías para navegación simplificada
interface CategoryGroup {
  label: string;
  categoryNames: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  { label: "Comida", categoryNames: ["Mariscos", "Pizzas", "Ensaladas", "Paninos", "Spaghettis", "Lasagnas", "Sugerencias del Chef", "Línea Económica"] },
  { label: "Promociones", categoryNames: ["Promociones"] },
  { label: "Bebidas & Vinos", categoryNames: ["Vinos", "Bebidas Frías", "Gaseosas", "Cervezas", "Bebidas Calientes"] },
  { label: "Postres", categoryNames: ["Postres"] },
];

export default function AppMenuClient({
  categorias,
  initialMesa,
}: AppMenuClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navegación de vistas: "carta" | "resumen"
  const initialVista = searchParams?.get("vista") === "resumen" ? "resumen" : "carta";
  const [vista, setVista] = useState<"carta" | "resumen">(initialVista);

  // Sincronizar URL cuando cambia de vista para soportar slug/parámetro limpio
  const cambiarVista = (nuevaVista: "carta" | "resumen") => {
    setVista(nuevaVista);
    const url = nuevaVista === "resumen" ? "/app/menu?vista=resumen" : "/app/menu";
    window.history.pushState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Escuchar botón Atrás del navegador
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setVista(params.get("vista") === "resumen" ? "resumen" : "carta");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Modalidad seleccionada (Mesa por defecto si viene por QR de mesa)
  const [modalidad, setModalidad] = useState<"mesa" | "llevar" | "delivery">(
    initialMesa ? "mesa" : "mesa"
  );

  // Formulario de Entrega / Mesa
  const [mesaNum, setMesaNum] = useState(initialMesa || "1");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horaRetiro, setHoraRetiro] = useState("Lo antes posible (15-20 min)");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [notasGenerales, setNotasGenerales] = useState("");

  // Notas individuales por plato
  const [notasPorPlato, setNotasPorPlato] = useState<{ [platoId: number]: string }>({});

  // Filtro de categoría y búsqueda
  const [categoriaActiva, setCategoriaActiva] = useState<number | number[] | "todas">("todas");
  const [grupoActivo, setGrupoActivo] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarTodasCategoriasGrid, setMostrarTodasCategoriasGrid] = useState(false);

  // Helper: seleccionar un grupo de categorías
  const seleccionarGrupo = (group: CategoryGroup) => {
    const ids = categorias
      .filter((c) => group.categoryNames.includes(c.nombre))
      .map((c) => c.id);
    setCategoriaActiva(ids);
    setGrupoActivo(group.label);
  };

  const seleccionarTodas = () => {
    setCategoriaActiva("todas");
    setGrupoActivo(null);
  };

  const seleccionarCategoria = (catId: number) => {
    setCategoriaActiva(catId);
    setGrupoActivo(null);
  };

  // Carrito de compras en tiempo real
  const [carrito, setCarrito] = useState<{ [platoId: number]: { plato: Plato; cantidad: number } }>({});

  // Estado de envío y confirmación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    id: number;
    total: string;
    modalidad: string;
    items: Array<{ nombre: string; cantidad: number; precio: string }>;
  } | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Agregar al carrito
  const agregarAlCarrito = (plato: Plato) => {
    setCarrito((prev) => {
      const actual = prev[plato.id]?.cantidad || 0;
      return {
        ...prev,
        [plato.id]: { plato, cantidad: actual + 1 },
      };
    });
  };

  // Quitar del carrito
  const quitarDelCarrito = (platoId: number) => {
    setCarrito((prev) => {
      const actual = prev[platoId]?.cantidad || 0;
      if (actual <= 1) {
        const copy = { ...prev };
        delete copy[platoId];
        return copy;
      }
      return {
        ...prev,
        [platoId]: { ...prev[platoId], cantidad: actual - 1 },
      };
    });
  };

  // Totales y Desglose Tributario (IVA 15%)
  const itemsCarrito = Object.values(carrito);
  const totalCantidad = itemsCarrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrecio = itemsCarrito.reduce(
    (acc, item) => acc + Number(item.plato.precio) * item.cantidad,
    0
  );
  const subtotal15 = Number((totalPrecio / 1.15).toFixed(2));
  const iva15 = Number((totalPrecio - subtotal15).toFixed(2));

  // Total de platos en la carta (sin mostrar en UI)
  const totalPlatosMenu = categorias.reduce((acc, cat) => acc + (cat.platos?.length || 0), 0);

  // Filtrado de platos
  const categoriasFiltradas = categorias
    .map((cat) => {
      const platosFiltrados = (cat.platos || []).filter((p) => {
        const matchBusqueda =
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
        return matchBusqueda;
      });

      return {
        ...cat,
        platos: platosFiltrados,
      };
    })
    .filter((cat) => {
      if (categoriaActiva === "todas") return cat.platos.length > 0;
      if (Array.isArray(categoriaActiva)) return categoriaActiva.includes(cat.id) && cat.platos.length > 0;
      return cat.id === categoriaActiva && cat.platos.length > 0;
    });

  // Enviar Pedido directamente al Sistema de Cocina
  const handleEnviarPedidoFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCarrito.length === 0) return;

    if (modalidad === "mesa" && !mesaNum.trim()) {
      setErrorEnvio("Por favor ingresa el número de mesa.");
      return;
    }
    if (!clienteNombre.trim()) {
      setErrorEnvio("Por favor ingresa tu nombre.");
      return;
    }
    if (modalidad === "delivery" && !direccion.trim()) {
      setErrorEnvio("Por favor ingresa tu dirección de entrega.");
      return;
    }

    setIsSubmitting(true);
    setErrorEnvio(null);

    const notasArray = [
      notasGenerales ? `Obs: ${notasGenerales}` : null,
      modalidad === "llevar" && horaRetiro ? `Hora Retiro: ${horaRetiro}` : null,
    ].filter(Boolean);

    const payload = {
      modalidad,
      mesa: modalidad === "mesa" ? mesaNum : undefined,
      nombreCliente: clienteNombre,
      telefonoCliente: clienteTelefono,
      direccion: modalidad === "delivery" ? direccion : undefined,
      metodoPago,
      notas: notasArray.join(" | ") || undefined,
      items: itemsCarrito.map((it) => {
        const notaItem = notasPorPlato[it.plato.id];
        return {
          platoId: it.plato.id,
          nombre: it.plato.nombre,
          cantidad: it.cantidad,
          precioUnitario: String(it.plato.precio),
          notas: notaItem || undefined,
        };
      }),
    };

    try {
      const res = await crearPedidoOnlineAction(payload);

      if (res.success && res.pedidoId) {
        setPedidoConfirmado({
          id: res.pedidoId,
          total: res.total || totalPrecio.toFixed(2),
          modalidad:
            modalidad === "mesa"
              ? `Mesa #${mesaNum}`
              : modalidad === "llevar"
              ? "Para Llevar (Pick-up)"
              : "A Domicilio (Delivery)",
          items: itemsCarrito.map((it) => ({
            nombre: it.plato.nombre,
            cantidad: it.cantidad,
            precio: String(it.plato.precio),
          })),
        });
        setCarrito({});
        cambiarVista("carta");
      } else {
        setErrorEnvio(res.error || "Ocurrió un error al procesar el pedido.");
      }
    } catch (err: any) {
      setErrorEnvio("Error de conexión con el servidor. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f0e8] pb-36 font-sans">
      {/* Header Sticky */}
      <header className="sticky top-0 z-40 bg-[#141210]/95 backdrop-blur-md border-b border-white/[0.06] py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#c9a84c]/30">
              <Image
                src="/images/logo-roma.jpg"
                alt="Roma"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-[#f5f0e8] block leading-none">
                ROMA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#2e7d32] font-bold">
                {vista === "resumen" ? "Resumen de Pedido" : `Carta Completa · ${categorias.length} Categorías`}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {vista === "resumen" ? (
              <button
                onClick={() => cambiarVista("carta")}
                className="text-xs bg-white/[0.08] hover:bg-white/[0.15] text-[#f5f0e8] px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1"
              >
                ← Volver a la Carta
              </button>
            ) : (
              <span className="text-xs bg-[#2e7d32]/15 text-[#2e7d32] border border-[#2e7d32]/30 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
                Cocina en Vivo
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VISTA 1: EXPLORACIÓN DE LA CARTA (MENÚ COMPLETO)                         */}
      {/* ========================================================================= */}
      {vista === "carta" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

          {/* Buscador & Navegación de Menú */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#f5f0e8]">
                  Nuestra Carta
                </h1>
                <p className="text-xs text-[#8a8078]">
                  Selecciona una categoría o busca tu plato favorito
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar plato, pizza, vino..."
                    className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#f5f0e8] placeholder-[#8a8078] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarTodasCategoriasGrid(!mostrarTodasCategoriasGrid)}
                  className="px-3 py-2 bg-white/[0.06] hover:bg-[#c9a84c] hover:text-[#0a0908] text-white border border-white/10 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5"
                  title="Ver todas las categorías"
                >
                  <span>{mostrarTodasCategoriasGrid ? "↔ Deslizar" : "⊞ Ver todas"}</span>
                </button>
              </div>
            </div>

            {/* BARRA DESLIZABLE HORIZONTAL CON GRUPOS Y ACCESO RÁPIDO */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar">
                {/* Botón Todas */}
                <button
                  onClick={seleccionarTodas}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    categoriaActiva === "todas"
                      ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                      : "bg-[#0a0908] border border-white/[0.08] text-[#8a8078] hover:text-[#f5f0e8] hover:border-white/20"
                  }`}
                >
                  <span>✨</span> Todas
                </button>

                {/* Grupos de Categorías Principales */}
                {CATEGORY_GROUPS.map((group) => {
                  const isActivo = grupoActivo === group.label;

                  return (
                    <button
                      key={group.label}
                      onClick={() => seleccionarGrupo(group)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                        isActivo
                          ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                          : "bg-[#0a0908] border border-white/[0.08] text-[#8a8078] hover:text-[#f5f0e8] hover:border-white/20"
                      }`}
                    >
                      <span>{group.label}</span>
                    </button>
                  );
                })}

                {/* Separador visual */}
                <span className="w-px h-6 bg-white/[0.08] shrink-0" />

                {/* Categorías individuales */}
                {categorias.map((cat) => {
                  const isActiva = !Array.isArray(categoriaActiva) && categoriaActiva === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => seleccionarCategoria(cat.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                        isActiva
                          ? "bg-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                          : "bg-[#0a0908] border border-white/[0.08] text-[#8a8078] hover:text-[#f5f0e8] hover:border-white/20"
                      }`}
                    >
                      <span>{cat.nombre}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8a8078] px-1 pt-1">
                <span>👈 Desliza para explorar 👉</span>
                <button
                  type="button"
                  onClick={() => setMostrarTodasCategoriasGrid(true)}
                  className="text-[#c9a84c] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>⊞ Ver todas agrupadas</span>
                </button>
              </div>
            </div>
          </div>

          {/* MODAL / BOTTOM SHEET ELEGANTE PARA EXPLORAR CATEGORÍAS */}
          {mostrarTodasCategoriasGrid && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
              <div
                className="bg-[#141210] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del Modal */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 sticky top-0 bg-[#141210] z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍕</span>
                    <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                      Categorías del Menú
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarTodasCategoriasGrid(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-[#8a8078] hover:text-white flex items-center justify-center text-sm font-bold transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Botón Ver Todo */}
                <button
                  onClick={() => {
                    seleccionarTodas();
                    setMostrarTodasCategoriasGrid(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    categoriaActiva === "todas"
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908] shadow-lg shadow-[#c9a84c]/20"
                      : "bg-[#0a0908] border-white/[0.08] text-[#f5f0e8] hover:border-[#c9a84c]/40"
                  }`}
                >
                  <span className="text-base">✨</span>
                  <span>Mostrar Toda la Carta ({totalPlatosMenu} Platos)</span>
                </button>

                {/* Secciones agrupadas de categorías */}
                <div className="space-y-4 pt-1">
                  {CATEGORY_GROUPS.map((group) => {
                    const groupCats = categorias.filter((c) =>
                      group.categoryNames.includes(c.nombre)
                    );
                    if (groupCats.length === 0) return null;

                    const isGroupActive = grupoActivo === group.label;

                    return (
                      <div key={group.label} className="space-y-2">
                        {/* Cabecera del Grupo */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              seleccionarGrupo(group);
                              setMostrarTodasCategoriasGrid(false);
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-[#c9a84c] hover:underline"
                          >
                            <span>{group.label}</span>
                            <span className="text-[10px] text-[#8a8078] font-normal">
                              (Ver todo el grupo)
                            </span>
                          </button>
                        </div>

                        {/* Chips / Pills de Categorías del Grupo */}
                        <div className="flex flex-wrap gap-2">
                          {groupCats.map((cat) => {
                            const isActiva =
                              !Array.isArray(categoriaActiva) && categoriaActiva === cat.id;

                            return (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  seleccionarCategoria(cat.id);
                                  setMostrarTodasCategoriasGrid(false);
                                }}
                                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                  isActiva
                                    ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908] shadow-md shadow-[#c9a84c]/20"
                                    : "bg-[#0a0908] border-white/[0.08] text-[#f5f0e8] hover:border-[#c9a84c]/40 hover:bg-white/[0.03]"
                                }`}
                              >
                                <span>{cat.nombre}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Modal */}
                <div className="pt-2 border-t border-white/[0.06] text-center">
                  <button
                    type="button"
                    onClick={() => setMostrarTodasCategoriasGrid(false)}
                    className="text-xs text-[#8a8078] hover:text-white transition-colors"
                  >
                    Cerrar panel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Listado de Platos de la Carta */}
          <div className="space-y-8">
            {categoriasFiltradas.length === 0 ? (
              <div className="text-center py-16 bg-[#141210] rounded-3xl border border-white/[0.06] text-xs text-[#8a8078]">
                No se encontraron platos disponibles con ese filtro.
              </div>
            ) : (
              categoriasFiltradas.map((cat) => {
                return (
                  <section key={cat.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <span className="font-serif text-xl font-bold text-[#c9a84c]">
                        {cat.nombre}
                      </span>
                      <span className="text-xs text-[#8a8078]">
                        {cat.platos?.length || 0} opciones
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {cat.platos?.map((plato) => {
                        const cantEnCarrito = carrito[plato.id]?.cantidad || 0;

                        return (
                          <div
                            key={plato.id}
                            className="bg-[#141210] border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#c9a84c]/40 transition-all duration-300 shadow-lg group p-4 space-y-3"
                          >
                            <div className="relative h-44 -mx-4 -mt-4 mb-2 bg-[#181515] overflow-hidden">
                              <Image
                                src={plato.imagenUrl || "/images/hero-pizza.jpg"}
                                alt={plato.nombre}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent" />
                              <span className="absolute top-3 right-3 bg-[#0a0908]/90 border border-[#c9a84c] text-[#c9a84c] font-serif font-bold text-sm px-3 py-1 rounded-full shadow">
                                ${Number(plato.precio).toFixed(2)}
                              </span>
                            </div>

                            <div className="space-y-1.5 flex-1">
                              <h3 className="font-serif text-base font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors leading-tight">
                                {plato.nombre}
                              </h3>

                              {plato.descripcion && (
                                <p className="text-xs text-[#8a8078] leading-relaxed line-clamp-2">
                                  {plato.descripcion}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                              {cantEnCarrito > 0 ? (
                                <div className="flex items-center gap-2 bg-[#0a0908] border border-[#c9a84c]/40 rounded-xl p-1">
                                  <button
                                    onClick={() => quitarDelCarrito(plato.id)}
                                    className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-[#c62828] text-white flex items-center justify-center font-bold text-sm transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-xs px-2 text-[#c9a84c]">
                                    {cantEnCarrito}
                                  </span>
                                  <button
                                    onClick={() => agregarAlCarrito(plato)}
                                    className="w-7 h-7 rounded-lg bg-[#c9a84c] hover:brightness-110 text-[#0a0908] flex items-center justify-center font-bold text-sm transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => agregarAlCarrito(plato)}
                                  className="px-4 py-2 bg-white/[0.04] hover:bg-[#c9a84c] hover:text-[#0a0908] border border-white/[0.08] text-[#f5f0e8] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                                >
                                  <span>🛒</span> Agregar
                                </button>
                              )}

                              <span className="text-xs font-mono font-bold text-[#f5f0e8]">
                                ${(Number(plato.precio) * (cantEnCarrito || 1)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PÁGINA DEDICADA DE RESUMEN DE PEDIDO (/app/menu?vista=resumen)   */}
      {/* ========================================================================= */}
      {vista === "resumen" && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* Header de la página de resumen */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <button
                onClick={() => cambiarVista("carta")}
                className="text-xs text-[#c9a84c] hover:underline flex items-center gap-1 mb-1 font-semibold"
              >
                ← Seguir agregando más platos
              </button>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
                Resumen de tu Pedido
              </h1>
              <p className="text-xs text-[#8a8078]">
                Revisa los platos seleccionados, su detalle, y completa tus datos para enviar a cocina.
              </p>
            </div>

            <div className="bg-[#141210] border border-[#c9a84c]/30 px-3.5 py-1.5 rounded-2xl text-right">
              <span className="text-[10px] text-[#8a8078] uppercase block">Total Platos</span>
              <span className="text-sm font-bold text-[#c9a84c]">{totalCantidad} items</span>
            </div>
          </div>

          {/* 1. Lista Detallada de Platos con Información Completa */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <span className="text-[#c9a84c]">📋</span> Platos Seleccionados ({itemsCarrito.length})
            </h2>

            {itemsCarrito.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#8a8078] space-y-3">
                <p>No tienes ningún plato en tu pedido todavía.</p>
                <button
                  onClick={() => cambiarVista("carta")}
                  className="px-4 py-2 bg-[#c9a84c] text-[#0a0908] font-bold rounded-xl text-xs"
                >
                  Ir a la Carta
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] space-y-4">
                {itemsCarrito.map((it) => {
                  const itemSubtotal = Number(it.plato.precio) * it.cantidad;

                  return (
                    <div
                      key={it.plato.id}
                      className="pt-4 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#0a0908] border border-white/10 shrink-0">
                            <Image
                              src={it.plato.imagenUrl || "/images/hero-pizza.jpg"}
                              alt={it.plato.nombre}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif font-bold text-base text-[#f5f0e8] leading-tight">
                              {it.plato.nombre}
                            </h4>
                            {/* Información detallada / ingredientes del plato */}
                            {it.plato.descripcion ? (
                              <p className="text-xs text-[#8a8078] leading-relaxed max-w-md">
                                {it.plato.descripcion}
                              </p>
                            ) : (
                              <span className="text-[11px] text-[#8a8078] italic">
                                Preparación clásica de la casa Roma
                              </span>
                            )}
                            <span className="text-xs text-[#c9a84c] font-mono block pt-0.5">
                              ${Number(it.plato.precio).toFixed(2)} c/u
                            </span>
                          </div>
                        </div>

                        {/* Controles +/- y subtotal */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-center">
                          <div className="flex items-center gap-2 bg-[#0a0908] border border-white/10 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => quitarDelCarrito(it.plato.id)}
                              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-[#c62828] text-white flex items-center justify-center font-bold text-sm transition-colors"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs px-2.5 text-[#c9a84c]">
                              {it.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => agregarAlCarrito(it.plato)}
                              className="w-8 h-8 rounded-lg bg-[#c9a84c] hover:brightness-110 text-[#0a0908] flex items-center justify-center font-bold text-sm transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-serif font-bold text-base text-[#f5f0e8] min-w-[75px] text-right">
                            ${itemSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Campo opcional de nota específica para este plato */}
                      <div className="pl-0 sm:pl-19">
                        <input
                          type="text"
                          value={notasPorPlato[it.plato.id] || ""}
                          onChange={(e) =>
                            setNotasPorPlato({
                              ...notasPorPlato,
                              [it.plato.id]: e.target.value,
                            })
                          }
                          placeholder="Nota para este plato: ej. sin cebolla, bien cocido, salsa aparte..."
                          className="w-full bg-[#0a0908] border border-white/[0.06] rounded-xl px-3 py-1.5 text-[11px] text-[#f5f0e8] placeholder-[#8a8078]/70 focus:border-[#c9a84c] focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Desglose de Costos & Impuestos */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <span className="text-[#c9a84c]">💵</span> Desglose de Costos
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#8a8078]">
                <span>Subtotal (Tarifa 15% IVA)</span>
                <span className="font-mono">${subtotal15.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8a8078]">
                <span>IVA 15% (Incluido)</span>
                <span className="font-mono">${iva15.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-[#f5f0e8] border-t border-white/10 pt-3">
                <span>Total Final a Pagar</span>
                <span className="font-serif text-2xl text-[#c9a84c]">
                  ${totalPrecio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Formulario de Entrega / Mesa & Confirmación */}
          <form
            onSubmit={handleEnviarPedidoFinal}
            className="bg-[#141210] border border-white/[0.06] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5"
          >
            <h2 className="font-serif text-lg font-bold text-[#f5f0e8] flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <span className="text-[#c9a84c]">📍</span> Datos para tu Orden
            </h2>

            {/* Modalidad Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-[#c9a84c]">
                Modalidad de Servicio
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModalidad("mesa")}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    modalidad === "mesa"
                      ? "bg-[#c62828] border-[#c62828] text-white shadow-md"
                      : "bg-[#0a0908] border-white/10 text-[#8a8078]"
                  }`}
                >
                  📍 En Mesa
                </button>
                <button
                  type="button"
                  onClick={() => setModalidad("llevar")}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    modalidad === "llevar"
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908] shadow-md"
                      : "bg-[#0a0908] border-white/10 text-[#8a8078]"
                  }`}
                >
                  🛍️ Para Llevar
                </button>
                <button
                  type="button"
                  onClick={() => setModalidad("delivery")}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    modalidad === "delivery"
                      ? "bg-[#2e7d32] border-[#2e7d32] text-white shadow-md"
                      : "bg-[#0a0908] border-white/10 text-[#8a8078]"
                  }`}
                >
                  🛵 Domicilio
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {modalidad === "mesa" && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                    Número de Mesa *
                  </label>
                  <input
                    type="text"
                    required
                    value={mesaNum}
                    onChange={(e) => setMesaNum(e.target.value)}
                    placeholder="Ej. 1, 2, 3..."
                    className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              )}

              <div className={modalidad !== "mesa" ? "sm:col-span-2" : ""}>
                <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                  Tu Nombre o Apodo *
                </label>
                <input
                  type="text"
                  required
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                  WhatsApp / Celular (Opcional)
                </label>
                <input
                  type="tel"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="098 767 0140"
                  className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                  Forma de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia / Deuna">📱 Transferencia / Deuna (Banco Pichincha)</option>
                  <option value="Tarjeta">💳 Tarjeta (en el local)</option>
                </select>
              </div>

              {modalidad === "delivery" && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                    Dirección de Entrega en Loja *
                  </label>
                  <input
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número de casa, barrio o referencia"
                    className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              )}

              {modalidad === "llevar" && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                    Hora estimada de Retiro
                  </label>
                  <input
                    type="text"
                    value={horaRetiro}
                    onChange={(e) => setHoraRetiro(e.target.value)}
                    placeholder="Ej. En 20 min / 8:30 PM"
                    className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[#c9a84c] mb-1">
                  Observaciones Generales para Cocina (Opcional)
                </label>
                <input
                  type="text"
                  value={notasGenerales}
                  onChange={(e) => setNotasGenerales(e.target.value)}
                  placeholder="Ej. Gaseosa bien fría, servilletas extra..."
                  className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>
            </div>

            {errorEnvio && (
              <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                {errorEnvio}
              </div>
            )}

            {/* Botón Principal de Confirmación */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => cambiarVista("carta")}
                className="py-3.5 px-6 border border-white/10 rounded-2xl text-xs font-semibold text-white/70 hover:text-white transition-all text-center"
              >
                ← Seguir agregando platos
              </button>
              <button
                type="submit"
                disabled={isSubmitting || itemsCarrito.length === 0}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#c62828] via-[#e53935] to-[#c62828] hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-900/40 transition-all uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🔥</span>
                <span>{isSubmitting ? "Enviando a Cocina..." : `Confirmar y Enviar Pedido a Cocina ($${totalPrecio.toFixed(2)})`}</span>
              </button>
            </div>
          </form>
        </main>
      )}

      {/* ── BARRA FLOTANTE INFERIOR EN MODO CARTA (VER RESUMEN DE PEDIDO) ── */}
      {vista === "carta" && totalCantidad > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => cambiarVista("resumen")}
              className="w-full bg-gradient-to-r from-[#c62828] via-[#e53935] to-[#c62828] text-white p-4 rounded-2xl shadow-2xl shadow-red-900/40 flex items-center justify-between font-bold text-sm hover:brightness-110 transition-all border border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-mono font-extrabold">
                  {totalCantidad}
                </span>
                <span>🛒 Ver Resumen de mi Pedido</span>
              </div>
              <span className="font-serif text-lg font-extrabold text-[#c9a84c]">
                ${totalPrecio.toFixed(2)} →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: PEDIDO CONFIRMADO EN VIVO ──────────────────────────────── */}
      {pedidoConfirmado && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-[#2e7d32]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#2e7d32]/20 border border-[#2e7d32]/50 text-[#2e7d32] rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
              ✓
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#f5f0e8]">
              ¡Comanda Enviada a Cocina!
            </h3>

            <p className="text-xs text-[#8a8078] leading-relaxed">
              Tu pedido <strong className="text-[#c9a84c]">#{pedidoConfirmado.id}</strong> fue recibido por el equipo de cocina de Roma Restaurante Pizzería y está en preparación.
            </p>

            <div className="bg-[#0a0908] p-3.5 rounded-2xl border border-white/5 text-left text-xs space-y-2">
              <div className="flex justify-between text-[#8a8078]">
                <span>Modalidad:</span>
                <span className="font-bold text-white">{pedidoConfirmado.modalidad}</span>
              </div>
              <div className="flex justify-between text-[#8a8078]">
                <span>Total a Pagar:</span>
                <span className="font-serif font-bold text-[#c9a84c] text-sm">
                  ${pedidoConfirmado.total}
                </span>
              </div>
              <div className="border-t border-white/5 pt-2 space-y-1">
                {pedidoConfirmado.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-[#f5f0e8]">
                    <span>{it.cantidad}x {it.nombre}</span>
                    <span className="font-mono text-[#8a8078]">${(Number(it.precio) * it.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPedidoConfirmado(null)}
                className="w-full py-3 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs rounded-2xl shadow-lg shadow-[#c9a84c]/20 transition-all uppercase tracking-wider"
              >
                Hacer Otra Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
