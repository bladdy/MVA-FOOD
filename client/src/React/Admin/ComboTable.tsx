import type { ComboResponse } from "@/Types/Restaurante.ts";

interface Props {
  combos: ComboResponse[];
  onEdit: (combo: ComboResponse) => void;
  onDelete: (id: string) => void;
}

export default function ComboTable({ combos, onEdit, onDelete }: Props) {
  if (combos.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No hay combos registrados</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-orange-100 text-orange-800">
          <tr>
            <th className="p-3 font-semibold">Nombre</th>
            <th className="p-3 font-semibold">Precio</th>
            <th className="p-3 font-semibold">Productos</th>
            <th className="p-3 font-semibold">Tipo</th>
            <th className="p-3 font-semibold">Activo</th>
            <th className="p-3 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {combos.map((combo) => (
            <tr key={combo.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{combo.nombre}</td>
              <td className="p-3">
                {combo.precio ? `$${combo.precio.toFixed(2)}` : "Suma de items"}
              </td>
              <td className="p-3 text-xs text-gray-500">
                {combo.items.map((i) => `${i.cantidad}x ${i.menuNombre}`).join(", ")}
              </td>
              <td className="p-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${combo.predefinido ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                  {combo.predefinido ? "Predefinido" : "Sugerido"}
                </span>
              </td>
              <td className="p-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${combo.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {combo.activo ? "Sí" : "No"}
                </span>
              </td>
              <td className="p-3 flex gap-2">
                <button onClick={() => onEdit(combo)} className="text-orange-600 hover:text-orange-800 text-xs font-medium">
                  Editar
                </button>
                <button onClick={() => onDelete(combo.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
