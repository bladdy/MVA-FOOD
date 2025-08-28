import React, { useState, useEffect } from "react";
import type { Menu } from "@/Types/Restaurante.ts";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Menu) => void;
  initialData?: Menu;
}

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState<Menu>({
    id: "",
    name: "",
    ingredientes: "",
    price: 0,
    categoria: "Todas",
    imagen: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, imagen: reader.result as string });
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: name === "price" ? parseFloat(value) : value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: initialData?.id || Date.now().toString() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Editar Plato" : "Agregar Plato"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
            <textarea name="ingredientes" value={form.ingredientes} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm">
              <option>Pizza</option>
              <option>Ensalada</option>
              <option>Bebida</option>
              <option>Burger & Street Food</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Imagen</label>
            <input name="imagen" type="file" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
            {form.imagen && <img src={form.imagen} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-md" />}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuModal;
