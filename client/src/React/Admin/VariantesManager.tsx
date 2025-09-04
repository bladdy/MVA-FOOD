import React, { useEffect, useState } from "react";
import type { Categoria, PagedResult, Variante, VarianteFilters } from "@/Types/Restaurante.ts";
import { menuService } from "@/Services/menuService.ts";
import Pagination from "../Buttons/Pagination.tsx";
import VariantesTable from "./VariantesTable.tsx";
import VariantesModal from "./VariantesModal.tsx";

const VariantesManager: React.FC = () => {
  const [pagedResult, setPagedResult] = useState<PagedResult<Variante> | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Variante | undefined>();

  const [filters, setFilters] = useState<VarianteFilters>({
    search: "",
    categoriaId: "",
    obligatorio: false,
    maxSeleccion: 1,
    pageNumber: 1,
    pageSize: 10,
    orderBy: "nombre", // 🔹 inicial
    orderDirection: "asc", // 🔹 inicial
  });

  // 🔹 Cargar variantes con filtros + orden
  const fetchVariantes = async () => {
    try {
      const data = await menuService.getVariantes(filters);
      setPagedResult(data);
    } catch (error) {
      console.error("Error cargando variantes:", error);
    }
  };

  // 🔹 Cargar categorías
  const fetchCategorias = async () => {
    try {
      const data = await menuService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    fetchVariantes();
  }, [filters]);

  // 🔹 Handlers
  const handleEdit = (variante: Variante) => {
    setSelectedMenu(variante);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMenu(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    await fetchVariantes();
  };

  const handleDelete = async (variante: Variante) => {
    try {
      await fetch(`http://localhost:5147/api/Variante/${variante.id}`, { method: "DELETE" });
      await fetchVariantes();
    } catch (error) {
      console.error("Error eliminando variante:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, pageNumber: 1 }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, categoriaId: e.target.value, pageNumber: 1 }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, pageSize: Number(e.target.value), pageNumber: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, pageNumber: newPage }));
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      orderBy: column,
      orderDirection: prev.orderBy === column && prev.orderDirection === "asc" ? "desc" : "asc",
    }));
  };

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
          + Nueva Variante
        </button>
      </div>

      {/* 🔹 Tabla */}
      {pagedResult && (
        <VariantesTable
          pagedResult={pagedResult}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          currentSort={{
            orderBy: filters.orderBy!,
            orderDirection: filters.orderDirection!,
          }}
        />
      )}

      {/* 🔹 Paginación */}
      {pagedResult && (
        <Pagination
          currentPage={filters.pageNumber || 1}
          totalPages={pagedResult.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* 🔹 Modal */}
      {isModalOpen && (
        <VariantesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={selectedMenu || undefined}
        />
      )}
    </div>
  );
};

export default VariantesManager;
