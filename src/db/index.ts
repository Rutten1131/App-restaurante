import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionUri = process.env.DATABASE_URL;

if (!connectionUri) {
  throw new Error("Falta DATABASE_URL en el archivo .env");
}

/**
 * Configuración resiliente del pool de conexiones para evitar ECONNRESET
 * con bases de datos MySQL/MariaDB remotas.
 */
function createPool() {
  return mysql.createPool({
    uri: connectionUri,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 0, // No mantener conexiones ociosas muertas en memoria
    idleTimeout: 10000, // Reciclar tras 10 segundos de inactividad
    enableKeepAlive: true,
    keepAliveInitialDelay: 5000,
    connectTimeout: 20000,
  });
}

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
