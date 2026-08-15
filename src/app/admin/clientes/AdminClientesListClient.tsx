"use client";

import { useState } from "react";

interface ClienteItem {
  id: number;
  numeroCliente: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  creadoEn: Date | string;
  platFavorito?: string | null;
  pizzaPromoReclamada?: boolean | null;
}

interface AdminClientesListClientProps {
  clientes: ClienteItem[];
}

export default function AdminClientesListClient({ clientes }: AdminClientesListClientProps) {
  const [limite, setLimite] = useState(10);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.telefono && c.telefono.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      c.numeroCliente.toLowerCase().includes(q)
    );
  });

  const paginados = filtrados.slice(0, limite);

  return (
    <div className="space-y-4">
      {/* Buscador de clientes */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o código..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setLimite(10);
          }}
          className="w-full sm:w-72 bg-[#0a0908] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#f5f0e8] focus:border-[#c9a84c] focus:outline-none"
        />

        <span className="text-xs text-[#8a8078] shrink-0">
          Mostrando {Math.min(limite, filtrados.length)} de {clientes.length}
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-[#8a8078] text-xs">
          No se encontraron clientes con el criterio de búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#8a8078] uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2">Código</th>
                <th className="pb-3 px-2">Nombre</th>
                <th className="pb-3 px-2">Contacto</th>
                <th className="pb-3 px-2">Fecha Registro</th>
                <th className="pb-3 px-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginados.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-2 font-mono text-[#c9a84c]">
                    {c.numeroCliente}
                  </td>
                  <td className="py-3 px-2 font-semibold text-[#f5f0e8]">
                    <div>{c.nombre}</div>
                    {c.platFavorito && (
                      <div className="text-[10px] text-[#c9a84c] font-normal mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-[#c9a84c]/15 rounded border border-[#c9a84c]/30 font-medium">
                          Favorito: {c.platFavorito}
                        </span>
                        {c.pizzaPromoReclamada && (
                          <span className="text-emerald-400 font-semibold">• Promo activa</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-[#8a8078]">
                    <div>{c.telefono || "Sin teléfono"}</div>
                    {c.email && <div className="text-[11px] text-white/40">{c.email}</div>}
                  </td>
                  <td className="py-3 px-2 text-[#8a8078]" suppressHydrationWarning>
                    {new Date(c.creadoEn).toLocaleDateString("es-EC")}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {c.telefono ? (
                      <a
                        href={`https://wa.me/593${c.telefono.replace(/^0/, "")}?text=${encodeURIComponent(`¡Hola ${c.nombre}! Te saludamos de Roma Pizzería 🍕`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition-colors text-[11px] font-semibold inline-block"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-white/20 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón Ver más clientes */}
      {filtrados.length > limite && (
        <div className="pt-4 flex items-center justify-between border-t border-white/[0.06]">
          <span className="text-xs text-[#8a8078]">
            Viendo {limite} de {filtrados.length} clientes
          </span>
          <button
            type="button"
            onClick={() => setLimite((prev) => prev + 10)}
            className="px-5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[#c9a84c] border border-[#c9a84c]/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Ver más clientes (+10) ↓
          </button>
        </div>
      )}
    </div>
  );
}
