import { cookies } from "next/headers";
import { db } from "@/db";
import { usuariosAdmin } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE = "roma_admin_session";
// 30 días de persistencia para que no se desconecte
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export interface AdminSession {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

/**
 * Obtiene la sesión actual del administrador desde las cookies seguras.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionValue) return null;

  try {
    const parsed = JSON.parse(Buffer.from(sessionValue, "base64").toString("utf-8"));
    if (parsed && parsed.id && parsed.email) {
      return parsed as AdminSession;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Inicia sesión verificando credenciales en la base de datos.
 * Si no existen administradores, crea automáticamente el usuario por defecto.
 */
export async function loginAdmin(email: string, password: string):Promise<{ success: boolean; error?: string }> {
  if (!email || !password) {
    return { success: false, error: "Por favor ingresa correo y contraseña" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  try {
    // 1. Buscar usuario
    let [user] = await db
      .select()
      .from(usuariosAdmin)
      .where(eq(usuariosAdmin.email, cleanEmail))
      .limit(1);

    // 2. Si no hay usuarios en la tabla y es el primer intento, inicializar administrador por defecto
    if (!user) {
      const allUsers = await db.select().from(usuariosAdmin).limit(1);
      if (allUsers.length === 0) {
        console.log("-> Inicializando usuario administrador por defecto...");
        await db.insert(usuariosAdmin).values({
          nombre: "Administrador Roma",
          email: cleanEmail,
          passwordHash: passwordHash,
          rol: "owner",
        });

        [user] = await db
          .select()
          .from(usuariosAdmin)
          .where(eq(usuariosAdmin.email, cleanEmail))
          .limit(1);
      }
    }

    if (!user || user.passwordHash !== passwordHash) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    // 3. Crear sesión persistente
    const sessionData: AdminSession = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, Buffer.from(JSON.stringify(sessionData)).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error en loginAdmin:", err);
    return { success: false, error: "Error de conexión con la base de datos" };
  }
}

/**
 * Cierra la sesión del administrador.
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
