import { useState } from "react";
import type { TipoEntregaResponse } from "@/Types/Restaurante.ts";
import { tipoEntregaService } from "@/Services/tipoEntregaService.ts";

interface Props {
  tipo?: TipoEntregaResponse | null;
  onClose: () => void;
  onSave: () => void;
}

type TipoCosto = "gratis" | "fijo" | "porcentaje";

export default function TipoEntregaModal({ tipo, onClose, onSave }: Props) {
  const [tiempoMinutos, setTiempoMinutos] = useState(tipo?.tiempoMinutos?.toString() || "");
  const [activo, setActivo] = useState(tipo?.activo ?? true);

  const costoInicial: TipoCosto = tipo?.costoFijo != null ? "fijo" : tipo?.porcentaje != null ? "porcentaje" : "gratis";
  const [tipoCosto, setTipoCosto] = useState<TipoCosto>(costoInicial);
  const [valorCosto, setValorCosto] = useState(
    tipo?.costoFijo != null ? tipo.costoFijo.toString() : tipo?.porcentaje != null ? tipo.porcentaje.toString() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo) return;

    const costoFijo = tipoCosto === "fijo" ? parseFloat(valorCosto) || 0 : undefined;
    const porcentaje = tipoCosto === "porcentaje" ? parseFloat(valorCosto) || 0 : undefined;

    await tipoEntregaService.update(tipo.id, {
      nombre: tipo.nombre,
      tiempoMinutos: tiempoMinutos ? parseInt(tiempoMinutos) : undefined,
      costoFijo,
      porcentaje,
      activo,
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-600">
            Configurar: {tipo?.nombre}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Activo</label>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo estimado (minutos)</label>
            <input
              type="number"
              min={0}
              value={tiempoMinutos}
              onChange={(e) => setTiempoMinutos(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              placeholder="Ej: 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Costo de envío</label>
            <div className="flex gap-3 mb-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="tipoCosto"
                  checked={tipoCosto === "gratis"}
                  onChange={() => { setTipoCosto("gratis"); setValorCosto(""); }}
                />
                Sin costo
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="tipoCosto"
                  checked={tipoCosto === "fijo"}
                  onChange={() => setTipoCosto("fijo")}
                />
                Monto fijo
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="tipoCosto"
                  checked={tipoCosto === "porcentaje"}
                  onChange={() => setTipoCosto("porcentaje")}
                />
                % del subtotal
              </label>
            </div>
            {tipoCosto !== "gratis" && (
              <div className="relative">
                {tipoCosto === "fijo" && (
                  <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                )}
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={valorCosto}
                  onChange={(e) => setValorCosto(e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg p-2 text-sm ${tipoCosto === "fijo" ? "pl-7" : ""}`}
                  placeholder={tipoCosto === "fijo" ? "0.00" : "Ej: 10"}
                  required
                />
                {tipoCosto === "porcentaje" && (
                  <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium text-sm"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
