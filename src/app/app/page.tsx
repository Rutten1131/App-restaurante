import Link from "next/link";

export default function AppHome() {
  return (
    <div className="min-h-screen bg-farina text-crosta flex flex-col items-center justify-center px-6 text-center gap-6">
      <span className="font-display italic text-3xl text-salsa">Roma</span>
      <h1 className="font-display italic text-2xl max-w-sm">
        Escaneaste el código de tu mesa. Elige qué necesitas:
      </h1>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/app/mesa"
          className="rounded-full bg-salsa text-farina-soft px-6 py-3.5 font-semibold hover:bg-salsa-dark transition-colors"
        >
          Ver menú y pedir
        </Link>
      </div>
      <p className="text-xs text-crosta/50 max-w-xs">
        Nota de desarrollo: esta es la base de /app. Aquí se construyen el
        menú digital por mesa, el registro de fidelización y la cola de
        cocina/caja (Paso 4 y 5 del plan).
      </p>
    </div>
  );
}
