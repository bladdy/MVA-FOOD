// src/Services/varianteService.ts
import type { VarianteCreate, Variante, PagedResult, VarianteFilters } from "@/Types/Restaurante.ts";
import { API_URL } from "@/lib/apiConfig";


export const varianteService = {
  async getAll(filters?: VarianteFilters): Promise<PagedResult<Variante>> {
    let url = API_URL;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.categoriaId) params.append("categoriaId", filters.categoriaId);
      if (filters.restauranteId) params.append("restauranteId", filters.restauranteId);
      if (filters.pageNumber) params.append("pageNumber", String(filters.pageNumber));
      if (filters.pageSize) params.append("pageSize", String(filters.pageSize));
      if (filters.orderBy) params.append("orderBy", filters.orderBy);
      if (filters.orderDirection) params.append("orderDirection", filters.orderDirection);
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al cargar variantes");
    return res.json();
  },

  async getById(id: string): Promise<Variante> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Error al cargar la variante");
    return res.json();
  },

  async create(data: VarianteCreate): Promise<Variante> {
    const formData = new FormData();
    formData.append("Name", data.name);
    if (data.categoriaId) {
      formData.append("CategoriaId", data.categoriaId.toString());
    }
    if (data.restauranteId) {
      formData.append("RestauranteId", data.restauranteId.toString());
    }
    formData.append("Obligatorio", data.obligatorio.toString());
    formData.append("MaxSeleccion", data.maxSeleccion.toString());
    data.opciones.forEach((opcion, index) => {
      formData.append(`Opciones[${index}].Nombre`, opcion.nombre);
      formData.append(`Opciones[${index}].Precio`, opcion.precio.toString());
    });
    
    const res = await fetch(`${API_URL}/variante`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Error al crear variante");
    return res.json();
  },

  async update(id: string, data: VarianteCreate): Promise<Variante> {
    
    const formData = new FormData();
    formData.append("Name", data.name);
    if (data.categoriaId) {
      formData.append("CategoriaId", data.categoriaId.toString());
    }
    if (data.restauranteId) {
      formData.append("RestauranteId", data.restauranteId.toString());
    }
    formData.append("Obligatorio", data.obligatorio.toString());
    formData.append("MaxSeleccion", data.maxSeleccion.toString());
    data.opciones.forEach((opcion, index) => {
      
      if (opcion.id) {
        formData.append(`Opciones[${index}].Id`, opcion.id.toString());
      }
      formData.append(`Opciones[${index}].Nombre`, opcion.nombre);
      formData.append(`Opciones[${index}].Precio`, opcion.precio.toString());
    });

    const res = await fetch(`${API_URL}/variante/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error("Error al actualizar variante");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/variante/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar variante");
  },
};
