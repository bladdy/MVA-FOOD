// src/React/Auth/UserSection.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import UserName from "@/React/Auth/UserName.tsx";
import LogoutButton from "@/React/Auth/LogoutButton.tsx";
import MenuManager from "../Admin/MenuManager.tsx";



const MenuSection= ({  }) => {
  return (
    <UserProvider>
      <MenuManager/>
    </UserProvider>
  );
};

export default MenuSection;
