import type { MenuCreate, Categoria, Menu  } from "@/Types/Restaurante.ts";

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

    // acá serializamos solo las variantes
    variantesBackend.forEach((v, i) => {
      formData.append(`Variantes[${i}].Name`, v.Name);
      v.Opciones.forEach((o, j) => {
        formData.append(`Variantes[${i}].Opciones[${j}].Nombre`, o.Nombre);
        formData.append(`Variantes[${i}].Opciones[${j}].Precio`, o.Precio.toString());
      });
    });

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
  // Nuevo método para obtener todos los menús
  async getMenus(): Promise<Menu[]> {
    const res = await fetch(`${API_URL}/Menu`);
    return res.json();
  },
};
