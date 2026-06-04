import React, { useState } from "react";
import { login } from "@/Services/authService.ts";
import mrMenusLogo from "@/assets/mr_menus.png";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        username,
        password
      });
      //if (!window) return;
      // Redirigir al dashboard
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message);
      console.log("Login error:", err);
    }
  };

  return (
    <div className="w-full max-w-md p-4 sm:p-6 md:p-8">
      {/* Logo centrado */}
      <div className="flex justify-center items-center mb-4">
        <img src={mrMenusLogo.src} alt="Mr Menus" className="h-32 sm:h-36 md:h-48" />
      </div>

      {/* Título */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Inicia sesión en tu cuenta
      </h2>

      {/* Subtítulo con enlace */}
      <p className="text-gray-600 mb-4">
        ¿Aún no eres miembro? <span>
          <a href="/contactos" className="text-orange-600 hover:underline">
            Prueba gratis por 7 días.
          </a>
        </span>
      </p>

      {/* Formulario */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-orange-600 text-white py-3 rounded-lg mt-4 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        >
          Iniciar sesión
        </button>

        <div className="mt-3 text-center">
          <a href="/" className="text-orange-600">
            Volver al inicio
          </a>
        </div>
      </form>
    </div>

  );
};

export default LoginForm;
