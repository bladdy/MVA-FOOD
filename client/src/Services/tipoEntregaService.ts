import { API_URL } from "@/lib/apiConfig";
import type { TipoEntregaResponse, TipoEntregaCreate } from "@/Types/Restaurante.ts";

export const tipoEntregaService = {
  async getAll(restauranteId: string): Promise<TipoEntregaResponse[]> {
    const res = await fetch(`${API_URL}/TipoEntrega/restaurante/${restauranteId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener tipos de entrega");
    return res.json();
  },

  async getById(id: string): Promise<TipoEntregaResponse> {
    const res = await fetch(`${API_URL}/TipoEntrega/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener tipo de entrega");
    return res.json();
  },

  async create(restauranteId: string, data: TipoEntregaCreate): Promise<TipoEntregaResponse> {
    const res = await fetch(`${API_URL}/TipoEntrega/${restauranteId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear tipo de entrega");
    return res.json();
  },

  async update(id: string, data: TipoEntregaCreate): Promise<TipoEntregaResponse> {
    const res = await fetch(`${API_URL}/TipoEntrega/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar tipo de entrega");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/TipoEntrega/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar tipo de entrega");
  },
};
