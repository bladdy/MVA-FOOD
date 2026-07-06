import { useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { facturaService } from "@/Services/facturaService";
import { formatPrice } from "@/lib/currency";
import type { FacturaDto } from "@/Types/Restaurante";

function HistoryInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;

  const [facturas, setFacturas] = useState<FacturaDto[]>([]);
  const [filter, setFilter] = useState<"todas" | "pagadas" | "pendientes">("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restauranteId) return;
    facturaService
      .getByRestaurante(restauranteId)
      .then(setFacturas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restauranteId]);

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

  const filtered =
    filter === "todas"
      ? facturas
      : filter === "pagadas"
        ? facturas.filter((f) => f.pagado)
        : facturas.filter((f) => !f.pagado);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Facturas</h1>
        <a
          href="/admin/facturacion"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Volver
        </a>
      </div>

      <div className="flex gap-2">
        {(["todas", "pagadas", "pendientes"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === opt
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt === "todas" ? "Todas" : opt === "pagadas" ? "Pagadas" : "Pendientes"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="p-3 font-medium">Factura</th>
                <th className="p-3 font-medium">Concepto</th>
                <th className="p-3 font-medium">Monto</th>
                <th className="p-3 font-medium">Emisión</th>
                <th className="p-3 font-medium">Pago</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{f.numeroFactura}</td>
                  <td className="p-3 text-gray-700">{f.concepto}</td>
                  <td className="p-3 text-gray-700">{formatPrice(f.monto, f.moneda)}</td>
                  <td className="p-3 text-gray-500">{new Date(f.fechaEmision).toLocaleDateString("es-ES")}</td>
                  <td className="p-3 text-gray-500">
                    {f.fechaPago ? new Date(f.fechaPago).toLocaleDateString("es-ES") : "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.pagado
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {f.pagado ? "Pagada" : "Pendiente"}
                    </span>
                  </td>
                  <td className="p-3">
                    <a
                      href={`/admin/facturacion/factura/${f.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                    >
                      Ver
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400 italic">
                    No hay facturas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PaymentHistory() {
  return (
    <UserProvider>
      <HistoryInner />
    </UserProvider>
  );
}
