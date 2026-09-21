import { IconCerrar, IconCheck } from "@/React/Admin/Mesero/icons";
import { fmt } from "@/React/Admin/Mesero/utils";
import type { Menu } from "@/Types/Restaurante";

interface Props {
  producto: Menu;
  selecciones: Record<string, string[]>;
  error: string;
  precioTotal: number;
  onToggleSeleccion: (grupoId: string, opcion: string) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalItem({
  producto,
  selecciones,
  error,
  precioTotal,
  onToggleSeleccion,
  onConfirmar,
  onCancelar,
}: Props) {
  const variantes = producto.variantes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl sm:p-6">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-800">{producto.nombre}</h3>
          <button
            onClick={onCancelar}
            className="shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <IconCerrar />
          </button>
        </div>
        {producto.ingredientes && (
          <p className="mb-4 text-sm text-gray-500">{producto.ingredientes}</p>
        )}

        {variantes.map((grupo) => (
          <div key={grupo.id} className="mb-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              {grupo.name}
              {grupo.obligatorio && <span className="text-red-500"> *</span>}
            </p>
            <div className="space-y-2">
              {grupo.opciones.map((op) => {
                const seleccionada = (selecciones[grupo.id] || []).includes(op.nombre);
                return (
                  <button
                    key={op.id}
                    onClick={() => onToggleSeleccion(grupo.id, op.nombre)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      seleccionada
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {seleccionada && <IconCheck className="h-3.5 w-3.5 text-orange-600" />}
                      {op.nombre}
                    </span>
                    <span className={seleccionada ? "font-semibold" : "text-gray-400"}>
                      {op.precio ? `+${fmt(op.precio)}` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onCancelar}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-orange-700"
          >
            Agregar · {fmt(precioTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
