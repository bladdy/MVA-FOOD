import type { TipoEntregaResponse } from "@/Types/Restaurante.ts";

interface Props {
  tipos: TipoEntregaResponse[];
  selectedId: string | null;
  onChange: (id: string) => void;
  subtotal?: number;
}

export default function TipoEntregaSelector({ tipos, selectedId, onChange, subtotal = 0 }: Props) {
  const activos = tipos.filter((t) => t.activo);
  if (activos.length === 0) return null;

  const seleccionado = activos.find((t) => t.id === selectedId) ?? activos[0];

  const calcularCosto = (tipo: TipoEntregaResponse): number => {
    if (tipo.costoFijo != null) return tipo.costoFijo;
    if (tipo.porcentaje != null) return subtotal * (tipo.porcentaje / 100);
    return 0;
  };

  const formatearCosto = (tipo: TipoEntregaResponse): string => {
    if (tipo.costoFijo != null) return `$${tipo.costoFijo.toFixed(2)}`;
    if (tipo.porcentaje != null) return `${tipo.porcentaje}% ($${calcularCosto(tipo).toFixed(2)})`;
    return "Gratis";
  };

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
        {activos.map((tipo) => (
          <button
            key={tipo.id}
            onClick={() => onChange(tipo.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              seleccionado.id === tipo.id
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            {tipo.nombre}
          </button>
        ))}
      </div>

      <div className="flex gap-6 text-sm text-gray-600 mt-3">
        <div className="flex flex-col items-center">
          <span className="text-warm-400 text-xs">Tiempo</span>
          <span className="font-semibold text-gray-800">
            {seleccionado.tiempoMinutos ? `${seleccionado.tiempoMinutos} min` : "—"}
          </span>
        </div>
        <div className="w-px bg-gray-200 self-stretch" />
        <div className="flex flex-col items-center">
          <span className="text-warm-400 text-xs">Costo envío</span>
          <span className="font-semibold text-gray-800">
            {formatearCosto(seleccionado)}
          </span>
        </div>
      </div>
    </div>
  );
}
