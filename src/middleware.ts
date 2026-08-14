import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar en rutas /admin
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("roma_admin_session")?.value;
    const isLoginPage = pathname === "/admin/login";

    // Si no está autenticado y no está en /admin/login, redirigir al login
    if (!sessionCookie && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Si ya está autenticado e intenta ir a /admin/login, redirigir al dashboard /admin
    if (sessionCookie && isLoginPage) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
