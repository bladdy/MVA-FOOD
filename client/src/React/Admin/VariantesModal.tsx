// src/components/VarianteModal.tsx
//ToDo: Validacion del formulario antes de enviar
import React, { useState, useEffect } from "react";
import type { VarianteCreate, Categoria, Variante } from "@/Types/Restaurante.ts";
import { varianteService } from "@/Services/varianteService.ts";
import { menuService } from "@/Services/menuService.ts"; // solo para categorias

interface VariantesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Variante;
}

const initialForm: VarianteCreate = {
  id: "",
  name: "",
  categoriaId: "",
  opciones: [],
  obligatorio: false,
  maxSeleccion: 1,
};

const VariantesModal: React.FC<VariantesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState<VarianteCreate>(initialForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        name: initialData.name,
        categoriaId: initialData.categoriaId,
        opciones:
        
          initialData.opciones?.map((op) => ({
            id: op.id,
            nombre: op.nombre,
            precio: op.precio ?? 0,
          })) || [],
        obligatorio: initialData.obligatorio,
        maxSeleccion: initialData.maxSeleccion ?? 1,
      });
    } else {
      setForm(initialForm);
    }
  }, [initialData]);

  // Cargar categorías
  useEffect(() => {
    menuService.getCategorias().then(setCategorias).catch(console.error);
  }, []);

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget;
    const checked = type === "checkbox" ? (e.currentTarget as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const opciones = [...form.opciones];
    (opciones[index] as any)[field] = value;
    setForm({ ...form, opciones });
  };

  const handleAddOption = () => {
    setForm({
      ...form,
      opciones: [...form.opciones, { id: "", nombre: "Nueva opción", precio: 0 }],
    });
  };

  const handleRemoveOption = (index: number) => {
    const opciones = form.opciones.filter((_, i) => i !== index);
    setForm({ ...form, opciones });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        console.log("Updating variante with id:", form.id, form);
        await varianteService.update(form.id, form);
      } else {
        await varianteService.create(form);
      }
      handleClose();
      onSave();
    } catch (error) {
      console.error(error);
      //sweet Alert
      alert("Hubo un error al guardar la variante");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Editar Variante" : "Agregar Variante"}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre de la variante"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <select
            name="categoriaId"
            value={form.categoriaId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccionar Categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="obligatorio"
                checked={form.obligatorio}
                onChange={handleChange}
              />
              Obligatorio
            </label>
            <label className="ml-4">Selección Máxima:
            </label>
            <input
              type="number"
              name="maxSeleccion"
              value={form.maxSeleccion}
              onChange={handleChange}
              className="w-20 border rounded px-2 py-1"
              min={1}
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Opciones</h3>
            {form.opciones.map((op, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={op.nombre}
                  onChange={(e) => handleOptionChange(i, "nombre", e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                />
                <input
                  type="number"
                  value={op.precio}
                  onChange={(e) => handleOptionChange(i, "precio", parseFloat(e.target.value))}
                  className="w-24 border rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(i)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              + Agregar opción
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantesModal;
