import React, { useState } from "react";
import clsx from "clsx";

interface Props {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}
const CategoriaButton = ({ label, icon, active, onClick }: Props) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 200); // duración de la animación
  };
  return (
    <button
      onClick={handleClick}
      className={clsx(
        "flex flex-col items-center justify-center px-2 py-2 rounded-full border transition-colors text-center shadow-sm",
        "w-10 h-10 sm:w-12 sm:h-16 md:w-20 md:h-20", // Tamaños responsivos
        active
          ? "border-orange-500 text-orange-700 bg-orange-50"
          : "border-gray-300 text-gray-600 hover:border-orange-300",
        isClicked ? "animate-pop" : ""
      )}
    >
      <div className="w-4 h-4 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] sm:text-[10px] md:text-[10px] font-semibold break-words leading-tight">
        {label.toUpperCase()}
      </span>
    </button>
  );
};

export default CategoriaButton;
