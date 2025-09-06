// src/components/MenuModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import type {
  MenuCreate,
  VarianteCreate,
  Categoria,
  Menu,
  VarianteFilters,
} from "@/Types/Restaurante.ts";
import { menuService } from "@/Services/menuService.ts";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  initialData?: MenuCreate | Menu;
}

const initialForm: MenuCreate = {
  id: "",
  nombre: "",
  ingredientes: "",
  precio: 0,
  categoriaId: "",
  restauranteId: "987C7605-3F17-4547-8806-ED5157666892",
  imagen: null,
  variantes: [],
};

const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [filters, setFilters] = useState<VarianteFilters>({
    search: "",
    categoriaId: "",
    obligatorio: false,
    maxSeleccion: 1,
    pageNumber: 1,
    pageSize: 10,
    orderBy: "nombre",
    orderDirection: "asc",
  });

  const [form, setForm] = useState<MenuCreate>(initialForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [variantesFiltradas, setVariantesFiltradas] = useState<VarianteCreate[]>([]);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // 🔹 Validaciones dinámicas
  const isFormValid = useMemo(() => {
    // Validar campos del menú
    if (!form.nombre.trim()) return false;
    if (!form.ingredientes.trim()) return false;
    if (!form.categoriaId) return false;
    if (form.precio < 0) return false;

    // Si no hay variantes → solo validar menú
    if (!form.variantes || form.variantes.length === 0) return true;

    // Validar variantes y sus opciones
    for (const v of form.variantes) {
      if (!v.name.trim()) return false;
      if (!v.maxSeleccion || v.maxSeleccion < 1) return false;

      for (const op of v.opciones) {
        if (!op.nombre.trim()) return false;
        if (op.precio < 0) return false;
      }
    }

    return true;
  }, [form]);

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    if (!initialData) {
      setForm(initialForm);
      setOriginalImage(null);
      return;
    }

    const data: MenuCreate = {
      id: initialData.id,
      nombre: initialData.nombre,
      ingredientes: initialData.ingredientes,
      precio: initialData.precio,
      categoriaId: initialData.categoriaId,
      restauranteId: initialData.restauranteId,
      imagen: null,
      variantes:
        initialData.variantes?.map((v) => ({
          id: v.id,
          name: v.name,
          obligatorio: v.obligatorio,
          maxSeleccion: v.maxSeleccion ?? 1,
          opciones:
            v.opciones?.map((op) => ({
              id: op.id,
              nombre: op.nombre,
              precio: op.precio ?? 0,
            })) || [],
        })) || [],
    };

    setForm(data);
    setOriginalImage(typeof initialData.imagen === "string" ? initialData.imagen : null);

    if (initialData.categoriaId) {
      setFilters((prev) => ({ ...prev, categoriaId: initialData.categoriaId }));
    }
  }, [initialData, isOpen]);

  // 🔹 Cargar categorías
  useEffect(() => {
    menuService.getCategorias().then(setCategorias).catch(console.error);
  }, []);

  // 🔹 Cargar variantes filtradas
  useEffect(() => {
    if (!filters.categoriaId) {
      setVariantesFiltradas([]);
      return;
    }

    menuService
      .getVariantes(filters)
      .then((allVariante) => {
        const mapped = allVariante.items.map((v) => ({
          id: v.id,
          name: v.name,
          obligatorio: v.obligatorio ?? false,
          maxSeleccion: v.maxSeleccion ?? 1,
          opciones:
            v.opciones?.map((op) => ({
              id: op.id,
              nombre: op.nombre,
              precio: op.precio ?? 0,
            })) || [],
        }));
        setVariantesFiltradas(mapped);
      })
      .catch(console.error);
  }, [filters]);

  // 🔹 Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;

    if (files) {
      setForm({ ...form, imagen: files[0] });
    } else {
      setForm({
        ...form,
        [name]: name === "precio" ? parseFloat(value) : value,
      });

      if (name === "categoriaId") {
        setFilters((prev) => ({ ...prev, categoriaId: value, pageNumber: 1 }));
      }
    }
  };

  const handleAddVariante = () => {
    const nuevaVariante: VarianteCreate = {
      id: `var-${Date.now()}`,
      name: "",
      obligatorio: false,
      maxSeleccion: 1,
      opciones: [{ id: `op-${Date.now()}`, nombre: "", precio: 0 }],
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
    updated[varianteIndex].opciones.push({
      id: `op-${Date.now()}`,
      nombre: "",
      precio: 0,
    });
    setForm({ ...form, variantes: updated });
  };

  const handleOpcionChange = (varianteIndex: number, opcionIndex: number, key: "nombre" | "precio", value: any) => {
    const updated = [...(form.variantes || [])];
    (updated[varianteIndex].opciones[opcionIndex] as any)[key] =
      key === "precio" ? parseFloat(value) : value;
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
    setOriginalImage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const dto: MenuCreate = { ...form };
      if (!form.imagen) delete (dto as any).imagen;

      if (initialData) {
        await menuService.update(initialData.id, dto);
      } else {
        await menuService.create(dto);
      }

      setForm(initialForm);
      setOriginalImage(null);
      onClose();
      onSave(null);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar el menú");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Editar Plato" : "Agregar Plato"}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingredientes *</label>
              <textarea name="ingredientes" value={form.ingredientes} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
            </div>

            {/* Categoría y Precio */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm">
                  <option value="">Seleccione</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Precio *</label>
                <input name="precio" type="number" step="0.01" value={form.precio} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen</label>
              <input name="image" type="file" onChange={handleChange} className="mt-1 block w-full border rounded-md p-2 text-sm" />
              {form.imagen && typeof form.imagen !== "string" ? (
                <img src={URL.createObjectURL(form.imagen)} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-md" />
              ) : originalImage ? (
                <img src={`http://localhost:5147${originalImage}`} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-md" />
              ) : null}
            </div>

            {/* Variantes */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Variantes (Opcional)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddVariante} className="text-xs px-2 py-1 bg-orange-500 text-white rounded-md">+ Nueva</button>
                  <select onChange={e => handleAgregarExistente(e.target.value)} className="text-xs border rounded-md p-1">
                    <option value="">+ Existente</option>
                    {variantesFiltradas.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                </div>
              </div>

              {form.variantes?.map((v, index) => (
                <div key={v.id} className="border p-2 mt-2 rounded-md bg-gray-50">
                  {/* Nombre variante */}
                  <div className="flex justify-center items-center gap-2 w-full">
                    <input type="text" value={v.name} onChange={e => handleVarianteChange(index, "name", e.target.value)} className="w-full border rounded-md p-1 text-sm mb-2" placeholder="Nombre de la variante *" />
                    <button type="button" onClick={() => handleEliminarVariante(index)} className="text-red-500 hover:text-red-700 text-sm p-1 mb-2">✕</button>
                  </div>

                  <label className="flex items-center text-xs gap-2">
                    <input type="checkbox" checked={v.obligatorio} onChange={e => handleVarianteChange(index, "obligatorio", e.target.checked)} /> Obligatorio
                  </label>

                  <div className="mt-2">
                    <label className="text-xs text-gray-600">Máx. selección *</label>
                    <input type="number" value={v.maxSeleccion} onChange={e => handleVarianteChange(index, "maxSeleccion", parseInt(e.target.value))} className="mt-1 block w-20 border rounded-md p-1 text-sm" />
                  </div>

                  {/* Opciones */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Opciones *</span>
                      <button type="button" onClick={() => handleAddOpcion(index)} className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md">+ Agregar Opción</button>
                    </div>

                    {v.opciones.map((op, opIndex) => (
                      <div key={op.id} className="flex gap-2 mt-2 relative">
                        <input type="text" value={op.nombre} onChange={e => handleOpcionChange(index, opIndex, "nombre", e.target.value)} className="flex-1 border rounded-md p-1 text-sm" placeholder="Nombre *" />
                        <input type="number" value={op.precio} onChange={e => handleOpcionChange(index, opIndex, "precio", e.target.value)} className="w-24 border rounded-md p-1 text-sm" placeholder="Precio" />
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
              <button type="submit" disabled={!isFormValid} className={`px-4 py-2 text-sm text-white rounded-md ${isFormValid ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-400 cursor-not-allowed"}`}>
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
