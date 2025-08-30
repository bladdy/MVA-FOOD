// src/components/MenuModal.tsx
import React, { useState, useEffect } from "react";
import type { Menu } from "@/Types/Restaurante.ts";
import type { Variante } from "@/Types/Restaurante.ts";
import { variantesPorCategoria } from "@/consts/variantes.ts";
import { menuService } from "@/Services/menuService.ts";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Menu) => void;
  initialData?: Menu;
}

const initialForm: Menu = {
  id: "",
  name: "",
  ingredientes: "",
  price: 0,
  categoria: "Todas",
  imagen: "",
  restauranteId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Temporal, hasta implementar autenticación
  variantes: [],
};

const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState<Menu>(initialForm);
  const [variantesFiltradas, setVariantesFiltradas] = useState<Variante[]>([]);

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(initialForm);
    }
  }, [initialData, isOpen]);

  // 🔹 Filtrar variantes por categoría
  useEffect(() => {
    if (form.categoria && variantesPorCategoria[form.categoria]) {
      setVariantesFiltradas(variantesPorCategoria[form.categoria]);
    } else {
      setVariantesFiltradas([]);
    }
  }, [form.categoria]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, files } = e.target as any;
    if (files) {
      const reader = new FileReader();
      reader.onload = () =>
        setForm({ ...form, imagen: reader.result as string });
      reader.readAsDataURL(files[0]);
    } else {
      setForm({
        ...form,
        [name]: name === "price" ? parseFloat(value) : value,
      });
    }
  };

  const handleAddVariante = () => {
    const nuevaVariante: Variante = {
      id: `var-${Date.now()}`,
      name: "Nueva Variante",
      obligatorio: false,
      maxSeleccion: 1,
      opciones: [{ nombre: "Opción 1", precio: 0 }],
    };
    setForm({ ...form, variantes: [...(form.variantes || []), nuevaVariante] });
  };

  const handleAgregarExistente = (id: string) => {
    if (!id) return;
    const variante = variantesFiltradas.find((v) => v.id === id);
    if (variante && !form.variantes?.some((v) => v.id === variante.id)) {
      setForm({ ...form, variantes: [...(form.variantes || []), variante] });
    }
  };

  const handleVarianteChange = (
    index: number,
    key: keyof Variante,
    value: any
  ) => {
    const updated = [...(form.variantes || [])];
    (updated[index] as any)[key] = value;
    setForm({ ...form, variantes: updated });
  };

  const handleAddOpcion = (varianteIndex: number) => {
    const updated = [...(form.variantes || [])];
    updated[varianteIndex].opciones.push({ nombre: "Nueva Opción", precio: 0 });
    setForm({ ...form, variantes: updated });
  };

  const handleOpcionChange = (
    varianteIndex: number,
    opcionIndex: number,
    key: "nombre" | "precio",
    value: any
  ) => {
    const updated = [...(form.variantes || [])];
    (updated[varianteIndex].opciones[opcionIndex] as any)[key] =
      key === "precio" ? parseFloat(value) : value;
    setForm({ ...form, variantes: updated });
  };

  // 🔹 Eliminar variante completa
  const handleEliminarVariante = (index: number) => {
    const updated = [...(form.variantes || [])];
    updated.splice(index, 1);
    setForm({ ...form, variantes: updated });
  };

  // 🔹 Eliminar opción de una variante
  const handleEliminarOpcion = (varianteIndex: number, opcionIndex: number) => {
    const updated = [...(form.variantes || [])];
    updated[varianteIndex].opciones.splice(opcionIndex, 1);
    setForm({ ...form, variantes: updated });
  };

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  // 🔹 Conexión con el servicio API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        // Editar
        const updated = await menuService.update(initialData.id, form);
        onSave(updated);
      } else {
        // Crear
        const created = await menuService.create(form);
        onSave(created);
      }
      setForm(initialForm);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar el menú");
    }
  };

  if (!isOpen) return null;

  // 🔹 Obtener lista de categorías desde el objeto variantesPorCategoria
  const categoriasDisponibles = Object.keys(variantesPorCategoria);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Editar Plato" : "Agregar Plato"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ingredientes
              </label>
              <textarea
                name="ingredientes"
                value={form.ingredientes}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Categoría */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2 text-sm"
                >
                  <option value="Todas">Todas</option>
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {/* Precio */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2 text-sm"
                />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen
              </label>
              <input
                name="imagen"
                type="file"
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
              {form.imagen && (
                <img
                  src={form.imagen}
                  alt="preview"
                  className="mt-2 h-16 w-16 object-cover rounded-md"
                />
              )}
            </div>

            {/* Variantes */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Variantes (Opcional)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddVariante}
                    className="text-xs px-2 py-1 bg-orange-500 text-white rounded-md"
                  >
                    + Nueva
                  </button>
                  <select
                    onChange={(e) => handleAgregarExistente(e.target.value)}
                    className="text-xs border rounded-md p-1"
                  >
                    <option value="">+ Existente</option>
                    {variantesFiltradas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.variantes?.map((v, index) => (
                <div
                  key={v.id}
                  className="border p-2 mt-2 rounded-md relative bg-gray-50"
                >
                  {/* Botón eliminar variante */}
                  <div className="flex flex-row justify-center items-center gap-2 w-full">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) =>
                        handleVarianteChange(index, "name", e.target.value)
                      }
                      className="w-full border rounded-md p-1 text-sm mb-2"
                      placeholder="Nombre de la variante"
                    />
                    <button
                      type="button"
                      onClick={() => handleEliminarVariante(index)}
                      className=" text-red-500 hover:text-red-700 text-sm p-1 mb-2"
                      title="Eliminar variante"
                    >
                      ✕
                    </button>
                  </div>

                  <label className="flex items-center text-xs gap-2">
                    <input
                      type="checkbox"
                      checked={v.obligatorio}
                      onChange={(e) =>
                        handleVarianteChange(
                          index,
                          "obligatorio",
                          e.target.checked
                        )
                      }
                    />
                    Obligatorio
                  </label>

                  <div className="mt-2">
                    <label className="text-xs text-gray-600">
                      Máx. selección
                    </label>
                    <input
                      type="number"
                      value={v.maxSeleccion}
                      onChange={(e) =>
                        handleVarianteChange(
                          index,
                          "maxSeleccion",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-20 border rounded-md p-1 text-sm"
                    />
                  </div>

                  {/* Opciones */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Opciones</span>
                      <button
                        type="button"
                        onClick={() => handleAddOpcion(index)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md"
                      >
                        + Agregar Opción
                      </button>
                    </div>
                    {v.opciones.map((op, opIndex) => (
                      <div key={opIndex} className="flex gap-2 mt-2 relative">
                        <input
                          type="text"
                          value={op.nombre}
                          onChange={(e) =>
                            handleOpcionChange(
                              index,
                              opIndex,
                              "nombre",
                              e.target.value
                            )
                          }
                          className="flex-1 border rounded-md p-1 text-sm"
                          placeholder="Nombre"
                        />
                        <input
                          type="number"
                          value={op.precio}
                          onChange={(e) =>
                            handleOpcionChange(
                              index,
                              opIndex,
                              "precio",
                              e.target.value
                            )
                          }
                          className="w-24 border rounded-md p-1 text-sm"
                          placeholder="Precio"
                        />
                        {/* Botón eliminar opción */}
                        <button
                          type="button"
                          onClick={() => handleEliminarOpcion(index, opIndex)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Eliminar opción"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
