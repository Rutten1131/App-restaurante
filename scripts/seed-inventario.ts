import "dotenv/config";
import { db } from "../src/db";
import { insumos, recetaInsumos, movimientosInventario, platos } from "../src/db/schema";
import { eq } from "drizzle-orm";

interface InsumoSeed {
  nombre: string;
  unidad: string;
  stockActual: string;
  stockMinimo: string;
}

const INSUMOS_ROMA: InsumoSeed[] = [
  { nombre: "Queso Mozzarella Fior di Latte", unidad: "kg", stockActual: "25.00", stockMinimo: "5.00" },
  { nombre: "Harina de Trigo Especial 00", unidad: "kg", stockActual: "50.00", stockMinimo: "10.00" },
  { nombre: "Salsa de Tomate San Marzano", unidad: "litros", stockActual: "30.00", stockMinimo: "6.00" },
  { nombre: "Pepperoni / Salami Italiano", unidad: "kg", stockActual: "8.00", stockMinimo: "2.00" },
  { nombre: "Jamón Serrano & Prosciutto", unidad: "kg", stockActual: "6.00", stockMinimo: "1.50" },
  { nombre: "Camarones & Mariscos Mixtos", unidad: "kg", stockActual: "12.00", stockMinimo: "3.00" },
  { nombre: "Spaghetti de Trigo Duro", unidad: "kg", stockActual: "15.00", stockMinimo: "3.00" },
  { nombre: "Láminas de Pasta Fresca", unidad: "kg", stockActual: "10.00", stockMinimo: "2.50" },
  { nombre: "Queso Parmesano Reggiano", unidad: "kg", stockActual: "5.00", stockMinimo: "1.00" },
  { nombre: "Aceite de Oliva Extra Virgen", unidad: "litros", stockActual: "12.00", stockMinimo: "2.00" },
  { nombre: "Pan Artesanal Ciabatta", unidad: "unidades", stockActual: "40.00", stockMinimo: "10.00" },
  { nombre: "Café Arábica de Altura (Loja)", unidad: "kg", stockActual: "6.00", stockMinimo: "1.00" },
  { nombre: "Vino Tinto Selección Roma", unidad: "botellas", stockActual: "18.00", stockMinimo: "4.00" },
  { nombre: "Cervezas (Club / Pilsener / Artesanal)", unidad: "unidades", stockActual: "48.00", stockMinimo: "12.00" },
  { nombre: "Gaseosas (Coca-Cola / Sprite / Fanta)", unidad: "unidades", stockActual: "60.00", stockMinimo: "15.00" },
  { nombre: "Cajas de Pizza Térmicas", unidad: "unidades", stockActual: "100.00", stockMinimo: "20.00" },
];

async function seedInventario() {
  console.log("🌱 Iniciando seed de inventario de Roma Restaurante Pizzería...");

  const insumosMap = new Map<string, number>();

  for (const ins of INSUMOS_ROMA) {
    const existing = await db
      .select()
      .from(insumos)
      .where(eq(insumos.nombre, ins.nombre))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ✓ Insumo existente: "${ins.nombre}" (ID: ${existing[0].id})`);
      insumosMap.set(ins.nombre, existing[0].id);
    } else {
      const [inserted] = await db.insert(insumos).values({
        nombre: ins.nombre,
        unidad: ins.unidad,
        stockActual: ins.stockActual,
        stockMinimo: ins.stockMinimo,
      });

      console.log(`  + Insertado: "${ins.nombre}" (${ins.stockActual} ${ins.unidad})`);
      insumosMap.set(ins.nombre, inserted.insertId);

      // Registrar movimiento inicial de entrada
      await db.insert(movimientosInventario).values({
        insumoId: inserted.insertId,
        tipo: "entrada",
        cantidad: ins.stockActual,
      });
    }
  }

  // Vincular recetas de ejemplo a platos existentes
  console.log("\n🍕 Vinculando insumos a recetas de platos principales...");
  const todosLosPlatos = await db.select().from(platos);

  const harinaId = insumosMap.get("Harina de Trigo Especial 00");
  const mozzarellaId = insumosMap.get("Queso Mozzarella Fior di Latte");
  const salsaId = insumosMap.get("Salsa de Tomate San Marzano");
  const pepperoniId = insumosMap.get("Pepperoni / Salami Italiano");
  const spaghettiId = insumosMap.get("Spaghetti de Trigo Duro");
  const lasagnaId = insumosMap.get("Láminas de Pasta Fresca");
  const paninoId = insumosMap.get("Pan Artesanal Ciabatta");

  for (const p of todosLosPlatos) {
    const nombreLower = p.nombre.toLowerCase();

    // Receta para Pizzas
    if (nombreLower.includes("pizza") || nombreLower.includes("romana") || nombreLower.includes("margarita") || nombreLower.includes("pepperoni") || nombreLower.includes("hawaiana")) {
      if (harinaId && mozzarellaId && salsaId) {
        await db.insert(recetaInsumos).values([
          { platoId: p.id, insumoId: harinaId, cantidadUsada: "0.25" },
          { platoId: p.id, insumoId: mozzarellaId, cantidadUsada: "0.18" },
          { platoId: p.id, insumoId: salsaId, cantidadUsada: "0.12" },
        ]).catch(() => {});
      }
      if (nombreLower.includes("pepperoni") && pepperoniId) {
        await db.insert(recetaInsumos).values({
          platoId: p.id,
          insumoId: pepperoniId,
          cantidadUsada: "0.08",
        }).catch(() => {});
      }
    }

    // Receta para Spaghettis
    if (nombreLower.includes("spaghetti") && spaghettiId && salsaId) {
      await db.insert(recetaInsumos).values([
        { platoId: p.id, insumoId: spaghettiId, cantidadUsada: "0.18" },
        { platoId: p.id, insumoId: salsaId, cantidadUsada: "0.15" },
      ]).catch(() => {});
    }

    // Receta para Lasagnas
    if (nombreLower.includes("lasagna") && lasagnaId && mozzarellaId && salsaId) {
      await db.insert(recetaInsumos).values([
        { platoId: p.id, insumoId: lasagnaId, cantidadUsada: "0.20" },
        { platoId: p.id, insumoId: mozzarellaId, cantidadUsada: "0.15" },
        { platoId: p.id, insumoId: salsaId, cantidadUsada: "0.15" },
      ]).catch(() => {});
    }

    // Receta para Paninos
    if (nombreLower.includes("panino") && paninoId && mozzarellaId) {
      await db.insert(recetaInsumos).values([
        { platoId: p.id, insumoId: paninoId, cantidadUsada: "1.00" },
        { platoId: p.id, insumoId: mozzarellaId, cantidadUsada: "0.10" },
      ]).catch(() => {});
    }
  }

  console.log("✅ Seed de inventario y recetas completado exitosamente.");
  process.exit(0);
}

seedInventario().catch((err) => {
  console.error("❌ Error en seed de inventario:", err);
  process.exit(1);
});
