// components/RestaurantsList.jsx
import RestauranteCard from './RestauranteCard.tsx';
import type { Restaurante } from "@/Types/Restaurante.ts";


const API_URL = "http://localhost:5147";
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
          {restaurantes.map((restaurant) => {
            const imageSrc =
              typeof restaurant.image === "string"
                ? restaurant.image
                : restaurant.image
                ? URL.createObjectURL(restaurant.image)
                : "/img/default.jpg";

            const perfilSrc =
              typeof restaurant.perfilImage === "string"
                ? restaurant.perfilImage
                : restaurant.perfilImage
                ? URL.createObjectURL(restaurant.perfilImage)
                : "/img/default.jpg";

            return (
              <RestauranteCard
                key={restaurant.id}
                href={`/restaurantes/${restaurant.id}`}
                name={restaurant.name}
                image={`${API_URL}${imageSrc}`}
                perfilImage={`${API_URL}${perfilSrc}`}
                tipoComida={restaurant.tipos ?? ["Sin categoría"]}
                direccion={restaurant.direccion ?? "Dirección no disponible"}
              />
            );
          })}
        </section>
      </div>
    </div>
  );
}
