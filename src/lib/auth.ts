import { cookies } from "next/headers";
import { db } from "@/db";
import { usuariosAdmin, restaurantes } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE = "roma_admin_session";
const SUPERADMIN_SESSION_COOKIE = "saas_superadmin_session";
// 30 días de persistencia
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export interface AdminSession {
  id: number;
  nombre: string;
  email: string;
  rol: "super_admin" | "owner" | "caja" | "cocina";
  restauranteId?: number | null;
  restauranteNombre?: string | null;
  restauranteSlug?: string | null;
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
 * Obtiene la sesión actual del Super Administrador.
 */
export async function getSuperAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SUPERADMIN_SESSION_COOKIE)?.value;

  if (!sessionValue) return null;

  try {
    const parsed = JSON.parse(Buffer.from(sessionValue, "base64").toString("utf-8"));
    if (parsed && parsed.id && parsed.rol === "super_admin") {
      return parsed as AdminSession;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Inicia sesión de Super Administrador (/superadmin/login).
 * Soporta credenciales maestras por defecto y usuarios en DB con rol 'super_admin'.
 */
export async function loginSuperAdmin(
  emailOrUser: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!emailOrUser || !password) {
    return { success: false, error: "Ingresa usuario/correo y contraseña" };
  }

  const cleanUser = emailOrUser.trim().toLowerCase();

  // 1. Acceso maestro superadmin
  if (
    (cleanUser === "superadmin" ||
      cleanUser === "admin@saas.com" ||
      cleanUser === "superadmin@roma.com") &&
    password === "superadmin123"
  ) {
    const sessionData: AdminSession = {
      id: 9999,
      nombre: "Super Administrador",
      email: "superadmin@saas.com",
      rol: "super_admin",
      restauranteId: null,
    };

    const cookieStore = await cookies();
    cookieStore.set(
      SUPERADMIN_SESSION_COOKIE,
      Buffer.from(JSON.stringify(sessionData)).toString("base64"),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      }
    );

    return { success: true };
  }

  // 2. Verificación en base de datos
  const passwordHash = hashPassword(password);

  try {
    const [user] = await db
      .select()
      .from(usuariosAdmin)
      .where(
        or(
          eq(usuariosAdmin.email, cleanUser),
          eq(usuariosAdmin.nombre, emailOrUser.trim())
        )
      )
      .limit(1);

    if (!user || user.passwordHash !== passwordHash || user.rol !== "super_admin") {
      return { success: false, error: "Credenciales de super administrador incorrectas" };
    }

    const sessionData: AdminSession = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: "super_admin",
      restauranteId: null,
    };

    const cookieStore = await cookies();
    cookieStore.set(
      SUPERADMIN_SESSION_COOKIE,
      Buffer.from(JSON.stringify(sessionData)).toString("base64"),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      }
    );

    return { success: true };
  } catch (err) {
    console.error("Error en loginSuperAdmin:", err);
    return { success: false, error: "Error al iniciar sesión de super admin" };
  }
}

/**
 * Inicia sesión verificando credenciales para el panel de restaurante (/admin):
 * Usuario: Roma
 * Contraseña: admin123
 */
export async function loginAdmin(
  usuarioInput: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!usuarioInput || !password) {
    return { success: false, error: "Por favor ingresa usuario y contraseña" };
  }

  const cleanUser = usuarioInput.trim().toLowerCase();

  // 1. Acceso maestro directo simplificado para Roma (Tenant #1)
  if (
    (cleanUser === "roma" || cleanUser === "admin" || cleanUser === "admin@romaloja.com") &&
    password === "admin123"
  ) {
    const sessionData: AdminSession = {
      id: 1,
      nombre: "Administrador Roma",
      email: "roma@romaloja.com",
      rol: "owner",
      restauranteId: 1,
      restauranteNombre: "Roma Restaurante Pizzería",
      restauranteSlug: "roma",
    };

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE,
      Buffer.from(JSON.stringify(sessionData)).toString("base64"),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      }
    );

    return { success: true };
  }

  // 2. Verificación en base de datos
  const passwordHash = hashPassword(password);

  try {
    const [user] = await db
      .select()
      .from(usuariosAdmin)
      .where(
        or(
          eq(usuariosAdmin.email, cleanUser),
          eq(usuariosAdmin.nombre, usuarioInput.trim())
        )
      )
      .limit(1);

    if (!user || user.passwordHash !== passwordHash) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

    let restNombre: string | null = null;
    let restSlug: string | null = null;

    if (user.restauranteId) {
      const [rest] = await db
        .select()
        .from(restaurantes)
        .where(eq(restaurantes.id, user.restauranteId))
        .limit(1);
      if (rest) {
        restNombre = rest.nombre;
        restSlug = rest.slug;
      }
    }

    const sessionData: AdminSession = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol as "super_admin" | "owner" | "caja" | "cocina",
      restauranteId: user.restauranteId ?? 1,
      restauranteNombre: restNombre ?? "Mi Restaurante",
      restauranteSlug: restSlug ?? "roma",
    };

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE,
      Buffer.from(JSON.stringify(sessionData)).toString("base64"),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      }
    );

    return { success: true };
  } catch (err: any) {
    console.error("Error en loginAdmin:", err);
    return { success: false, error: "Usuario o contraseña incorrectos" };
  }
}

/**
 * Cierra la sesión del administrador de restaurante.
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Cierra la sesión del super administrador.
 */
export async function logoutSuperAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPERADMIN_SESSION_COOKIE);
}
