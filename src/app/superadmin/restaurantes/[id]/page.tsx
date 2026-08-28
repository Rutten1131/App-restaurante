import { getRestaurantePorId, getUsuarioAdminPorRestaurante } from "@/db/queries/restaurantes";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditarRestauranteForm from "./EditarRestauranteForm";

export const dynamic = "force-dynamic";

export default async function EditarRestaurantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const [restaurante, adminUser] = await Promise.all([
    getRestaurantePorId(numId),
    getUsuarioAdminPorRestaurante(numId),
  ]);

  if (!restaurante) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/superadmin/restaurantes"
          className="text-xs text-[#8a8078] hover:text-white"
        >
          ← Volver a Restaurantes
        </Link>
        <Link
          href={`/r/${restaurante.slug}`}
          target="_blank"
          className="text-xs text-[#c9a84c] hover:underline font-mono"
        >
          Visitar Web Pública /r/{restaurante.slug} ↗
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Configurar: {restaurante.nombre}
          </h1>
          <p className="text-xs text-[#8a8078]">
            Edita colores, identidad de marca, contacto y parámetros fiscales para este restaurante.
          </p>
        </div>
      </div>

      <EditarRestauranteForm restaurante={restaurante} adminUser={adminUser} />
    </div>
  );
}
