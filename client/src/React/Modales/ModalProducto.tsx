import type { Menu, Variante } from "@/Types/Restaurante";
import CrossIcon from "@/components/Icons/CrossIcon";
import { variantesPorCategoria } from "@/consts/variantes";
import { useState } from "react";

export default function ModalProducto({
  producto,
  onClose,
  onAgregar,
}: {
  producto: Menu;
  onClose: () => void;
  onAgregar: (notas: string) => void;
}) {
  const [notas, setNotas] = useState("");
  const variantes: Variante[] = variantesPorCategoria[producto.categoria] || [];

  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});

  const toggleSeleccion = (grupoId: string, opcion: string) => {
    const seleccionadas = selecciones[grupoId] || [];
    const grupo = variantes.find((v) => v.id === grupoId);
    const max = grupo?.maxSeleccion ?? 1;

    if (max === 1) {
      setSelecciones((prev) => ({ ...prev, [grupoId]: [opcion] }));
    } else {
      const yaSeleccionada = seleccionadas.includes(opcion);
      let nuevas: string[] = [];

      if (yaSeleccionada) {
        nuevas = seleccionadas.filter((o) => o !== opcion);
      } else if (seleccionadas.length < max) {
        nuevas = [...seleccionadas, opcion];
      } else {
        nuevas = seleccionadas;
      }

      setSelecciones((prev) => ({ ...prev, [grupoId]: nuevas }));
    }
  };

  const calcularTotal = () => {
    let total = producto.price;

    variantes.forEach((grupo) => {
      const seleccionadas = selecciones[grupo.id] || [];
      seleccionadas.forEach((nombre) => {
        const op = grupo.opciones.find((o) => o.nombre === nombre);
        total += op?.precio ?? 0;
      });
    });

    return total;
  };

  const handleAgregar = () => {
    const detalles = Object.entries(selecciones)
      .map(([grupo, opciones]) => `${grupo}: ${opciones.join(", ")}`)
      .join(" | ");

    const textoFinal = `${notas ? `Notas: ${notas} | ` : ""}${detalles}`;
    onAgregar(textoFinal);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full overflow-y-auto max-h-[90vh] shadow-xl">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full"
          aria-label="Cerrar modal"
        >
          <CrossIcon className="h-4 w-4"/>
        </button>

        <h2 className="text-xl font-bold mb-2 text-orange-600">{producto.name}</h2>
        <p className="text-sm mb-4 text-gray-600">{producto.ingredientes}</p>

        {variantes.map((grupo) => (
          <div key={grupo.id} className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold">{grupo.name}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  grupo.obligatorio
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {grupo.obligatorio ? "obligatorio" : "opcional"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              {grupo.maxSeleccion && grupo.maxSeleccion > 1
                ? `Selecciona máximo ${grupo.maxSeleccion}`
                : "Selecciona 1"}
            </p>
            <ul className="divide-y divide-gray-200 border rounded-md">
              {grupo.opciones.map((opcion) => {
                const checked = selecciones[grupo.id]?.includes(opcion.nombre);
                const isRadio = grupo.maxSeleccion === 1;

                return (
                  <li
                    key={opcion.nombre}
                    className="flex justify-between items-center px-3 py-2 hover:bg-gray-50"
                  >
                    <span>{opcion.nombre}</span>
                    <label className="flex cursor-pointer text-gray items-center gap-1">
                      {opcion.precio && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-300">
                          ${opcion.precio}
                        </span>
                      )}
                      <input
                        type={isRadio ? "radio" : "checkbox"}
                        name={grupo.id}
                        value={opcion.nombre}
                        checked={checked}
                        onChange={() =>
                          toggleSeleccion(grupo.id, opcion.nombre)
                        }
                        className="w-5 h-5 text-orange-500 accent-orange-500"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-4 text-sm"
          placeholder="Notas especiales..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />

        <button
          className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 transition"
          onClick={handleAgregar}
        >
          Agregar producto ${calcularTotal()}
        </button>
      </div>
    </div>
  );
}
