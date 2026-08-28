"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginSuperAdminAction } from "./actions";

export default function SuperAdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginSuperAdminAction, null);

  return (
    <div className="min-h-screen bg-[#060504] text-[#f5f0e8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#c62828]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#12100e] border border-[#c9a84c]/30 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl shadow-black/80 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#9c7827] flex items-center justify-center text-black font-extrabold text-2xl mx-auto shadow-lg shadow-[#c9a84c]/30">
            ⚡
          </div>
          <div>
            <span className="font-serif text-2xl font-black tracking-tight text-white block">
              PLATAFORMA SAAS
            </span>
            <span className="text-[11px] uppercase tracking-widest text-[#c9a84c] font-bold">
              Acceso Super Administrador
            </span>
          </div>
          <p className="text-xs text-[#8a8078]">
            Ingresa para gestionar todos los perfiles de restaurantes, menús y configuraciones globales.
          </p>
        </div>

        {/* Formulario */}
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3.5 bg-[#c62828]/15 border border-[#c62828]/40 rounded-xl text-xs text-[#ff6b6b] text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
              Usuario o Correo SuperAdmin
            </label>
            <input
              type="text"
              name="usuario"
              required
              placeholder="superadmin"
              defaultValue="superadmin"
              className="w-full bg-[#080706] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-[#8a8078]/50 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a84c]">
              Contraseña Maestra
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="superadmin123"
              defaultValue="superadmin123"
              className="w-full bg-[#080706] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-[#8a8078]/50 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-[#c9a84c] hover:bg-[#e8d48b] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-50 mt-2"
          >
            {isPending ? "Validando acceso..." : "Entrar a Plataforma SaaS"}
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.08] text-center space-y-2">
          <p className="text-[11px] text-[#8a8078]">
            Credenciales de prueba: <strong className="text-white">superadmin</strong> / <strong className="text-white">superadmin123</strong>
          </p>
          <div>
            <Link href="/admin/login" className="text-[11px] text-[#c9a84c] hover:underline">
              → Ir a Login de Restaurante Individual (/admin)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
