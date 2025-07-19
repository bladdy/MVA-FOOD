// src/React/MenuSectionWrapper.jsx
import { useEffect, useState } from "react";
import MenuSection from "./MenuSection";

interface MenuSectionWrapperProps {
  menu: any; // Replace 'any' with the actual type if known
  titulo: string;
  tomaPedido: boolean;
}

const MenuSectionWrapper = ({ menu, titulo, tomaPedido }: MenuSectionWrapperProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga (puedes omitir el timeout si lo quieres instantáneo tras el montaje)
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-500 border-solid"></div>
      <p className="mt-4 text-orange-600 font-semibold">Cargando menú...</p>
    </div>
  ) : (
    <MenuSection menu={menu} titulo={titulo} tomaPedido={tomaPedido} />
  );
};

export default MenuSectionWrapper;

