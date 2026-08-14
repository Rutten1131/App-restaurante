"use server";

import { loginAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const usuario = (formData.get("usuario") || formData.get("email")) as string;
  const password = formData.get("password") as string;

  const result = await loginAdmin(usuario, password);

  if (!result.success) {
    return { error: result.error || "Usuario o contraseña incorrectos" };
  }

  redirect("/admin");
}
