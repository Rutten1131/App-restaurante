"use client";

import { useState, useTransition } from "react";
import { importarMenuMasivoAction } from "@/app/superadmin/actions";

interface MenuBulkImporterModalProps {
  restauranteId: number;
  restauranteNombre: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EJEMPLO_TEXTO = `[Pizzas Artesanales]
Pizza Margarita Especial | 11.50 | Salsa pomodoro, mozzarella di bufala y albahaca fresca | /images/hero-pizza.jpg
Pizza Cuatro Quesos | 13.00 | Mozzarella, gorgonzola, parmesano y ricotta | /images/hero-pizza.jpg
Pizza Pepperoni Clásica | 12.50 | Doble pepperoni americano y orégano seco

[Pastas & Tradición]
Lasagna Bolognese al Horno | 12.00 | Capas de pasta artesanal con ragú de carne y bechamel
Spaghetti Carbonara | 11.00 | Guanciale crujiente, yema de huevo y pecorino romano

[Bebidas & Postres]
Tiramisú Tradicional | 5.50 | Mascarpone, café espresso y cacao amargo
Limonada Imperial con Hierbabuena | 3.00 | Limón fresco y menta natural`;

const EJEMPLO_JSON = `[
  {
    "categoria": "Pizzas Tradicionales",
    "platos": [
      {
        "nombre": "Pizza Margarita",
        "precio": 10.50,
        "descripcion": "Salsa de tomate, mozzarella fresca y albahaca",
        "imagenUrl": "/images/hero-pizza.jpg"
      },
      {
        "nombre": "Pizza Pepperoni",
        "precio": 12.00,
        "descripcion": "Pepperoni crujiente y queso mozzarella"
      }
    ]
  },
  {
    "categoria": "Bebidas",
    "platos": [
      {
        "nombre": "Coca Cola 500ml",
        "precio": 2.00,
        "descripcion": "Bien fría"
      }
    ]
  }
]`;

export default function MenuBulkImporterModal({
  restauranteId,
  restauranteNombre,
  isOpen,
  onClose,
  onSuccess,
}: MenuBulkImporterModalProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    categoriasCreadas: number;
    platosInsertados: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleImportar = () => {
    if (!content.trim()) {
      setError("Por favor ingresa o pega el contenido del menú.");
      return;
    }

    setError(null);
    setResultado(null);

    startTransition(async () => {
      const res = await importarMenuMasivoAction(restauranteId, content);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setResultado({
          categoriasCreadas: res.categoriasCreadas || 0,
          platosInsertados: res.platosInsertados || 0,
        });
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12100e] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl animate-fadeIn relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span> Carga Rápida de Menú (Texto / JSON)
            </h3>
            <p className="text-xs text-[#8a8078]">
              Importa platos y categorías para: <strong className="text-[#c9a84c]">{restauranteNombre}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a8078] hover:text-white p-1 text-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#c62828]/20 border border-[#c62828]/40 rounded-xl text-xs text-[#ff6b6b]">
            {error}
          </div>
        )}

        {resultado && (
          <div className="p-3.5 bg-[#2e7d32]/20 border border-[#2e7d32]/40 rounded-xl text-xs text-[#81c784] space-y-1">
            <p className="font-bold">¡Importación completada con éxito!</p>
            <p>
              Se crearon <strong>{resultado.categoriasCreadas}</strong> categorías y{" "}
              <strong>{resultado.platosInsertados}</strong> platos en el menú.
            </p>
          </div>
        )}

        {/* Botones de plantillas de ejemplo */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-[#8a8078] text-[11px]">Plantillas de ejemplo:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContent(EJEMPLO_TEXTO)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[#c9a84c] border border-white/10 rounded-lg text-[11px] transition-colors"
            >
              📄 Pegar Formato Texto Simple
            </button>
            <button
              type="button"
              onClick={() => setContent(EJEMPLO_JSON)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-blue-400 border border-white/10 rounded-lg text-[11px] transition-colors"
            >
              🧩 Pegar Formato JSON
            </button>
          </div>
        </div>

        {/* Textarea para pegar */}
        <div className="space-y-1">
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Pega aquí tu lista en formato texto o JSON:\n\n[Pizzas]\nPizza Margarita | 10.50 | Mozzarella y albahaca\nPizza Pepperoni | 12.00 | Pepperoni crujiente`}
            className="w-full bg-[#080706] border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder-white/25 focus:border-[#c9a84c] focus:outline-none leading-relaxed"
          />
          <p className="text-[10px] text-[#8a8078]">
            Formato: <code>[Nombre Categoría]</code> seguido de <code>Nombre Plato | Precio | Descripción | URL Imagen (opcional)</code>
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs text-[#8a8078] hover:text-white"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleImportar}
            className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#e8d48b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? "Importando Menú..." : "Importar Platos al Menú"}
          </button>
        </div>
      </div>
    </div>
  );
}
