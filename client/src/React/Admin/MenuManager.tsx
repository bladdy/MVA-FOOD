// components/MenuManager.tsx
import { useState } from "react";
import MenuButton from "./MenuButton.tsx";
import MenuTable from "./MenuTable.tsx";
import MenuModal from "./MenuModal.tsx";
import type { Menu } from "@/Types/Restaurante.ts";

interface MenuManagerProps {
  initialMenus?: Menu[];
}

const MenuManager: React.FC<MenuManagerProps> = ({ initialMenus = [] }) => {
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Menu | undefined>(undefined);

  const handleEdit = (item: Menu) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Menu) => {
    setMenus(menus.filter((m) => m.id !== item.id));
  };

  const handleSave = (item: Menu) => {
    const exists = menus.find((m) => m.id === item.id);
    if (exists) {
      setMenus(menus.map((m) => (m.id === item.id ? item : m)));
    } else {
      setMenus([...menus, item]);
    }
    setModalOpen(false);
    setSelectedItem(undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menú</h1>
        <div className="mb-4">
          <MenuButton label="Agregar plato" onClick={() => setModalOpen(true)} />
        </div>
      </div>

        <MenuTable items={menus} onEdit={handleEdit} onDelete={handleDelete} />

      <MenuModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(undefined);
        }}
        onSave={handleSave}
        initialData={selectedItem}
      />
    </div>
  );
};

export default MenuManager;
