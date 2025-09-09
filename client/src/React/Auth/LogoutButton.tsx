import React from "react";
import { logout } from "@/Services/authService.ts";

interface LogoutButtonProps {
  isSide: boolean; // true o false para cambiar la clase
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ isSide}) => {
  const handleLogout = async () => {
    await logout();
  };
//hidden lg:flex items-center gap-1 px-4 py-2 text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition
  return (
    <button
      onClick={handleLogout}
      className={
        isSide
          ? "hidden lg:flex items-center gap-1 px-4 py-2 text-orange-600 font-bold rounded-lg hover:scale-110 transition"
          : "lg:hidden flex items-center gap-1 px-4 py-2 text-orange-600 font-bold rounded-lg hover:scale-110 transition"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        stroke="currentColor"
        style={{ background: "white", borderRadius: "50%", margin: "2px" }}
        className="h-6 w-6 text-orange-600"
        viewBox="0 0 24 24"
      >
        <path d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"></path>
      </svg>
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
