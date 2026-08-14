import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Ejecutando migración DDL en MySQL...");
  const connectionUri = process.env.DATABASE_URL;

  if (!connectionUri) {
    throw new Error("DATABASE_URL no encontrada en .env");
  }

  const connection = await mysql.createConnection(connectionUri);

  try {
    const sqlPath = path.join(__dirname, "../drizzle/0000_magical_peter_quill.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    const statements = sqlContent
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err: any) {
        // Ignorar si la tabla ya existe
        if (err.code === "ER_TABLE_EXISTS_ERROR" || err.errno === 1050) {
          // ya existe
        } else if (err.code === "ER_DUP_KEYNAME" || err.errno === 1061) {
          // clave ya existe
        } else {
          console.warn("Aviso en sentencia:", err.sqlMessage || err);
        }
      }
    }

    console.log("✅ Tablas migradas exitosamente en la base de datos.");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
