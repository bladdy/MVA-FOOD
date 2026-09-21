import {
  IconCerrar,
  IconLapiz,
  IconMinus,
  IconPapelera,
  IconPlus,
  IconRecibo,
} from "@/React/Admin/Mesero/icons";
import { fmt, parseOpciones, type CartItem } from "@/React/Admin/Mesero/utils";

interface Props {
  mesaNumero: number;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  creando: boolean;
  error: string;
  onCambiarCantidad: (idx: number, delta: number) => void;
  onEditar: (idx: number) => void;
  onQuitar: (idx: number) => void;
  onVaciar: () => void;
  onEnviar: () => void;
  onCerrar?: () => void;
}

export default function CartPanel({
  mesaNumero,
  cart,
  cartCount,
  cartTotal,
  creando,
  error,
  onCambiarCantidad,
  onEditar,
  onQuitar,
  onVaciar,
  onEnviar,
  onCerrar,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-gray-800">Orden de mesa {mesaNumero}</h2>
          {onCerrar && (
            <button
              onClick={onCerrar}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar panel"
            >
              <IconCerrar className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">
            {cartCount} {cartCount === 1 ? "producto" : "productos"}
          </span>
          {cart.length > 0 && (
            <button
              onClick={onVaciar}
              className="text-xs font-medium text-gray-400 transition hover:text-red-500"
            >
              Vaciar
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-gray-300">
            <IconRecibo className="h-10 w-10" />
            <p className="text-sm text-gray-400">Agrega productos de la carta</p>
          </div>
        ) : (
          <ul className="space-y-2 overflow-y-auto pr-0.5" style={{ maxHeight: "100%" }}>
            {cart.map((item, idx) => {
              const opciones = parseOpciones(item.opciones);
              return (
                <li key={idx} className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        {item.nombre}
                        {item.esCombo && (
                          <span className="rounded bg-orange-100 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                            Combo
                          </span>
                        )}
                      </p>
                      {opciones.length > 0 && (
                        <p className="mt-0.5 text-xs text-orange-600">+ {opciones.join(", ")}</p>
                      )}
                      {item.notas && (
                        <p className="mt-0.5 text-xs italic text-gray-400">📝 {item.notas}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className="text-sm font-bold text-gray-800">{fmt(item.precio * item.cantidad)}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEditar(idx)}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-orange-600"
                          aria-label={`Editar ${item.nombre}`}
                        >
                          <IconLapiz className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onQuitar(idx)}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-red-500"
                          aria-label={`Quitar ${item.nombre}`}
                        >
                          <IconPapelera className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                      <button
                        onClick={() => onCambiarCantidad(idx, -1)}
                        className="h-7 w-7 rounded-full text-gray-500 transition hover:text-orange-600"
                        aria-label="Disminuir cantidad"
                      >
                        <IconMinus className="mx-auto h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-gray-800">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => onCambiarCantidad(idx, 1)}
                        className="h-7 w-7 rounded-full text-gray-500 transition hover:text-orange-600"
                        aria-label="Aumentar cantidad"
                      >
                        <IconPlus className="mx-auto h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">{fmt(item.precio)} c/u</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="mt-2 shrink-0 text-xs text-red-600">{error}</p>}

      <footer className="mt-3 shrink-0 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-700">{fmt(cartTotal)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2">
          <span className="text-sm font-semibold text-gray-800">TOTAL</span>
          <span className="text-2xl font-extrabold leading-none text-orange-700">{fmt(cartTotal)}</span>
        </div>

        <button
          onClick={onEnviar}
          disabled={creando || cart.length === 0}
          className="mt-3 w-full rounded-xl bg-orange-600 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-card transition hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
        >
          {creando ? "Enviando..." : "Enviar a cocina"}
        </button>
        {cart.length === 0 && (
          <p className="mt-2 text-center text-xs text-gray-400">
            Agrega productos para enviar la orden
          </p>
        )}
      </footer>
    </div>
  );
}
