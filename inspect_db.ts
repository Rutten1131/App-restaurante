import { db } from "./src/db";
import { restaurantes, platos, insumos, recetaInsumos, usuariosAdmin } from "./src/db/schema";

async function inspect() {
  const rests = await db.select().from(restaurantes);
  console.log("Restaurantes:", rests);

  const users = await db.select().from(usuariosAdmin);
  console.log("Usuarios Admin:", users.map(u => ({ id: u.id, email: u.email, rol: u.rol, restauranteId: u.restauranteId })));

  const allPlatos = await db.select().from(platos);
  console.log("Total Platos en BD:", allPlatos.length, allPlatos.map(p => ({ id: p.id, nombre: p.nombre, restId: p.restauranteId })));

  const allInsumos = await db.select().from(insumos);
  console.log("Total Insumos en BD:", allInsumos.length, allInsumos.map(i => ({ id: i.id, nombre: i.nombre, restId: i.restauranteId })));

  process.exit(0);
}

inspect();
