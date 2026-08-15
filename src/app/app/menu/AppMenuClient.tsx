"use client";

import { useState, useEffect, useMemo } from "react";
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

// Helper para asignar imagen default de alta calidad a cada categoría
function getCategoryImage(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes("pizza")) return "/images/hero-pizza.jpg";
  if (n.includes("pasta") || n.includes("spaghetti")) return "/images/pasta.jpg";
  if (n.includes("lasagna")) return "/images/lasagna.jpg";
  if (n.includes("marisco") || n.includes("pescado") || n.includes("camaron")) return "/images/mariscos_dish_1786743970051.jpg";
  if (n.includes("ensalada")) return "/images/ensalada_dish_1786743983137.jpg";
  if (n.includes("panino") || n.includes("entrada")) return "/images/panino_dish_1786744000815.jpg";
  if (n.includes("postre") || n.includes("dulce")) return "/images/postre_dish_1786744022960.jpg";
  if (n.includes("bebida") || n.includes("vino") || n.includes("gaseosa") || n.includes("cerveza")) return "/images/vino_drinks_1786744045924.jpg";
  if (n.includes("sugerencia") || n.includes("chef")) return "/images/chef-oven.jpg";
  return "/images/hero-pizza.jpg";
}

const BEBIDAS_NOMBRES = ["vinos", "bebidas frías", "bebidas frias", "gaseosas", "cervezas", "bebidas calientes", "bebidas"];

export default function AppMenuClient({
  categorias,
  initialMesa,
}: AppMenuClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navegación de vistas: "carta" | "resumen"
  const initialVista = searchParams?.get("vista") === "resumen" ? "resumen" : "carta";
  const [vista, setVista] = useState<"carta" | "resumen">(initialVista);

  const cambiarVista = (nuevaVista: "carta" | "resumen") => {
    setVista(nuevaVista);
    const url = nuevaVista === "resumen" ? "/app/menu?vista=resumen" : "/app/menu";
    window.history.pushState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Agrupación unificada de categorías:
  // Combina Vinos, Bebidas Frías, Gaseosas, Cervezas, Bebidas Calientes en 1 sola categoría "Bebidas"
  const categoriasUnificadas = useMemo(() => {
    const comidas: { id: string | number; nombre: string; platos: Plato[]; imagenUrl: string }[] = [];
    const platosBebidas: Plato[] = [];

    for (const cat of categorias) {
      const nombreNorm = cat.nombre.toLowerCase().trim();
      if (BEBIDAS_NOMBRES.includes(nombreNorm)) {
        platosBebidas.push(...(cat.platos || []));
      } else {
        comidas.push({
          id: cat.id,
          nombre: cat.nombre,
          platos: cat.platos || [],
          imagenUrl: getCategoryImage(cat.nombre),
        });
      }
    }

    if (platosBebidas.length > 0) {
      comidas.push({
        id: "bebidas-unificadas",
        nombre: "Bebidas & Vinos",
        platos: platosBebidas,
        imagenUrl: "/images/vino_drinks_1786744045924.jpg",
      });
    }

    return comidas;
  }, [categorias]);

  // Estado de navegación por categoría:
  // null = cuadrícula de categorías (2 por fila con fotos)
  // id = platos de esa categoría específica
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Modalidad seleccionada (Mesa por defecto si viene por QR de mesa)
  const mesaDefecto = initialMesa || "1";
  const [modalidad, setModalidad] = useState<"mesa" | "llevar" | "delivery">("mesa");

  // Formulario de Entrega / Mesa
  const [mesaNum, setMesaNum] = useState(mesaDefecto);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horaRetiro, setHoraRetiro] = useState("Lo antes posible (15-20 min)");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [notasGenerales, setNotasGenerales] = useState("");
  const [notasPorPlato, setNotasPorPlato] = useState<{ [platoId: number]: string }>({});

  // Carrito de compras
  const [carrito, setCarrito] = useState<{ [platoId: number]: { plato: Plato; cantidad: number } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    id: number;
    total: string;
    modalidad: string;
    items: Array<{ nombre: string; cantidad: number; precio: string }>;
  } | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Sincronizar parámetro mesa
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setVista(params.get("vista") === "resumen" ? "resumen" : "carta");
      const urlMesa = params.get("mesa");
      if (urlMesa) {
        setMesaNum(urlMesa);
        setModalidad("mesa");
      }
    };
    window.addEventListener("popstate", handlePopState);

    const params = new URLSearchParams(window.location.search);
    const urlMesa = params.get("mesa");
    if (urlMesa) {
      setMesaNum(urlMesa);
      setModalidad("mesa");
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  // Totales del carrito
  const itemsCarrito = Object.values(carrito);
  const totalCantidad = itemsCarrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrecio = itemsCarrito.reduce(
    (acc, item) => acc + Number(item.plato.precio) * item.cantidad,
    0
  );
  const subtotal15 = Number((totalPrecio / 1.15).toFixed(2));
  const iva15 = Number((totalPrecio - subtotal15).toFixed(2));

  // Categoría activa seleccionada
  const catActual = categoriasUnificadas.find((c) => c.id === categoriaSeleccionada);

  // Búsqueda inteligente global
  const esBusquedaActiva = busqueda.trim().length > 0;
  const platosEncontradosPorBusqueda = useMemo(() => {
    if (!esBusquedaActiva) return [];
    const q = busqueda.toLowerCase().trim();

    return categoriasUnificadas.flatMap((cat) =>
      cat.platos
        .filter((p) => {
          return (
            p.nombre.toLowerCase().includes(q) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
            cat.nombre.toLowerCase().includes(q)
          );
        })
        .map((p) => ({ ...p, categoriaNombre: cat.nombre }))
    );
  }, [busqueda, esBusquedaActiva, categoriasUnificadas]);

  // Enviar Pedido
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
    } catch {
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
                {vista === "resumen" ? "Resumen de Pedido" : "Carta Digital & QR"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {vista === "resumen" && (
              <button
                onClick={() => cambiarVista("carta")}
                className="text-xs bg-white/[0.08] hover:bg-white/[0.15] text-[#f5f0e8] px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1"
              >
                ← Volver al Menú
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VISTA 1: EXPLORACIÓN DE LA CARTA                                         */}
      {/* ========================================================================= */}
      {vista === "carta" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* BUSCADOR SUPER INTELIGENTE (TODO EL MENÚ) */}
          <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Busca cualquier plato en todo el menú (ej. Pepperoni, Lasagna, Vino...)"
                className="w-full bg-[#0a0908] border border-white/[0.1] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#f5f0e8] placeholder-[#8a8078] focus:border-[#c9a84c] focus:outline-none"
              />
              {esBusquedaActiva && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-xs text-white rounded-lg transition-colors"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>

            {esBusquedaActiva && (
              <div className="flex items-center justify-between text-xs text-[#8a8078] px-1">
                <span>
                  Resultados para &ldquo;<strong className="text-white">{busqueda}</strong>&rdquo;
                </span>
                <span className="text-[#c9a84c] font-semibold">
                  {platosEncontradosPorBusqueda.length} platos encontrados
                </span>
              </div>
            )}
          </div>

          {/* CASO A: RESULTADOS DE BÚSQUEDA GLOBAL */}
          {esBusquedaActiva ? (
            <div className="space-y-4">
              {platosEncontradosPorBusqueda.length === 0 ? (
                <div className="text-center py-16 bg-[#141210] rounded-3xl border border-white/[0.06] text-xs text-[#8a8078] space-y-2">
                  <p>No se encontraron platos que coincidan con &ldquo;{busqueda}&rdquo;.</p>
                  <button
                    onClick={() => setBusqueda("")}
                    className="text-[#c9a84c] underline font-semibold"
                  >
                    Ver todas las categorías
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platosEncontradosPorBusqueda.map((plato) => {
                    const cantEnCarrito = carrito[plato.id]?.cantidad || 0;

                    return (
                      <div
                        key={plato.id}
                        className="bg-[#141210] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#c9a84c]/40 transition-all duration-300 shadow-lg group p-4 space-y-3"
                      >
                        <div className="relative h-44 -mx-4 -mt-4 mb-2 bg-[#181515] overflow-hidden">
                          <Image
                            src={plato.imagenUrl || "/images/hero-pizza.jpg"}
                            alt={plato.nombre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent" />
                          <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-white/10 text-white/80 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full">
                            {plato.categoriaNombre}
                          </span>
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
                              <span>+</span> Agregar
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
              )}
            </div>
          ) : categoriaSeleccionada === null ? (
            /* CASO B: SELECCIONAR CATEGORÍA (2 POR FILA CON FOTOS) */
            <div className="space-y-4">
              <div className="border-b border-white/[0.06] pb-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
                  Explora Nuestro Menú
                </h1>
                <p className="text-xs text-[#8a8078] mt-1">
                  Elige una categoría para descubrir nuestras especialidades italianas
                </p>
              </div>

              {/* GRID RESPONSIVO: 2 POR FILA EN MÓVIL, 3-4 EN TABLET Y ORDENADOR */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {categoriasUnificadas.map((cat) => {
                  const totalPlatos = cat.platos?.length || 0;

                  return (
                    <button
                      key={String(cat.id)}
                      type="button"
                      onClick={() => {
                        setCategoriaSeleccionada(cat.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group bg-[#141210] border border-white/[0.08] hover:border-[#c9a84c] rounded-2xl sm:rounded-3xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] shadow-2xl flex flex-col justify-between h-40 sm:h-52 md:h-56 relative"
                    >
                      {/* Imagen de Fondo de Portada */}
                      <div className="absolute inset-0 bg-[#181515]">
                        <Image
                          src={cat.imagenUrl}
                          alt={cat.nombre}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-75"
                        />
                        {/* Gradiente Oscuro para Legibilidad */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/60 to-transparent" />
                      </div>

                      {/* Header de la Tarjeta */}
                      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-[#c9a84c] font-mono font-bold bg-[#0a0908]/90 border border-[#c9a84c]/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-sm shadow-md">
                          {totalPlatos} {totalPlatos === 1 ? "plato" : "platos"}
                        </span>
                      </div>

                      {/* Footer de la Tarjeta con Título */}
                      <div className="relative z-10 p-3 sm:p-4 pt-0 space-y-0.5 sm:space-y-1">
                        <h2 className="font-serif text-base sm:text-xl md:text-2xl font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors leading-tight drop-shadow-md line-clamp-1">
                          {cat.nombre}
                        </h2>
                        <span className="text-[10px] sm:text-xs text-[#c9a84c] group-hover:text-white font-semibold transition-colors flex items-center gap-1">
                          <span>Ver platos</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CASO C: PLATOS DE LA CATEGORÍA SELECCIONADA */
            <div className="space-y-6">
              {/* Barra de Retorno y Título de Categoría */}
              <div className="bg-[#141210] border border-white/[0.06] rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaSeleccionada(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2.5 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-xs rounded-2xl transition-all shadow-md shadow-[#c9a84c]/20 flex items-center gap-1.5 uppercase tracking-wider shrink-0"
                >
                  <span>←</span> Cambiar de Categoría
                </button>

                <div className="text-right">
                  <span className="font-serif text-lg sm:text-xl font-bold text-[#f5f0e8] block">
                    {catActual?.nombre}
                  </span>
                  <span className="text-xs text-[#8a8078]">
                    {catActual?.platos?.length || 0} platos disponibles
                  </span>
                </div>
              </div>

              {/* Grid de Platos de la Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catActual?.platos?.map((plato) => {
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
                            <span>+</span> Agregar
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

              {/* Botón inferior de retorno a categorías */}
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaSeleccionada(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-[#c9a84c] border border-[#c9a84c]/30 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  ← Explorar Otra Categoría
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: RESUMEN DE PEDIDO & DATOS DE ENVÍO / MESA                       */}
      {/* ========================================================================= */}
      {vista === "resumen" && (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          <div className="bg-[#141210] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-white/[0.06] pb-4">
              <h1 className="font-serif text-2xl font-bold text-[#f5f0e8]">
                Confirma tu Pedido
              </h1>
              <p className="text-xs text-[#8a8078] mt-1">
                Revisa los platos seleccionados e indícanos dónde servirlo
              </p>
            </div>

            {itemsCarrito.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-xs text-[#8a8078]">Tu pedido está vacío.</p>
                <button
                  onClick={() => cambiarVista("carta")}
                  className="px-6 py-2.5 bg-[#c9a84c] text-[#0a0908] rounded-2xl font-bold text-xs uppercase"
                >
                  Explorar la Carta
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnviarPedidoFinal} className="space-y-6">
                {/* Desglose de Platos */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
                    Platos en tu Pedido ({totalCantidad})
                  </h3>
                  <div className="divide-y divide-white/[0.04] bg-[#0a0908] border border-white/[0.06] rounded-2xl p-4">
                    {itemsCarrito.map((item) => (
                      <div key={item.plato.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white">
                              {item.cantidad}x {item.plato.nombre}
                            </span>
                            <div className="text-[11px] text-[#8a8078]">
                              ${Number(item.plato.precio).toFixed(2)} c/u
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#c9a84c]">
                            ${(Number(item.plato.precio) * item.cantidad).toFixed(2)}
                          </span>
                        </div>

                        {/* Observación por plato */}
                        <input
                          type="text"
                          placeholder="Nota (ej. sin orégano, bien dorado...)"
                          value={notasPorPlato[item.plato.id] || ""}
                          onChange={(e) =>
                            setNotasPorPlato({
                              ...notasPorPlato,
                              [item.plato.id]: e.target.value,
                            })
                          }
                          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5 text-[11px] text-white focus:border-[#c9a84c] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selección de Modalidad */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
                    ¿Dónde lo vas a disfrutar?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalidad("mesa")}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                        modalidad === "mesa"
                          ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                          : "bg-[#0a0908] border-white/[0.08] text-[#8a8078]"
                      }`}
                    >
                      En Mesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidad("llevar")}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                        modalidad === "llevar"
                          ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                          : "bg-[#0a0908] border-white/[0.08] text-[#8a8078]"
                      }`}
                    >
                      Para Llevar
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidad("delivery")}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                        modalidad === "delivery"
                          ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0908]"
                          : "bg-[#0a0908] border-white/[0.08] text-[#8a8078]"
                      }`}
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                {/* Campos según Modalidad */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {modalidad === "mesa" && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#c9a84c] uppercase">
                        Número de Mesa *
                      </label>
                      <input
                        type="text"
                        required
                        value={mesaNum}
                        onChange={(e) => setMesaNum(e.target.value)}
                        placeholder="Ej. 5"
                        className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#c9a84c] uppercase">
                      Tu Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#c9a84c] uppercase">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
                      placeholder="0991234567"
                      className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                    />
                  </div>

                  {modalidad === "delivery" && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#c9a84c] uppercase">
                        Dirección de Entrega *
                      </label>
                      <input
                        type="text"
                        required
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Calle principal, número y referencia..."
                        className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>
                  )}


                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#c9a84c] uppercase">
                      Método de Pago
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia Bancaria</option>
                      <option value="Tarjeta">Tarjeta de Débito / Crédito</option>
                      <option value="Deuna">Deuna / PayPhone</option>
                    </select>
                  </div>
                </div>

                {/* Resumen de Totales */}
                <div className="bg-[#0a0908] border border-white/[0.06] rounded-2xl p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#8a8078]">
                    <span>Subtotal (sin impuestos):</span>
                    <span>${subtotal15.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8a8078]">
                    <span>IVA (15%):</span>
                    <span>${iva15.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#c9a84c] pt-2 border-t border-white/[0.06]">
                    <span>Total a Pagar:</span>
                    <span>${totalPrecio.toFixed(2)}</span>
                  </div>
                </div>

                {errorEnvio && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                    {errorEnvio}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#c9a84c] hover:brightness-110 text-[#0a0908] font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando a Cocina..." : `Confirmar y Enviar Pedido · $${totalPrecio.toFixed(2)}`}
                </button>
              </form>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* BARRA FLOTANTE DEL CARRITO (SIEMPRE ACCESIBLE EN VISTA CARTA)            */}
      {/* ========================================================================= */}
      {vista === "carta" && totalCantidad > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-slideUp">
          <button
            onClick={() => cambiarVista("resumen")}
            className="w-full bg-[#c9a84c] hover:brightness-110 text-[#0a0908] p-4 rounded-3xl shadow-2xl flex items-center justify-between font-bold text-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#0a0908] text-[#c9a84c] flex items-center justify-center text-xs">
                {totalCantidad}
              </span>
              <span>Ver Pedido</span>
            </div>
            <span className="font-mono text-base">${totalPrecio.toFixed(2)} →</span>
          </button>
        </div>
      )}

      {/* POPUP DE PEDIDO CONFIRMADO */}
      {pedidoConfirmado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141210] border border-[#c9a84c]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-[#2e7d32]/20 border border-[#2e7d32]/40 text-[#2e7d32] text-2xl flex items-center justify-center mx-auto">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-[#f5f0e8]">
                ¡Pedido #{pedidoConfirmado.id} Enviado!
              </h2>
              <p className="text-xs text-[#8a8078]">
                Tu comanda ya entró directamente a la cocina de Roma Pizzería.
              </p>
            </div>
            <div className="bg-[#0a0908] p-4 rounded-2xl border border-white/[0.06] text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-[#8a8078]">Destino:</span>
                <span className="font-bold text-white">{pedidoConfirmado.modalidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8078]">Total:</span>
                <span className="font-bold text-[#c9a84c]">${pedidoConfirmado.total}</span>
              </div>
            </div>
            <button
              onClick={() => setPedidoConfirmado(null)}
              className="w-full py-3 bg-[#c9a84c] text-[#0a0908] font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
