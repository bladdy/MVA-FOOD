
// components/RestaurantSearch.jsx
import { useState } from 'react';

interface Filters {
  name: string;
  tipo: string;
  ubicacion: string;
  amenidad: string;
}

interface RestaurantSearchProps {
  onSearch: (filters: Filters) => void;
}

export default function RestaurantSearch({ onSearch }: RestaurantSearchProps) {
  const [filters, setFilters] = useState({
    name: '',
    tipo: '',
    ubicacion: '',
    amenidad: ''
  });

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
              onChange={handleChange}
              className="w-full p-3 border border-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Restaurante</option>
              <option value="Demo">Demo</option>
            </select>

            <select
              name="tipo"
              onChange={handleChange}
              className="w-full p-3 border border-white  focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Tipo comida</option>
              <option value="Americana">Americana</option>
              <option value="Pollo">Pollo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 col-span-2 gap-1">
            <select
              name="ubicacion"
              onChange={handleChange}
              className="w-full p-3 border border-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Ubicación</option>
              <option value="Piantini">Piantini</option>
              <option value="Churchill">Churchill</option>
            </select>

            <select
              name="amenidad"
              onChange={handleChange}
              className="w-full p-3 border border-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Amenidades</option>
              <option value="Wifi">Wifi</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          <div className="w-full lg:col-span-1 col-span-6">
            <button
              type="submit"
              className="w-full bg-orange-600 text-white px-8 py-3 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}