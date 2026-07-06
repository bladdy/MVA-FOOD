import { API_URL } from "@/lib/apiConfig";
import type { FacturaDto, FacturaDetalleDto, PagarFacturaResponseDto } from "@/Types/Restaurante";

export const facturaService = {
  async getByRestaurante(restauranteId: string): Promise<FacturaDto[]> {
    const res = await fetch(`${API_URL}/Factura/restaurante/${restauranteId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener facturas");
    return res.json();
  },

  async getById(id: string): Promise<FacturaDetalleDto> {
    const res = await fetch(`${API_URL}/Factura/detalle/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener factura");
    return res.json();
  },

  async pagar(facturaId: string): Promise<PagarFacturaResponseDto> {
    const res = await fetch(`${API_URL}/Factura/pagar/${facturaId}`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Error al procesar pago" }));
      throw new Error(err.error || "Error al procesar pago");
    }
    return res.json();
  },

  getPdfUrl(id: string): string {
    return `${API_URL}/Factura/pdf/${id}`;
  },
};
