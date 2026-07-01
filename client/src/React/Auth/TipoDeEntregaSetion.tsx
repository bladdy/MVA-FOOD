


// src/React/Auth/ConfiguracionSetion.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import RestauranteForm from "../Admin/RestauranteForm.tsx";
import TipoEntregaManager from "../Admin/TipoEntregaManager.tsx";



const TipoDeEntregaSetion= ({  }) => {
  return (
    <UserProvider>
       <TipoEntregaManager  />
    </UserProvider>
  );
};

export default TipoDeEntregaSetion;
