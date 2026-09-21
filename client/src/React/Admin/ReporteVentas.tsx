import { useCallback, useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { facturaVentaService } from "@/Services/facturaVentaService";
import { getCurrencySymbol } from "@/lib/currency";
import type { ReporteVentasDto, RangoReporteVentas } from "@/Types/Restaurante";

const RANGOS: { value: RangoReporteVentas; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

function ReporteVentasInner() {
  const { user } = useUser();  const restauranteId = user?.restauranteId || "";

  const [rango, setRango] = useState<RangoReporteVentas>("hoy");
  const [reporte, setReporte] = useState<ReporteVentasDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    if (!restauranteId) return;
    setLoading(true);
    setError("");
    try {
      const data = await facturaVentaService.getReporte(restauranteId, rango);
      setReporte(data);
    } catch (e: any) {
      setError(e?.message || "Error al obtener reporte");
    } finally {
      setLoading(false);
    }
  }, [restauranteId, rango]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const simb = getCurrencySymbol(reporte?.moneda || "DOP");
  const fmt = (n: number) => `${simb}${n.toFixed(2)}`;
  const fmtFecha = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  };
  const maxTotal = Math.max(1, ...(reporte?.ventasPorDia ?? []).map((d) => d.total));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reporte de ventas</h1>
          <p className="text-sm text-gray-500">Facturación del punto de venta</p>
        </div>
        <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
          {RANGOS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRango(r.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                rango === r.value ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
      )}

      {loading && !reporte && (
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-orange-500 border-t-transparent" />
        </div>
      )}

      {reporte && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Ingresos</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(reporte.ingresos)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Ventas</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{reporte.cantidadVentas}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Ticket promedio</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(reporte.ticketPromedio)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Impuestos</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(reporte.impuestos)}</p>
            </div>
          </div>

          {reporte.cantidadAnuladas > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-4 py-3">
              {reporte.cantidadAnuladas} factura(s) anulada(s) por {fmt(reporte.montoAnulado)} en el período.
            </div>
          )}

          {/* Ventas por día */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Ventas por día</h2>
            {reporte.ventasPorDia.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Sin ventas en el período.</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {reporte.ventasPorDia.map((d) => (
                  <div key={d.fecha} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-[10px] text-gray-500 truncate">{fmtFecha(d.fecha)}</span>
                    <div
                      className="w-full rounded-t-md bg-orange-500/80 hover:bg-orange-600 transition-colors"
                      style={{ height: `${Math.max(4, (d.total / maxTotal) * 100)}%` }}
                    />
                    <span className="text-[10px] font-medium text-gray-700">
                      {d.cantidad} · {fmt(d.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Por método de pago */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Por método de pago</h2>
            {reporte.ventasPorMetodoPago.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin datos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                      <th className="py-2 pr-4">Método</th>
                      <th className="py-2 pr-4 text-right">Ventas</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.ventasPorMetodoPago.map((m) => (
                      <tr key={m.metodoPago} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4 text-gray-700">{m.metodoPago}</td>
                        <td className="py-2 pr-4 text-right text-gray-500">{m.cantidad}</td>
                        <td className="py-2 text-right font-semibold text-gray-800">{fmt(m.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top productos */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Top productos</h2>
            {reporte.topProductos.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin datos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                      <th className="py-2 pr-4">Producto</th>
                      <th className="py-2 pr-4 text-right">Cantidad</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.topProductos.map((p) => (
                      <tr key={p.nombre} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4 text-gray-700">{p.nombre}</td>
                        <td className="py-2 pr-4 text-right text-gray-500">{p.cantidad}</td>
                        <td className="py-2 text-right font-semibold text-gray-800">{fmt(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ReporteVentas() {
  return (
    <UserProvider>
      <ReporteVentasInner />
    </UserProvider>
  );
}
