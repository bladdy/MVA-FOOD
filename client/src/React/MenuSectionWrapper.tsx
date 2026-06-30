// src/React/MenuSectionWrapper.jsx
import { useEffect, useState } from "react";
import MenuSection from "./MenuSection.tsx";
import type { Menu, ComboResponse } from "@/Types/Restaurante.ts";

interface MenuSectionWrapperProps {
  restaurantId: string,
  menu: Menu[];
  combos?: ComboResponse[];
  titulo: string;
  tomaPedido: boolean;
}

const MenuSectionWrapper = ({ restaurantId, menu, combos, titulo, tomaPedido }: MenuSectionWrapperProps) => {
  const [loading, setLoading] = useState(true);
  const [mesa, setMesa] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get("mesa");
    if (mesaParam) {
      setMesa(mesaParam);
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-500 border-solid"></div>
      <p className="mt-4 text-orange-600 font-semibold">Cargando menú...</p>
    </div>
  ) : (
    <div>
      {mesa && (
        <p className="text-sm mb-4 text-orange-700 font-semibold text-center">
          Número de mesa: <span className="font-bold">{mesa}</span>
        </p>
      )}
      <MenuSection
        restaurantId ={restaurantId}
        menu={menu}
        combos={combos}
        titulo={titulo}
        tomaPedido={tomaPedido}
        mesa={mesa}
      />
    </div>
  );
};

export default MenuSectionWrapper;
