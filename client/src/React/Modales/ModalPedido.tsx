import { useState } from "react";
import AddIcon from "@/components/Icons/AddIcon.tsx";
import CheckIcon from "@/components/Icons/CheckIcon.tsx";
import CrossIcon from "@/components/Icons/CrossIcon.tsx";
import MinusIcon from "@/components/Icons/MinusIcon.tsx";
import TrashIcon from "@/components/Icons/TrashIcon.tsx";
import type { MetodoPagoResponse, PedidoItem } from "@/Types/Restaurante.ts";
import MetodoPagoSelector from "@/React/MetodoPagoSelector.tsx";

interface ItemInterno {
  menuId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  opciones: string[];
}

function calcularPrecioUnitario(item: PedidoItem): number {
  if (item.esCombo) {
    const internos: ItemInterno[] = JSON.parse(item.comboItemsJson || "[]");
    return internos.reduce((sum, si) => sum + si.precio, 0);
  }
  if (!item.producto) return 0;
  const opcionesArr: string[] = JSON.parse(item.opciones || "[]");
  let extra = 0;
  if (item.producto.variantes) {
    item.producto.variantes.forEach((grupo) => {
      opcionesArr.forEach((nombre) => {
        const op = grupo.opciones.find((o) => o.nombre === nombre);
        if (op?.precio) extra += op.precio;
      });
    });
  }
  return item.producto.precio + extra;
}

export default function ModalPedido({
  pedido,
  mesa,
  total,
  onClose,
  onCantidadChange,
  comentario,
  setComentario,
  costoEnvio = 0,
  tipoEntrega,
  metodosPago,
  metodoPagoId,
  onMetodoPagoChange,
  onSubmit,
}: {
  pedido: PedidoItem[];  
  mesa?: string | null;
  total: number;
  onClose: () => void;
  onCantidadChange?: (index: number, nuevaCantidad: number) => void;
  comentario?: string;
  setComentario?: (value: string) => void;
  costoEnvio?: number;
  tipoEntrega?: string;
  metodosPago?: MetodoPagoResponse[];
  metodoPagoId?: string | null;
  onMetodoPagoChange?: (id: string) => void;
  onSubmit?: (nombre: string, telefono: string, direccion?: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [comboExpandido, setComboExpandido] = useState<number | null>(null);
  let metaEnvioGratis = 0;
  let progreso = 100;
  if (mesa) {
    progreso = 100;
  } else if (costoEnvio > 0) {
    metaEnvioGratis = 200;
    progreso = Math.min((total - costoEnvio) / metaEnvioGratis * 100, 100);
  }
  const tieneEnvioGratis = costoEnvio === 0 || total >= 200;
  let progresoColor = "bg-red-500";
  if ((total - costoEnvio) >= 150 && (total - costoEnvio) < 200) progresoColor = "bg-yellow-500";
  if (tieneEnvioGratis) progresoColor = "bg-green-500";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-drawer-overlay"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-drawer animate-drawer-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-orange-600">Tu Pedido</h2>
          <button onClick={onClose} className="text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
            <CrossIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {costoEnvio > 0 && !mesa && (
            <div className="bg-gray-50 text-sm text-gray-700 p-3 rounded-xl mb-4">
              {tieneEnvioGratis ? (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-green-600 font-semibold flex items-center gap-1 text-xs">
                      ¡Listo! Ya tienes envío gratis <CheckIcon className="inline-block w-4 h-4 text-green-500" />
                    </span>
                    <span className="text-xs text-gray-400">Meta: ${metaEnvioGratis}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${progresoColor}`} style={{ width: `${progreso}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">
                      Te faltan <strong>${(metaEnvioGratis - (total - costoEnvio)).toFixed(2)}</strong> para envío gratis
                    </span>
                    <span className="text-xs text-gray-400">Meta: ${metaEnvioGratis}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${progresoColor}`} style={{ width: `${progreso}%` }} />
                  </div>
                </>
              )}
            </div>
          )}

          {pedido.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay productos en tu pedido.</p>
          ) : (
            <ul className="space-y-4">
              {pedido.map((item, idx) => {
                const precioUnitario = calcularPrecioUnitario(item);
                const opcionesArr: string[] = JSON.parse(item.opciones || "[]");

                if (item.esCombo) {
                  const internos: ItemInterno[] = JSON.parse(item.comboItemsJson || "[]");
                  const expandido = comboExpandido === idx;

                  return (
                    <li key={idx} className="flex flex-col border-b border-gray-100 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs flex-shrink-0">
                          Combo
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => setComboExpandido(expandido ? null : idx)}
                            className="text-sm font-semibold text-gray-800 hover:text-orange-600 text-left"
                          >
                            {item.comboNombre || "Combo"}
                          </button>
                          {expandido && (
                            <div className="mt-2 space-y-1">
                              {internos.map((interno, ii) => (
                                <div key={ii} className="text-xs text-gray-600">
                                  <span className="font-medium">{interno.cantidad}x {interno.nombre}</span>
                                  {interno.opciones.length > 0 && (
                                    <span className="text-orange-500"> + {interno.opciones.join(", ")}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                            ${precioUnitario.toLocaleString("es-MX")}
                          </span>
                          {onCantidadChange && (
                            <button className="text-red-400 hover:text-red-600 transition-colors" onClick={() => onCantidadChange(idx, 0)}>
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={idx} className="flex items-start gap-3 border-b border-gray-100 pb-4">
                    <img
                      src={item.producto?.imagen || "/mva-logo-rb.png"}
                      alt={item.producto?.nombre || ""}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800">{item.producto?.nombre || ""}</div>
                      {opcionesArr.length > 0 && (
                        <div className="text-xs text-orange-600 mt-0.5">
                          + {opcionesArr.join(", ")}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">{item.notas}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        ${precioUnitario.toLocaleString("es-MX")} x {item.cantidad}
                      </span>
                      <div className="flex items-center gap-1">
                        {onCantidadChange && (
                          <>
                            {item.cantidad === 1 ? (
                              <button className="text-red-400 hover:text-red-600 p-1" onClick={() => onCantidadChange(idx, 0)}>
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button className="text-gray-500 hover:text-gray-700 p-1" onClick={() => onCantidadChange(idx, item.cantidad - 1)}>
                                <MinusIcon className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <span className="text-sm font-semibold min-w-[1.5rem] text-center">{item.cantidad}</span>
                            <button className="text-gray-500 hover:text-gray-700 p-1" onClick={() => onCantidadChange(idx, item.cantidad + 1)}>
                              <AddIcon className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {setComentario && (
            <div className="mt-4">
              <label className="font-semibold text-sm text-gray-800 mb-1 block">Comentarios</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:border-orange-300 transition resize-none"
                placeholder="Instrucciones adicionales"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          <div className="flex justify-between items-center font-bold text-lg">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-600">${total.toLocaleString("es-MX")}</span>
          </div>

          {!mesa && onSubmit && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tu nombre *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:border-orange-300 transition"
              />
              <input
                type="tel"
                placeholder="Tu teléfono *"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:border-orange-300 transition"
              />
              {tipoEntrega === "A domicilio" && (
                <input
                  type="text"
                  placeholder="Tu dirección *"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:border-orange-300 transition"
                />
              )}
              {metodosPago && metodosPago.some((m) => m.activo) && onMetodoPagoChange && (
                <MetodoPagoSelector
                  metodos={metodosPago}
                  selectedId={metodoPagoId ?? null}
                  onChange={onMetodoPagoChange}
                />
              )}
            </div>
          )}

          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            disabled={
              !onSubmit ||
              (!mesa && (!nombre.trim() || !telefono.trim())) ||
              (!mesa && tipoEntrega === "A domicilio" && !direccion.trim())
            }
            onClick={() => onSubmit?.(nombre, telefono, direccion)}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </>
  );
}
