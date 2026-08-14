"use server";

import { loginAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await loginAdmin(email, password);

  if (!result.success) {
    return { error: result.error || "Credenciales incorrectas" };
  }

  redirect("/admin");
}
