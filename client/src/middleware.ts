// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { validateToken } from "@/Services/authService.ts";

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
    console.log(isValid)
    if (!isValid) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
  }

  console.log(token)
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
