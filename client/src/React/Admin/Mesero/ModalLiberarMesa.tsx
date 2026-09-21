import { IconCheck } from "@/React/Admin/Mesero/icons";

interface Props {
  mesaNumero: number;
  liberando: boolean;
  onLiberar: () => void;
  onSeguir: () => void;
}

export default function ModalLiberarMesa({ mesaNumero, liberando, onLiberar, onSeguir }: Props) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <IconCheck className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Factura creada</h3>
            <p className="text-sm text-gray-500">
              La mesa <span className="font-semibold text-gray-700">{mesaNumero}</span> terminó su
              servicio
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm text-gray-600">
          ¿Qué deseas hacer con la mesa {mesaNumero}?
        </p>

        <div className="space-y-2">
          <button
            onClick={onLiberar}
            disabled={liberando}
            className="flex w-full items-center justify-center rounded-xl bg-orange-600 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-card transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {liberando ? "Liberando..." : "Liberar mesa"}
          </button>
          <button
            onClick={onSeguir}
            disabled={liberando}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Seguir agregando órdenes
          </button>
        </div>
      </div>
    </div>
  );
}
