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
  imagen: string;
}
export interface RestauranteUpdateDto {
  id?: string
  name: string
  slogan: string
  direccion: string
  phone: string
  perfilImage: string | File | null
  image: string | File | null
  amenidadIds?: string[]
  categoriaIds?: string[]
  horarios?: Horario[]
  tipos?: string[]
  plan?: Plan
  horario?: string
}

export interface RestauranteDTO {
  id?: string;
  name: string;
  slogan: string;
  slug: string;
  direccion: string;
  phone: string;
  perfilImage: File | string | null;
  image: string | File | null;
  amenidades: string[];
  categorias: string[];
  horarios: Horario[];

  // Campos opcionales
  tipos?: string[];
  plan?: Plan;
  horario?: string;
  menus?: any[];
  combos?: ComboResponse[];
  tiposEntrega?: TipoEntregaResponse[];
  metodosPago?: MetodoPagoResponse[];
}
export interface Restaurante {

  id?: string;
  name: string;
  slogan: string;
  direccion: string;
  slug: string;
  phone: string;
  perfilImage: File | string | null;
  image: File | string | null;
  amenidades: string[];
  categorias: string[];
  horarios: Horario[];

  // Campos opcionales
  tipos?: string[];
  plan?: Plan;
  horario?: string;
  menus?: any[];
  combos?: ComboResponse[];
  tiposEntrega?: TipoEntregaResponse[];
  metodosPago?: MetodoPagoResponse[];
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

export interface PedidoItem {
  producto: Menu | null;
  cantidad: number;
  notas: string;
  opciones: string;
  precio?: number;
  esCombo?: boolean;
  comboId?: string;
  comboNombre?: string;
  comboItemsJson?: string;
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
  horaAperturaTexto: string;
  horaCierreTexto: string;

  diaTexto: string;
}
export interface CreatePedidoDto {
  clienteNombre: string;
  clienteTelefono: string;
  tipoEntrega: string;
  metodoPago?: string;
  direccion?: string;
  restauranteId: string;
  items: {
    menuId?: string;
    cantidad: number;
    precio?: number;
    notas?: string;
    opciones?: string;
    esCombo?: boolean;
    comboId?: string;
    comboNombre?: string;
    comboItemsJson?: string;
  }[];
}

export interface ComboResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  imagen?: string;
  activo: boolean;
  predefinido: boolean;
  restauranteId: string;
  items: ComboItemResponse[];
  sugerencias?: ComboSugerenciaResponse[];
}

export interface ComboItemResponse {
  menuId: string;
  menuNombre: string;
  menuPrecio: number;
  menuImagen: string;
  cantidad: number;
}

export interface ComboSugerenciaResponse {
  menuId: string;
  menuNombre: string;
  precioAdicional: number;
}

export interface TipoEntregaResponse {
  id: string;
  restauranteId: string;
  nombre: string;
  tiempoMinutos?: number;
  costoFijo?: number;
  porcentaje?: number;
  activo: boolean;
}

export interface TipoEntregaCreate {
  nombre: string;
  tiempoMinutos?: number;
  costoFijo?: number;
  porcentaje?: number;
  activo: boolean;
}

export interface MetodoPagoResponse {
  id: string;
  restauranteId: string;
  nombre: string;
  icono?: string;
  activo: boolean;
}

export interface MetodoPagoCreate {
  nombre: string;
  icono?: string;
  activo: boolean;
}

export interface ComboCreate {
  nombre: string;
  descripcion?: string;
  precio?: number;
  activo: boolean;
  predefinido: boolean;
  restauranteId: string;
  imagenUrl?: string;
  items: { menuId: string; cantidad: number }[];
  sugerencias?: { menuId: string; precioAdicional: number }[];
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
  | "Sushi"
  | "Comida Japonesa"
  | "Postres";



