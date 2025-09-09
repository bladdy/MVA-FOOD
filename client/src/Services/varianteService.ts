// src/Services/varianteService.ts
import type { VarianteCreate, Variante, PagedResult } from "@/Types/Restaurante.ts";

const API_URL = "http://localhost:5147/api";

export const varianteService = {
  async getAll(): Promise<PagedResult<Variante>> {
    const res = await fetch(API_URL);
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
