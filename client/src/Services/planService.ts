import { API_URL } from "@/lib/apiConfig";
import type { Plan, PlanRestaurante, CambiarPlanDto, CambioPlanResponseDto, DashboardInfoDto } from "@/Types/Restaurante";

export const planService = {
  async getAll(restauranteId?: string): Promise<Plan[]> {
    const url = restauranteId
      ? `${API_URL}/Plan?restauranteId=${restauranteId}`
      : `${API_URL}/Plan`;
    const res = await fetch(url, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener planes");
    return res.json();
  },

  async getActivo(restauranteId: string): Promise<PlanRestaurante> {
    const res = await fetch(`${API_URL}/Plan/activo/${restauranteId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener plan activo");
    return res.json();
  },

  async getDashboardInfo(restauranteId: string): Promise<DashboardInfoDto> {
    const res = await fetch(`${API_URL}/Plan/dashboard-info/${restauranteId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener información del dashboard");
    return res.json();
  },

  async cambiar(data: CambiarPlanDto): Promise<CambioPlanResponseDto> {
    const res = await fetch(`${API_URL}/Plan/cambiar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al cambiar plan");
    return res.json();
  },
};
