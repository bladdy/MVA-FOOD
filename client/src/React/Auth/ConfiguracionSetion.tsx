
// src/React/Auth/ConfiguracionSetion.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import RestauranteForm from "../Admin/RestauranteForm.tsx";



const ConfiguracionSetion= ({  }) => {
  return (
    <UserProvider>
      <RestauranteForm/>
    </UserProvider>
  );
};

export default ConfiguracionSetion;
