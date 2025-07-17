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
  imagen: string;
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
  | "Pastas"
  | "Sopas"
  | "Kids"
  | "Bebidas"
  | "Postres";
