import { db } from "./index";
import { sql } from "drizzle-orm";

async function migratePlatosImagenUrl() {
  console.log("Migrando platos.imagen_url a LONGTEXT...");
  
  try {
    await db.execute(sql`ALTER TABLE platos MODIFY COLUMN imagen_url LONGTEXT`);
    console.log("✅ platos.imagen_url migrado a LONGTEXT exitosamente.");
  } catch (error: any) {
    if (error.message?.includes("LONGTEXT")) {
      console.log("⚠️ La columna ya es LONGTEXT, nada que hacer.");
    } else {
      console.error("❌ Error migrando platos.imagen_url:", error);
    }
  }
  
  process.exit(0);
}

migratePlatosImagenUrl();
