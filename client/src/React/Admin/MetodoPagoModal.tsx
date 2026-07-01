import { useState } from "react";
import type { MetodoPagoResponse } from "@/Types/Restaurante.ts";
import { metodoPagoService } from "@/Services/metodoPagoService.ts";

interface Props {
  metodo?: MetodoPagoResponse | null;
  onClose: () => void;
  onSave: () => void;
}

export default function MetodoPagoModal({ metodo, onClose, onSave }: Props) {
  const [activo, setActivo] = useState(metodo?.activo ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodo) return;

    await metodoPagoService.update(metodo.id, {
      nombre: metodo.nombre,
      activo,
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-600">
            Configurar: {metodo?.nombre}
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
