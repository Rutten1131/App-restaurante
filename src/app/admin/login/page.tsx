"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f0e8] flex items-center justify-center px-6 py-12 grain-overlay">
      <div className="w-full max-w-md bg-[#141210] border border-white/[0.08] rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl relative z-10 animate-fadeIn">
        {/* Logo & Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#c9a84c]/50 mx-auto shadow-lg">
            <Image
              src="/images/logo-roma.jpg"
              alt="Roma"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#d32f2f] block">
              ROMA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">
              Panel Administrativo
            </span>
          </div>
          <h1 className="font-serif text-xl font-bold text-[#f5f0e8] pt-2">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-[#8a8078]">
            Accede al sistema de gestión de menú, comandas e inventario.
          </p>
        </div>

        {/* Formulario */}
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3.5 bg-[#c62828]/15 border border-[#c62828]/30 rounded-xl text-xs text-[#e53935] text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              required
              placeholder="Roma"
              defaultValue="Roma"
              className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="admin123"
              className="w-full bg-[#0a0908] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-[#f5f0e8] placeholder-[#8a8078]/50 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-[#c62828] hover:bg-[#e53935] text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#c62828]/20 disabled:opacity-50 mt-2"
          >
            {isPending ? "Ingresando..." : "Ingresar al Panel"}
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.06] text-center space-y-2">
          <p className="text-[11px] text-[#8a8078]">
            Credenciales: <strong className="text-[#f5f0e8]">Usuario: Roma</strong> / <strong className="text-[#f5f0e8]">Contraseña: admin123</strong>
          </p>
          <div>
            <Link href="/" className="text-[11px] text-[#c9a84c] hover:underline">
              ← Volver al sitio público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
