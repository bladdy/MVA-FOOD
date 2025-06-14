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
        "w-28 h-28 flex flex-col items-center justify-center px-2 py-2 rounded-full border transition-colors text-center",
        active
          ? "border-orange-500 text-orange-700 bg-orange-50"
          : "border-gray-300 text-gray-600 hover:border-orange-300"
      )}
    >
      <div className="w-8 h-8 mb-2 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs font-semibold break-words leading-tight">
        {label.toUpperCase()}
      </span>
    </button>
  );
};

export default CategoriaButton;
