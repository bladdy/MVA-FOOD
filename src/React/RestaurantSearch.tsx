// components/RestaurantSearch.jsx
import { useState, useEffect } from 'react';

interface Filters {
  name: string;
  tipo: string;
  ubicacion: string;
  amenidad: string;
}

interface RestaurantSearchProps {
  onSearch: (filters: Filters) => void;
}

// Función para obtener los filtros desde la URL
function getFiltersFromURL(): Filters {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') || '',
    tipo: params.get('tipo') || '',
    ubicacion: params.get('ubicacion') || '',
    amenidad: params.get('amenidad') || '',
  };
}

// Función para actualizar la URL con los filtros
function setFiltersToURL(filters: Filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

export default function RestaurantSearch({ onSearch }: RestaurantSearchProps) {
  const [filters, setFilters] = useState<Filters>(getFiltersFromURL());

  // Actualiza los filtros si la URL cambia (ej: navegación hacia atrás)
  useEffect(() => {
    const onPopState = () => setFilters(getFiltersFromURL());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Actualiza la URL cada vez que cambian los filtros
  useEffect(() => {
    setFiltersToURL(filters);
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <section className="lg:w-1/2 w-full rounded-lg px-8">
      <div className="mx-auto py-4 flex flex-col justify-center items-center">
        <h2 className="text-3xl font-semibold text-white lg:mb-6 text-center">
          Búsqueda de Restaurantes
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col lg:grid lg:grid-cols-5 grid-cols-12 w-full mt-4 gap-1">
          <div className="grid grid-cols-2 col-span-2 gap-1">
            <select
              name="name"
              value={filters.name}
              onChange={handleChange}
              className="px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Restaurante</option>
              <option value="Demo">Demo</option>
            </select>

            <select
              name="tipo"
              value={filters.tipo}
              onChange={handleChange}
              className="px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Tipo comida</option>
              <option value="Americana">Americana</option>
              <option value="Pollo">Pollo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 col-span-2 gap-1">
            <select
              name="ubicacion"
              value={filters.ubicacion}
              onChange={handleChange}
              className="px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Ubicación</option>
              <option value="Piantini">Piantini</option>
              <option value="Churchill">Churchill</option>
            </select>

            <select
              name="amenidad"
              value={filters.amenidad}
              onChange={handleChange}
              className="px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Amenidades</option>
              <option value="Wifi">Wifi</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          <div className="w-full lg:col-span-1 col-span-6">
            <button
              type="submit"
              className="w-full bg-orange-600 text-white px-8 py-3 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 rounded-lg "
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}