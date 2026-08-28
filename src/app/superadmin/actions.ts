"use server";

import {
  crearRestaurante,
  actualizarRestaurante,
  upsertUsuarioAdminRestaurante,
  CrearRestauranteInput,
  ActualizarRestauranteInput,
} from "@/db/queries/restaurantes";
import { importarMenuMasivo, BulkCategoriaItem } from "@/db/queries/menu";
import { logoutSuperAdmin, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logoutSuperAdminAction() {
  await logoutSuperAdmin();
  redirect("/superadmin/login");
}

export async function crearRestauranteAction(formData: FormData) {
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const nombre = (formData.get("nombre") as string)?.trim();
  const nombreComercial = (formData.get("nombreComercial") as string)?.trim() || undefined;
  const descripcion = (formData.get("descripcion") as string)?.trim() || undefined;
  const colorPrimario = (formData.get("colorPrimario") as string)?.trim() || "#c9a84c";
  const colorFondo = (formData.get("colorFondo") as string)?.trim() || "#0a0908";
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || "/images/logo-roma.jpg";
  const heroImageUrl = (formData.get("heroImageUrl") as string)?.trim() || "/images/hero-pizza.jpg";
  const telefono = (formData.get("telefono") as string)?.trim() || undefined;
  const email = (formData.get("email") as string)?.trim() || undefined;
  const direccion = (formData.get("direccion") as string)?.trim() || undefined;
  const ciudad = (formData.get("ciudad") as string)?.trim() || undefined;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || undefined;
  
  // Credenciales Admin del nuevo local
  const adminNombre = (formData.get("adminNombre") as string)?.trim() || `${nombre} Admin`;
  const adminUsuario = (formData.get("adminUsuario") as string)?.trim() || email || slug;
  const adminPassword = (formData.get("adminPassword") as string)?.trim() || "admin123";

  // SRI
  const sriRuc = (formData.get("sriRuc") as string)?.trim() || undefined;
  const sriRazonSocial = (formData.get("sriRazonSocial") as string)?.trim() || undefined;
  const sriEstablecimiento = (formData.get("sriEstablecimiento") as string)?.trim() || "001";
  const sriPuntoEmision = (formData.get("sriPuntoEmision") as string)?.trim() || "001";
  const sriDirMatriz = (formData.get("sriDirMatriz") as string)?.trim() || undefined;

  if (!slug || !nombre) {
    return { error: "El nombre y el slug (identificador) son obligatorios." };
  }

  // Validar formato de slug
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { error: "El slug solo puede contener letras minúsculas, números y guiones (ej. trattoria-bella)." };
  }

  try {
    const input: CrearRestauranteInput = {
      slug,
      nombre,
      nombreComercial,
      descripcion,
      colorPrimario,
      colorFondo,
      logoUrl,
      heroImageUrl,
      telefono,
      email,
      direccion,
      ciudad,
      whatsapp,
      sriRuc,
      sriRazonSocial,
      sriEstablecimiento,
      sriPuntoEmision,
      sriDirMatriz,
    };

    const newId = await crearRestaurante(input);

    // Crear usuario administrador para este restaurante
    if (adminUsuario && adminPassword) {
      await upsertUsuarioAdminRestaurante({
        restauranteId: newId,
        nombre: adminNombre,
        email: adminUsuario,
        passwordHash: hashPassword(adminPassword),
        rol: "owner",
      });
    }

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/restaurantes");
    revalidatePath(`/r/${slug}`);

    return { success: true, id: newId };
  } catch (error: any) {
    console.error("Error crearRestauranteAction:", error);
    if (error.message?.includes("Duplicate") || error.code === "ER_DUP_ENTRY") {
      return { error: `Ya existe un restaurante con el slug "${slug}". Elige otro identificador.` };
    }
    return { error: "Error al crear el restaurante. Verifica los datos." };
  }
}

export async function actualizarRestauranteAction(id: number, formData: FormData) {
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const nombre = (formData.get("nombre") as string)?.trim();
  const nombreComercial = (formData.get("nombreComercial") as string)?.trim() || undefined;
  const descripcion = (formData.get("descripcion") as string)?.trim() || undefined;
  const colorPrimario = (formData.get("colorPrimario") as string)?.trim() || undefined;
  const colorFondo = (formData.get("colorFondo") as string)?.trim() || undefined;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || undefined;
  const heroImageUrl = (formData.get("heroImageUrl") as string)?.trim() || undefined;
  const telefono = (formData.get("telefono") as string)?.trim() || undefined;
  const email = (formData.get("email") as string)?.trim() || undefined;
  const direccion = (formData.get("direccion") as string)?.trim() || undefined;
  const ciudad = (formData.get("ciudad") as string)?.trim() || undefined;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || undefined;
  const activo = formData.get("activo") === "true";

  // Credenciales Admin
  const adminNombre = (formData.get("adminNombre") as string)?.trim();
  const adminUsuario = (formData.get("adminUsuario") as string)?.trim();
  const adminPassword = (formData.get("adminPassword") as string)?.trim();

  // SRI
  const sriRuc = (formData.get("sriRuc") as string)?.trim() || undefined;
  const sriRazonSocial = (formData.get("sriRazonSocial") as string)?.trim() || undefined;
  const sriEstablecimiento = (formData.get("sriEstablecimiento") as string)?.trim() || undefined;
  const sriPuntoEmision = (formData.get("sriPuntoEmision") as string)?.trim() || undefined;
  const sriDirMatriz = (formData.get("sriDirMatriz") as string)?.trim() || undefined;

  try {
    const input: ActualizarRestauranteInput = {
      slug,
      nombre,
      nombreComercial,
      descripcion,
      colorPrimario,
      colorFondo,
      logoUrl,
      heroImageUrl,
      telefono,
      email,
      direccion,
      ciudad,
      whatsapp,
      sriRuc,
      sriRazonSocial,
      sriEstablecimiento,
      sriPuntoEmision,
      sriDirMatriz,
      activo,
    };

    await actualizarRestaurante(id, input);

    // Actualizar usuario administrador si se proporcionaron datos
    if (adminUsuario) {
      if (adminPassword) {
        await upsertUsuarioAdminRestaurante({
          restauranteId: id,
          nombre: adminNombre || nombre || "Administrador",
          email: adminUsuario,
          passwordHash: hashPassword(adminPassword),
          rol: "owner",
        });
      } else {
        // Mantener hash existente o actualizar email/nombre
        const { getUsuarioAdminPorRestaurante } = await import("@/db/queries/restaurantes");
        const existing = await getUsuarioAdminPorRestaurante(id);
        if (existing) {
          const { db } = await import("@/db");
          const { usuariosAdmin } = await import("@/db/schema");
          const { eq } = await import("drizzle-orm");
          await db
            .update(usuariosAdmin)
            .set({
              nombre: adminNombre || existing.nombre,
              email: adminUsuario,
            })
            .where(eq(usuariosAdmin.id, existing.id));
        }
      }
    }

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/restaurantes");
    if (slug) revalidatePath(`/r/${slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error actualizarRestauranteAction:", error);
    return { error: "Error al actualizar el restaurante." };
  }
}

export async function toggleActivoRestauranteAction(id: number, activoActual: boolean) {
  try {
    await actualizarRestaurante(id, { activo: !activoActual });
    revalidatePath("/superadmin");
    revalidatePath("/superadmin/restaurantes");
    return { success: true };
  } catch (error) {
    console.error("Error toggleActivoRestauranteAction:", error);
    return { error: "Error al cambiar estado" };
  }
}

/**
 * Importa categorías y platos masivamente desde JSON o texto estructurado.
 */
export async function importarMenuMasivoAction(restauranteId: number, rawInput: string) {
  if (!restauranteId) return { error: "ID de restaurante inválido" };
  const input = rawInput.trim();
  if (!input) return { error: "El contenido no puede estar vacío" };

  try {
    let bulkData: BulkCategoriaItem[] = [];

    // Intento 1: Parsear como JSON estándar
    if (input.startsWith("[") || input.startsWith("{")) {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          // Formato: [ { categoria: "...", platos: [...] } ]
          bulkData = parsed.map((item: any) => ({
            categoria: String(item.categoria || item.nombreCategoria || "General"),
            platos: Array.isArray(item.platos)
              ? item.platos.map((p: any) => ({
                  nombre: String(p.nombre || p.titulo || ""),
                  precio: Number(p.precio || p.price || 0),
                  descripcion: p.descripcion ? String(p.descripcion) : undefined,
                  imagenUrl: p.imagenUrl || p.imagen || p.foto || undefined,
                  disponible: p.disponible !== false,
                }))
              : [],
          }));
        } else if (parsed && typeof parsed === "object") {
          // Formato objeto: { "Pizzas": [ {...}, {...} ] }
          bulkData = Object.entries(parsed).map(([categoria, platosList]: [string, any]) => ({
            categoria,
            platos: Array.isArray(platosList)
              ? platosList.map((p: any) => ({
                  nombre: String(p.nombre || p.titulo || ""),
                  precio: Number(p.precio || p.price || 0),
                  descripcion: p.descripcion ? String(p.descripcion) : undefined,
                  imagenUrl: p.imagenUrl || p.imagen || p.foto || undefined,
                  disponible: p.disponible !== false,
                }))
              : [],
          }));
        }
      } catch (jsonErr) {
        console.warn("No es JSON válido, intentando parsear texto estructurado...");
      }
    }

    // Intento 2: Parsear como texto por líneas
    // Formatos soportados:
    // Categoría: Nombre Plato | Precio | Descripción | Imagen
    // o
    // === Categoría ===
    // Nombre Plato | Precio | Descripción
    if (bulkData.length === 0) {
      const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
      let currentCat = "General";
      const catMap = new Map<string, BulkCategoriaItem["platos"]>();

      for (const line of lines) {
        // Encabezado de categoría: [Pizzas] o === Pizzas === o # Pizzas
        if (
          (line.startsWith("[") && line.endsWith("]")) ||
          (line.startsWith("===") && line.endsWith("===")) ||
          line.startsWith("# ") ||
          line.startsWith("## ")
        ) {
          currentCat = line.replace(/[\[\]=#]/g, "").trim() || "General";
          if (!catMap.has(currentCat)) catMap.set(currentCat, []);
          continue;
        }

        // Si tiene formato: Categoría: Plato | Precio | Desc
        let row = line;
        let lineCat = currentCat;
        if (line.includes(":") && line.indexOf(":") < line.indexOf("|")) {
          const parts = line.split(":");
          lineCat = parts[0].trim() || currentCat;
          row = parts.slice(1).join(":").trim();
        }

        const cols = row.split("|").map((c) => c.trim());
        if (cols.length >= 2) {
          const nombre = cols[0];
          const precioRaw = cols[1].replace(/[^0-9.]/g, "");
          const precio = parseFloat(precioRaw) || 0;
          const descripcion = cols[2] || undefined;
          const imagenUrl = cols[3] || undefined;

          if (nombre) {
            if (!catMap.has(lineCat)) catMap.set(lineCat, []);
            catMap.get(lineCat)!.push({
              nombre,
              precio,
              descripcion,
              imagenUrl,
              disponible: true,
            });
          }
        }
      }

      bulkData = Array.from(catMap.entries()).map(([categoria, platos]) => ({
        categoria,
        platos,
      }));
    }

    if (bulkData.length === 0) {
      return {
        error:
          "No se pudieron detectar platos válidos. Usa el formato JSON o líneas tipo: 'Nombre Plato | Precio | Descripción'",
      };
    }

    const { categoriasCreadas, platosInsertados } = await importarMenuMasivo(restauranteId, bulkData);

    revalidatePath("/superadmin/restaurantes");
    revalidatePath("/admin/menu");
    revalidatePath("/app/menu");

    return {
      success: true,
      categoriasCreadas,
      platosInsertados,
    };
  } catch (error: any) {
    console.error("Error importarMenuMasivoAction:", error);
    return { error: error.message || "Error al importar el menú" };
  }
}

