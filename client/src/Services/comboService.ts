import { API_URL } from "@/lib/apiConfig";
import type { ComboResponse, ComboCreate } from "@/Types/Restaurante.ts";

export const comboService = {
  async getAll(restauranteId?: string): Promise<ComboResponse[]> {
    const params = restauranteId ? `?restauranteId=${restauranteId}` : "";
    const res = await fetch(`${API_URL}/Combo${params}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener combos");
    return res.json();
  },

  async getById(id: string): Promise<ComboResponse> {
    const res = await fetch(`${API_URL}/Combo/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener combo");
    return res.json();
  },

  async create(data: ComboCreate): Promise<ComboResponse> {
    const formData = new FormData();
    formData.append("Nombre", data.nombre);
    if (data.descripcion) formData.append("Descripcion", data.descripcion);
    if (data.precio != null) formData.append("Precio", String(data.precio));
    formData.append("Activo", String(data.activo));
    formData.append("Predefinido", String(data.predefinido));
    formData.append("RestauranteId", data.restauranteId);
    if (data.imagenUrl) formData.append("ImagenUrl", data.imagenUrl);

    data.items.forEach((item, i) => {
      formData.append(`Items[${i}].MenuId`, item.menuId);
      formData.append(`Items[${i}].Cantidad`, String(item.cantidad));
    });

    if (data.sugerencias) {
      data.sugerencias.forEach((sug, i) => {
        formData.append(`Sugerencias[${i}].MenuId`, sug.menuId);
        formData.append(`Sugerencias[${i}].PrecioAdicional`, String(sug.precioAdicional));
      });
    }

    const res = await fetch(`${API_URL}/Combo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return res.json();
  },

  async update(id: string, data: ComboCreate): Promise<ComboResponse> {
    const formData = new FormData();
    formData.append("Nombre", data.nombre);
    if (data.descripcion) formData.append("Descripcion", data.descripcion);
    if (data.precio != null) formData.append("Precio", String(data.precio));
    formData.append("Activo", String(data.activo));
    formData.append("Predefinido", String(data.predefinido));
    formData.append("RestauranteId", data.restauranteId);
    if (data.imagenUrl) formData.append("ImagenUrl", data.imagenUrl);

    data.items.forEach((item, i) => {
      formData.append(`Items[${i}].MenuId`, item.menuId);
      formData.append(`Items[${i}].Cantidad`, String(item.cantidad));
    });

    if (data.sugerencias) {
      data.sugerencias.forEach((sug, i) => {
        formData.append(`Sugerencias[${i}].MenuId`, sug.menuId);
        formData.append(`Sugerencias[${i}].PrecioAdicional`, String(sug.precioAdicional));
      });
    }

    const res = await fetch(`${API_URL}/Combo/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/Combo/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al eliminar combo");
  },
};
