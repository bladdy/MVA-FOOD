import type { FacturaVentaDetalleDto } from "@/Types/Restaurante";
import { IconCheck } from "@/React/Admin/Mesero/icons";

interface Props {
  mesaNumero: number;
  factura: FacturaVentaDetalleDto;
  onSeguir: () => void;
}

/**
 * Confirmación de que la cuenta quedó en manos de caja.
 *
 * El mesero no cobra ni imprime: solo ve el número de factura y el total para tener la
 * referencia. El ticket lo imprime caja, que lo lleva al cliente.
 */
export default function ModalCuentaCerrada({ mesaNumero, factura, onSeguir }: Props) {
  const total = factura.totalConPropina ?? factura.total;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cuenta-caja"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <IconCheck className="h-5 w-5" />
          </span>
          <div>
            <h3 id="modal-cuenta-caja" className="text-lg font-bold text-gray-800">
              Cuenta enviada a caja
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Factura {factura.numeroFactura} · Mesa {mesaNumero}
            </p>
          </div>
        </div>

        <dl className="mb-5 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Total a cobrar</dt>
            <dd className="text-xl font-bold text-gray-800">
              {total.toFixed(2)} {factura.moneda}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Mesero</dt>
            <dd className="font-medium text-gray-800">{factura.meseroNombre || "—"}</dd>
          </div>
        </dl>

        <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Pendiente de cobro.</strong> Caja imprimirá la cuenta, se la llevará al
          cliente y marcará la factura como pagada cuando reciba el dinero. La mesa ya
          quedó libre.
        </p>

        <button
          onClick={onSeguir}
          className="flex w-full items-center justify-center rounded-xl bg-orange-600 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-card transition hover:bg-orange-700"
        >
          Volver a mesas
        </button>
      </div>
    </div>
  );
}
