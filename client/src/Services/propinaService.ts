import { API_URL } from "@/lib/apiConfig";
import type {
  ConfigPropinaDto,
  PagoPropinaDto,
  ResumenPropinaDto,
} from "@/Types/Restaurante.ts";

const BASE = `${API_URL}/propinas`;

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let mensaje = "Error en el servidor";
  try {
    const body = await res.json();
    mensaje = body.mensaje || body.error || mensaje;
  } catch {
    mensaje = await res.text().catch(() => mensaje);
  }
  throw new Error(mensaje);
}

export const propinaService = {
  async getConfig(restauranteId: string): Promise<ConfigPropinaDto> {
    const res = await fetch(`${BASE}/config?restauranteId=${restauranteId}`, {
      credentials: "include",
    });
    return handle<ConfigPropinaDto>(res);
  },

  async saveConfig(
    restauranteId: string,
    dto: ConfigPropinaDto,
  ): Promise<ConfigPropinaDto> {
    const res = await fetch(`${BASE}/config?restauranteId=${restauranteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dto),
    });
    return handle<ConfigPropinaDto>(res);
  },

  async getResumen(
    restauranteId: string,
    desde: string,
    hasta: string,
  ): Promise<ResumenPropinaDto> {
    const res = await fetch(
      `${BASE}/resumen?restauranteId=${restauranteId}&desde=${desde}&hasta=${hasta}`,
      { credentials: "include" },
    );
    return handle<ResumenPropinaDto>(res);
  },

  async pagar(
    restauranteId: string,
    desde: string,
    hasta: string,
  ): Promise<PagoPropinaDto> {
    const res = await fetch(`${BASE}/pagar?restauranteId=${restauranteId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ desde, hasta }),
    });
    return handle<PagoPropinaDto>(res);
  },

  async getHistorial(restauranteId: string): Promise<PagoPropinaDto[]> {
    const res = await fetch(`${BASE}/historial?restauranteId=${restauranteId}`, {
      credentials: "include",
    });
    return handle<PagoPropinaDto[]>(res);
  },
};