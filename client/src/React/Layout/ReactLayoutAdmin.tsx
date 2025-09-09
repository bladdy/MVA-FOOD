// ReactLayout.tsx
import React from "react";
import { UserProvider } from "@/context/UserContext.tsx";
import AdminSideBar from "@/components/Admin/AdminSideBar.astro";
import AdminFooter from "@/components/Admin/AdminFooter.astro";
import AdminNavBar from "../Admin/AdminNavBar.tsx";

const ReactLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <div className="max-h-screen">
        {/*<AdminSideBar />*/}
        <div className="p-4 lg:ml-80">
          <AdminNavBar />
          <div className="h-[calc(100vh-182px)] px-4 py-6 overflow-y-auto">
            {children}
          </div>
          {/*<AdminFooter />*/}
        </div>
      </div>
    </UserProvider>
  );
};

export default ReactLayout;
