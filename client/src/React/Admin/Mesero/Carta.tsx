import { useMemo, useState } from "react";
import { IconBuscar } from "@/React/Admin/Mesero/icons";
import ProductoCard from "@/React/Admin/Mesero/ProductoCard";
import type { ComboResponse, Menu } from "@/Types/Restaurante";

interface Props {
  menus: Menu[];
  combos: ComboResponse[];
  onAgregarMenu: (m: Menu) => void;
  onAgregarCombo: (c: ComboResponse) => void;
}

export default function Carta({ menus, combos, onAgregarMenu, onAgregarCombo }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("");

  const categorias = useMemo(() => {
    const map = new Map<string, string>();
    menus.forEach((m) => {
      if (m.categoria) map.set(m.categoriaId, m.categoria.nombre);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [menus]);

  const menusFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return menus.filter((m) => {
      const porCategoria = categoriaActiva ? m.categoriaId === categoriaActiva : true;
      const porBusqueda = q
        ? m.nombre.toLowerCase().includes(q) || (m.ingredientes || "").toLowerCase().includes(q)
        : true;
      return porCategoria && porBusqueda;
    });
  }, [menus, busqueda, categoriaActiva]);

  const combosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (categoriaActiva) return [];
    return q ? combos.filter((c) => c.nombre.toLowerCase().includes(q)) : combos;
  }, [combos, busqueda, categoriaActiva]);

  const sinResultados = menusFiltrados.length === 0 && combosFiltrados.length === 0;

  return (
    <div>
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <IconBuscar />
        </span>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto o combo..."
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1.5">
        <button
          onClick={() => setCategoriaActiva("")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            categoriaActiva === ""
              ? "bg-orange-600 text-white shadow-card"
              : "border border-gray-200 bg-white text-gray-600 hover:border-orange-300"
          }`}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoriaActiva(categoriaActiva === c.id ? "" : c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              categoriaActiva === c.id
                ? "bg-orange-600 text-white shadow-card"
                : "border border-gray-200 bg-white text-gray-600 hover:border-orange-300"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {combosFiltrados.map((combo) => (
          <ProductoCard
            key={combo.id}
            nombre={combo.nombre}
            precio={combo.precio ?? 0}
            imagen={combo.imagen}
            descripcion={combo.descripcion}
            esCombo
            onAgregar={() => onAgregarCombo(combo)}
          />
        ))}
        {menusFiltrados.map((m) => (
          <ProductoCard
            key={m.id}
            nombre={m.nombre}
            precio={m.precio}
            imagen={m.imagen}
            descripcion={m.ingredientes}
            onAgregar={() => onAgregarMenu(m)}
          />
        ))}
      </div>

      {sinResultados && (
        <div className="py-10 text-center text-sm text-gray-400">
          No se encontraron resultados{busqueda.trim() ? ` para "${busqueda}"` : ""}
        </div>
      )}
    </div>
  );
}
