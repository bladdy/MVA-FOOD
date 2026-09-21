import { API_URL } from "@/lib/apiConfig";
import type { CerrarCuentaMesaDto, CuentaMesaDetalleDto } from "@/Types/Restaurante.ts";

export const cuentaMesaService = {
  async getByMesa(mesaId: string): Promise<CuentaMesaDetalleDto | null> {
    const res = await fetch(`${API_URL}/CuentaMesa/mesa/${mesaId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener la cuenta de la mesa");
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  },

  async getByRestaurante(restauranteId: string, soloAbiertas = false): Promise<CuentaMesaDetalleDto[]> {
    const res = await fetch(`${API_URL}/CuentaMesa/restaurante/${restauranteId}?soloAbiertas=${soloAbiertas}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener las cuentas");
    return res.json();
  },

  async abrir(mesaId: string): Promise<CuentaMesaDetalleDto> {
    const res = await fetch(`${API_URL}/CuentaMesa/${mesaId}/abrir`, {
      method: "POST",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Error al abrir la cuenta");
    return json;
  },

  async cerrar(mesaId: string, dto: CerrarCuentaMesaDto): Promise<CuentaMesaDetalleDto> {
    const res = await fetch(`${API_URL}/CuentaMesa/${mesaId}/cerrar`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Error al cerrar la cuenta");
    return json;
  },
};
