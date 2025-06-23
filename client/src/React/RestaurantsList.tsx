// components/RestaurantsList.jsx
import RestauranteCard from './RestauranteCard';

type Restaurante = {
  id: string | number;
  name: string;
  image: string;
  perfilImage?: string;
  tipos?: string[];
  direccion?: string;
};

interface RestaurantsListProps {
  restaurantes: Restaurante[];
}

export default function RestaurantsList({ restaurantes }: RestaurantsListProps) {
  return (
    <div className="lg:w-4/6 w-full">
      <div className="mx-auto py-4 flex flex-col justify-center items-center">
        <h2 className="text-3xl font-semibold text-orange-600 lg:mb-6 text-center">
          Restaurantes
        </h2>

        <section className="w-full max-w-[1600px] grid lg:grid-cols-12 auto-rows-[15rem] gap-4 mx-auto p-6 md:p-6 lg:p-10">
          {restaurantes.map((restaurant) => (
            <RestauranteCard
              key={restaurant.id}
              href={`/restaurantes/${restaurant.id}`}
              name={restaurant.name}
              image={restaurant.image}
              perfilImage={restaurant.perfilImage ?? "/img/default.jpg"}
              tipoComida={restaurant.tipos ?? ["Sin categoría"]}
              direccion={restaurant.direccion ?? "Dirección no disponible"}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
