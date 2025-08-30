// src/services/menuService.ts
import type { Menu } from "@/Types/Restaurante.ts";

const API_URL = import.meta.env.VITE_API_URL;

export const menuService = {
  async getAll(): Promise<Menu[]> {
    const res = await fetch(`${API_URL}/Menu`);
    if (!res.ok) throw new Error("Error al obtener los menús");
    return res.json();
  },

  async create(data: Menu): Promise<Menu> {
    const res = await fetch(`${API_URL}/Menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear menú");
    return res.json();
  },

  async update(id: string, data: Menu): Promise<Menu> {
    const res = await fetch(`${API_URL}/Menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar menú");
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/Menu/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar menú");
  },
};
