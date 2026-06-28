import { API_URL } from "@/lib/apiConfig";
import type { CreatePedidoDto } from "@/Types/Restaurante.ts";

export interface PedidoResponse {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  tipoEntrega: string;
  direccion?: string;
  fecha: string;
  estado: number;
  total: number;
  restauranteId: string;
  items: {
    id: string;
    menuId: string;
    producto: {
      id: string;
      nombre: string;
      precio: number;
      imagen: string;
    };
    precio: number;
    cantidad: number;
    notas: string;
    opciones: string;
  }[];
}

export const pedidoService = {
  async create(data: CreatePedidoDto): Promise<PedidoResponse> {
    const res = await fetch(`${API_URL}/Pedido`, {
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

  async getAll(restauranteId?: string): Promise<PedidoResponse[]> {
    const params = restauranteId ? `?restauranteId=${restauranteId}` : "";
    const res = await fetch(`${API_URL}/Pedido${params}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener pedidos");
    return res.json();
  },

  async updateEstado(id: string, estado: number): Promise<void> {
    const res = await fetch(`${API_URL}/Pedido/${id}/estado?estado=${estado}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al actualizar estado");
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/Pedido/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar pedido");
  },
};
