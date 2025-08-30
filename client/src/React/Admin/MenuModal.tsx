// src/components/MenuModal.tsx
import React, { useState, useEffect } from "react";
import type { MenuCreate, VarianteCreate, Categoria } from "@/Types/Restaurante.ts";
import { variantesPorCategoria } from "@/consts/variantes.ts";
import { menuService } from "@/Services/menuService.ts";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  initialData?: MenuCreate;
}

const initialForm: MenuCreate = {
  nombre: "",
  ingredientes: "",
  precio: 0,
  categoriaId: "",
  restauranteId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Temporal
  image: null,
  variantes: [],
};

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState<MenuCreate>(initialForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [variantesFiltradas, setVariantesFiltradas] = useState<VarianteCreate[]>([]);

  // Cargar datos iniciales del formulario
  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(initialForm);
  }, [initialData, isOpen]);

  // Cargar categorías desde API
  useEffect(() => {
    menuService.getCategorias()
      .then(setCategorias)
      .catch(console.error);
  }, []);

  // Filtrar variantes según el nombre de la categoría
  useEffect(() => {
    if (!form.categoriaId) {
      setVariantesFiltradas([]);
      return;
    }

    // Encontrar el nombre de la categoría seleccionada
    const categoriaSeleccionada = categorias.find(cat => cat.id === form.categoriaId);
    const nombreCategoria = categoriaSeleccionada?.nombre || "";

    // Obtener variantes según el nombre
    const rawVariante = variantesPorCategoria[nombreCategoria] || [];

    const normalizadas: VarianteCreate[] = rawVariante.map(v => ({
      id: v.id,
      name: v.name,
      obligatorio: v.obligatorio ?? false,
      maxSeleccion: v.maxSeleccion ?? 1,
      opciones: v.opciones?.map(op => ({
        nombre: op.nombre,
        precio: op.precio ?? 0,
      })) || [],
    }));

    setVariantesFiltradas(normalizadas);
  }, [form.categoriaId, categorias]);

  // Manejo de cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) setForm({ ...form, image: files[0] });
    else setForm({ ...form, [name]: name === "precio" ? parseFloat(value) : value });
  };

  const handleAddVariante = () => {
    const nuevaVariante: VarianteCreate = {
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

  const handleVarianteChange = (index: number, key: keyof VarianteCreate, value: any) => {
    const updated = [...(form.variantes || [])];
    (updated[index] as any)[key] = value;
    setForm({ ...form, variantes: updated });
  };

  const handleAddOpcion = (varianteIndex: number) => {
    const updated = [...(form.variantes || [])];
    updated[varianteIndex].opciones.push({ nombre: "Nueva Opción", precio: 0 });
    setForm({ ...form, variantes: updated });
  };

  const handleOpcionChange = (varianteIndex: number, opcionIndex: number, key: "nombre" | "precio", value: any) => {
    const updated = [...(form.variantes || [])];
    (updated[varianteIndex].opciones[opcionIndex] as any)[key] = key === "precio" ? parseFloat(value) : value;
    setForm({ ...form, variantes: updated });
  };

  const handleEliminarVariante = (index: number) => {
    const updated = [...(form.variantes || [])];
    updated.splice(index, 1);
    setForm({ ...form, variantes: updated });
  };

  const handleEliminarOpcion = (varianteIndex: number, opcionIndex: number) => {
    const updated = [...(form.variantes || [])];
    updated[varianteIndex].opciones.splice(opcionIndex, 1);
    setForm({ ...form, variantes: updated });
  };

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("%cDTO Enviado al Backend:", "color: orange; font-weight: bold; font-size: 14px;", form);

      if (initialData) {
        const updated = await menuService.update(initialData.restauranteId, form);
        onSave(updated);
      } else {
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

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{initialData ? "Editar Plato" : "Agregar Plato"}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
              <textarea name="ingredientes" value={form.ingredientes} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
            </div>

            {/* Categoría y Precio */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm">
                  <option value="">Seleccione</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input name="precio" type="number" step="0.01" value={form.precio} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen</label>
              <input name="image" type="file" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
              {form.image && typeof form.image !== "string" && (
                <img src={URL.createObjectURL(form.image)} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-md" />
              )}
            </div>

            {/* Variantes */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Variantes (Opcional)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddVariante} className="text-xs px-2 py-1 bg-orange-500 text-white rounded-md">+ Nueva</button>
                  <select onChange={(e) => handleAgregarExistente(e.target.value)} className="text-xs border rounded-md p-1">
                    <option value="">+ Existente</option>
                    {variantesFiltradas.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.variantes?.map((v, index) => (
                <div key={v.id} className="border p-2 mt-2 rounded-md relative bg-gray-50">
                  {/* Nombre variante */}
                  <div className="flex flex-row justify-center items-center gap-2 w-full">
                    <input type="text" value={v.name} onChange={(e) => handleVarianteChange(index, "name", e.target.value)} className="w-full border rounded-md p-1 text-sm mb-2" placeholder="Nombre de la variante" />
                    <button type="button" onClick={() => handleEliminarVariante(index)} className="text-red-500 hover:text-red-700 text-sm p-1 mb-2">✕</button>
                  </div>

                  <label className="flex items-center text-xs gap-2">
                    <input type="checkbox" checked={v.obligatorio} onChange={(e) => handleVarianteChange(index, "obligatorio", e.target.checked)} /> Obligatorio
                  </label>

                  <div className="mt-2">
                    <label className="text-xs text-gray-600">Máx. selección</label>
                    <input type="number" value={v.maxSeleccion} onChange={(e) => handleVarianteChange(index, "maxSeleccion", parseInt(e.target.value))} className="mt-1 block w-20 border rounded-md p-1 text-sm" />
                  </div>

                  {/* Opciones */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Opciones</span>
                      <button type="button" onClick={() => handleAddOpcion(index)} className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md">+ Agregar Opción</button>
                    </div>

                    {v.opciones.map((op, opIndex) => (
                      <div key={opIndex} className="flex gap-2 mt-2 relative">
                        <input type="text" value={op.nombre} onChange={(e) => handleOpcionChange(index, opIndex, "nombre", e.target.value)} className="flex-1 border rounded-md p-1 text-sm" placeholder="Nombre" />
                        <input type="number" value={op.precio} onChange={(e) => handleOpcionChange(index, opIndex, "precio", e.target.value)} className="w-24 border rounded-md p-1 text-sm" placeholder="Precio" />
                        <button type="button" onClick={() => handleEliminarOpcion(index, opIndex)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
