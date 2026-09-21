import { API_URL } from "@/lib/apiConfig";
import type { Mesa, MesaCreate } from "@/Types/Restaurante.ts";

export const mesaService = {
  async getAll(restauranteId?: string): Promise<Mesa[]> {
    const params = restauranteId ? `?restauranteId=${restauranteId}` : "";
    const res = await fetch(`${API_URL}/Mesa${params}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener las mesas");
    return res.json();
  },

  async getById(id: string): Promise<Mesa> {
    const res = await fetch(`${API_URL}/Mesa/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener la mesa");
    return res.json();
  },

  async create(data: MesaCreate): Promise<Mesa> {
    const res = await fetch(`${API_URL}/Mesa`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return res.json();
  },

  async update(id: string, data: MesaCreate): Promise<void> {
    const res = await fetch(`${API_URL}/Mesa/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar la mesa");
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/Mesa/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar la mesa");
  },

  async liberar(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/Mesa/${id}/liberar`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al liberar la mesa");
  },
};
