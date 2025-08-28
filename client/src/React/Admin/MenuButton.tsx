import React from "react";

interface MenuButtonProps {
  label: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
  >
    {label}
  </button>
);

export default MenuButton;
