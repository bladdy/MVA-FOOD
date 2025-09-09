// src/React/Auth/MenuSection.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import MenuManager from "../Admin/MenuManager.tsx";



const MenuSection= ({  }) => {
  return (
    <UserProvider>
      <MenuManager/>
    </UserProvider>
  );
};

export default MenuSection;
