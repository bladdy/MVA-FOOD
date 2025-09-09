// src/React/Admin/AdminNavBar.tsx
import React from "react";
import UserSection from "../Auth/UserSection.tsx";

const AdminNavBar: React.FC = () => {
  return (
    <nav className="w-full bg-white px-4 py-3 border rounded-full shadow-sm flex justify-between items-center">
      <div>
        <h1>Dashboard</h1>
      </div>
      <UserSection/>
    </nav>
  );
};

export default AdminNavBar;
