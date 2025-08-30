import type { MenuCreate, Categoria } from "@/Types/Restaurante.ts";

const API_URL = "http://localhost:5147/api";

export const menuService = {
  async create(menu: MenuCreate) {
    const formData = new FormData();
    formData.append("Nombre", menu.nombre);
    formData.append("Ingredientes", menu.ingredientes);
    formData.append("Precio", menu.precio.toString());
    formData.append("CategoriaId", menu.categoriaId);
    formData.append("RestauranteId", menu.restauranteId);

    if (menu.image) formData.append("Image", menu.image);

    // Convertimos las variantes a las propiedades exactas que espera el backend
    const variantesBackend = menu.variantes.map(v => ({
      Id: v.id,
      Name: v.name,
      Obligatorio: v.obligatorio,
      MaxSeleccion: v.maxSeleccion,
      Opciones: v.opciones.map(op => ({
        Nombre: op.nombre,
        Precio: op.precio,
      })),
    }));

    formData.append("Variantes", JSON.stringify(variantesBackend));

    const res = await fetch(`${API_URL}/Menu`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data;
  },

  async update(id: string, menu: MenuCreate) {
    const formData = new FormData();
    formData.append("Nombre", menu.nombre);
    formData.append("Ingredientes", menu.ingredientes);
    formData.append("Precio", menu.precio.toString());
    formData.append("CategoriaId", menu.categoriaId);
    formData.append("RestauranteId", menu.restauranteId);

    if (menu.image) formData.append("Image", menu.image);

    const variantesBackend = menu.variantes.map(v => ({
      Id: v.id,
      Name: v.name,
      Obligatorio: v.obligatorio,
      MaxSeleccion: v.maxSeleccion,
      Opciones: v.opciones.map(op => ({
        Nombre: op.nombre,
        Precio: op.precio,
      })),
    }));

    formData.append("Variantes", JSON.stringify(variantesBackend));

    const res = await fetch(`${API_URL}/Menu/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    return data;
  },

  async getCategorias(): Promise<Categoria[]> {
    const res = await fetch(`${API_URL}/Categoria`);
    const data = await res.json();
    return data;
  },
};
