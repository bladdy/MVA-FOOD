import React from "react";
import Pencil from "@assets/svg/pencil.svg";
import Trash from "@assets/svg/trash.svg";
import type { Menu } from "@/Types/Restaurante";
import TrashIcon from "@/components/Icons/TrashIcon";
import PencilIcon from "@/components/Icons/PencilIcon";

interface MenuTableProps {
  items: Menu[];
  onEdit: (item: Menu) => void;
  onDelete: (item: Menu) => void;
}

const MenuTable: React.FC<MenuTableProps> = ({ items, onEdit, onDelete }) => (
  <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {["Img", "Nombre", "Ingredientes", "Precio", "Categoría", "Acciones"].map((header) => (
            <th
              key={header}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-6 py-4">
              <img src={item.imagen} alt={item.name} className="h-12 w-12 object-cover rounded-md" />
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{item.ingredientes}</td>
            <td className="px-6 py-4 text-sm text-gray-900">${item.price.toFixed(2)}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{item.categoria}</td>
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
                <TrashIcon className="h-6 w-6"/>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MenuTable;
