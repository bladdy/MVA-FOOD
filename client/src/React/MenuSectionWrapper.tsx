// src/React/MenuSectionWrapper.jsx
import { useEffect, useState } from "react";
import MenuSection from "./MenuSection";

interface MenuSectionWrapperProps {
  menu: any; // Puedes reemplazar 'any' con el tipo correcto si lo conoces
  titulo: string;
  tomaPedido: boolean;
}

const MenuSectionWrapper = ({ menu, titulo, tomaPedido }: MenuSectionWrapperProps) => {
  const [loading, setLoading] = useState(true);
  const [mesa, setMesa] = useState<string | null>(null);

  useEffect(() => {
    // Leer el número de mesa de los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get("mesa");
    if (mesaParam) {
      setMesa(mesaParam);
    }

    // Simular carga (puedes quitar esto si prefieres carga instantánea)
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
      {/* ✅ Mostrar número de mesa si existe */}
      {mesa && (
        <p className="text-sm mb-4 text-orange-700 font-semibold text-center">
          Número de mesa: <span className="font-bold">{mesa}</span>
        </p>
      )}
      <MenuSection
        menu={menu}
        titulo={titulo}
        tomaPedido={tomaPedido}
        //mesa={mesa}  opcional: pásalo si MenuSection lo necesita
      />
    </div>
  );
};

export default MenuSectionWrapper;
