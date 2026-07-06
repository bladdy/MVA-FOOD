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
  restauranteId?: string;
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
  restauranteId?: string;
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
  instagram?: string
  facebook?: string
  whatsapp?: string
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
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
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
  pais?: string;
}
export interface Restaurante {

  id?: string;
  name: string;
  slogan: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
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
  pais?: string;
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
  restauranteId?: string;
  obligatorio: boolean;
  maxSeleccion?: number; 
  opciones: {
    id: string;
    nombre: string;
    precio: number;
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
  id: string;
  nombre: string;
  precio: number;
  duracionDias: number;
  stripePriceId?: string;
  moneda: string;
}

export interface PlanRestaurante {
  id: string;
  nombre: string;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  fechaPago: string;
  pagado: boolean;
  stripeSubscriptionId?: string;
  moneda?: string;
}

export interface FacturaDto {
  id: string;
  restauranteId: string;
  numeroFactura: string;
  monto: number;
  fechaEmision: string;
  fechaPago?: string;
  pagado: boolean;
  concepto: string;
  pdfPath?: string;
  planNombre: string;
  periodo: string;
  moneda: string;
}

export interface FacturaDetalleDto extends FacturaDto {
  stripePaymentIntentId?: string;
  restauranteNombre: string;
  restauranteDireccion: string;
  restauranteRnc?: string;
}

export interface DashboardInfoDto {
  planNombre: string;
  planPrecio: number;
  moneda: string;
  fechaFin: string;
  diasRestantes: number;
  esGratuito: boolean;
  tieneFacturaPendiente: boolean;
  montoPendiente?: number;
  facturaPendienteId?: string;
  estado: string;
}

export interface PagarFacturaResponseDto {
  checkoutUrl: string;
}

export interface CambiarPlanDto {
  restauranteId: string;
  nuevoPlanId: string;
}

export interface CambioPlanResponseDto {
  checkoutUrl: string;
  sessionId: string;
}

export interface CreatePaymentIntentDto {
  facturaId: string;
}

export interface PaymentIntentResponseDto {
  clientSecret: string;
  facturaId: string;
  monto: number;
}

export interface CreateSubscriptionDto {
  restauranteId: string;
  planId: string;
}

export interface CreateSubscriptionResponseDto {
  clientSecret: string;
  facturaId: string;
  subscriptionId: string;
}

export interface UpdateSubscriptionResponseDto {
  requierePago: boolean;
  clientSecret?: string;
  facturaId?: string;
  montoAPagar: number;
  mensaje: string;
  moneda: string;
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
export interface PedidoFilters {
  restauranteId: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: number;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
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
  imagenFile?: File | null;
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



