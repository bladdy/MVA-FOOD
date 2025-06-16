// components/RestaurantSearchWrapper.jsx
"use client";

import { useState } from "react";

import { restaurants as allRestaurants } from "@/consts/restaurantes";
import RestaurantSearch from "./RestaurantSearch.tsx";
import RestaurantsList from "./RestaurantsList.tsx";
import RestaurantePaginator from "./RestaurantePaginator.tsx"; // importar paginador
const ITEMS_PER_PAGE = 6;

interface Filters {
  name: string;
  tipo: string;
  ubicacion: string;
  amenidad: string;
}
interface HandlePageChange {
  (page: number): void;
}

export default function RestaurantSearchWrapper() {
  const [filteredRestaurants, setFilteredRestaurants] = useState(allRestaurants);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);

  const handleSearch = (filters: Filters) => {
    const results = allRestaurants.filter((r) => {
      return (
        (!filters.name || r.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.tipo || r.tipos.includes(filters.tipo)) &&
        (!filters.ubicacion || r.direccion.toLowerCase().includes(filters.ubicacion.toLowerCase())) &&
        (!filters.amenidad ||
          r.amnidades.some((a) => a.name.toLowerCase() === filters.amenidad.toLowerCase()))
      );
    });

    setFilteredRestaurants(results);
    setCurrentPage(1); // reinicia a la página 1 después de buscar
  };


  const handlePageChange: HandlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col">
      <div className="items-center justify-center flex lg:h-60 bg-[url(/img/fast-food-3.jpg)] bg-cover bg-center">
        <RestaurantSearch onSearch={handleSearch} />
      </div>

      <div className="w-full max-w-7xl px-4"></div>
      <div className="flex justify-center pb-">
        <RestaurantsList restaurantes={filteredRestaurants} />
      </div>
      <div className="flex justify-center pb-">
        <RestaurantePaginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
