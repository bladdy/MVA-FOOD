// src/Types/Restaurante.ts

export interface VarianteOpcionCreate {
  nombre: string;
  precio: number;
}

export interface VarianteCreate {
  id: string;
  name: string;
  obligatorio: boolean;
  maxSeleccion: number;
  opciones: VarianteOpcionCreate[];
}

export interface MenuCreate {
  nombre: string;
  ingredientes: string;
  precio: number;
  categoriaId: string; // Solo enviamos el id al backend
  restauranteId: string;
  image: File | null;
  variantes: VarianteCreate[];
}

// Interface para Categoria recibida del API
export interface Categoria {
  id: string;
  nombre: string;
}


export interface Horario {
  dia: string;
  apertura: string;
  cierre: string;
}

export interface Restaurante {
  id: string;
  name: string;
  image: string;
  tipos: string[];
  perfilImage: string;
  direccion: string;
  phone: string;
  plan: Plan;
  horario: Horario[];
  amnidades: Amnidades[];
  menu: Menu[];
}

export interface PedidoItem {
  producto: Menu;
  cantidad: number;
  notas?: string;
}


export interface Menu {
  // Define the properties of Menu here, for example:
  id: string;
  name: string;
  ingredientes: string;
  price: number;
  categoria: Categorias;
  restauranteId: string;
  imagen: string;  
  variantes?: Variante[]; // <- aquí añadimos las variantes
}

export interface Plan {
  id: number;
  name: string;
}

export interface Amnidades {
  svg: string;
  name: string;
}

export interface Variante {
  id: string;
  name: string;
  obligatorio: boolean;
  maxSeleccion?: number; // si >1, es checkbox
  opciones: {
    nombre: string;
    precio?: number;
  }[];
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
