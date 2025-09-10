import type { MenuCreate, Categoria, Menu, PagedResult, MenuFilters, VarianteCreate, Variante, VarianteFilters, Amenidad } from "@/Types/Restaurante.ts";

const API_URL = "http://localhost:5147/api";

export const menuService = {
  async create(menu: MenuCreate) {
    const formData = new FormData();
    formData.append("Nombre", menu.nombre);
    formData.append("Ingredientes", menu.ingredientes);
    formData.append("Precio", menu.precio.toString());
    formData.append("Activo", String(menu.activo));
    formData.append("CategoriaId", menu.categoriaId);
    formData.append("RestauranteId", menu.restauranteId);

    if (menu.imagen) formData.append("Image", menu.imagen);

    // Convertimos las variantes a las propiedades exactas que espera el backend
    const variantesBackend = menu.variantes.map((v) => ({
      Id: v.id,
      Name: v.name,
      Obligatorio: v.obligatorio,
      MaxSeleccion: v.maxSeleccion,
      Opciones: v.opciones.map((op) => ({
        Nombre: op.nombre,
        Precio: op.precio,
      })),
    }));

    // acá serializamos solo las variantes
    variantesBackend.forEach((v, i) => {
      formData.append(`Variantes[${i}].Name`, v.Name);
      v.Opciones.forEach((o, j) => {
        formData.append(`Variantes[${i}].Opciones[${j}].Nombre`, o.Nombre);
        formData.append(
          `Variantes[${i}].Opciones[${j}].Precio`,
          o.Precio.toString()
        );
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
    formData.append("Activo", String(menu.activo));
    formData.append("CategoriaId", menu.categoriaId);
    formData.append("RestauranteId", menu.restauranteId);

    // Solo enviar imagen si cambió
    if (menu.imagen && typeof menu.imagen !== "string") {
      formData.append("Image", menu.imagen);
    }

    // Variantes
    menu.variantes.forEach((v, i) => {
      formData.append(`Variantes[${i}].Name`, v.name);
      formData.append(`Variantes[${i}].Obligatorio`, String(v.obligatorio));
      formData.append(`Variantes[${i}].MaxSeleccion`, String(v.maxSeleccion));
      v.opciones.forEach((op, j) => {
        formData.append(`Variantes[${i}].Opciones[${j}].Nombre`, op.nombre);
        formData.append(
          `Variantes[${i}].Opciones[${j}].Precio`,
          String(op.precio)
        );
      });
    });

    const res = await fetch(`${API_URL}/Menu/${id}`, {
      method: "PUT",
      body: formData, // <-- NO headers Content-Type
    });

    return res.json();
  },
  // 🔹 Nuevo: Obtener variantes
  async getVariantes( filters: VarianteFilters): Promise<PagedResult<Variante>> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.categoriaId) params.append("categoriaId", filters.categoriaId);
    if (filters.obligatorio) params.append("obligatorio", String(filters.obligatorio));
    if (filters.maxSeleccion) params.append("maxSeleccion", String(filters.maxSeleccion));
    if (filters.pageNumber) params.append("pageNumber", String(filters.pageNumber));
    if (filters.pageSize) params.append("pageSize", String(filters.pageSize));
    if (filters.orderBy) params.append("orderBy", filters.orderBy);
    if (filters.orderDirection) params.append("orderDirection", filters.orderDirection);

    const res = await fetch(`${API_URL}/Variante?${params.toString()}`);
    return res.json();
  },

  async getCategorias(): Promise<Categoria[]> {
    const res = await fetch(`${API_URL}/Categoria`);
    const data = await res.json();
    return data;
  },
  // 🔹 Nuevo método: Obtener amenidades
  async getAmenidades(): Promise<Amenidad[]> {
    const res = await fetch(`${API_URL}/Amenidades`);
    if (!res.ok) return [];
    return res.json();
  },
  // Nuevo método para obtener todos los menús
  async getMenus(filters: MenuFilters): Promise<PagedResult<Menu>> {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.restauranteId) params.append("restauranteId", filters.restauranteId);
    if (filters.categoriaId) params.append("categoriaId", filters.categoriaId);
    if (filters.activo !== undefined) params.append("activo", String(filters.activo));
    if (filters.orderBy) params.append("orderBy", filters.orderBy);
    if (filters.orderDirection) params.append("orderDirection", filters.orderDirection);
    if (filters.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
    if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());

    const res = await fetch(`${API_URL}/Menu?${params.toString()}`);
    if (!res.ok) return new Promise<PagedResult<Menu>>((resolve) => resolve({ items: [], totalItems: 0 , pageNumber: 1, pageSize: 10, totalPages: 0}));
    return res.json();
  },
};
