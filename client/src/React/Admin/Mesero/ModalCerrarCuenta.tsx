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

export default function ModalCerrarCuenta({
  cuenta,
  cerrando,
  error,
  onCerrar,
  onCancelar,
}: Props) {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteNumeroFiscal, setClienteNumeroFiscal] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("en mesa");
  const [nota, setNota] = useState("");

  const tiposEntregaMesa: { value: string; label: string }[] = [
    { value: "en mesa", label: "En mesa" },
    { value: "para comer aquí", label: "Para comer aquí" },
  ];

  // El método de pago no se pregunta aquí: caja lo confirma al cobrar, porque el
  // mesero no entrega ni recibe el dinero.
  const submit = () => {
    onCerrar({
      clienteNombre,
      clienteTelefono,
      clienteNumeroFiscal: clienteNumeroFiscal || undefined,
      tipoEntrega,
      nota: nota || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cerrar-cuenta"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2
            id="modal-cerrar-cuenta"
            className="text-lg font-bold text-gray-800"
          >
            Enviar cuenta de la mesa {cuenta.numeroMesa} a caja
          </h2>
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
            {cuenta.porcentajePropina > 0 && (
              <div className="flex justify-between">
                <span>Propina ({cuenta.porcentajePropina}%)</span>
                <span>{fmt(cuenta.propina)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-orange-200 pt-2 font-bold text-gray-800">
              <span>Total a cobrar</span>
              <span className="text-xl font-bold text-orange-700">
                {fmt(cuenta.totalConPropina ?? cuenta.total)}
              </span>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                {tiposEntregaMesa.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
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

          <p className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            Al enviar la cuenta, <strong>caja la imprime</strong>, se la lleva al cliente y
            registra el pago cuando recibe el dinero. La mesa queda libre de inmediato.
          </p>

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
              {cerrando ? "Enviando a caja..." : "Enviar a caja"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
