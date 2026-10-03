import { useEffect, useState } from "react";
import { propinaService } from "@/Services/propinaService.ts";
import { getCurrencySymbol } from "@/lib/currency";
import { UserProvider, useUser } from "@/context/UserContext.tsx";
import type {
  ConfigPropinaDto,
  PagoPropinaDto,
  ResumenPropinaDto,
} from "@/Types/Restaurante.ts";

const ROLES_REPARTO = ["Empleado", "Mesero", "Cocina"];

const fmt = (n: number) =>
  n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const hoy = () => new Date().toISOString().slice(0, 10);

export default function PropinasManager() {
  return (
    <UserProvider>
      <PropinasManagerInner />
    </UserProvider>
  );
}

function PropinasManagerInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId || "";
  const esAdmin = user?.rol === "Admin";

  const [tab, setTab] = useState<"distribucion" | "pago" | "historial">("distribucion");

  // Distribución
  const [config, setConfig] = useState<ConfigPropinaDto | null>(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);

  // Pago por rango
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());
  const [resumen, setResumen] = useState<ResumenPropinaDto | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Historial
  const [historial, setHistorial] = useState<PagoPropinaDto[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [confirmandoPago, setConfirmandoPago] = useState(false);

  const cargarConfig = async () => {
    if (!restauranteId) return;
    setCargandoConfig(true);
    try {
      setConfig(await propinaService.getConfig(restauranteId));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la configuración");
    } finally {
      setCargandoConfig(false);
    }
  };

  const cargarHistorial = async () => {
    if (!restauranteId) return;
    try {
      setHistorial(await propinaService.getHistorial(restauranteId));
    } catch {
      setHistorial([]);
    }
  };

  useEffect(() => {
    if (!restauranteId) return;
    cargarConfig();
    cargarHistorial();
  }, [restauranteId]);

  const guardarConfig = async () => {
    if (!config || !restauranteId || !esAdmin) return;
    try {
      const guardado = await propinaService.saveConfig(restauranteId, config);
      setConfig(guardado);
      setExito("Configuración de reparto guardada");
      setError("");
      setTimeout(() => setExito(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la configuración");
    }
  };

  const buscar = async () => {
    if (!restauranteId || !desde || !hasta || desde > hasta) {
      setError("Selecciona un rango de fechas válido (desde ≤ hasta)");
      return;
    }
    setBuscando(true);
    setError("");
    try {
      setResumen(await propinaService.getResumen(restauranteId, desde, hasta));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar el rango");
      setResumen(null);
    } finally {
      setBuscando(false);
    }
  };

  const pagar = async () => {
    if (!restauranteId || !resumen) return;
    setConfirmandoPago(false);
    try {
      const pago = await propinaService.pagar(restauranteId, desde, hasta);
      setExito(`Propinas pagadas: ${fmt(pago.totalDividir)} ${resumen.moneda}. ${pago.detalles.length} empleado${pago.detalles.length === 1 ? "" : "s"} incluido${pago.detalles.length === 1 ? "" : "s"}.`);
      setError("");
      setResumen(null);
      cargarHistorial();
      cargarConfig();
      setTimeout(() => setExito(""), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo marcar el pago");
    }
  };

  const modoLabel = (modo: number) => (modo === 1 ? "Por rol" : "Todos por igual");
  const simbolo = getCurrencySymbol(resumen?.moneda || "DOP");

  if (!restauranteId) {
    return <p className="py-8 text-center text-gray-500">Cargando sesión...</p>;
  }

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "distribucion", label: "Distribución" },
    { id: "pago", label: "Pago por rango" },
    { id: "historial", label: "Historial" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Propinas</h1>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
              tab === t.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-4 font-bold">
            ✕
          </button>
        </div>
      )}
      {exito && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {exito}
        </div>
      )}

      {tab === "distribucion" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-800">¿Cómo se divide la propina?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Participa el personal activo ({config?.participantes ?? 0} usuarios: Empleado, Mesero y Cocina;
              Admin no participa).
            </p>

            {cargandoConfig ? (
              <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
            ) : (
              config && (
                <div className="mt-4 space-y-5">
                  <div className="space-y-2">
                    {[
                      { modo: 0 as const, label: "A todos por igual", desc: "El total se reparte equitativamente entre todo el personal activo." },
                      { modo: 1 as const, label: "Por rol", desc: "A cada rol le corresponde un % del total; el % del rol se reparte igual entre sus miembros." },
                    ].map((op) => (
                      <label
                        key={op.modo}
                        className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                          config.modo === op.modo ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="modo"
                          checked={config.modo === op.modo}
                          disabled={!esAdmin}
                          onChange={() => setConfig({ ...config, modo: op.modo })}
                          className="mt-1 h-4 w-4 text-orange-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{op.label}</p>
                          <p className="text-xs text-gray-500">{op.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {config.modo === 1 && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="mb-3 text-sm font-medium text-gray-700">Porcentaje por rol</p>
                      <div className="space-y-3">
                        {ROLES_REPARTO.map((rol) => {
                          const fila = config.rolPorcentajes.find((r) => r.rol === rol);
                          return (
                            <div key={rol} className="flex items-center gap-3">
                              <span className="w-24 text-sm text-gray-700">{rol}</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={fila?.porcentaje ?? 0}
                                disabled={!esAdmin}
                                onChange={(e) => {
                                  const pct = parseFloat(e.target.value) || 0;
                                  const otros = config.rolPorcentajes.filter((r) => r.rol !== rol);
                                  const nuevo = [...otros, { rol, porcentaje: pct }];
                                  setConfig({ ...config, rolPorcentajes: nuevo });
                                }}
                                className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                              />
                              <span className="text-sm text-gray-400">%</span>
                              <p className="text-xs text-gray-500">= {fmt(config.rolPorcentajes.reduce((s, r) => s + r.porcentaje, 0))}% del total (se normaliza)</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">
                      % de propina que se cobra actualmente en ventas en mesa
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{config.porcentajePropina ?? 0}%</p>
                  </div>

                  {esAdmin ? (
                    <button
                      onClick={guardarConfig}
                      className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                    >
                      Guardar distribución
                    </button>
                  ) : (
                    <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-500">
                      Solo el rol Admin puede modificar la configuración de reparto.
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {tab === "pago" && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-800">Propinas por rango de fechas</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Desde</label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Hasta</label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                />
              </div>
              <button
                onClick={buscar}
                disabled={buscando}
                className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-900 disabled:opacity-50"
              >
                {buscando ? "Consultando..." : "Consultar"}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Solo se suman facturas emitidas (no anuladas). Las propinas de un rango ya pagado
              se informan aparte y quedan excluidas de futuros pagos.
            </p>
          </div>

          {resumen && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="text-xs font-medium text-orange-600">Pendiente de pagar</p>
                  <p className="mt-1 text-2xl font-bold text-orange-700">
                    {simbolo} {fmt(resumen.totalPendiente)}
                  </p>
                  <p className="text-xs text-gray-500">{resumen.cantidadPendiente} factura{resumen.cantidadPendiente === 1 ? "" : "s"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Ya liquidado en el rango</p>
                  <p className="mt-1 text-2xl font-bold text-gray-700">
                    {simbolo} {fmt(resumen.totalYaLiquidado)}
                  </p>
                  <p className="text-xs text-gray-500">{resumen.cantidadYaLiquidado} factura{resumen.cantidadYaLiquidado === 1 ? "" : "s"}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-xs font-medium text-green-600">Participantes activos</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">{config?.participantes ?? 0}</p>
                  <p className="text-xs text-gray-500">{config ? modoLabel(config.modo) : ""}</p>
                </div>
              </div>

              {resumen.propuesta.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Reparto propuesto ({modoLabel(config?.modo ?? 0)})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {resumen.propuesta.map((d, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-800">{d.nombre || "—"}</span>
                          <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{d.rol}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{simbolo} {fmt(d.monto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                {resumen.totalPendiente <= 0 ? (
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    No hay propinas pendientes en este rango — ya fueron liquidadas. {" "}
                    <button onClick={() => setTab("historial")} className="font-medium text-orange-600 hover:underline">
                      Ver historial
                    </button>
                  </p>
                ) : esAdmin ? (
                  <button
                    onClick={() => setConfirmandoPago(true)}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                  >
                    Liquidar propinas ({fmt(resumen.totalPendiente)})
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">Solo el rol Admin puede marcar un pago.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "historial" && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-800">Pagos de propinas</h2>
          </div>
          {historial.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Aún no hay pagos registrados.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {historial.map((p) => (
                <div key={p.id}>
                  <button
                    onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(p.desde + (p.desde.length === 10 ? "T00:00:00" : "")).toLocaleDateString("es-DO")} →{" "}
                        {new Date(p.hasta + (p.hasta.length === 10 ? "T00:00:00" : "")).toLocaleDateString("es-DO")}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {modoLabel(p.modo)} · {p.cantidadFacturas} factura{p.cantidadFacturas === 1 ? "" : "s"} ·{" "}
                        {new Date(p.fechaPago).toLocaleString("es-DO")} por {p.usuarioPagoNombre || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-800">{getCurrencySymbol(p.moneda)} {fmt(p.totalDividir)}</span>
                      <span className={`text-xs ${expandido === p.id ? "rotate-180" : ""} transition`}>▾</span>
                    </div>
                  </button>
                  {expandido === p.id && (
                    <div className="bg-gray-50 px-5 pb-5">
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {p.detalles.map((d, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-800">{d.nombre || "—"}</span>
                              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{d.rol}</span>
                            </div>
                            <span className="font-semibold text-gray-800">{getCurrencySymbol(p.moneda)} {fmt(d.monto)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmandoPago && resumen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmandoPago(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmar-pago"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="titulo-confirmar-pago" className="text-lg font-semibold text-gray-800">
                  Liquidar propinas
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {desde} → {hasta}
                </p>
              </div>
              <button
                onClick={() => setConfirmandoPago(false)}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-lg bg-orange-50 p-4">
              <p className="text-sm text-orange-700">
                Se marcarán como pagadas las propinas del <strong>{desde}</strong> al{" "}
                <strong>{hasta}</strong> por un total de{" "}
                <strong>{simbolo} {fmt(resumen.totalPendiente)}</strong>.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmandoPago(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={pagar}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Sí, liquidar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}