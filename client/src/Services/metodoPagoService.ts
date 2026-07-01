import { API_URL } from "@/lib/apiConfig";
import type { MetodoPagoResponse, MetodoPagoCreate } from "@/Types/Restaurante.ts";

export const metodoPagoService = {
  async getAll(restauranteId: string): Promise<MetodoPagoResponse[]> {
    const res = await fetch(`${API_URL}/MetodoPago/restaurante/${restauranteId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener métodos de pago");
    return res.json();
  },

  async getById(id: string): Promise<MetodoPagoResponse> {
    const res = await fetch(`${API_URL}/MetodoPago/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener método de pago");
    return res.json();
  },

  async create(restauranteId: string, data: MetodoPagoCreate): Promise<MetodoPagoResponse> {
    const res = await fetch(`${API_URL}/MetodoPago/${restauranteId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear método de pago");
    return res.json();
  },

  async update(id: string, data: MetodoPagoCreate): Promise<MetodoPagoResponse> {
    const res = await fetch(`${API_URL}/MetodoPago/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar método de pago");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/MetodoPago/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar método de pago");
  },
};
