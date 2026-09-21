import { UserProvider, useUser } from "@/context/UserContext";
import VentaRapida from "@/React/Admin/VentaRapida";

function PuntoDeVentaInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Punto de venta</h1>
        <p className="text-sm text-gray-500">Facturación rápida</p>
      </div>

      <VentaRapida restauranteId={restauranteId} />
    </div>
  );
}

export default function PuntoDeVenta() {
  return (
    <UserProvider>
      <PuntoDeVentaInner />
    </UserProvider>
  );
}
