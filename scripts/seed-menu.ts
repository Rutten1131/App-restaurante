import "dotenv/config";
import { db } from "../src/db";
import { categorias, platos } from "../src/db/schema";
import { eq } from "drizzle-orm";

interface PlatoSeed {
  nombre: string;
  descripcion: string | null;
  precio: string;
}

interface CategoriaSeed {
  nombre: string;
  orden: number;
  platos: PlatoSeed[];
}

/**
 * TODO: En un paso futuro, modelar tamaños de pizza como variantes (Junior, Mediana, Familiar, Doble Familiar)
 * con precios y descripciones diferenciadas por tamaño. Por ahora se usa el precio base.
 */
const MENU_ROMA: CategoriaSeed[] = [
  {
    nombre: "Mariscos",
    orden: 1,
    platos: [
      {
        nombre: "Ceviche Blanco",
        descripcion: "Ceviche de pescado al estilo peruano. Solo sábado y domingo.",
        precio: "9.00",
      },
      {
        nombre: "Arroz Marinero",
        descripcion: "Deliciosa combinación de mariscos seleccionados, sazonado con la mejor energía del chef. Solo sábado y domingo.",
        precio: "12.50",
      },
      {
        nombre: "Sopa de Mariscos",
        descripcion: "Solo sábado y domingo.",
        precio: "10.50",
      },
      {
        nombre: "Camarones Reventados",
        descripcion: "Solo sábado y domingo.",
        precio: "10.50",
      },
    ],
  },
  {
    nombre: "Promociones",
    orden: 2,
    platos: [
      {
        nombre: "Combo Familiar",
        descripcion: "Pizza familiar línea ideal + Pizza junior línea ideal + Cola de 1 litro.",
        precio: "16.99",
      },
      {
        nombre: "Combo Amigos",
        descripcion: "6 pizzas junior línea económica + gaseosa 2 litros.",
        precio: "25.99",
      },
      {
        nombre: "Rueda Futbolera",
        descripcion: "Exquisita pizza salame, pizza hawaiana, mini empanadas italianas, alitas crujientes, selecto camarón, papas fritas y acompañantes.",
        precio: "25.99",
      },
      {
        nombre: "Combo Ideal",
        descripcion: "1 Pizza Mediana + 1 Pizza Junior + 1 cola de litro.",
        precio: "11.75",
      },
      {
        nombre: "Combo Para Compartir",
        descripcion: "2 Pizzas medianas + Lasaña de Carne + Gaseosa de litro + Pan de ajo.",
        precio: "23.99",
      },
      {
        nombre: "Combo Para Todos",
        descripcion: "2 Pizzas medianas línea económica + spaghetti bolognese + Gaseosa de 1lt + Pan de ajo.",
        precio: "22.99",
      },
      {
        nombre: "Super Combo",
        descripcion: "3 Pizzas Medianas (Línea Económica) + Cola de 1lt.",
        precio: "19.99",
      },
      {
        nombre: "Combo Roma",
        descripcion: "Pizza familiar (línea económica) + media lasaña de carne + gaseosa de litro + pan de ajo.",
        precio: "23.99",
      },
    ],
  },
  {
    nombre: "Pizzas",
    orden: 3,
    platos: [
      {
        nombre: "Pizza Roma",
        descripcion: "Salsa de tomate, queso mozzarella, pimientos, jamón, tocino, aceituna y orégano.",
        precio: "6.40",
      },
      {
        nombre: "Pizza Salame",
        descripcion: "Salsa de tomate, queso mozzarella, salame, cebolla, y orégano.",
        precio: "6.40",
      },
      {
        nombre: "Pizza 4 Quesos",
        descripcion: "Salsa de tomate, queso mozzarella, suizo, gouda y parmesano.",
        precio: "7.00",
      },
      {
        nombre: "Pizza Vegetariana",
        descripcion: "Salsa de tomate, queso mozzarella, pimientos, coliflor, cebolla, zanahoria, champiñones, aceitunas, ajonjolí y orégano.",
        precio: "6.50",
      },
      {
        nombre: "Pizza 4 Estaciones",
        descripcion: "Salsa de tomate, queso mozzarella, jamón, champiñones, pimientos, salame y orégano.",
        precio: "6.40",
      },
      {
        nombre: "Pizza Tropical",
        descripcion: "Salsa de tomate, queso mozzarella, jamón y piña.",
        precio: "6.40",
      },
      {
        nombre: "Pizza Santa Lucía",
        descripcion: "Salsa de tomate, queso mozzarella, jamón, champiñones y orégano.",
        precio: "7.00",
      },
      {
        nombre: "Pizza Mediterránea",
        descripcion: "Salsa de tomate, queso mozzarella, camarones, perejil y orégano.",
        precio: "7.25",
      },
      {
        nombre: "Pizza Margherita",
        descripcion: "Salsa de tomate, queso mozzarella, rodajas de tomate natural, alcaparras y orégano.",
        precio: "6.10",
      },
      {
        nombre: "Pizza Putanesca",
        descripcion: "Salsa de tomate, queso mozzarella, ajo, ají, salame, tocino, alcaparras y orégano.",
        precio: "6.10",
      },
      {
        nombre: "Pizza de Pollo",
        descripcion: "Salsa de tomate, queso mozzarella, pollo cocido al vapor, queso parmesano y orégano.",
        precio: "7.25",
      },
      {
        nombre: "Pizza Siciliana",
        descripcion: "Salsa bolognesse, queso mozzarella, jamón, champiñones, pollo, salame, tocino, orégano y perejil.",
        precio: "8.00",
      },
      {
        nombre: "Pizza de Embutidos",
        descripcion: "Salsa de tomate, queso mozzarella, jamón, tocino, salame, pepperoni y orégano.",
        precio: "6.40",
      },
      {
        nombre: "Pizza de Jamón y Queso",
        descripcion: "Salsa de tomate, queso mozzarella, jamón, orégano.",
        precio: "5.75",
      },
      {
        nombre: "Pizza Pepperoni",
        descripcion: "Salsa agridulce sutilmente picante (tomate y salsa BBQ), queso mozzarella, pepperoni, ají y tomillo.",
        precio: "7.00",
      },
      {
        nombre: "Empanada Italiana (Calzone)",
        descripcion: "Salsa de tomate, queso mozzarella, aceitunas, pimientos, jamón, tocino y orégano.",
        precio: "9.50",
      },
      {
        nombre: "Rollo de Pizza",
        descripcion: "Salsa peperoni, carne de cerdo, queso mozzarella y orégano.",
        precio: "3.90",
      },
    ],
  },
  {
    nombre: "Ensaladas",
    orden: 4,
    platos: [
      {
        nombre: "Ensalada del Huerto",
        descripcion: "Pepino, tomate, cebollas, zanahorias, champiñones, vainitas, salsas (golf, tártara o vinagreta), sobre camada de lechuga.",
        precio: "6.60",
      },
      {
        nombre: "Ensalada de Pollo",
        descripcion: "Pollo, pimiento, tomate, lechuga, aceitunas, especias.",
        precio: "8.90",
      },
      {
        nombre: "Ensalada del Chef",
        descripcion: "Queso mozzarella, pollo, palmitos, champiñones, aceitunas, salame, jamón y lechuga.",
        precio: "9.90",
      },
      {
        nombre: "Ensalada Tropical",
        descripcion: "Piña, pechuga de pollo al vapor, frutilla, uvas, durazno, mayonesa, curry y crema chantilly.",
        precio: "9.80",
      },
      {
        nombre: "Ensalada de la Casa",
        descripcion: "Tomate, pimiento, champiñones, jamón, queso mozzarella, lechuga, limón, albahaca y especias.",
        precio: "8.90",
      },
      {
        nombre: "Ensalada César",
        descripcion: "Ensalada muy liviana con lechuga, tomate, queso mozzarella, crutones de pan y queso parmesano aderezada con salsa...",
        precio: "7.50",
      },
      {
        nombre: "Sopa de Cebolla",
        descripcion: "Saludable combinación de cebolla sofrita con fondo de res, aromatizada con vino tinto, hojas de laurel y pimienta en gr...",
        precio: "6.25",
      },
    ],
  },
  {
    nombre: "Paninos",
    orden: 5,
    platos: [
      {
        nombre: "Club Sandwich",
        descripcion: "Pan de molde, pollo, jamón, queso, huevo, tomate, lechuga, tocino y salsa golf.",
        precio: "9.80",
      },
      {
        nombre: "Sandwich Mixto",
        descripcion: "Pan de molde, mostaza, mantequilla, queso holandés, paletas y jamón de pierna, acompañado con papas fritas.",
        precio: "6.25",
      },
      {
        nombre: "Sandwich de Pollo",
        descripcion: "Pan molde relleno con pollo al vapor, salsa tártara, lechuga, tomate, acompañado con papas fritas.",
        precio: "7.10",
      },
      {
        nombre: "Burguer Pizza",
        descripcion: "Reducción de salsa bolognesse (carne de res y tomate), jamón, queso mozzarella, pepinillos, lechuga, tomate, piña en al...",
        precio: "6.50",
      },
      {
        nombre: "Panino Italiano",
        descripcion: "Lechuga, tomate, queso mozzarella, pollo al vapor, salame, jamón, durazno, uva, frutilla y salsa de queso.",
        precio: "9.90",
      },
      {
        nombre: "Hamburguesa Suprema",
        descripcion: "95 gr. de mezcla de carne de res y cerdo, queso mozzarella, huevo frito, tomate, lechuga, piña en almíbar y salsa golf aco...",
        precio: "7.10",
      },
      {
        nombre: "Porción de Papas Fritas",
        descripcion: "Deliciosas papas fritas acompañadas de jamón fino, ensalada y nuestras salsas.",
        precio: "3.25",
      },
    ],
  },
  {
    nombre: "Spaghettis",
    orden: 6,
    platos: [
      {
        nombre: "Spaghettis a la Diavola",
        descripcion: "Spaghetti blanco picante con aceite de oliva, ajo y ají.",
        precio: "7.50",
      },
      {
        nombre: "Spaghettis al Formaggio (Queso)",
        descripcion: "Spaghetti con cuatro tipos de queso combinados con salsa de tomate, salsa blanca, gratinados al horno.",
        precio: "10.80",
      },
      {
        nombre: "Spaghettis de Champiñones",
        descripcion: "Spaghetti con champiñones frescos con salsa de tomate y queso parmesano.",
        precio: "10.50",
      },
      {
        nombre: "Spaghettis Frutti di Mare",
        descripcion: "Spaghetti con salsa blanca de crema de leche y vino, camarón selecto, corvina, calamar, mejillones, almejas y queso. p...",
        precio: "14.50",
      },
      {
        nombre: "Spaghettis a la Carbonara",
        descripcion: "Spaghetti con salsa blanca de crema de leche, yemas de huevo, tocineta y queso parmesano.",
        precio: "10.25",
      },
      {
        nombre: "Spaghettis Siciliano",
        descripcion: "Spaghetti con camarones, salame, jamón, champiñones, pollo, aceitunas, perejil, tocino, salsa Bolognesi y queso parmes...",
        precio: "13.25",
      },
      {
        nombre: "Spaghettis Lomo Fino y Vegetales",
        descripcion: "Spaghetti con cubos de lomo fino salteado con vegetales (vainita, arveja, brócoli, zanahoria y pimiento), acompañados...",
        precio: "11.50",
      },
      {
        nombre: "Spaghettis Bolognesse",
        descripcion: "Spaghetti, más salsa roja, carne de res molida y queso parmesano.",
        precio: "8.15",
      },
      {
        nombre: "Spaghettis a la Marinera",
        descripcion: "Spaghetti, camarón selecto, salsa de tomate y queso parmesano.",
        precio: "11.90",
      },
      {
        nombre: "Spaghettis al Pesto",
        descripcion: "Con salsa verde de albahaca, perejil, nueces, aceite de oliva y queso parmesano.",
        precio: "8.15",
      },
    ],
  },
  {
    nombre: "Lasagnas",
    orden: 7,
    platos: [
      {
        nombre: "Lasagna de Carne",
        descripcion: "Exquisita combinación de pasta, carne de res, tomate, queso mozzarella, salsa blanca, queso parmesano, todo gratinado...",
        precio: "9.75",
      },
      {
        nombre: "Lasagna de Pollo",
        descripcion: "Pasta y pechuga de pollo cocido al vapor, con salsa blanca y rosada, queso mozzarella, parmesano, todo gratinado al h...",
        precio: "9.75",
      },
      {
        nombre: "Lasagna Mixta",
        descripcion: "Pasta, pollo, salsa Bolognesse, salsa rosada, salsa blanca, queso, mozzarella y parmesano, gratinado al horno.",
        precio: "11.50",
      },
      {
        nombre: "Lasagna de Camarón",
        descripcion: "Deliciosa mezcla de camarón seleccionado y fresco con pasta, salsa rosada y blanca, queso mozzarella y parmesano.",
        precio: "11.50",
      },
      {
        nombre: "Lasagna Vegetariana",
        descripcion: "Sana combinación de pasta con cebolla, zanahoria, pimiento rojo, coliflor, aceituna picada, champiñones, ajonjolí, ques...",
        precio: "9.50",
      },
      {
        nombre: "Canelones de Carne",
        descripcion: "Pasta envuelta y rellena con carne de res, pasta de tomate, queso mozzarella y cubierta con salsa blanca al horno.",
        precio: "9.75",
      },
      {
        nombre: "Canelones de Pollo",
        descripcion: "Pasta envuelta y rellena con pollo cocido al vapor, cubierta con salsa rosada y salsa blanca al horno.",
        precio: "9.75",
      },
    ],
  },
  {
    nombre: "Sugerencias del Chef",
    orden: 8,
    platos: [
      {
        nombre: "Lomo en Reducción de Vino Tinto",
        descripcion: "300gr. de lomo fino de res marinado en salsa chimichurri, cocido a la plancha, bañado en salsa de vino tinto, acompaña...",
        precio: "16.90",
      },
      {
        nombre: "Mixtura Roma",
        descripcion: "Deliciosa combinación de spaghetti carbonara, lasaña de pollo y spaghetti bolognesse.",
        precio: "12.30",
      },
      {
        nombre: "Pollo a la Plancha",
        descripcion: "Filete de pollo a la plancha acompañado con papas fritas, arroz blanco y ensalada.",
        precio: "9.30",
      },
      {
        nombre: "Milanesa de Pollo a la Napolitana",
        descripcion: "Pechuga de pollo a la plancha gratinada al horno con queso mozzarella, bañada con salsa napolitana sobre puré de pa...",
        precio: "11.25",
      },
      {
        nombre: "Pasta e Carne",
        descripcion: "Presentamos 300gr. de lomo fino de res a la plancha sobre spaghetti blanco bañado con salsa provenzale.",
        precio: "11.60",
      },
      {
        nombre: "Lomo a la Plancha",
        descripcion: "Filete de lomo fino de res a la plancha, acompañado con papas fritas, arroz blanco y ensalada.",
        precio: "11.25",
      },
      {
        nombre: "Fte. Trucha en Salsa de Mariscos",
        descripcion: "Lomo de trucha de la mejor calidad a la plancha bañada con deliciosa salsa de mariscos en vino blanco.",
        precio: "16.00",
      },
      {
        nombre: "Filet Mignon",
        descripcion: "Lomo fino de res bridado con tocino cocido a la plancha bañado con salsa de champiñones al vino tinto.",
        precio: "16.25",
      },
      {
        nombre: "Cachema Entera Frita",
        descripcion: "470 gr de peso, acompañadas con papas fritas, ensalada y arroz blanco.",
        precio: "12.00",
      },
      {
        nombre: "Cordon Bleu de Pollo",
        descripcion: "Filete de pechuga de pollo relleno con queso holandés y jamón, más salsa blanca.",
        precio: "13.00",
      },
    ],
  },
  {
    nombre: "Postres",
    orden: 9,
    platos: [
      { nombre: "Ensalada Hawaiana", descripcion: null, precio: "7.80" },
      { nombre: "Torta del Día", descripcion: null, precio: "2.75" },
      { nombre: "Helado Frito", descripcion: null, precio: "6.50" },
      { nombre: "Plato de Frutas", descripcion: null, precio: "5.50" },
      { nombre: "Copa de Helado", descripcion: null, precio: "4.75" },
      { nombre: "Brownie con Helado", descripcion: null, precio: "4.75" },
      { nombre: "Tiramisú", descripcion: null, precio: "4.50" },
      { nombre: "Crepps de Durazno", descripcion: null, precio: "6.50" },
      { nombre: "Ensalada de Frutas", descripcion: null, precio: "5.50" },
    ],
  },
  {
    nombre: "Vinos",
    orden: 10,
    platos: [
      { nombre: "Jarra de Sangría", descripcion: null, precio: "26.00" },
      { nombre: "Botella de Vino", descripcion: null, precio: "26.00" },
      { nombre: "Copa de Vino Hervido", descripcion: null, precio: "5.50" },
      { nombre: "Cuba Libre", descripcion: null, precio: "6.00" },
      { nombre: "Copa de Vino", descripcion: null, precio: "4.50" },
    ],
  },
  {
    nombre: "Bebidas Frías",
    orden: 11,
    platos: [
      { nombre: "Limonada Natural", descripcion: null, precio: "2.00" },
      { nombre: "Limonada Imperial", descripcion: null, precio: "2.30" },
      { nombre: "Horchata", descripcion: null, precio: "1.60" },
      { nombre: "Jugos", descripcion: null, precio: "2.30" },
      { nombre: "Milk Shake", descripcion: null, precio: "4.00" },
      { nombre: "Sorbetes", descripcion: null, precio: "3.75" },
      { nombre: "Té Helado", descripcion: null, precio: "1.95" },
    ],
  },
  {
    nombre: "Gaseosas",
    orden: 12,
    platos: [
      { nombre: "Gaseosa Mini", descripcion: null, precio: "0.70" },
      { nombre: "Gaseosa de 1/2 Litro", descripcion: null, precio: "1.40" },
      { nombre: "Gaseosa de 1 Litro", descripcion: null, precio: "2.25" },
      { nombre: "Gaseosa de 2 Litros", descripcion: null, precio: "2.95" },
      { nombre: "Gaseosa de 3 Litros", descripcion: null, precio: "4.50" },
      { nombre: "Agua (con gas)", descripcion: null, precio: "1.15" },
      { nombre: "Agua (sin gas)", descripcion: null, precio: "0.80" },
    ],
  },
  {
    nombre: "Cervezas",
    orden: 13,
    platos: [
      { nombre: "Cerveza Club 330cc", descripcion: null, precio: "2.00" },
      { nombre: "Cerveza Corona", descripcion: null, precio: "3.60" },
    ],
  },
  {
    nombre: "Bebidas Calientes",
    orden: 14,
    platos: [
      { nombre: "Chocolate de la Abuela", descripcion: null, precio: "4.10" },
      { nombre: "Chocolate Mashmelado", descripcion: null, precio: "3.40" },
      { nombre: "Capuccino y Mocaccino", descripcion: null, precio: "2.75" },
      { nombre: "Chocolate Gitano", descripcion: null, precio: "3.25" },
      { nombre: "Café con Leche", descripcion: null, precio: "2.00" },
      { nombre: "Café", descripcion: null, precio: "1.60" },
      { nombre: "Café Irlandés", descripcion: null, precio: "6.20" },
      { nombre: "Agua Aromática o Té", descripcion: null, precio: "1.30" },
    ],
  },
  {
    nombre: "Línea Económica",
    orden: 15,
    platos: [
      {
        nombre: "Pizza Junior",
        descripcion: "*No aplica entrega a domicilio gratis*",
        precio: "4.20",
      },
      {
        nombre: "Pizza Mediana",
        descripcion: "*No aplica entrega a domicilio gratis*",
        precio: "6.40",
      },
      {
        nombre: "Pizza Familiar",
        descripcion: "*No aplica entrega a domicilio gratis*",
        precio: "17.00",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando seed del menú COMPLETO de Roma Restaurante Pizzería (~90 platos)...");

  let totalCategorias = 0;
  let totalPlatosInsertados = 0;
  let totalPlatosActualizados = 0;

  for (const catData of MENU_ROMA) {
    // 1. Obtener o crear categoría
    let [categoriaExistente] = await db
      .select()
      .from(categorias)
      .where(eq(categorias.nombre, catData.nombre))
      .limit(1);

    let categoriaId: number;

    if (!categoriaExistente) {
      console.log(`-> Creando categoría: [${catData.orden}] ${catData.nombre}`);
      await db.insert(categorias).values({
        restauranteId: 1,
        nombre: catData.nombre,
        orden: catData.orden,
      });
      const [nueva] = await db
        .select()
        .from(categorias)
        .where(eq(categorias.nombre, catData.nombre))
        .limit(1);
      categoriaId = nueva.id;
      totalCategorias++;
    } else {
      categoriaId = categoriaExistente.id;
      // Actualizar orden si difiere
      if (categoriaExistente.orden !== catData.orden) {
        await db
          .update(categorias)
          .set({ orden: catData.orden })
          .where(eq(categorias.id, categoriaId));
      }
    }

    // 2. Insertar o actualizar platos de la categoría
    for (const p of catData.platos) {
      const [platoExistente] = await db
        .select()
        .from(platos)
        .where(eq(platos.nombre, p.nombre))
        .limit(1);

      if (!platoExistente) {
        await db.insert(platos).values({
          restauranteId: 1,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          categoriaId: categoriaId,
          imagenUrl: null,
          videoUrl: null,
          disponible: true,
        });
        totalPlatosInsertados++;
      } else {
        // Actualizar categoría, descripción y precio para sincronizar
        await db
          .update(platos)
          .set({
            categoriaId: categoriaId,
            descripcion: p.descripcion,
            precio: p.precio,
          })
          .where(eq(platos.id, platoExistente.id));
        totalPlatosActualizados++;
      }
    }
  }

  console.log("==========================================");
  console.log(`✅ Seed completado con éxito:`);
  console.log(`- 15 Categorías configuradas`);
  console.log(`- ${totalPlatosInsertados} Platos nuevos insertados`);
  console.log(`- ${totalPlatosActualizados} Platos actualizados/sincronizados`);
  console.log("==========================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error ejecutando seed-menu:", err);
  process.exit(1);
});
