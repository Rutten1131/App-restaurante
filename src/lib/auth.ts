import { cookies } from "next/headers";
import { db } from "@/db";
import { usuariosAdmin } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE = "roma_admin_session";
// 30 días de persistencia
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
    if (parsed && parsed.id && (parsed.email || parsed.nombre)) {
      return parsed as AdminSession;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Inicia sesión verificando credenciales:
 * Usuario: Roma
 * Contraseña: admin123
 */
export async function loginAdmin(usuarioInput: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!usuarioInput || !password) {
    return { success: false, error: "Por favor ingresa usuario y contraseña" };
  }

  const cleanUser = usuarioInput.trim().toLowerCase();

  // 1. Acceso maestro directo simplificado
  if ((cleanUser === "roma" || cleanUser === "admin" || cleanUser === "admin@romaloja.com") && password === "admin123") {
    const sessionData: AdminSession = {
      id: 1,
      nombre: "Administrador Roma",
      email: "roma@romaloja.com",
      rol: "owner",
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
  }

  // 2. Verificación en base de datos
  const passwordHash = hashPassword(password);

  try {
    const [user] = await db
      .select()
      .from(usuariosAdmin)
      .where(or(eq(usuariosAdmin.email, cleanUser), eq(usuariosAdmin.nombre, usuarioInput.trim())))
      .limit(1);

    if (!user || user.passwordHash !== passwordHash) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

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
    return { success: false, error: "Usuario o contraseña incorrectos" };
  }
}

/**
 * Cierra la sesión del administrador.
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
