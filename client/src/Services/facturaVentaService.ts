import { API_URL } from "@/lib/apiConfig";
import type {
  ConfigFacturacionDto,
  CrearFacturaVentaDto,
  FacturaVentaDetalleDto,
  FacturaVentaDto,
  PedidoFacturableDto,
  ReporteVentasDto,
  ResumenFacturacionHoyDto,
  RangoReporteVentas,
} from "@/Types/Restaurante";

export const facturaVentaService = {
  async getByRestaurante(restauranteId: string): Promise<FacturaVentaDto[]> {
    const res = await fetch(`${API_URL}/FacturaVenta/restaurante/${restauranteId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener facturas");
    return res.json();
  },

  async getResumenHoy(restauranteId: string): Promise<ResumenFacturacionHoyDto> {
    const res = await fetch(`${API_URL}/FacturaVenta/restaurante/${restauranteId}/resumen-hoy`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener resumen del día");
    return res.json();
  },

  async getReporte(restauranteId: string, rango: RangoReporteVentas): Promise<ReporteVentasDto> {
    const res = await fetch(
      `${API_URL}/FacturaVenta/restaurante/${restauranteId}/reporte?rango=${rango}`,
      { credentials: "include" },
    );
    if (!res.ok) throw new Error("Error al obtener reporte de ventas");
    return res.json();
  },

  async getFacturables(restauranteId: string): Promise<PedidoFacturableDto[]> {
    const res = await fetch(`${API_URL}/FacturaVenta/restaurante/${restauranteId}/facturables`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener pedidos facturables");
    return res.json();
  },

  async getConfig(restauranteId: string): Promise<ConfigFacturacionDto> {
    const res = await fetch(`${API_URL}/FacturaVenta/restaurante/${restauranteId}/config`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener configuración de facturación");
    return res.json();
  },

  async getById(id: string): Promise<FacturaVentaDetalleDto> {
    const res = await fetch(`${API_URL}/FacturaVenta/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener factura");
    return res.json();
  },

  async crearDesdePedido(data: CrearFacturaVentaDto): Promise<FacturaVentaDetalleDto> {
    const res = await fetch(`${API_URL}/FacturaVenta/desde-pedido`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Error al crear factura");
    return json;
  },

  async crearVentaRapida(
    restauranteId: string,
    data: CrearFacturaVentaDto,
  ): Promise<FacturaVentaDetalleDto> {
    const res = await fetch(`${API_URL}/FacturaVenta/venta-rapida?restauranteId=${restauranteId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Error al crear factura");
    return json;
  },

  async anular(id: string, motivo: string): Promise<void> {
    const res = await fetch(`${API_URL}/FacturaVenta/${id}/anular`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    if (!res.ok) throw new Error("Error al anular factura");
  },
};
