export interface Horario {
  dia: string
  apertura: string
  cierre: string
}

export interface Restaurante {
  id: string
  name: string
  image: string
  tipos: string[]
  perfilImage: string
  direccion: string
  phone: string,
  horario: Horario[]
  amnidades: Amnidades[]
  menu: Menu[]
}

export interface Menu {
  // Define the properties of Menu here, for example:
  id: string;
  name: string;
  ingredientes: string
  price: number;
  categoria: Categorias
}

export interface Amnidades {
  svg: string
  name: string
}

export type Categorias = "Kids" | "Entradas" | "Plato Fuerte" | "Postres"| "Sopas" | "Bebidas" | "Burger & Street Food";