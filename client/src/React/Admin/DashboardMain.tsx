import { useEffect, useState } from "react";
import { pedidoService, type PedidoResponse } from "@/Services/pedidoService.ts";
import { menuService } from "@/Services/menuService.ts";
import { UserProvider, useUser } from "@/context/UserContext.tsx";
import { isToday, format, parseISO } from "date-fns";

const ESTADOS = ["Pendiente", "En Proceso", "Completado", "Entregado"] as const;

function DonutChart({
  segments,
  size = 180,
  thickness = 24,
  innerLabel,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  innerLabel?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-sm text-gray-400 italic">Sin datos</p>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {segments.map((seg) => {
          const percent = seg.value / total;
          const dashArray = `${percent * circumference} ${circumference}`;
          const dashOffset = -cumulative * circumference;
          cumulative += percent;
          return (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      {innerLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{innerLabel}</span>
        </div>
      )}
    </div>
  );
}

function DashboardInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;

  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [totalMenus, setTotalMenus] = useState(0);

  useEffect(() => {
    if (!restauranteId) return;
    pedidoService.getAll(restauranteId).then(setPedidos).catch(console.error);
    menuService
      .getMenus({ restauranteId, pageSize: 1, activo: true })
      .then((r) => setTotalMenus(r.totalItems))
      .catch(console.error);
  }, [restauranteId]);

  const pendientes = pedidos.filter((p) => p.estado === 0);
  const enProceso = pedidos.filter((p) => p.estado === 1);
  const completados = pedidos.filter((p) => p.estado === 2);
  const entregados = pedidos.filter((p) => p.estado === 3);

  const completadosHoy = completados.filter((p) => isToday(parseISO(p.fecha)));

  const pedidosHoy = pedidos.filter((p) => isToday(parseISO(p.fecha)));
  const bloquesHorarios = [
    { label: "Madrugada", horas: [0, 1, 2, 3, 4, 5], color: "#1e293b" },
    { label: "Mañana", horas: [6, 7, 8, 9, 10, 11], color: "#f59e0b" },
    { label: "Tarde", horas: [12, 13, 14, 15, 16, 17], color: "#f97316" },
    { label: "Noche", horas: [18, 19, 20, 21, 22, 23], color: "#6366f1" },
  ];
  const ordenesPorBloque = bloquesHorarios.map((bloque) => {
    const count = pedidosHoy.filter((p) => {
      const h = parseInt(format(parseISO(p.fecha), "HH"));
      return bloque.horas.includes(h);
    }).length;
    return { ...bloque, value: count };
  });
  const totalHoy = pedidosHoy.length;

  const ingresosHoy = completadosHoy.reduce((sum, p) => sum + p.total, 0);
  const ultimas5 = [...pedidos].slice(0, 5);

  if (!restauranteId) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
        <p className="mt-5 text-base text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{pendientes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">En Proceso</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{enProceso.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Completados Hoy</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{completadosHoy.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-gray-400">
          <p className="text-sm text-gray-500 font-medium">Entregados</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{entregados.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-emerald-600">
          <p className="text-sm text-gray-500 font-medium">Ingresos Hoy</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">${ingresosHoy.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 font-medium">Menús Activos</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalMenus}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes por bloque horario — donut chart */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Órdenes por Horario (Hoy)
          </h3>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
            <DonutChart
              segments={ordenesPorBloque.map((b) => ({
                value: b.value,
                color: b.color,
                label: b.label,
              }))}
              size={180}
              thickness={24}
              innerLabel={String(totalHoy)}
            />
            <div className="space-y-2">
              {ordenesPorBloque.map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="text-gray-600">{b.label}</span>
                  <span className="font-medium text-gray-800 ml-auto">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribución por estado — donut chart */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribución por Estado
          </h3>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
            <DonutChart
              segments={[
                { value: pendientes.length, color: "#eab308", label: "Pendiente" },
                { value: enProceso.length, color: "#3b82f6", label: "En Proceso" },
                { value: completados.length, color: "#22c55e", label: "Completado" },
                { value: entregados.length, color: "#6b7280", label: "Entregado" },
              ]}
              size={180}
              thickness={24}
              innerLabel={String(pedidos.length)}
            />
            <div className="space-y-2">
              {[
                { label: "Pendiente", value: pendientes.length, color: "#eab308" },
                { label: "En Proceso", value: enProceso.length, color: "#3b82f6" },
                { label: "Completado", value: completados.length, color: "#22c55e" },
                { label: "Entregado", value: entregados.length, color: "#6b7280" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-800 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Últimas Órdenes</h3>
          <a
            href="/admin/ordenes"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Ver todas →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Hora</th>
              </tr>
            </thead>
            <tbody>
              {ultimas5.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="py-2.5 font-medium text-gray-800">
                    {p.clienteNombre}
                  </td>
                  <td className="py-2.5 text-gray-700">${p.total.toFixed(2)}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.estado === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : p.estado === 1
                            ? "bg-blue-100 text-blue-800"
                            : p.estado === 2
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ESTADOS[p.estado]}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-500">
                    {format(parseISO(p.fecha), "HH:mm")}
                  </td>
                </tr>
              ))}
              {ultimas5.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400 italic">
                    Sin órdenes aún
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

export default function DashboardMain() {
  return (
    <UserProvider>
      <DashboardInner />
    </UserProvider>
  );
}
