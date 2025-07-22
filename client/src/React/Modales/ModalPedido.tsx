import AddIcon from "@/components/Icons/AddIcon";
import CheckIcon from "@/components/Icons/CheckIcon";
import CrossIcon from "@/components/Icons/CrossIcon";
import MinusIcon from "@/components/Icons/MinusIcon";
import TrashIcon from "@/components/Icons/TrashIcon";
import type { PedidoItem } from "@/Types/Restaurante";

export default function ModalPedido({
  pedido,
  total,
  onClose,
  onCantidadChange,
  comentario,
  setComentario,
  envioGratis = true,
}: {
  pedido: PedidoItem[];
  total: number;
  onClose: () => void;
  onCantidadChange?: (index: number, nuevaCantidad: number) => void;
  comentario?: string;
  setComentario?: (value: string) => void;
  envioGratis?: boolean;
}) {
  const metaEnvioGratis = 200;
  const progreso = Math.min((total / metaEnvioGratis) * 100, 100);
  let progresoColor = "bg-red-500";
  if (total >= 150 && total < 200) progresoColor = "bg-yellow-500";
  if (total >= 200) progresoColor = "bg-green-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-600">Tu Pedido</h2>
          <button onClick={onClose} className="text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full">
            <CrossIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Envío Gratis */}
        {envioGratis && (
          <div className="bg-gray-100 text-sm text-gray-700 p-2 px-4 rounded-lg mb-4">
            {total >= metaEnvioGratis ? (
              <>
              <div className="flex justify-between items-center mb-1">
                  <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                    ¡Listo! Ya tienes envío gratis <CheckIcon className="inline-block w-4 h-4 text-green-500" />
                  </span>
                  <span className="text-xs text-gray-500 ml-2">Meta: ${metaEnvioGratis}</span>
                </div>
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div className={`h-full ${progresoColor}`} style={{ width: `${progreso}%` }} />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span>
                    Te faltan <strong>${(metaEnvioGratis - total).toFixed(2)}</strong> para envío gratis
                  </span>
                  <span className="text-xs text-gray-500 ml-2">Meta: ${metaEnvioGratis}</span>
                </div>
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div className={`h-full ${progresoColor}`} style={{ width: `${progreso}%` }} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Lista de productos */}
        {pedido.length === 0 ? (
          <p className="text-gray-600">No hay productos en tu pedido.</p>
        ) : (
          <ul className="mb-4 space-y-4">
            {pedido.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 border-b pb-4">
                <img
                  src={item.producto.imagen || "/mva-logo-rb.png"}
                  alt={item.producto.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="text-md font-semibold text-gray-800">{item.producto.name}</div>
                  <div className="text-sm text-gray-600 text-left">{item.notas}</div>
                </div>

                {/* Control cantidad */}
                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    ${item.producto.price.toLocaleString("es-MX")} × {item.cantidad}
                  </div>
                  <div className="flex justify-center">
                    {onCantidadChange && (
                      <>
                        {item.cantidad === 1 ? (
                          <button className="text-red-500 hover:text-red-700" onClick={() => onCantidadChange(idx, 0)}>
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button className="text-gray-600 hover:text-gray-800" onClick={() => onCantidadChange(idx, item.cantidad - 1)}>
                            <MinusIcon className="h-5 w-5" />
                          </button>
                        )}
                        <span className="text-base px-2">{item.cantidad}</span>
                        <button className="text-gray-600 hover:text-gray-800" onClick={() => onCantidadChange(idx, item.cantidad + 1)}>
                          <AddIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Comentarios */}
        {setComentario && (
          <div className="mb-4">
            <label className="font-semibold text-sm text-gray-800 mb-1 block">Comentarios generales</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              placeholder="Instrucciones adicionales"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        )}

        {/* Total y botón finalizar */}
        <div className="flex justify-between items-center font-bold text-lg mb-4">
          <span>Total:</span>
          <span>${total.toLocaleString("es-MX")}</span>
        </div>

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold">
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}
