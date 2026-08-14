"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface PlatoDb {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  imagenUrl: string | null;
  categoria?: { id: number; nombre: string } | null;
}

interface HomeClientProps {
  initialPlatos?: PlatoDb[];
}

const fallbackHeroDishes = [
  {
    id: "margherita",
    nombre: "Margherita Romana",
    categoria: "Pizza al Horno de Leña",
    tagline: "Salsa casera de tomate madurado al sol, mozzarella fresca di bufala, hojas de albahaca fresca y aceite de oliva virgen extra.",
    precio: "$8.50",
    tiempo: "12 min",
    calificacion: "4.9 ★ (Más Pedida)",
    badge: "100% Horno a Leña",
    imagen: "/images/hero-pizza.jpg",
    ingredientes: ["Mozzarella fresca", "Albahaca", "Tomate madurado", "Masa 48h"],
    colorAccent: "#c62828",
  },
  {
    id: "lasagna",
    nombre: "Lasaña Roma al Forno",
    categoria: "Pasta Artesanal al Forno",
    tagline: "Capas de pasta fresca artesanal, ragú de carne de res braseada durante 6 horas y cremosa bechamel gratinada.",
    precio: "$9.90",
    tiempo: "15 min",
    calificacion: "5.0 ★ (Especialidad)",
    badge: "Plato Estrella",
    imagen: "/images/lasagna.jpg",
    ingredientes: ["Carne braseada", "Bechamel", "Parmesano reggiano", "Pasta fresca"],
    colorAccent: "#c9a84c",
  },
  {
    id: "fettuccine",
    nombre: "Fettuccine ai Funghi & Trufa",
    categoria: "Pasta Fresca de Autor",
    tagline: "Fettuccine fresco hecho a mano con salteado de champiñones portobello, mantequilla aromatizada y toque de trufa.",
    precio: "$10.50",
    tiempo: "14 min",
    calificacion: "4.8 ★ (Gourmet)",
    badge: "Chef's Special",
    imagen: "/images/pasta.jpg",
    ingredientes: ["Fettuccine al dente", "Portobello", "Aceite de trufa", "Vino blanco"],
    colorAccent: "#2e7d32",
  },
  {
    id: "italo-lojana",
    nombre: "Pizza Ítalo-Lojana",
    categoria: "Especialidad Fusión",
    tagline: "Chorizo lojano artesanal, cebolla morada marinada, pimientos asados y doble queso mozzarella sobre masa crujiente.",
    precio: "$11.00",
    tiempo: "12 min",
    calificacion: "4.9 ★ (Orgullo Lojano)",
    badge: "Sabor de Nuestra Tierra",
    imagen: "/images/hero-pizza.jpg",
    ingredientes: ["Chorizo de Loja", "Cebolla morada", "Doble mozzarella", "Horno a leña"],
    colorAccent: "#c62828",
  },
];

const liveTickerNotifications = [
  "🔥 Horno de leña encendido a 450°C en Loja",
  "🍕 Saliendo del horno: 1x Pizza Margherita Familiar",
  "🛵 Envíos a domicilio activos en toda la ciudad",
  "🍝 Preparando pasta fresca artesanal para hoy",
  "⭐️ Calificación 4.9/5 con más de 2,400 comensales felices",
];

const menuPreview = [
  {
    category: "Pizzas a la Leña",
    items: [
      { name: "Margherita", detail: "Mozzarella · albahaca · tomate", price: "$8.50" },
      { name: "Pepperoni Speciale", detail: "Pepperoni · extra mozzarella", price: "$9.50" },
      { name: "Quattro Formaggi", detail: "Mozzarella · gorgonzola · parmesano · gouda", price: "$11.50" },
    ],
  },
  {
    category: "Pastas Artesanales",
    items: [
      { name: "Lasaña Roma", detail: "Carne braseada · bechamel · gratinada", price: "$9.90" },
      { name: "Fettuccine Alfredo", detail: "Crema de leche · pollo grillado", price: "$8.90" },
      { name: "Spaghetti Bolognese", detail: "Salsa bolognesa artesanal", price: "$8.50" },
    ],
  },
];

export default function HomeClient({ initialPlatos = [] }: HomeClientProps) {
  // Convertir platos de la base de datos a formato de heroDishes o usar fallback
  const heroDishes =
    initialPlatos && initialPlatos.length > 0
      ? initialPlatos.map((p, index) => ({
          id: String(p.id),
          nombre: p.nombre,
          categoria: p.categoria?.nombre ? `Especialidad ${p.categoria.nombre}` : "Horno de Leña",
          tagline: p.descripcion || "Elaborado con masa madurada 48h e ingredientes frescos seleccionados.",
          precio: `$${Number(p.precio).toFixed(2)}`,
          tiempo: index % 2 === 0 ? "12 min" : "15 min",
          calificacion: "4.9 ★",
          badge: index === 0 ? "Más Pedido" : index === 1 ? "Especialidad" : "Receta de Casa",
          imagen: p.imagenUrl || (index % 2 === 0 ? "/images/hero-pizza.jpg" : "/images/lasagna.jpg"),
          ingredientes: ["Masa 48h", "Queso mozzarella", "Horno a leña"],
          colorAccent: index === 0 ? "#c62828" : index === 1 ? "#c9a84c" : "#2e7d32",
        }))
      : fallbackHeroDishes;

  const [selectedDishIndex, setSelectedDishIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);

  const currentDish = heroDishes[selectedDishIndex] || heroDishes[0];

  // Auto-rotación del plato cada 5 segundos
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setSelectedDishIndex((prev) => (prev + 1) % heroDishes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroDishes.length]);

  // Rotación del ticker de actividad cada 3.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveTickerNotifications.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          1 · HERO SPOTLIGHT CINEMATOGRÁFICO CON MOVIMIENTO VIVO
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[96vh] pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden grain-overlay flex items-center">
        {/* Animated Floating Embers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute left-[15%] bottom-10 w-2 h-2 rounded-full bg-[#e53935] blur-[1px] opacity-80" style={{ animation: "floatEmber 6s ease-in-out infinite" }} />
          <div className="absolute left-[25%] bottom-5 w-3 h-3 rounded-full bg-[#c9a84c] blur-[1px] opacity-70" style={{ animation: "floatEmber 8s ease-in-out infinite 1.5s" }} />
          <div className="absolute left-[45%] bottom-16 w-2.5 h-2.5 rounded-full bg-[#e53935] blur-[1px] opacity-60" style={{ animation: "floatEmber 7s ease-in-out infinite 3s" }} />
          <div className="absolute right-[20%] bottom-8 w-2 h-2 rounded-full bg-[#c9a84c] blur-[1px] opacity-75" style={{ animation: "floatEmber 6.5s ease-in-out infinite 0.8s" }} />
          <div className="absolute right-[35%] bottom-12 w-3.5 h-3.5 rounded-full bg-[#e53935] blur-[1px] opacity-60" style={{ animation: "floatEmber 9s ease-in-out infinite 2.2s" }} />
        </div>

        {/* Ambient backdrops */}
        <div className="absolute top-1/4 left-10 w-[550px] h-[550px] bg-[#c62828]/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#2e7d32]/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#c9a84c]/[0.08] rounded-full blur-[180px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Columna Izquierda */}
            <div className="lg:col-span-6 space-y-7 animate-fadeInUp">
              
              {/* Ticker de Actividad en Vivo */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-[#c9a84c]/30 shadow-lg group">
                <div className="flex h-3.5 w-6 rounded-[3px] overflow-hidden shadow-inner shrink-0">
                  <span className="w-1/3 bg-[#2e7d32]" />
                  <span className="w-1/3 bg-[#ffffff]" />
                  <span className="w-1/3 bg-[#c62828]" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-[#c9a84c] transition-all duration-500">
                  {liveTickerNotifications[tickerIndex]}
                </span>
              </div>

              {/* Titular Principal */}
              <div className="space-y-2">
                <span className="block font-script text-3xl sm:text-4xl lg:text-5xl text-[#c9a84c] animate-float" style={{ animationDuration: "6s" }}>
                  Benvenuti a Roma
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl lg:text-6xl font-extrabold text-[#f5f0e8] leading-[1.08] tracking-tight">
                  La mesa a la que <br />
                  <span className="text-[#c62828] relative inline-block">
                    siempre
                    <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#2e7d32] via-[#ffffff] to-[#c62828] rounded-full" />
                  </span>{" "}
                  quieres{" "}
                  <span className="italic text-[#c9a84c]">
                    volver.
                  </span>
                </h1>
              </div>

              {/* Párrafo descriptivo */}
              <p className="text-sm sm:text-base text-[#8a8078] leading-relaxed max-w-xl">
                25 años encendiendo la leña cada día en Loja. Masa madurada durante 48 horas, ingredientes italianos selectos y la calidez de nuestra casa para recibir a tu familia.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href={`https://wa.me/593987670140?text=Hola%20Roma%20Pizzeria,%20quisiera%20pedir:%20${encodeURIComponent(currentDish.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#c62828] to-[#e53935] text-white text-[13px] font-semibold uppercase tracking-widest rounded-full shadow-[0_0_35px_-4px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_-2px_rgba(220,38,38,0.8)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                  <span>Pedir {currentDish.nombre.split(" ")[0]} ({currentDish.precio})</span>
                </a>

                <Link
                  href="/reserva"
                  className="inline-flex items-center gap-2 px-7 py-4 text-[13px] font-semibold uppercase tracking-widest text-[#f5f0e8] border border-[#c9a84c]/40 rounded-full hover:border-[#c9a84c] hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Reservar Mesa
                </Link>
              </div>

              {/* Métricas y Estado */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-6 text-xs text-[#8a8078]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] animate-pulse" />
                  <span className="text-[#f5f0e8] font-medium">Abierto hoy:</span> 11:00 AM – 8:30 PM
                </div>
                <div className="hidden sm:block text-white/20">•</div>
                <div className="flex items-center gap-1.5 text-[#c9a84c]">
                  <span>★ 4.9 en Loja</span>
                  <span className="text-[#8a8078]">(+2,400 opiniones)</span>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Spotlight Interactivo */}
            <div className="lg:col-span-6 relative">
              
              {/* Sello Circular Giratorio */}
              <div className="absolute -top-8 -right-6 z-20 hidden sm:block">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full animate-spin-slow text-[#c9a84c]" viewBox="0 0 100 100">
                    <path
                      id="circlePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="transparent"
                    />
                    <text className="text-[9.5px] uppercase tracking-[2.8px] font-semibold fill-current">
                      <textPath href="#circlePath">
                        • ROMA PIZZERÍA • 25 AÑOS LOJA •
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute w-12 h-12 rounded-full glass border border-[#c9a84c]/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">🔥</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta del plato */}
              <div className="relative rounded-3xl overflow-hidden bg-[#141210] border border-white/[0.08] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.85)] card-lift group">
                
                {/* Barra de progreso */}
                <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-30 overflow-hidden">
                  <div
                    key={selectedDishIndex}
                    className="h-full bg-gradient-to-r from-[#2e7d32] via-[#c9a84c] to-[#c62828]"
                    style={{
                      width: "100%",
                      animation: isAutoPlaying ? "shimmer 5s linear infinite" : "none",
                    }}
                  />
                </div>

                {/* Imagen del plato */}
                <div className="relative h-[340px] sm:h-[420px] w-full overflow-hidden">
                  <Image
                    key={currentDish.id}
                    src={currentDish.imagen}
                    alt={currentDish.nombre}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-all duration-1000 animate-fadeIn"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/30 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-5 left-5 glass px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-[#c9a84c]/40 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[#c62828] animate-ping" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
                      {currentDish.badge}
                    </span>
                  </div>

                  {/* Micro-badge */}
                  <div className="absolute bottom-6 right-5 glass px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xl hidden sm:flex items-center gap-2 animate-float">
                    <span className="text-base">♨️</span>
                    <span className="text-[11px] font-medium text-[#f5f0e8]">Horno a 450°C</span>
                  </div>

                  {/* Precio */}
                  <div className="absolute top-5 right-5 bg-[#0a0908]/95 border border-[#c9a84c] px-4 py-1.5 rounded-full shadow-2xl">
                    <span className="font-serif text-xl font-bold text-[#c9a84c]">
                      {currentDish.precio}
                    </span>
                  </div>
                </div>

                {/* Detalle */}
                <div className="p-6 sm:p-7 space-y-4 relative z-10">
                  <div className="flex justify-between items-baseline flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2e7d32]">
                        {currentDish.categoria}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f5f0e8] mt-0.5">
                        {currentDish.nombre}
                      </h3>
                    </div>
                    <span className="text-xs text-[#8a8078] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.05]">
                      ⏱️ {currentDish.tiempo}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#8a8078] leading-relaxed">
                    {currentDish.tagline}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentDish.ingredientes.map((ing) => (
                      <span
                        key={ing}
                        className="text-[11px] bg-white/[0.03] text-[#f5f0e8]/80 px-2.5 py-1 rounded-md border border-white/[0.06]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selector de Platos */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-2 bg-[#141210]/95 backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-xl">
                <div className="flex flex-wrap items-center gap-1.5 flex-1">
                  {heroDishes.map((dish, idx) => (
                    <button
                      key={dish.id}
                      onClick={() => {
                        setSelectedDishIndex(idx);
                        setIsAutoPlaying(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                        selectedDishIndex === idx
                          ? "bg-gradient-to-r from-[#c62828] to-[#e53935] text-white shadow-md shadow-[#c62828]/50"
                          : "bg-white/[0.03] text-[#8a8078] hover:text-[#f5f0e8] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>{idx === 0 ? "🍕" : idx === 1 ? "🍝" : idx === 2 ? "🍄" : "🔥"}</span>
                      <span>{dish.nombre.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  title={isAutoPlaying ? "Pausar rotación" : "Activar rotación automática"}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] text-[#8a8078] hover:text-[#c9a84c] transition-colors"
                >
                  {isAutoPlaying ? "⏸ Auto" : "▶ Play"}
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          2 · INTRO
          ═══════════════════════════════════ */}
      <section className="relative bg-[#0a0908] py-28 lg:py-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          <div className="lg:col-span-5 relative h-[420px] sm:h-[500px]">
            <div className="absolute inset-y-0 left-0 w-[65%] rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl animate-slideInLeft">
              <Image
                src="/images/chef-oven.jpg"
                alt="Maestro pizzero en el horno de leña"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-[50%] h-[55%] rounded-2xl overflow-hidden border border-[#c9a84c]/20 shadow-2xl animate-slideInRight delay-200">
              <Image
                src="/images/lasagna.jpg"
                alt="Lasaña artesanal"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute top-6 right-8 glass rounded-2xl px-5 py-4 text-center animate-float animate-scaleIn delay-400 shadow-xl">
              <span className="block font-serif text-3xl font-bold text-shimmer leading-none">25</span>
              <span className="block text-[9px] uppercase tracking-[0.15em] text-[#8a8078] mt-1">
                Años en Loja
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-12 space-y-6">
            <div className="ornament-divider justify-start">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
                Nuestra Historia
              </span>
            </div>

            <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-[#f5f0e8] leading-[1.15]">
              Donde la tradición italiana <br className="hidden sm:block" />
              se encuentra con el <span className="text-[#2e7d32]">sabor lojano</span>
            </h2>

            <p className="text-[15px] text-[#8a8078] leading-[1.8] max-w-lg">
              En el año 2001, Roma Restaurante Pizzería encendió por primera vez
              las brasas de su horno en la ciudad de Loja. Desde entonces, cada
              pizza, cada pasta y cada lasaña que sale de nuestra cocina lleva
              consigo el respeto por la técnica centenaria italiana y el cariño
              de servir a nuestros vecinos como familia.
            </p>

            <div className="flex gap-10 pt-2">
              <div>
                <span className="block font-serif text-3xl font-bold text-[#c62828]">100%</span>
                <span className="block text-[11px] text-[#8a8078] mt-1">Horno de leña</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-[#c9a84c]">48h</span>
                <span className="block text-[11px] text-[#8a8078] mt-1">Fermentación de masa</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-[#2e7d32]">Local</span>
                <span className="block text-[11px] text-[#8a8078] mt-1">Ingredientes lojanos</span>
              </div>
            </div>

            <Link
              href="/nosotros"
              className="group inline-flex items-center gap-2 text-[13px] font-semibold text-[#c9a84c] hover:text-[#e8d48b] transition-colors pt-2"
            >
              Leer nuestra historia completa
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          3 · ESPECIALES DEL DÍA
          ═══════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 bg-dark-texture overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center space-y-3 mb-20">
            <div className="ornament-divider">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
                Especiales del Día
              </span>
            </div>
            <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-[#f5f0e8]">
              Lo que más piden nuestros comensales
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {heroDishes.slice(0, 3).map((dish, i) => (
              <div
                key={dish.id}
                className={`card-lift group relative rounded-2xl overflow-hidden bg-[#141210] border border-white/[0.04] ${
                  i === 1 ? "md:-mt-6" : ""
                }`}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={dish.imagen}
                    alt={dish.nombre}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/20 to-transparent" />
                  <div className="absolute top-4 right-4 glass rounded-full px-3.5 py-1.5 text-[12px] font-serif font-bold text-[#c9a84c]">
                    {dish.precio}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors duration-300">
                    {dish.nombre}
                  </h3>
                  <p className="text-[13px] text-[#8a8078] leading-relaxed">
                    {dish.tagline}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <Link
                    href={`/menu#${dish.id}`}
                    className="flex items-center justify-between text-[12px] font-semibold text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors group/link"
                  >
                    <span>Ver en la carta</span>
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          4 · MENU PREVIEW
          ═══════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 bg-[#0a0908] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
              <div className="ornament-divider justify-start">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
                  Nuestra Carta
                </span>
              </div>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-[#f5f0e8] leading-[1.15]">
                Descubre lo que <br className="hidden sm:block" />
                <span className="text-[#c9a84c] italic">preparamos para ti</span>
              </h2>
              <p className="text-[15px] text-[#8a8078] leading-[1.8]">
                Cada plato sale de nuestro horno de leña y de las manos de nuestros maestros.
                Ingredientes frescos, recetas con alma y una presentación que honra la tradición.
              </p>
              <Link
                href="/app/menu"
                className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#c62828] text-[#f5f0e8] text-[13px] font-semibold uppercase tracking-widest rounded-full hover:bg-[#e53935] transition-all duration-300 shadow-[0_0_30px_-6px_rgba(198,40,40,0.25)]"
              >
                Ver carta completa
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="lg:col-span-7 space-y-12">
              {menuPreview.map((section) => (
                <div key={section.category}>
                  <h3 className="font-serif text-lg font-semibold text-[#c9a84c] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-[#c9a84c]/40" />
                    {section.category}
                  </h3>
                  <div className="space-y-0">
                    {section.items.map((item) => (
                      <div
                        key={item.name}
                        className="group flex items-baseline justify-between py-5 border-b border-white/[0.04] hover:border-[#c9a84c]/20 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="font-serif text-base font-semibold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors duration-300">
                            {item.name}
                          </span>
                          <span className="block text-[12px] text-[#8a8078]">
                            {item.detail}
                          </span>
                        </div>
                        <span className="flex-1 mx-4 border-b border-dotted border-white/[0.06] translate-y-[-4px]" />
                        <span className="font-serif text-lg font-bold text-[#c9a84c] shrink-0">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          5 · CTA BANNER
          ═══════════════════════════════════ */}
      <section className="relative py-32 sm:py-40 overflow-hidden grain-overlay">
        <div className="absolute inset-0">
          <Image
            src="/images/chef-oven.jpg"
            alt="Horno de leña Roma"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[#0a0908]/75 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center space-y-6">
          <span className="font-script text-[clamp(2rem,5vw,3.5rem)] text-[#c9a84c] leading-none">
            Tu mesa te espera
          </span>
          <h2 className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-[#f5f0e8] leading-tight">
            Reserva tu experiencia en Roma <br className="hidden sm:block" />
            o pide directamente a tu puerta
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-[#f5f0e8]/70 pt-2">
            <span className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <svg className="w-3.5 h-3.5 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lun – Sáb · 11 am – 8:30 pm
            </span>
            <span className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <svg className="w-3.5 h-3.5 text-[#2e7d32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              098 767 0140
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/reserva"
              className="w-full sm:w-auto px-8 py-4 bg-[#c9a84c] text-[#0a0908] text-[13px] font-semibold uppercase tracking-widest rounded-full hover:bg-[#e8d48b] transition-all duration-300 shadow-[0_0_30px_-6px_rgba(201,168,76,0.35)] text-center"
            >
              Reservar mesa online
            </Link>
            <a
              href="https://wa.me/593987670140?text=Hola%20Roma,%20quisiera%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#2e7d32] text-white text-[13px] font-semibold uppercase tracking-widest rounded-full hover:bg-[#388e3c] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
