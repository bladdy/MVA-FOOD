import React from "react";
import clsx from "clsx";

interface Props {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

const CategoriaButton = ({ label, icon, active, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center justify-center px-2 py-2 rounded-full border transition-colors text-center shadow-sm",
        "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32", // Tamaños responsivos
        active
          ? "border-orange-500 text-orange-700 bg-orange-50"
          : "border-gray-300 text-gray-600 hover:border-orange-300"
      )}
    >
      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] sm:text-xs md:text-sm font-semibold break-words leading-tight">
        {label.toUpperCase()}
      </span>
    </button>
  );
};

export default CategoriaButton;
