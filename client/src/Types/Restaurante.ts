// src/Types/Restaurante.ts

export interface VarianteOpcionCreate {
  id: string;
  nombre: string;
  precio: number;
}
export interface PagedResult<T> {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  items: T[];
  totalPages: number;
}
export interface MenuFilters {
  search?: string;
  restauranteId?: string;
  activo?: boolean;
  categoriaId?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}
export interface VarianteFilters {
  search?: string;
  categoriaId?: string;
  obligatorio?: boolean;
  maxSeleccion?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface VarianteCreate {
  id: string;
  name: string;
  categoriaId?: string;
  obligatorio: boolean;
  maxSeleccion: number;
  opciones: VarianteOpcionCreate[];
}

export interface MenuCreate {
  id: string;
  nombre: string;
  ingredientes: string;
  precio: number;
  activo: boolean;
  categoriaId: string; // Solo enviamos el id al backend
  restauranteId: string;
  imagen: File | null; // archivo nuevo a subir
  variantes: VarianteCreate[];
}

// Interface para Categoria recibida del API
export interface Categoria {
  id: string;
  nombre: string;
}
export interface RestauranteUpdateDto {
  id?: string
  name: string
  direccion: string
  phone: string
  perfilImage: string | File | null
  image: string | File | null
  amenidadIds?: string[]
  categoriaIds?: string[]
  horarios?: Horario[]
  tipos?: string[]
  plan?: string
  horario?: string
}


export interface Restaurante {
  id?: string;
  name: string;
  direccion: string;
  phone: string;
  perfilImage: File | string | null;
  image: File | string | null;
  amnidades: string[];
  categorias: string[];
  horarios: Horario[];

  // Campos opcionales
  tipos?: string[];
  plan?: string;
  horario?: string;
  menus?: any[];
}


export interface Amenidad {
  id: string
  svg: any
  nombre: string
}



export interface Menu {
  id: string;
  nombre: string;
  ingredientes: string;
  precio: number;
  activo: boolean;
  categoriaId: string; // Agregado para compatibilidad
  categoria: Categoria;
  restauranteId: string;
  imagen: string;
  ImageFullPath: string;
  variantes?: Variante[];
}

export interface Variante {
  id: string;
  name: string;
  categoriaId: string;
  categoria?: Categoria;
  obligatorio: boolean;
  maxSeleccion?: number; 
  opciones: {
    id: string;
    nombre: string;
    precio: number; // ahora obligatorio para cuadrar con MenuCreate
  }[];
}

export interface Plan {
  id: number;
  name: string;
}

export interface Amnidades {
  svg: string;
  name: string;
}

export interface Horario {
  id:string;
  dia: string;
  horaApertura: string;
  horaCierre: string;
}
export type Categorias =
    "Todas"
  | "Entradas"
  | "Plato Fuerte"
  | "Burger & Street Food"
  | "Steak House"
  | "Pollo Frito"
  | "Mariscos"
  | "Ensaladas"
  | "Pescados"
  | "Pizza"
  | "Pastas"
  | "Sopas"
  | "Kids"
  | "Bebidas"
  | "Postres";
