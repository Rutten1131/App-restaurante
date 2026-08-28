"use server";

import { loginSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginSuperAdminAction(prevState: any, formData: FormData) {
  const usuario = (formData.get("usuario") || formData.get("email")) as string;
  const password = formData.get("password") as string;

  const result = await loginSuperAdmin(usuario, password);

  if (!result.success) {
    return { error: result.error || "Credenciales de super administrador incorrectas" };
  }

  redirect("/superadmin");
}
