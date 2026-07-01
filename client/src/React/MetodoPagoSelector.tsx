import type { MetodoPagoResponse } from "@/Types/Restaurante.ts";

interface Props {
  metodos: MetodoPagoResponse[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

export default function MetodoPagoSelector({ metodos, selectedId, onChange }: Props) {
  const activos = metodos.filter((m) => m.activo);
  if (activos.length === 0) return null;

  const seleccionado = activos.find((m) => m.id === selectedId) ?? activos[0];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Método de pago</h3>
      <div className="flex flex-wrap gap-2">
        {activos.map((metodo) => (
          <button
            key={metodo.id}
            onClick={() => onChange(metodo.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              seleccionado.id === metodo.id
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
            }`}
          >
            {metodo.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
