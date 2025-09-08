// src/services/authService.ts
interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const API_URL = "http://localhost:5147/api/auth";

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error al iniciar sesión");
  }

  const result: LoginResponse = await res.json();
  // Guardamos el token en localStorage
  //localStorage.setItem("token", result.token);

  // ⚠️ Si backend aún NO devuelve Set-Cookie, entonces lo guardamos manualmente:
  document.cookie = `token=${result.token}; path=/; Secure; SameSite=Strict`;

  return result;
};

export const validateToken = async (token?: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/validate-token`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include", // 👈 importante para enviar cookies al backend
    });
    return res.ok;
  } catch (err) {
    console.error("Error validando token:", err);
    return false;
  }
};
export const logout = async () => {
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include", // importante para que envíe la cookie al backend
  });  // Redirigir al login
  window.location.href = "/login";
};

