

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

//const API_URL = "http://localhost:5000/api/auth";
const API_URL = import.meta.env.PUBLIC_API_URL;

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (!response.ok)
    throw new Error("Credenciales inválidas");

  return response.json();
};

export const validateToken = async (token?: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/auth/validate-token?token=${token}`, {
      method: "GET",
      credentials: "include",
    });
    return res.ok;
  } catch (err) {
    console.error("Error validando token:", err);
    return false;
  }
};
export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  console.log("Logout status:", response.status);

  window.location.href = "/login";
};

export const getCurrentUser = async () => {
  const response = await fetch(
    `${API_URL}/auth/get-current-user`,
    {
      credentials: "include"
    }
  );

  if (!response.ok)
    throw new Error("No se pudo obtener el usuario");

  return response.json();
};