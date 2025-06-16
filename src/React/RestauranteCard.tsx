import FoodIcon from "@/components/Icons/FoodIcon";
import LocationIcon from "@/components/Icons/LocationIcon";

// components/RestauranteCard.jsx
type RestauranteCardProps = {
  href: string;
  name: string;
  image: string;
  perfilImage: string;
  tipoComida: string[];
  direccion: string;
};

export default function RestauranteCard({
  href,
  name,
  image,
  perfilImage,
  tipoComida,
  direccion
}: RestauranteCardProps) {
  return (
     <a
  href={href}
  className="col-span-4 relative rounded-xl backdrop-blur-md border border-black/10 shadow-inner shadow-white/10 overflow-hidden group"
>
  <div
    className="absolute z-10 bottom-0 top-0 w-full h-full
      bg-gradient-to-b from-transparent from-40% via-[#151836]/50 to-[#151836]/80"
  >
  </div>

  <div
    className="absolute left-0 top-0 bottom-0 w-full
      h-full group-hover:scale-110 transition-scale duration-1000
      ease-in-out opacity-90 bg-blend-luminosity bg-center bg-cover bg-no-repeat -z-10"
      style={{ backgroundImage: `url(${perfilImage})` }}
  >
  </div>

  <div
    className="relative flex flex-col gap-1 p-6 z-20 select-none justify-end h-full"
  >
    <img
      src="mva-logo-rb.png"
      alt="Logo"
      className="w-14 h-14 object-cover rounded-full border-2 border-white"
    />
    
    <h2 className="text-3xl font-semibold text-balance text-white">{name}</h2>
    <div className="flex items-start">
      <div>
        <FoodIcon className="text-orange-600 text-sm mr-2" />
      </div>
      <h2 className="text-sm font-semibold text-balance text-white">
        {tipoComida?.join(", ") ?? "Sin categoría"}
      </h2>
    </div>
    <div className="flex items-start">
      <div>
        <LocationIcon className="text-orange-600 text-sm mr-2" />
        
      </div>
      <h2 className="text-sm text-balance text-white">{direccion}</h2>
    </div>
  </div>
</a>
  );
}