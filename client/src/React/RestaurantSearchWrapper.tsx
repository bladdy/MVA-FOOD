"use client";

import { useEffect, useState } from "react";
import { getRestaurantes } from "@/Services/restauranteService.ts"; // ✅ importar función que consume la API
import RestaurantSearch from "./RestaurantSearch.tsx";
import RestaurantsList from "./RestaurantsList.tsx";
import RestaurantePaginator from "./RestaurantePaginator.tsx";

interface Filters {
  name: string;
  tipo: string;
  ubicacion: string;
  amenidad: string;
}

export default function RestaurantSearchWrapper() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    name: "",
    tipo: "",
    ubicacion: "",
    amenidad: "",
  });

  const ITEMS_PER_PAGE = 6;

  // ✅ Cargar restaurantes desde la API
  const loadRestaurants = async (page: number = 1) => {
    try {
      setLoading(true);
      const data = await getRestaurantes(page, ITEMS_PER_PAGE);
      setRestaurants(data.items || data); // si la API devuelve {items, totalPages}
      setTotalPages(data.totalPages || 1); // si la API envía totalPages
    } catch (error) {
      console.error("Error al obtener restaurantes:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cargar página inicial
  useEffect(() => {
    loadRestaurants(currentPage);
  }, [currentPage]);

  // ✅ Búsqueda local (opcional)
  const handleSearch = (filters: Filters) => {
    setFilters(filters);
    setCurrentPage(1);
    // Si tu API soporta búsqueda, puedes agregar aquí los filtros como query params
    loadRestaurants(1);
  };

  // ✅ Cambio de página desde el paginador
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="items-center justify-center flex lg:h-60 bg-[url(/img/fast-food-3.jpg)] bg-cover bg-center">
        <RestaurantSearch onSearch={handleSearch} />
      </div>

      {/* Contenido principal */}
      <div className="flex justify-center pb-4 min-h-[calc(100vh-25rem)]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-orange-600 text-xl md:text-2xl">Cargando...</p>
          </div>
        ) : restaurants.length > 0 ? (
          <RestaurantsList restaurantes={restaurants} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <h1 className="p-10 text-center text-orange-600 text-xl md:text-2xl">
              No se encontraron restaurantes.
            </h1>
          </div>
        )}
      </div>

      {/* ✅ Paginador */}
      <div className="flex justify-center pb-2">
        {restaurants.length > 0 && (
          <RestaurantePaginator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
