import { getCurrencySymbol } from "@/lib/currency";
import type { FacturaVentaDetalleDto } from "@/Types/Restaurante";

interface Props {
  factura: FacturaVentaDetalleDto;
  showPrintButton?: boolean;
}

function parseOpciones(opciones?: string): string[] {
  if (!opciones) return [];
  try {
    const arr = JSON.parse(opciones);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return opciones ? [opciones] : [];
  }
}

function parseComboItems(json?: string): { nombre: string; cantidad: number; opciones: string[] }[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const SEP = "─".repeat(44);
const SEP_DOBLE = "═".repeat(44);

export default function FacturaReceipt({ factura, showPrintButton = true }: Props) {
  const moneda = getCurrencySymbol(factura.moneda);
  const fecha = new Date(factura.fechaEmision);
  const fechaStr = fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  const horaStr = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  const fmt = (n: number) => `${moneda}${n.toFixed(2)}`;
  const anulada = factura.estado === 1;

  const lineaPrecio = (nombre: string, precio: string) => {
    const ancho = 44;
    const espacio = Math.max(1, ancho - nombre.length - precio.length);
    return nombre + " ".repeat(espacio) + precio;
  };

  return (
    <div>
      {showPrintButton && (
        <div className="print:hidden flex justify-end gap-3 mb-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md font-medium"
          >
            Imprimir
          </button>
        </div>
      )}

      <div className="ticket-print bg-white text-black p-4 mx-auto max-w-[280px] rounded-lg shadow" style={{ width: "80mm" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .ticket-print, .ticket-print * { visibility: visible; }
            .ticket-print { position: absolute; left: 0; top: 0; margin: 0; box-shadow: none; border-radius: 0; }
            @page { size: 80mm auto; margin: 0; }
          }
        `}</style>

        <div className="font-mono text-[13px] leading-[1.3]">
          {/* Encabezado */}
          <div className="text-center">
            <p className="font-bold uppercase tracking-wide text-[15px]">{factura.restauranteNombre}</p>
            {factura.restauranteDireccion && <p>{factura.restauranteDireccion}</p>}
            {factura.restauranteTelefono && <p>Tel: {factura.restauranteTelefono}</p>}
            {factura.restauranteNumeroFiscal && <p>{factura.restauranteNumeroFiscal}</p>}
          </div>

          <p className="my-2">{SEP}</p>

          <div className="text-center">
            <p className="font-bold text-[15px]">{anulada ? "FACTURA ANULADA" : "TICKET DE VENTA"}</p>
            <p className="font-bold">FACTURA N° {factura.numeroFactura}</p>
          </div>

          <p className="my-2">{SEP}</p>

          <div className="space-y-0.5">
            <p>Fecha: {fechaStr}  {horaStr}</p>
            {factura.pedidoId && <p>Orden: {factura.pedidoId.slice(0, 8).toUpperCase()}</p>}
            {factura.clienteNombre && <p>Cliente: {factura.clienteNombre}</p>}
            {factura.numeroMesa && <p>Mesa: {factura.numeroMesa}</p>}
            {factura.clienteTelefono && <p>Tel: {factura.clienteTelefono}</p>}
            {factura.clienteNumeroFiscal && <p>N° Fiscal: {factura.clienteNumeroFiscal}</p>}
            <p>
              {factura.tipoEntrega === "domicilio"
                ? "Entrega: Domicilio"
                : factura.tipoEntrega === "en mesa"
                  ? `Entrega: Mesa ${factura.numeroMesa ?? "—"}`
                  : "Entrega: Recoger"}
              {factura.metodoPago ? ` | Pago: ${factura.metodoPago}` : ""}
            </p>
          </div>

          <p className="my-2">{SEP}</p>

          {/* Items */}
          <div className="space-y-1">
            {factura.items.map((item, i) => {
              const totalItem = item.precio * item.cantidad;
              const opciones = parseOpciones(item.opciones);
              const comboInternos = parseComboItems((item as any).comboItemsJson);
              return (
                <div key={i}>
                  <p className="whitespace-nowrap">{lineaPrecio(`${item.cantidad} ${item.nombre}`, fmt(totalItem))}</p>
                  {opciones.length > 0 && (
                    <p className="text-[12px]">   + {opciones.join(", ")}</p>
                  )}
                  {item.esCombo && comboInternos.length > 0 && comboInternos.map((int, ii) => (
                    <p key={ii} className="text-[12px]">
                      {int.cantidad}x {int.nombre}
                      {int.opciones && int.opciones.length > 0 ? ` + ${int.opciones.join(", ")}` : ""}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>

          <p className="my-2">{SEP}</p>

          {/* Totales */}
          <div className="space-y-0.5">
            <p className="whitespace-nowrap">{lineaPrecio("Subtotal", fmt(factura.subtotal))}</p>
            {factura.porcentajeImpuesto > 0 ? (
              <p className="whitespace-nowrap">
                {lineaPrecio(
                  factura.impuestoIncluido
                    ? `Impuesto incluido (${factura.porcentajeImpuesto}%)`
                    : `Impuesto (${factura.porcentajeImpuesto}%)`,
                  fmt(factura.impuesto),
                )}
              </p>
            ) : (
              <p className="whitespace-nowrap">{lineaPrecio("Impuesto", fmt(0))}</p>
            )}
          </div>

          <p className="my-1">{SEP_DOBLE}</p>

          <p className="whitespace-nowrap font-bold text-[16px]">{lineaPrecio("TOTAL", fmt(factura.total))}</p>

          <p className="my-1">{SEP_DOBLE}</p>

          {factura.metodoPago && <p className="text-center">Pago: {factura.metodoPago}</p>}

          {anulada && (
            <p className="text-center font-bold mt-1">ANULADA{factura.nota ? ` - ${factura.nota}` : ""}</p>
          )}

          {factura.nota && !anulada && <p className="text-center mt-1">{factura.nota}</p>}

          <p className="my-2">{SEP}</p>

          <div className="text-center space-y-0.5">
            <p>¡Gracias por su compra!</p>
            {factura.mensajePieFactura && <p>{factura.mensajePieFactura}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
