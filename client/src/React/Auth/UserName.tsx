import React from "react";
import { useUser } from "@/context/UserContext.tsx";

interface UserNameProps {
  className?: string;
}

const UserName: React.FC<UserNameProps> = ({ className }) => {
  const { user } = useUser();
  return (
    <span className={className}>
      {user ? user.nombre : "Cargando..."}
    </span>
  );
};

export default UserName;
