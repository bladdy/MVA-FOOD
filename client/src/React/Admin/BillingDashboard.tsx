import { useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { planService } from "@/Services/planService";
import { facturaService } from "@/Services/facturaService";
import { formatPrice } from "@/lib/currency";
import type { DashboardInfoDto } from "@/Types/Restaurante";

function BillingInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;

  const [dashboard, setDashboard] = useState<DashboardInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchDashboard = () => {
    if (!restauranteId) return;
    planService
      .getDashboardInfo(restauranteId)
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, [restauranteId]);

  const handlePagar = async (facturaId: string) => {
    setPaying(true);
    try {
      const res = await facturaService.pagar(facturaId);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (!restauranteId || loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const isVencido = dashboard?.estado === "Vencido";
  const venceEn = dashboard?.fechaFin
    ? Math.max(0, Math.floor((new Date(dashboard.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>

      {dashboard?.esGratuito && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-800 font-semibold">Plan Gratuito</p>
            <p className="text-blue-600 text-sm mt-1">
              Estás usando el plan gratuito. Actualiza a un plan de pago para acceder a todas las funciones.
            </p>
          </div>
          <a
            href="/admin/facturacion/planes"
            className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Ver Planes
          </a>
        </div>
      )}

      {isVencido && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">Plan Vencido</p>
          <p className="text-red-600 text-sm mt-1">
            Tu plan ha vencido. Tu menú no está visible para los clientes. Renueva tu plan para reactivar tu restaurante.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 font-medium">Plan Actual</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{dashboard?.planNombre ?? "Sin plan"}</p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.esGratuito ? "Gratuito" : `${formatPrice(dashboard?.planPrecio ?? 0, dashboard?.moneda ?? "DOP")}/mes`}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Vence en</p>
          <p className={`text-3xl font-bold mt-1 ${venceEn <= 2 ? "text-red-600" : "text-gray-800"}`}>
            {venceEn}
          </p>
          <p className={`text-xs mt-1 ${venceEn <= 2 ? "text-red-500" : "text-gray-400"}`}>
            días
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">Estado</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {isVencido ? "Vencido" : dashboard?.tieneFacturaPendiente ? "Pendiente" : "Al día"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.tieneFacturaPendiente ? "factura por pagar" : ""}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Facturación</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {dashboard?.esGratuito ? "Sin costo" : dashboard?.tieneFacturaPendiente ? formatPrice(dashboard?.montoPendiente ?? 0, dashboard?.moneda ?? "DOP") : "Al día"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.tieneFacturaPendiente ? "pendiente de pago" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href="/admin/facturacion/planes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
        >
          Cambiar Plan
        </a>
        <a
          href="/admin/facturacion/historial"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
        >
          Ver Historial
        </a>
      </div>

      {dashboard?.tieneFacturaPendiente && dashboard?.facturaPendienteId && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Factura Pendiente</h3>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-semibold text-red-800">
                {formatPrice(dashboard.montoPendiente ?? 0, dashboard.moneda)}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Vence el {new Date(dashboard.fechaFin).toLocaleDateString("es-ES")}
              </p>
            </div>
            <button
              onClick={() => handlePagar(dashboard.facturaPendienteId!)}
              disabled={paying}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
            >
              {paying ? "Procesando..." : "Pagar Ahora"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingDashboard() {
  return (
    <UserProvider>
      <BillingInner />
    </UserProvider>
  );
}
