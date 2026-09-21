import { useState } from "react";
import type { CerrarCuentaMesaDto, CuentaMesaDetalleDto } from "@/Types/Restaurante";
import { fmt, parseComboInternos, parseOpciones } from "@/React/Admin/Mesero/utils";

interface Props {
  cuenta: CuentaMesaDetalleDto;
  cerrando: boolean;
  error: string;
  onCerrar: (dto: CerrarCuentaMesaDto) => void;
  onCancelar: () => void;
}

const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia", "QR"];

export default function ModalCerrarCuenta({ cuenta, cerrando, error, onCerrar, onCancelar }: Props) {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteNumeroFiscal, setClienteNumeroFiscal] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("en mesa");
  const [metodoPago, setMetodoPago] = useState("");
  const [nota, setNota] = useState("");

  const submit = () => {
    onCerrar({
      clienteNombre,
      clienteTelefono,
      clienteNumeroFiscal: clienteNumeroFiscal || undefined,
      tipoEntrega,
      metodoPago: metodoPago || undefined,
      nota: nota || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">Cerrar cuenta de la mesa {cuenta.numeroMesa}</h2>
          <button
            onClick={onCancelar}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-6">
          {cuenta.items.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Productos a facturar</label>
              <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {cuenta.items.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <span>
                      <span className="font-medium">
                        {item.cantidad}x {item.nombre}
                      </span>
                      {item.esCombo && item.comboItemsJson && (
                        <span className="ml-2 text-xs text-gray-500">
                          {parseComboInternos(item.comboItemsJson)
                            .map((int) => `${int.cantidad}x ${int.nombre}`)
                            .join(", ")}
                        </span>
                      )}
                      {parseOpciones(item.opciones).length > 0 && (
                        <span className="ml-2 text-xs text-orange-600">
                          + {parseOpciones(item.opciones).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{fmt(item.precio * item.cantidad)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-0.5 rounded-xl bg-orange-50 p-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(cuenta.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuesto</span>
              <span>{fmt(cuenta.impuesto)}</span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-2 font-bold text-gray-800">
              <span>Total</span>
              <span className="text-xl font-bold text-orange-700">{fmt(cuenta.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
              <input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                placeholder="Teléfono"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">RNC/RFC (opcional)</label>
              <input
                value={clienteNumeroFiscal}
                onChange={(e) => setClienteNumeroFiscal(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de entrega</label>
              <select
                value={tipoEntrega}
                onChange={(e) => setTipoEntrega(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="en mesa">En mesa</option>
                <option value="recoger">Para recoger</option>
                <option value="domicilio">A domicilio</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Método de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Seleccionar...</option>
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nota</label>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Opcional"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancelar}
              disabled={cerrando}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={cerrando}
              className={`rounded-md px-5 py-2 text-sm font-medium text-white ${
                cerrando ? "cursor-not-allowed bg-gray-400" : "bg-orange-600 transition hover:bg-orange-700"
              }`}
            >
              {cerrando ? "Cerrando..." : "Cerrar cuenta y facturar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
