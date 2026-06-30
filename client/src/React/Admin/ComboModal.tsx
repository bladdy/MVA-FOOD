import { useState } from "react";
import type { ComboResponse, Menu } from "@/Types/Restaurante.ts";
import { comboService } from "@/Services/comboService.ts";

interface Props {
  combo?: ComboResponse | null;
  restauranteId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function ComboModal({ combo, restauranteId, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState(combo?.nombre || "");
  const [descripcion, setDescripcion] = useState(combo?.descripcion || "");
  const [precio, setPrecio] = useState(combo?.precio?.toString() || "");
  const [activo, setActivo] = useState(combo?.activo ?? true);
  const [predefinido, setPredefinido] = useState(combo?.predefinido ?? true);
  const [items, setItems] = useState<{ menuId: string; menuNombre: string; cantidad: number }[]>(
    combo?.items.map((i) => ({ menuId: i.menuId, menuNombre: i.menuNombre, cantidad: i.cantidad })) || []
  );
  const [sugerencias, setSugerencias] = useState<{ menuId: string; menuNombre: string; precioAdicional: number }[]>(
    combo?.sugerencias?.map((s) => ({ menuId: s.menuId, menuNombre: s.menuNombre, precioAdicional: s.precioAdicional })) || []
  );
  const [menus, setMenus] = useState<Menu[]>([]);
  const [buscando, setBuscando] = useState(false);

  const cargarMenus = async () => {
    if (menus.length > 0) return;
    setBuscando(true);
    try {
      const mod = await import("@/Services/menuService.ts");
      const res = await mod.menuService.getMenus({ restauranteId, pageNumber: 1, pageSize: 200 });
      setMenus(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setBuscando(false);
    }
  };

  const handleAgregarItem = () => {
    setItems([...items, { menuId: "", menuNombre: "", cantidad: 1 }]);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const nuevos = [...items];
    if (field === "menuId") {
      const menu = menus.find((m) => m.id === value);
      nuevos[index] = { ...nuevos[index], menuId: value as string, menuNombre: menu?.nombre || "" };
    } else if (field === "cantidad") {
      nuevos[index] = { ...nuevos[index], cantidad: value as number };
    }
    setItems(nuevos);
  };

  const handleEliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAgregarSugerencia = () => {
    setSugerencias([...sugerencias, { menuId: "", menuNombre: "", precioAdicional: 0 }]);
  };

  const handleSugerenciaChange = (index: number, field: string, value: string | number) => {
    const nuevos = [...sugerencias];
    if (field === "menuId") {
      const menu = menus.find((m) => m.id === value);
      nuevos[index] = { ...nuevos[index], menuId: value as string, menuNombre: menu?.nombre || "" };
    } else if (field === "precioAdicional") {
      nuevos[index] = { ...nuevos[index], precioAdicional: value as number };
    }
    setSugerencias(nuevos);
  };

  const handleEliminarSugerencia = (index: number) => {
    setSugerencias(sugerencias.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || items.length === 0 || items.some((i) => !i.menuId)) {
      alert("Completa todos los campos requeridos");
      return;
    }

    const data = {
      nombre,
      descripcion: descripcion || undefined,
      precio: precio ? parseFloat(precio) : undefined,
      activo,
      predefinido,
      restauranteId,
      items: items.map((i) => ({ menuId: i.menuId, cantidad: i.cantidad })),
      sugerencias: sugerencias.length > 0
        ? sugerencias.map((s) => ({ menuId: s.menuId, precioAdicional: s.precioAdicional }))
        : undefined,
    };

    if (combo) {
      await comboService.update(combo.id, data);
    } else {
      await comboService.create(data);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-600">
            {combo ? "Editar Combo" : "Nuevo Combo"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Precio (opcional)</label>
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                placeholder="Si se deja vacío = suma de productos"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                Activo
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={predefinido} onChange={(e) => setPredefinido(e.target.checked)} />
                Predefinido
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Productos del combo *</label>
              <button type="button" onClick={handleAgregarItem} onFocus={cargarMenus} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                + Agregar producto
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <select
                  value={item.menuId}
                  onChange={(e) => handleItemChange(i, "menuId", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={item.cantidad}
                  onChange={(e) => handleItemChange(i, "cantidad", parseInt(e.target.value) || 1)}
                  className="w-16 border border-gray-300 rounded-lg p-2 text-sm text-center"
                />
                <button type="button" onClick={() => handleEliminarItem(i)} className="text-red-500 hover:text-red-700 text-sm">&times;</button>
              </div>
            ))}
            {buscando && <p className="text-xs text-gray-400">Cargando productos...</p>}
          </div>

          {!predefinido && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Sugerencias (convertir en combo)</label>
                <button type="button" onClick={handleAgregarSugerencia} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  + Agregar
                </button>
              </div>
              {sugerencias.map((sug, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <select
                    value={sug.menuId}
                    onChange={(e) => handleSugerenciaChange(i, "menuId", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                  >
                    <option value="">Seleccionar menú base...</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">+$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={sug.precioAdicional}
                    onChange={(e) => handleSugerenciaChange(i, "precioAdicional", parseFloat(e.target.value) || 0)}
                    className="w-20 border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <button type="button" onClick={() => handleEliminarSugerencia(i)} className="text-red-500 hover:text-red-700 text-sm">&times;</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium text-sm">
              {combo ? "Guardar cambios" : "Crear combo"}
            </button>
            <button type="button" onClick={onClose} className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
