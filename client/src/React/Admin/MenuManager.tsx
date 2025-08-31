import React, { useEffect, useState } from "react";
import type { Menu } from "@/Types/Restaurante.ts";
import { menuService } from "@/Services/menuService.ts";
import MenuTable from "./MenuTable.tsx";
import MenuModal from "./MenuModal.tsx";

const MenuManager: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>();

  // Cargar menú desde API usando menuService
  const fetchMenus = async () => {
    try {
      const data = await menuService.getMenus();
      console.log("Menús cargados:", data);
      setMenus(data);
    } catch (error) {
      console.error("Error cargando menús:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMenu(undefined);
    setIsModalOpen(true);
  };

  // Guardar menú (solo recarga el listado)
  const handleSave = async () => {
    setIsModalOpen(false);
    await fetchMenus();
  };

  const handleDelete = async (menu: Menu) => {
    try {
      await fetch(`http://localhost:5147/api/Menu/${menu.id}`, { method: "DELETE" });
      await fetchMenus();
    } catch (error) {
      console.error("Error eliminando menú:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          onClick={handleAdd}
        >
          + Nuevo Menú
        </button>
      </div>

      <MenuTable items={menus} onEdit={handleEdit} onDelete={handleDelete} />

      {isModalOpen && (
        <MenuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={selectedMenu || undefined}
        />
      )}
    </div>
  );
};

export default MenuManager;
