import "dotenv/config";
import mysql from "mysql2/promise";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function migrateSaas() {
  const connectionUri = process.env.DATABASE_URL;
  if (!connectionUri) {
    throw new Error("Falta DATABASE_URL en .env");
  }

  const connection = await mysql.createConnection(connectionUri);
  console.log("Conectado a la base de datos MySQL...");

  try {
    // 1. Crear tabla restaurantes
    console.log("1. Creando o verificando tabla `restaurantes`...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`restaurantes\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`slug\` varchar(80) NOT NULL UNIQUE,
        \`nombre\` varchar(200) NOT NULL,
        \`nombre_comercial\` varchar(200) DEFAULT NULL,
        \`descripcion\` text DEFAULT NULL,
        \`logo_url\` varchar(500) DEFAULT '/images/logo-roma.jpg',
        \`hero_image_url\` varchar(500) DEFAULT '/images/hero-pizza.jpg',
        \`color_primario\` varchar(20) DEFAULT '#c9a84c',
        \`color_fondo\` varchar(20) DEFAULT '#0a0908',
        \`telefono\` varchar(30) DEFAULT NULL,
        \`email\` varchar(150) DEFAULT NULL,
        \`direccion\` text DEFAULT NULL,
        \`ciudad\` varchar(100) DEFAULT 'Loja',
        \`pais\` varchar(50) DEFAULT 'Ecuador',
        \`whatsapp\` varchar(30) DEFAULT NULL,
        \`horario\` text DEFAULT NULL,
        \`redes_sociales\` text DEFAULT NULL,
        \`sri_ruc\` varchar(20) DEFAULT NULL,
        \`sri_razon_social\` varchar(200) DEFAULT NULL,
        \`sri_establecimiento\` varchar(5) DEFAULT '001',
        \`sri_punto_emision\` varchar(5) DEFAULT '001',
        \`sri_dir_matriz\` text DEFAULT NULL,
        \`activo\` tinyint(1) NOT NULL DEFAULT 1,
        \`creado_en\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Insertar restaurante Roma si no existe
    console.log("2. Verificando restaurante inicial Roma...");
    const [rows]: any = await connection.execute(
      "SELECT id FROM `restaurantes` WHERE `id` = 1 OR `slug` = 'roma' LIMIT 1"
    );

    if (rows.length === 0) {
      console.log("Insertando restaurante inicial Roma (id=1, slug='roma')...");
      await connection.execute(`
        INSERT INTO \`restaurantes\` (
          \`id\`, \`slug\`, \`nombre\`, \`nombre_comercial\`, \`descripcion\`,
          \`logo_url\`, \`hero_image_url\`, \`color_primario\`, \`color_fondo\`,
          \`telefono\`, \`email\`, \`direccion\`, \`ciudad\`, \`pais\`,
          \`whatsapp\`, \`sri_ruc\`, \`sri_razon_social\`, \`sri_establecimiento\`,
          \`sri_punto_emision\`, \`sri_dir_matriz\`, \`activo\`
        ) VALUES (
          1, 'roma', 'Roma Restaurante Pizzería', 'REYES JARAMILLO CESAR AUGUSTO',
          'Pizzas artesanales al horno de leña, pastas frescas diarias, paninos y especialidades italianas en Loja.',
          '/images/logo-roma.jpg', '/images/hero-pizza.jpg', '#c9a84c', '#0a0908',
          '0987670140', 'roma@romaloja.com', 'Av. Eugenio Espejo 200-100 y Shuaras, Loja, Ecuador',
          'Loja', 'Ecuador', '593987670140', '1103421531001', 'REYES JARAMILLO CESAR AUGUSTO',
          '001', '001', 'Av. Eugenio Espejo 200-100 y Shuaras, Loja, Ecuador', 1
        )
      `);
    } else {
      console.log("Restaurante Roma ya existe en la base de datos.");
    }

    // 3. Agregar columna restaurante_id a todas las tablas si no existe
    const tablas = [
      "categorias",
      "platos",
      "clientes",
      "alertas_fidelizacion",
      "resenas",
      "pedidos",
      "insumos",
      "facturas",
      "usuarios_admin",
      "encuestas",
    ];

    for (const tabla of tablas) {
      try {
        const [colRows]: any = await connection.execute(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '${tabla}' 
            AND COLUMN_NAME = 'restaurante_id'
        `);

        if (colRows.length === 0) {
          console.log(`Agregando columna \`restaurante_id\` a tabla \`${tabla}\`...`);
          await connection.execute(`
            ALTER TABLE \`${tabla}\` ADD COLUMN \`restaurante_id\` INT(11) DEFAULT 1
          `);
          await connection.execute(`
            UPDATE \`${tabla}\` SET \`restaurante_id\` = 1 WHERE \`restaurante_id\` IS NULL
          `);
        } else {
          console.log(`Tabla \`${tabla}\` ya tiene columna \`restaurante_id\`.`);
        }
      } catch (err: any) {
        console.warn(`Aviso en tabla ${tabla}:`, err.message);
      }
    }

    // 4. Asegurar rol super_admin en usuarios_admin si existe columna rol
    try {
      await connection.execute(`
        ALTER TABLE \`usuarios_admin\` 
        MODIFY COLUMN \`rol\` ENUM('super_admin', 'owner', 'caja', 'cocina') NOT NULL DEFAULT 'caja'
      `);
    } catch (e: any) {
      console.warn("Aviso al modificar ENUM rol:", e.message);
    }

    console.log("✅ Migración SaaS Multi-Tenant completada exitosamente.");
  } finally {
    await connection.end();
  }
}

migrateSaas().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
