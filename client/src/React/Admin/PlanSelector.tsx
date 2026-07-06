import { useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { planService } from "@/Services/planService";
import { formatPrice } from "@/lib/currency";
import type { Plan, CambioPlanResponseDto } from "@/Types/Restaurante";

function PlanSelectorInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planActivo, setPlanActivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [result, setResult] = useState<CambioPlanResponseDto | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!restauranteId) return;

    const params = new URLSearchParams(window.location.search);
    const pago = params.get("pago");
    if (pago === "exito") {
      setSuccessMsg("Pago exitoso. Tu plan ha sido activado.");
    } else if (pago === "error") {
      setErrorMsg("El pago no se completó. Intenta de nuevo.");
    }

    Promise.all([
      planService.getAll(restauranteId),
      planService.getActivo(restauranteId),
    ])
      .then(([ps, activo]) => {
        setPlanes([...ps.filter((p) => p.precio > 0)].sort((a, b) => a.precio - b.precio || a.nombre.localeCompare(b.nombre)));
        setPlanActivo(activo);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restauranteId]);

  const handleChange = async (nuevoPlanId: string) => {
    if (!restauranteId) return;
    setChanging(true);
    setResult(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await planService.cambiar({
        restauranteId,
        nuevoPlanId,
      });
      setResult(res);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setChanging(false);
    }
  };

  if (!restauranteId) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Planes</h1>
        <a
          href="/admin/facturacion"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Volver
        </a>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 font-semibold">{errorMsg}</p>
        </div>
      )}

      {result && result.checkoutUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700">Redirigiendo a Stripe para completar el pago...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planes.map((plan) => {
          const isActive = planActivo?.planId === plan.id || planActivo?.nombre === plan.nombre;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow p-6 flex flex-col justify-between border-2 transition ${
                isActive ? "border-orange-500" : "border-transparent hover:border-orange-300"
              }`}
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">{plan.nombre}</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {formatPrice(plan.precio, plan.moneda)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {plan.duracionDias === 7 ? "7 días" : `${plan.duracionDias} días`}
                </p>
                {plan.stripePriceId && (
                  <p className="text-xs text-gray-400 mt-2">Pago recurrente mensual</p>
                )}
              </div>
              <button
                onClick={() => handleChange(plan.id)}
                disabled={isActive || changing}
                className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                } disabled:opacity-50`}
              >
                {isActive ? "Plan actual" : changing ? "Cambiando..." : "Seleccionar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlanSelector() {
  return (
    <UserProvider>
      <PlanSelectorInner />
    </UserProvider>
  );
}
