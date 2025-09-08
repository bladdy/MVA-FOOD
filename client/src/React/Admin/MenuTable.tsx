import React from "react";
import type { PagedResult } from "@/Types/Restaurante.ts";
import type { Menu } from "@/Types/Restaurante.ts";
import TrashIcon from "@/components/Icons/TrashIcon.tsx";
import PencilIcon from "@/components/Icons/PencilIcon.tsx";

interface MenuTableProps {
  pagedResult: PagedResult<Menu>;
  onEdit: (item: Menu) => void;
  onDelete: (item: Menu) => void;
  onSort: (column: string) => void;
  currentSort: { orderBy: string; orderDirection: "asc" | "desc" };
}

const MenuTable: React.FC<MenuTableProps> = ({
  pagedResult,
  onEdit,
  onDelete,
  onSort,
  currentSort,
}) => {
  const headers = [
    { key: "imagen", label: "Img", sortable: false },
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "ingredientes", label: "Ingredientes", sortable: true },
    { key: "precio", label: "Precio", sortable: true },
    { key: "categoria", label: "Categoría", sortable: true },
    { key: "variantes", label: "Variantes", sortable: false },
    { key: "activo", label: "Activo", sortable: true },
    { key: "acciones", label: "Acciones", sortable: false },
  ];
  const renderSortIcon = (key: string) => {
    if (currentSort.orderBy !== key) return null;
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
                No se encontró ningún menú con la búsqueda.
              </td>
            </tr>
          ) : (
            pagedResult.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <img
                    src={`http://localhost:5147${item.imagen}`}
                    alt={item.nombre}
                    className="h-12 w-12 object-cover rounded-md"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.ingredientes}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ${item.precio.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.categoria.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.variantes?.length}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.activo ? "Sí" : "No"}
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

export default MenuTable;
