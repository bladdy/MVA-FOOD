import { Fragment, useCallback, useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { facturaVentaService } from "@/Services/facturaVentaService";
import { useSignalR } from "@/hooks/useSignalR";
import { getCurrencySymbol } from "@/lib/currency";
import { ESTADO_FACTURA, HUB_EVENTOS, estadoFacturaMeta } from "@/consts/estadosFactura";
import type {
  FacturaVentaDetalleDto,
  FacturaVentaDto,
  PagarFacturaVentaDto,
  ResumenFacturacionHoyDto,
} from "@/Types/Restaurante";
import FacturaModal from "@/React/Admin/FacturaModal";
import FacturaReceipt from "@/React/Admin/FacturaReceipt";
import ModalCobrarFactura from "@/React/Admin/ModalCobrarFactura";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFechaCorta(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FacturasManagerInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId || "";
  // Defensa en profundidad: el backend ya exige el rol Caja, pero no mostrar el botón
  // a quien no puede usarlo evita el rechazo.
  const esCaja = user?.permisos?.includes("facturacion") ?? false;

  const [facturas, setFacturas] = useState<FacturaVentaDto[]>([]);
  const [resumen, setResumen] = useState<ResumenFacturacionHoyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<FacturaVentaDetalleDto | null>(null);
  const [impresion, setImpresion] = useState<FacturaVentaDetalleDto | null>(null);
  const [cobrando, setCobrando] = useState<FacturaVentaDetalleDto | null>(null);
  const [anulando, setAnulando] = useState<FacturaVentaDto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");
  // La cola de cobro es la vista de entrada de caja.
  const [filtros, setFiltros] = useState({
    search: "",
    estado: String(ESTADO_FACTURA.PendienteCobro),
  });

  const fetchFacturas = useCallback(async () => {
    if (!restauranteId) return;
    try {
      const [data, resumenHoy] = await Promise.all([
        facturaVentaService.getByRestaurante(restauranteId),
        facturaVentaService.getResumenHoy(restauranteId).catch(() => null),
      ]);
      setFacturas(data);
      setResumen(resumenHoy);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  // Mesero envió una cuenta o caja cobró una: la cola se actualiza sola.
  useSignalR(restauranteId, {
    [HUB_EVENTOS.FacturaPendienteCobro]: fetchFacturas,
    [HUB_EVENTOS.FacturaPagada]: fetchFacturas,
  });

  const cargarDetalle = async (id: string) => {
    if (expandido === id) {
      setExpandido(null);
      setDetalle(null);
      return;
    }
    setExpandido(id);
    setError("");
    try {
      setDetalle(await facturaVentaService.getById(id));
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de la factura.");
    }
  };

  const confirmarCobro = async (dto: PagarFacturaVentaDto) => {
    if (!cobrando) return;
    const factura = await facturaVentaService.marcarPagada(cobrando.id, dto);
    setCobrando(null);
    setDetalle((prev) => (prev?.id === factura.id ? factura : prev));
    await fetchFacturas();
  };

  const confirmarAnulacion = async (motivo: string) => {
    if (!anulando) return;
    try {
      await facturaVentaService.anular(anulando.id, motivo);
      setAnulando(null);
      setDetalle(null);
      setExpandido(null);
      await fetchFacturas();
    } catch (e) {
      setError((e as Error).message || "No se pudo anular la factura.");
    }
  };

  const moneda = facturas.length > 0 ? facturas[0].moneda : resumen?.moneda || "DOP";
  const simb = getCurrencySymbol(moneda);
  const fmt = (n: number) => `${simb}${n.toFixed(2)}`;

  const filtradas = facturas.filter((f) => {
    const matchSearch =
      !filtros.search ||
      f.clienteNombre.toLowerCase().includes(filtros.search.toLowerCase()) ||
      f.numeroFactura.toLowerCase().includes(filtros.search.toLowerCase());
    const matchEstado = filtros.estado === "" || f.estado === Number(filtros.estado);
    return matchSearch && matchEstado;
  });

  const porCobrar = facturas.filter((f) => f.estado === ESTADO_FACTURA.PendienteCobro);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Caja</h1>
          <p className="text-sm text-gray-500">
            Cuentas enviadas por los meseros y ventas de mostrador
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          + Nueva factura
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Resumen del día: cobrado vs por cobrar. */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-l-4 border-amber-500 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Por cobrar (hoy)</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {fmt(resumen?.montoPorCobrar ?? 0)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {resumen?.cantidadPorCobrar ?? porCobrar.length} cuenta(s) esperando cobro
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-green-500 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Cobrado (hoy)</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {fmt(resumen?.ingresos ?? 0)}
          </p>
          <p className="mt-1 text-xs text-gray-400">{resumen?.cantidadVentas ?? 0} venta(s)</p>
        </div>
        <div className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Anuladas (hoy)</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {resumen?.cantidadAnuladas ?? 0}
          </p>
        </div>
      </div>

      {porCobrar.length > 0 && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Hay <strong>{porCobrar.length}</strong> cuenta(s) esperando cobro por{" "}
          <strong>{fmt(porCobrar.reduce((s, f) => s + (f.totalConPropina ?? f.total), 0))}</strong>.
          Imprímela, entrégala al cliente y regístrale el pago al recibir el dinero.
        </p>
      )}

      {/* Filtros */}
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="filtro-buscar" className="mb-1 block text-xs font-medium text-gray-600">
              Buscar
            </label>
            <input
              id="filtro-buscar"
              value={filtros.search}
              onChange={(e) => setFiltros((p) => ({ ...p, search: e.target.value }))}
              placeholder="Cliente o número de factura..."
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="filtro-estado" className="mb-1 block text-xs font-medium text-gray-600">
              Estado
            </label>
            <select
              id="filtro-estado"
              value={filtros.estado}
              onChange={(e) => setFiltros((p) => ({ ...p, estado: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value={String(ESTADO_FACTURA.PendienteCobro)}>Por cobrar</option>
              <option value={String(ESTADO_FACTURA.Pagada)}>Pagadas</option>
              <option value={String(ESTADO_FACTURA.Emitida)}>Cobradas en mostrador</option>
              <option value={String(ESTADO_FACTURA.Anulada)}>Anuladas</option>
              <option value="">Todas</option>
            </select>
          </div>
        </div>
      </div>

      {filtradas.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-400">
            {filtros.estado === String(ESTADO_FACTURA.PendienteCobro)
              ? "No hay cuentas por cobrar"
              : "No hay facturas"}
          </p>
          <button
            onClick={() => setModalAbierto(true)}
            className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Crear la primera factura
          </button>
        </div>
      )}

      {filtradas.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Factura</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Mesa</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Cobro</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map((f) => {
                const meta = estadoFacturaMeta(f.estado);
                return (
                  <Fragment key={f.id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => cargarDetalle(f.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{f.numeroFactura}</td>
                      <td className="px-4 py-3 text-gray-600">{f.clienteNombre || "—"}</td>
                      <td className="px-4 py-3">
                        {f.numeroMesa ? (
                          <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                            Mesa {f.numeroMesa}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{fmt(f.totalConPropina ?? f.total)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatFecha(f.fechaEmision)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          title={meta.descripcion}
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {f.estado === ESTADO_FACTURA.PendienteCobro ? (
                          <span className="font-medium text-amber-600">Sin cobrar</span>
                        ) : f.estado === ESTADO_FACTURA.Anulada ? (
                          <span>—</span>
                        ) : (
                          <>
                            <span className="block font-medium text-gray-700">
                              {f.metodoPago || "—"}
                            </span>
                            <span className="block">{formatFechaCorta(f.fechaPago)}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{expandido === f.id ? "▲" : "▼"}</td>
                    </tr>
                    {expandido === f.id && detalle?.id === f.id && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 px-4 py-3">
                          <div className="flex flex-wrap gap-3">
                            {esCaja && f.estado === ESTADO_FACTURA.PendienteCobro && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCobrando(detalle);
                                  }}
                                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                                >
                                  Cobrar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImpresion(detalle);
                                  }}
                                  className="rounded-md bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-200"
                                >
                                  Imprimir cuenta
                                </button>
                              </>
                            )}
                            {f.estado !== ESTADO_FACTURA.Pagada && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImpresion(detalle);
                                }}
                                className="rounded-md bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-200"
                              >
                                {f.estado === ESTADO_FACTURA.Anulada ? "Ver ticket" : "Reimprimir"}
                              </button>
                            )}
                            {esCaja &&
                              (f.estado === ESTADO_FACTURA.PendienteCobro ||
                                f.estado === ESTADO_FACTURA.Emitida) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAnulando(f);
                                  }}
                                  className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
                                >
                                  Anular
                                </button>
                              )}
                          </div>

                          {/* Detalle del cobro confirmado. */}
                          {f.estado === ESTADO_FACTURA.Pagada && (
                            <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
                              Cobrada por <strong>{detalle.usuarioCajaNombre || "caja"}</strong> el{" "}
                              {formatFechaCorta(detalle.fechaPago)} · Recibido{" "}
                              {fmt(detalle.montoRecibido ?? detalle.totalConPropina)}
                              {(detalle.cambio ?? 0) > 0 &&
                                ` · Cambio ${fmt(detalle.cambio!)}`}
                            </p>
                          )}

                          <div className="mt-3 space-y-1 text-sm">
                            {detalle.tipoEntrega === "domicilio" && (
                              <p className="text-blue-600">📍 Entrega a domicilio</p>
                            )}
                            {detalle.numeroMesa && (
                              <p className="font-medium text-orange-600">
                                🪑 Mesa {detalle.numeroMesa}
                              </p>
                            )}
                            {detalle.clienteTelefono && (
                              <p className="text-gray-600">📞 {detalle.clienteTelefono}</p>
                            )}
                            {detalle.clienteNumeroFiscal && (
                              <p className="text-gray-600">
                                ID fiscal: {detalle.clienteNumeroFiscal}
                              </p>
                            )}
                            <ul className="mt-2 space-y-1">
                              {detalle.items.map((item, i) => (
                                <li key={i} className="text-gray-700">
                                  <span className="font-medium">
                                    {item.cantidad}x {item.nombre}
                                  </span>
                                  <span className="ml-2 text-gray-500">
                                    {fmt(item.precio * item.cantidad)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 flex justify-end space-x-8 border-t border-gray-200 pt-2">
                              <span className="text-gray-600">
                                Subtotal: {fmt(detalle.subtotal)} | Impuesto:{" "}
                                {fmt(detalle.impuesto)}
                              </span>
                              <span className="font-bold text-gray-800">
                                Total: {fmt(detalle.totalConPropina ?? detalle.total)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <FacturaModal onClose={() => setModalAbierto(false)} onFacturaCreada={fetchFacturas} />
      )}

      {cobrando && (
        <ModalCobrarFactura
          factura={cobrando}
          restauranteId={restauranteId}
          onConfirmar={confirmarCobro}
          onCancelar={() => setCobrando(null)}
        />
      )}

      {impresion && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 py-8"
          onClick={() => setImpresion(null)}
        >
          <div className="mx-auto max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex justify-end px-4">
              <button
                onClick={() => setImpresion(null)}
                className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
              >
                Cerrar
              </button>
            </div>
            <FacturaReceipt factura={impresion} />
          </div>
        </div>
      )}

      {anulando && (
        <ModalAnularFactura
          factura={anulando}
          onConfirmar={confirmarAnulacion}
          onCancelar={() => setAnulando(null)}
        />
      )}
    </div>
  );
}

interface AnularProps {
  factura: FacturaVentaDto;
  onConfirmar: (motivo: string) => Promise<void>;
  onCancelar: () => void;
}

/** Reemplaza los prompt()/confirm() nativos para poder explicar el motivo y el alcance. */
function ModalAnularFactura({ factura, onConfirmar, onCancelar }: AnularProps) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const esPendienteCobro = factura.estado === ESTADO_FACTURA.PendienteCobro;

  const confirmar = async () => {
    setEnviando(true);
    try {
      await onConfirmar(motivo.trim());
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-anular"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="modal-anular" className="text-lg font-bold text-gray-800">
          Anular factura {factura.numeroFactura}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {esPendienteCobro
            ? "La cuenta aún no fue cobrada. Al anularla, los pedidos vuelven a quedar disponibles para facturar."
            : "La factura quedará sin efecto contable. Los pedidos vuelven a quedar disponibles para facturar."}
        </p>

        <label htmlFor="anular-motivo" className="mb-1 mt-4 block text-sm font-medium text-gray-700">
          Motivo
        </label>
        <input
          id="anular-motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej. Error en el pedido"
          autoFocus
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-300"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancelar}
            disabled={enviando}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={enviando}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {enviando ? "Anulando..." : "Anular factura"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacturasManager() {
  return (
    <UserProvider>
      <FacturasManagerInner />
    </UserProvider>
  );
}
