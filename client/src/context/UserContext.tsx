// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import { getCurrentUser } from "@/Services/authService.ts";
import type { User } from "@/Types/User.ts";

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("No se pudo obtener usuario", err);
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de UserProvider");
  }
  return context;
};
