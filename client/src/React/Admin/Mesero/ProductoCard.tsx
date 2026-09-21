import { IconPlus, IconUtensilios } from "@/React/Admin/Mesero/icons";
import { fmt } from "@/React/Admin/Mesero/utils";

interface Props {
  nombre: string;
  precio: number;
  imagen?: string;
  descripcion?: string;
  esCombo?: boolean;
  onAgregar: () => void;
}

export default function ProductoCard({
  nombre,
  precio,
  imagen,
  descripcion,
  esCombo = false,
  onAgregar,
}: Props) {
  return (
    <button
      type="button"
      onClick={onAgregar}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-orange-50">
        {imagen ? (
          <img
            src={imagen}
            alt={nombre}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <IconUtensilios className="h-9 w-9 text-orange-300" />
          </div>
        )}
        {esCombo && (
          <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Combo
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">{nombre}</p>
        {descripcion && <p className="line-clamp-1 text-xs text-gray-400">{descripcion}</p>}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-bold text-orange-600">{fmt(precio)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white transition group-hover:bg-orange-700">
            <IconPlus className="h-3.5 w-3.5" />
            Agregar
          </span>
        </div>
      </div>
    </button>
  );
}
