// src/React/Auth/VariantesSection.tsx
import { UserProvider } from "@/context/UserContext.tsx";
import QRGeneratorForm from "../Admin/QRGeneratorForm.tsx";



const QRGeneratorSection = () => {
  return (
    <UserProvider>
      <div className="h-full">
        <QRGeneratorForm />
      </div>
    </UserProvider>
  );
};

export default QRGeneratorSection;
