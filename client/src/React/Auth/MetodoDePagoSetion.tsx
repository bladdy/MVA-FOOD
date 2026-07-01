// src/React/Auth/MetodoDePagoSetion.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import MetodoPagoManager from "../Admin/MetodoPagoManager.tsx";

const MetodoDePagoSetion = () => {
  return (
    <UserProvider>
       <MetodoPagoManager />
    </UserProvider>
  );
};

export default MetodoDePagoSetion;
