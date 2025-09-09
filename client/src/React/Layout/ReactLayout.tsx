// src/components/ReactLayout.tsx
import React, { type ReactNode } from "react";
import { UserProvider } from "@/context/UserContext.tsx";

interface ReactLayoutProps {
  children: ReactNode;
}

const ReactLayout: React.FC<ReactLayoutProps> = ({ children }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

export default ReactLayout;
