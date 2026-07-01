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
    setTimeout(() => setIsClicked(false), 200);
  };
  return (
    <button
      onClick={handleClick}
      className={clsx(
        "flex flex-col items-center justify-center px-3 py-3 rounded-2xl border-2 transition-all text-center flex-shrink-0",
        "w-24 h-24 md:w-28 md:h-28",
        active
          ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
          : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:shadow-sm",
        isClicked ? "animate-pop" : ""
      )}
    >
      <div className="w-6 h-6 md:w-7 md:h-7 mb-2 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[11px] md:text-xs font-semibold break-words leading-tight">
        {label.toUpperCase()}
      </span>
      {active && (
        <span className="mt-1 block w-6 h-0.5 bg-orange-500 rounded-full transition-all duration-300" />
      )}
    </button>
  );
};

export default CategoriaButton;
