

// src/React/Auth/VariantesSection.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import VariantesManager from "../Admin/VariantesManager.tsx";



const VariantesSection= ({  }) => {
  return (
    <UserProvider>
      <VariantesManager />
    </UserProvider>
  );
};

export default VariantesSection;
