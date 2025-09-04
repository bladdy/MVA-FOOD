import React from "react";
import type { PagedResult, Variante } from "@/Types/Restaurante.ts";
import TrashIcon from "@/components/Icons/TrashIcon.tsx";
import PencilIcon from "@/components/Icons/PencilIcon.tsx";

interface VariantesTableProps {
  pagedResult: PagedResult<Variante>;
  onEdit: (item: Variante) => void;
  onDelete: (item: Variante) => void;
  onSort: (column: string) => void;
  currentSort: { orderBy: string; orderDirection: "asc" | "desc" };
}

const VariantesTable: React.FC<VariantesTableProps> = ({
  pagedResult,
  onEdit,
  onDelete,
  onSort,
  currentSort,
}) => {
  const headers = [
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "maxSeleccion", label: "Máx. Selección", sortable: true },
    { key: "obligatorio", label: "Obligatorio", sortable: true },
    { key: "opciones", label: "Opciones", sortable: true },
    { key: "categoria", label: "Categoría", sortable: true },
    { key: "acciones", label: "Acciones", sortable: false },
  ];
  const renderSortIcon = (key: string) => {
    if (currentSort.orderBy !== key) return "⇅"; // icono neutro
    return currentSort.orderDirection === "asc" ? "▲" : "▼";
  };

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                  h.sortable ? "cursor-pointer select-none" : ""
                }`}
                onClick={() => h.sortable && onSort(h.key)}
              >
                {h.label} {h.sortable && renderSortIcon(h.key)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {pagedResult.totalItems === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-4 text-center text-gray-500 italic"
              >
                No se encontró ninguna variante con la búsqueda.
              </td>
            </tr>
          ) : (
            pagedResult.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.maxSeleccion}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.obligatorio ? "Sí" : "No"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.opciones?.length}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.categoria?.nombre}
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    className="text-yellow-600 hover:text-yellow-900"
                    onClick={() => onEdit(item)}
                    title="Editar"
                  >
                    <PencilIcon className="h-6 w-6" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onDelete(item)}
                    title="Eliminar"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VariantesTable;
