// components/RestaurantSearchWrapper.jsx
"use client";

import { useState } from "react";

import { restaurants as allRestaurants } from "@/consts/restaurantes";
import RestaurantSearch from "./RestaurantSearch.tsx";
import RestaurantsList from "./RestaurantsList.tsx";

interface Filters {
  name: string;
  tipo: string;
  ubicacion: string;
  amenidad: string;
}

export default function RestaurantSearchWrapper() {
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(allRestaurants);

  const handleSearch = (filters: Filters) => {
    const results = allRestaurants.filter((r) => {
      return (
        (!filters.name ||
          r.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.tipo || r.tipos.includes(filters.tipo)) &&
        (!filters.ubicacion ||
          r.direccion
            .toLowerCase()
            .includes(filters.ubicacion.toLowerCase())) &&
        (!filters.amenidad ||
          r.amnidades.some(
            (a) => a.name.toLowerCase() === filters.amenidad.toLowerCase()
          ))
      );
    });

    setFilteredRestaurants(results);
  };

  return (
    <div className="flex flex-col">
      <div className="items-center justify-center flex lg:h-60 bg-[url(/img/fast-food-3.jpg)] bg-cover bg-center">
        <RestaurantSearch onSearch={handleSearch} />
      </div>

      <div className="w-full max-w-7xl px-4"></div>
      <div className="flex justify-center pb-">
        <RestaurantsList restaurantes={filteredRestaurants} />
      </div>
      <div className="flex justify-center pb-">PAGINADOR...</div>
    </div>
  );
}
