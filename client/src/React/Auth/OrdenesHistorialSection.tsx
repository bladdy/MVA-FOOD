
// src/React/Auth/OrdenesHistorialSection.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import OrdenesHistorial from "../Admin/OrdenesHistorial.tsx";

const OrdenesHistorialSection= ({  }) => {
  return (
    <UserProvider>
      <OrdenesHistorial/>
    </UserProvider>
  );
};

export default OrdenesHistorialSection;
