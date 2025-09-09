import React, { useEffect, useState } from "react";
import type { Menu, Categoria, PagedResult, MenuFilters } from "@/Types/Restaurante.ts";
import { menuService } from "@/Services/menuService.ts";
import MenuTable from "./MenuTable.tsx";
import MenuModal from "./MenuModal.tsx";
import Pagination from "../Buttons/Pagination.tsx";
import { useUser } from "@/context/UserContext.tsx";

const MenuManager: React.FC = () => {
  const { user } = useUser();

  const [pagedResult, setPagedResult] = useState<PagedResult<Menu> | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>();

  const [filters, setFilters] = useState<MenuFilters>({
    search: "",
    categoriaId: "",
    restauranteId: "", // Se actualizará cuando user esté disponible
    pageNumber: 1,
    pageSize: 10,
    orderBy: "nombre",
    orderDirection: "asc",
  });

  // 🔹 Actualizar restauranteId cuando el usuario se cargue
  useEffect(() => {
    if (user?.restauranteId) {
      setFilters(prev => ({
        ...prev,
        restauranteId: user.restauranteId,
        pageNumber: 1,
      }));
    }
  }, [user]);

  // 🔹 Cargar categorías
  const fetchCategorias = async () => {
    try {
      const data = await menuService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // 🔹 Cargar menús
  const fetchMenus = async () => {
    try {
      if (!filters.restauranteId) return; // Esperar a que se cargue restauranteId
      const data = await menuService.getMenus(filters);
      setPagedResult(data);
    } catch (error) {
      console.error("Error cargando menús:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [filters]);

  // 🔹 Handlers
  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMenu(undefined);
    setIsModalOpen(true);
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters(prev => ({ ...prev, search: e.target.value, pageNumber: 1 }));

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters(prev => ({ ...prev, categoriaId: e.target.value, pageNumber: 1 }));

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters(prev => ({ ...prev, pageSize: Number(e.target.value), pageNumber: 1 }));

  const handlePageChange = (newPage: number) =>
    setFilters(prev => ({ ...prev, pageNumber: newPage }));

  const handleSort = (column: string) =>
    setFilters(prev => ({
      ...prev,
      orderBy: column,
      orderDirection: prev.orderBy === column && prev.orderDirection === "asc" ? "desc" : "asc",
    }));

  return (
    <div>
      {/* 🔹 Filtros */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Buscar menú..."
          value={filters.search}
          onChange={handleSearchChange}
          className="border rounded px-3 py-2"
        />

        <select
          value={filters.categoriaId}
          onChange={handleCategoryChange}
          className="border rounded px-3 py-2"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>

        <select
          value={filters.pageSize}
          onChange={handlePageSizeChange}
          className="border rounded px-3 py-2"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>

        <span className="text-gray-600">
          Total encontrados: <strong>{pagedResult?.totalItems || 0}</strong>
        </span>

        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 ml-auto"
          onClick={handleAdd}
        >
          + Nuevo Menú
        </button>
      </div>

      {/* 🔹 Tabla */}
      {pagedResult && (
        <MenuTable
          pagedResult={pagedResult}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          currentSort={{ orderBy: filters.orderBy!, orderDirection: filters.orderDirection! }}
        />
      )}

      {pagedResult && (
        <Pagination
          currentPage={filters.pageNumber || 1}
          totalPages={pagedResult.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* 🔹 Modal */}
      {isModalOpen && (
        <MenuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          restauranteId={user?.restauranteId}
          initialData={selectedMenu || undefined}
        />
      )}
    </div>
  );
};

export default MenuManager;
