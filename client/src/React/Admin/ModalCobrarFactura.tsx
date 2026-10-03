import { useEffect, useRef, useState } from "react";
import { metodoPagoService } from "@/Services/metodoPagoService";
import { getCurrencySymbol } from "@/lib/currency";
import type { FacturaVentaDetalleDto, MetodoPagoResponse } from "@/Types/Restaurante";
import FacturaReceipt from "@/React/Admin/FacturaReceipt";

interface Props {
  factura: FacturaVentaDetalleDto;
  restauranteId: string;
  onConfirmar: (dto: { metodoPago?: string; montoRecibido: number }) => Promise<void>;
  onCancelar: () => void;
}

/**
 * Caja registra el cobro de una cuenta que el mesero envió a cobrar.
 *
 * El método de pago lo confirma aquí y no el mesero, porque es caja quien tiene el
 * dinero en la mano. El monto recibido permite calcular el cambio cuando el cliente
 * paga en efectivo con un billete mayor.
 */
export default function ModalCobrarFactura({
  factura,
  restauranteId,
  onConfirmar,
  onCancelar,
}: Props) {
  const total = factura.totalConPropina ?? factura.total;
  const [metodos, setMetodos] = useState<MetodoPagoResponse[]>([]);
  const [metodoPago, setMetodoPago] = useState(factura.metodoPago ?? "");
  const [montoTexto, setMontoTexto] = useState(total.toFixed(2));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const montoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!restauranteId) return;
    metodoPagoService
      .getAll(restauranteId)
      .then((res) => setMetodos(res.filter((m) => m.activo)))
      .catch(() => setMetodos([]));
  }, [restauranteId]);

  useEffect(() => {
    montoInputRef.current?.focus();
    montoInputRef.current?.select();
  }, []);

  const monto = Number.parseFloat(montoTexto.replace(",", "."));
  const montoValido = Number.isFinite(monto);
  const insuficiente = montoValido && monto < total;
  const cambio = montoValido ? Math.max(0, Math.round((monto - total) * 100) / 100) : 0;

  const simb = getCurrencySymbol(factura.moneda);
  const fmt = (n: number) => `${simb}${n.toFixed(2)}`;

  const confirmar = async () => {
    if (!montoValido || insuficiente) {
      setError(
        insuficiente
          ? `El monto recibido es menor al total (${fmt(total)}).`
          : "Ingresa un monto válido.",
      );
      return;
    }
    if (!metodoPago) {
      setError("Selecciona el método de pago con el que se cobró.");
      return;
    }

    setCargando(true);
    setError("");
    try {
      await onConfirmar({ metodoPago, montoRecibido: Math.round(monto * 100) / 100 });
    } catch (e) {
      setError((e as Error).message || "No se pudo registrar el cobro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cobrar"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !cargando) onCancelar();
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6 py-4 lg:flex-row lg:items-start">
        {/* Vista previa del ticket que caja lleva al cliente. */}
        <div className="mx-auto w-full max-w-xs shrink-0">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-white/80">
            Vista previa del ticket
          </p>
          <div className="max-h-[70vh] overflow-y-auto">
            <FacturaReceipt factura={factura} showPrintButton={false} />
          </div>
        </div>

        {/* Formulario de cobro. */}
        <div className="flex-1 rounded-2xl bg-white p-6 shadow-2xl">
          <h2 id="modal-cobrar" className="text-lg font-bold text-gray-800">
            Registrar cobro
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {factura.numeroFactura}
            {factura.numeroMesa ? ` · Mesa ${factura.numeroMesa}` : ""}
            {factura.meseroNombre ? ` · ${factura.meseroNombre}` : ""}
          </p>

          <dl className="mt-5 space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd>{fmt(factura.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">
                Impuesto{factura.impuestoIncluido ? " (incluido)" : ""}
              </dt>
              <dd>{fmt(factura.impuesto)}</dd>
            </div>
            {factura.porcentajePropina > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Propina ({factura.porcentajePropina}%)</dt>
                <dd>{fmt(factura.propina)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-800">
              <dt>Total a cobrar</dt>
              <dd>{fmt(total)}</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="cobrar-metodo"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Método de pago
              </label>
              <select
                id="cobrar-metodo"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Seleccionar...</option>
                {metodos.map((m) => (
                  <option key={m.id} value={m.nombre}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="cobrar-monto"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Monto recibido
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{simb}</span>
                <input
                  id="cobrar-monto"
                  ref={montoInputRef}
                  type="text"
                  inputMode="decimal"
                  value={montoTexto}
                  onChange={(e) => setMontoTexto(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-describedby="cobrar-cambio"
                  aria-invalid={insuficiente}
                  className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 ${
                    insuficiente
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:ring-orange-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMontoTexto(total.toFixed(2))}
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 transition hover:bg-gray-50"
                >
                  Total
                </button>
              </div>
            </div>

            <div
              id="cobrar-cambio"
              className={`flex justify-between rounded-lg px-4 py-3 text-sm ${
                insuficiente
                  ? "bg-red-50 text-red-700"
                  : cambio > 0
                    ? "bg-amber-50 text-amber-800"
                    : "bg-green-50 text-green-800"
              }`}
            >
              <span>{insuficiente ? "Falta por recibir" : "Cambio a devolver"}</span>
              <span className="font-bold">
                {fmt(insuficiente ? total - (montoValido ? monto : 0) : cambio)}
              </span>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={cargando || insuficiente || !montoValido}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {cargando ? "Registrando..." : "Confirmar cobro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
