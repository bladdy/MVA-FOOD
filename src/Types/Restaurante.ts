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
  amnidades: string
}