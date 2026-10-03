import { API_URL } from "@/lib/apiConfig";
import type { ActualizarUsuarioDto, CrearUsuarioDto, UsuarioDto } from "@/Types/Restaurante";

// src/services/usuarioService.ts
const BASE = `${API_URL}/usuario`;

export const usuarioService = {
  async getAll(): Promise<UsuarioDto[]> {
    const res = await fetch(BASE, { credentials: "include" });
    if (!res.ok) throw new Error("No se pudieron obtener los usuarios");
    return res.json();
  },

  async crear(dto: CrearUsuarioDto): Promise<UsuarioDto> {
    const res = await fetch(BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        throw new Error(parsed.mensaje || text);
      } catch {
        throw new Error(text);
      }
    }
    return res.json();
  },

  async actualizar(id: string, dto: ActualizarUsuarioDto): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        throw new Error(parsed.mensaje || text);
      } catch {
        throw new Error(text);
      }
    }
  },

  async cambiarPassword(id: string, nuevaPassword: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}/password`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevaPassword }),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        throw new Error(parsed.mensaje || text);
      } catch {
        throw new Error(text);
      }
    }
  },
};