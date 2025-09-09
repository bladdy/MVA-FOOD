// src/React/Auth/UserSection.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import UserName from "@/React/Auth/UserName.tsx";
import LogoutButton from "@/React/Auth/LogoutButton.tsx";



const UserSection= ({  }) => {
  return (
    <UserProvider>
      <div className="flex items-center gap-4">
        <h6 className="font-semibold text-orange-600 capitalize">
          Bienvenido: <UserName />
        </h6>
        <LogoutButton isSide={true} />
      </div>
    </UserProvider>
  );
};

export default UserSection;
