/**
 * Estados de FacturaVenta. Deben coincidir con `EstadoFacturaVenta` en la API
 * (api/MVA-FOOD.Core/Entities/FacturaVenta.cs).
 *
 * El ciclo real es:
 *   PendienteCobro -> Pagada      (el mesero envía a caja, caja cobra)
 *   Pagada / Emitida -> Anulada   (solo Admin; anula Emitida/PendienteCobro)
 *
 * Solo Emitida y Pagada son dinero cobrado.
 */
export const ESTADO_FACTURA = {
  /** Venta directa en mostrador: el cliente pagó en el acto. */
  Emitida: 0,
  Anulada: 1,
  /** El mesero cerró la cuenta y la envió a caja; falta cobrar. */
  PendienteCobro: 2,
  /** Caja cobró y confirmó el pago. */
  Pagada: 3,
} as const;

export type EstadoFactura = (typeof ESTADO_FACTURA)[keyof typeof ESTADO_FACTURA];

interface EstadoFacturaMeta {
  label: string;
  badge: string;
  /** Texto para lectores de pantalla y títulos de columna. */
  descripcion: string;
}

export const ESTADO_FACTURA_META: Record<number, EstadoFacturaMeta> = {
  [ESTADO_FACTURA.Emitida]: {
    label: "Cobrada",
    badge: "bg-teal-100 text-teal-700",
    descripcion: "Cobrada en mostrador",
  },
  [ESTADO_FACTURA.Anulada]: {
    label: "Anulada",
    badge: "bg-red-100 text-red-700",
    descripcion: "Anulada, sin efecto contable",
  },
  [ESTADO_FACTURA.PendienteCobro]: {
    label: "Por cobrar",
    badge: "bg-amber-100 text-amber-700",
    descripcion: "Enviada a caja, pendiente de cobro",
  },
  [ESTADO_FACTURA.Pagada]: {
    label: "Pagada",
    badge: "bg-green-100 text-green-700",
    descripcion: "Cobrada y confirmada por caja",
  },
};

export const estadoFacturaMeta = (estado: number): EstadoFacturaMeta =>
  ESTADO_FACTURA_META[estado] ?? {
    label: "Desconocido",
    badge: "bg-gray-100 text-gray-700",
    descripcion: "Estado desconocido",
  };

/** Espera el cobro de caja: caja debe imprimir, cobrar y confirmar. */
export const estaPendienteCobro = (estado: number): boolean =>
  estado === ESTADO_FACTURA.PendienteCobro;

/** Dinero efectivamente cobrado; cuenta como ingreso. */
export const estaCobrada = (estado: number): boolean =>
  estado === ESTADO_FACTURA.Emitida || estado === ESTADO_FACTURA.Pagada;

/**.Events del hub OrderHub usados por caja y mesero. */
export const HUB_EVENTOS = {
  FacturaPendienteCobro: "FacturaPendienteCobro",
  FacturaPagada: "FacturaPagada",
  NuevoPedido: "NuevoPedido",
  EstadoPedidoActualizado: "EstadoPedidoActualizado",
  EstadoItemActualizado: "EstadoItemActualizado",
} as const;
