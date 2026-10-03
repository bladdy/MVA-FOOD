import { API_URL } from "@/lib/apiConfig";
import type { PermisoDto, RolPermisosDto } from "@/Types/Restaurante";

// src/services/permisoService.ts
const BASE = `${API_URL}/permiso`;

export const permisoService = {
  async getAll(): Promise<PermisoDto[]> {
    const res = await fetch(BASE, { credentials: "include" });
    if (!res.ok) throw new Error("No se pudieron obtener los permisos");
    return res.json();
  },

  async getPorRol(): Promise<RolPermisosDto[]> {
    const res = await fetch(`${BASE}/roles`, { credentials: "include" });
    if (!res.ok) throw new Error("No se pudieron obtener los permisos por rol");
    return res.json();
  },

  async asignarRol(rol: string, permisos: string[]): Promise<RolPermisosDto> {
    const res = await fetch(`${BASE}/roles`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol, permisos }),
    });
    if (!res.ok) throw new Error("No se pudieron guardar los permisos");
    return res.json();
  },
};