// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { validateToken } from "@/Services/authService.ts";

const RUTAS_SOLO_ADMIN = ["/admin/configuracion/usuarios", "/admin/configuracion/permisos"];

function decodificarPayload(token?: string): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const parte = token.split(".")[1];
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  // Leer el token desde cookies
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader?.match(/token=([^;]+)/)?.[1];
  // --- Protección de rutas /admin ---
  if (url.pathname.startsWith("/admin")) {
    if (!token) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const isValid = await validateToken(token);
    if (!isValid) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    // Rutas de solo administrador
    if (RUTAS_SOLO_ADMIN.some((ruta) => url.pathname.startsWith(ruta))) {
      const payload = decodificarPayload(token);
      if (payload?.rol !== "Admin") {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/dashboard" },
        });
      }
    }
  }

  // --- Redirigir login si ya está logeado ---
  if (url.pathname === "/login") {
    if (token) {
      const isValid = await validateToken(token);
      if (isValid) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/admin/dashboard" },
        });
      }
    }
  }

  return next();
});
