import { API_URL } from "@/lib/apiConfig";
import type { CreatePedidoDto, PedidoFilters } from "@/Types/Restaurante.ts";

export interface PagedResultPedidos {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  items: PedidoResponse[];
}

export interface PedidoResponse {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  tipoEntrega: string;
  metodoPago?: string;
  direccion?: string;
  fecha: string;
  estado: number;
  total: number;
  restauranteId: string;
  mesaId?: string;
  numeroMesa?: number;
  items: {
    id: string;
    menuId?: string;
    producto?: {
      id: string;
      nombre: string;
      precio: number;
      imagen: string;
    } | null;
    precio: number;
    cantidad: number;
    notas: string;
    opciones: string;
    esCombo?: boolean;
    comboId?: string;
    comboNombre?: string;
    comboItemsJson?: string;
    estado?: number;
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

  async getById(id: string): Promise<PedidoResponse> {
    const res = await fetch(`${API_URL}/Pedido/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener pedido");
    return res.json();
  },

  async getByMesa(mesaId: string): Promise<PedidoResponse[]> {
    const res = await fetch(`${API_URL}/Pedido/mesa/${mesaId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener pedidos de la mesa");
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

  async getHistorial(filters: PedidoFilters): Promise<PagedResultPedidos> {
    const params = new URLSearchParams();
    params.append("restauranteId", filters.restauranteId);
    if (filters.fechaDesde) params.append("fechaDesde", filters.fechaDesde);
    if (filters.fechaHasta) params.append("fechaHasta", filters.fechaHasta);
    if (filters.estado !== undefined) params.append("estado", String(filters.estado));
    if (filters.search) params.append("search", filters.search);
    if (filters.pageNumber) params.append("pageNumber", String(filters.pageNumber));
    if (filters.pageSize) params.append("pageSize", String(filters.pageSize));
    const res = await fetch(`${API_URL}/Pedido/historial?${params.toString()}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener historial");
    return res.json();
  },

  async updateEstado(id: string, estado: number): Promise<void> {
    const res = await fetch(`${API_URL}/Pedido/${id}/estado?estado=${estado}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al actualizar estado");
  },

  async updateItemEstado(pedidoId: string, itemId: string, estado: number): Promise<void> {
    const res = await fetch(
      `${API_URL}/Pedido/${pedidoId}/item/${itemId}/estado?estado=${estado}`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );
    if (!res.ok) throw new Error("Error al actualizar estado del producto");
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/Pedido/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar pedido");
  },
};

