import { useState, useMemo } from "react";
import type { ComboResponse, Variante } from "@/Types/Restaurante.ts";

interface Props {
  combo: ComboResponse;
  onClose: () => void;
  onAgregar: (comboId: string, comboNombre: string, comboItemsJson: string) => void;
}

interface ComboItemSeleccion {
  menuId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  opciones: string[];
}

export default function ModalCombo({ combo, onClose, onAgregar }: Props) {
  const [items, setItems] = useState<ComboItemSeleccion[]>(() =>
    combo.items.map((i) => ({
      menuId: i.menuId,
      nombre: i.menuNombre,
      cantidad: i.cantidad,
      precio: i.menuPrecio,
      opciones: [] as string[],
    }))
  );

  const handleOptionToggle = (itemIndex: number, opcionNombre: string) => {
    setItems((prev) => {
      const nuevos = [...prev];
      const item = { ...nuevos[itemIndex] };
      const idx = item.opciones.indexOf(opcionNombre);
      if (idx >= 0) {
        item.opciones = item.opciones.filter((o) => o !== opcionNombre);
      } else {
        item.opciones = [...item.opciones, opcionNombre];
      }
      nuevos[itemIndex] = item;
      return nuevos;
    });
  };

  const total = useMemo(
    () => items.reduce((sum, item) => {
      return sum + item.precio * item.cantidad;
    }, 0),
    [items]
  );

  const totalConDescuento = combo.precio ?? total;

  const handleAgregar = () => {
    const comboItemsJson = JSON.stringify(
      items.map((i) => ({
        menuId: i.menuId,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precio: combo.precio
          ? (combo.precio / items.length) * i.cantidad
          : i.precio,
        opciones: i.opciones,
      }))
    );
    onAgregar(combo.id, combo.nombre, comboItemsJson);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-orange-600">{combo.nombre}</h2>
            {combo.descripcion && (
              <p className="text-sm text-gray-500">{combo.descripcion}</p>
            )}
          </div>
          <button onClick={onClose} className="text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-4">
          {items.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  ${item.precio.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className={combo.precio ? "text-orange-600" : ""}>
              {combo.precio ? (
                <>
                  <span className="line-through text-gray-400 text-sm mr-2">${total.toFixed(2)}</span>
                  ${combo.precio.toFixed(2)}
                </>
              ) : (
                `$${total.toFixed(2)}`
              )}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAgregar}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold"
          >
            Agregar al pedido
          </button>
          <button
            onClick={onClose}
            className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
