import type { Menu, Variante } from "@/Types/Restaurante.ts";
import CrossIcon from "@/components/Icons/CrossIcon.tsx";
import { useState, useMemo } from "react";

export default function ModalProducto({
  producto,
  onClose,
  onAgregar,
}: {
  producto: Menu;
  onClose: () => void;
  onAgregar: (notas: string, opciones: string) => void;
}) {
  const [notas, setNotas] = useState("");
  const variantes: Variante[] = producto.variantes || [];

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
    let total = producto.precio;

    variantes.forEach((grupo) => {
      const seleccionadas = selecciones[grupo.id] || [];
      seleccionadas.forEach((nombre) => {
        const op = grupo.opciones.find((o) => o.nombre === nombre);
        total += op?.precio ?? 0;
      });
    });

    return total;
  };

  const variantesObligatoriasSinSeleccion = useMemo(() => {
    return variantes
      .filter((v) => v.obligatorio)
      .filter((v) => !selecciones[v.id] || selecciones[v.id].length === 0)
      .map((v) => v.name);
  }, [variantes, selecciones]);

  const handleAgregar = () => {
    if (variantesObligatoriasSinSeleccion.length > 0) {
      alert(
        `Selecciona: ${variantesObligatoriasSinSeleccion.join(", ")}`
      );
      return;
    }

    const opcionesArr: string[] = [];
    variantes.forEach((grupo) => {
      const seleccionadas = selecciones[grupo.id] || [];
      seleccionadas.forEach((nombre) => {
        opcionesArr.push(nombre);
      });
    });

    onAgregar(notas, JSON.stringify(opcionesArr));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full overflow-y-auto max-h-[90vh] shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full"
          aria-label="Cerrar modal"
        >
          <CrossIcon className="h-4 w-4"/>
        </button>

        <div className="flex items-start gap-4 mb-4">
          {producto.imagen && (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-orange-600">{producto.nombre}</h2>
            <p className="text-sm text-gray-600 mt-1">{producto.ingredientes}</p>
            <p className="text-lg font-bold text-orange-700 mt-1">
              ${producto.precio.toLocaleString("es-MX")}
            </p>
          </div>
        </div>

        {variantes.length > 0 && (
          <div className="border-t pt-4 mb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Personaliza tu pedido</h3>
            {variantes.map((grupo) => (
              <div key={grupo.id} className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800">{grupo.name}</h4>
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
                {grupo.maxSeleccion && grupo.maxSeleccion > 1 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Selecciona hasta {grupo.maxSeleccion}
                  </p>
                )}
                <ul className="divide-y divide-gray-200 border rounded-md">
                  {grupo.opciones.map((opcion) => {
                    const checked = selecciones[grupo.id]?.includes(opcion.nombre) || false;
                    const isRadio = grupo.maxSeleccion === 1;
                    const inputId = `${grupo.id}-${opcion.nombre}`;

                    return (
                      <li
                        key={opcion.nombre}
                        className={`flex justify-between items-center px-3 py-3 cursor-pointer transition-colors ${
                          checked
                            ? "bg-orange-50 border-l-4 border-orange-500"
                            : "hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                        onClick={() => toggleSeleccion(grupo.id, opcion.nombre)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={isRadio ? "radio" : "checkbox"}
                            name={grupo.id}
                            id={inputId}
                            value={opcion.nombre}
                            checked={checked}
                            onChange={() =>
                              toggleSeleccion(grupo.id, opcion.nombre)
                            }
                            className="w-5 h-5 text-orange-500 accent-orange-500 cursor-pointer"
                          />
                          <span className={`${checked ? "font-semibold text-orange-800" : "text-gray-700"}`}>
                            {opcion.nombre}
                          </span>
                        </div>
                        {opcion.precio && opcion.precio > 0 && (
                          <span className="text-sm font-medium text-orange-600">
                            +${opcion.precio}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
          placeholder="Notas especiales (ej: sin sal, bien cocido...)"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />

        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold text-lg transition mt-4"
          onClick={handleAgregar}
        >
          Agregar — ${calcularTotal().toLocaleString("es-MX")}
        </button>
      </div>
    </div>
  );
}
