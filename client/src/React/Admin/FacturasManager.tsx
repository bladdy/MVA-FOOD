import { Fragment, useCallback, useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { facturaVentaService } from "@/Services/facturaVentaService";
import { getCurrencySymbol } from "@/lib/currency";
import type { FacturaVentaDetalleDto, FacturaVentaDto } from "@/Types/Restaurante";
import FacturaModal from "@/React/Admin/FacturaModal";
import FacturaReceipt from "@/React/Admin/FacturaReceipt";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FacturasManagerInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId || "";

  const [facturas, setFacturas] = useState<FacturaVentaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<FacturaVentaDetalleDto | null>(null);
  const [reimpresion, setReimpresion] = useState<FacturaVentaDetalleDto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtros, setFiltros] = useState({ search: "", estado: "" });

  const fetchFacturas = useCallback(async () => {
    if (!restauranteId) return;
    try {
      const data = await facturaVentaService.getByRestaurante(restauranteId);
      setFacturas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const cargarDetalle = async (id: string) => {
    if (expandido === id) {
      setExpandido(null);
      setDetalle(null);
      return;
    }
    setExpandido(id);
    try {
      setDetalle(await facturaVentaService.getById(id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnular = async (f: FacturaVentaDto) => {
    const motivo = prompt(`¿Motivo de anulación de la factura ${f.numeroFactura}?`, "Error en el pedido");
    if (motivo === null) return;
    if (!confirm(`¿Anular la factura ${f.numeroFactura}?`)) return;
    try {
      await facturaVentaService.anular(f.id, motivo);
      await fetchFacturas();
    } catch (e: any) {
      alert(e?.message || "Error al anular factura");
    }
  };

  const moneda = facturas.length > 0 ? facturas[0].moneda : "DOP";
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

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Facturas</h1>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md font-medium"
        >
          + Nueva factura
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
            <input
              value={filtros.search}
              onChange={(e) => setFiltros((p) => ({ ...p, search: e.target.value }))}
              placeholder="Cliente o número de factura..."
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros((p) => ({ ...p, estado: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              <option value="0">Emitidas</option>
              <option value="1">Anuladas</option>
            </select>
          </div>
        </div>
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No hay facturas</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="mt-3 text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            Crear la primera factura
          </button>
        </div>
      )}

      {filtradas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Factura</th>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Mesa</th>
                <th className="text-left px-4 py-3 font-medium">Pago</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map((f) => (
                <Fragment key={f.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => cargarDetalle(f.id)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{f.numeroFactura}</td>
                    <td className="px-4 py-3 text-gray-600">{f.clienteNombre}</td>
                    <td className="px-4 py-3">
                      {f.numeroMesa ? (
                        <span className="inline-block text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          Mesa {f.numeroMesa}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.metodoPago || "—"}</td>
                    <td className="px-4 py-3 font-medium">{fmt(f.total)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(f.fechaEmision)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          f.estado === 1 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {f.estado === 1 ? "Anulada" : "Emitida"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{expandido === f.id ? "▲" : "▼"}</td>
                  </tr>
                  {expandido === f.id && detalle?.id === f.id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-3 bg-gray-50">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReimpresion(detalle);
                            }}
                            className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm rounded-md font-medium"
                          >
                            Reimprimir
                          </button>
                          {f.estado === 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnular(f);
                              }}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md font-medium"
                            >
                              Anular
                            </button>
                          )}
                        </div>
                        <div className="mt-3 text-sm space-y-1">
                          {detalle.tipoEntrega === "domicilio" && (
                            <p className="text-blue-600">📍 Entrega a domicilio</p>
                          )}
                          {detalle.numeroMesa && (
                            <p className="text-orange-600 font-medium">🪑 Mesa {detalle.numeroMesa}</p>
                          )}
                          {detalle.clienteTelefono && (
                            <p className="text-gray-600">📞 {detalle.clienteTelefono}</p>
                          )}
                          {detalle.clienteNumeroFiscal && (
                            <p className="text-gray-600">ID fiscal: {detalle.clienteNumeroFiscal}</p>
                          )}
                          <ul className="space-y-1 mt-2">
                            {detalle.items.map((item, i) => (
                              <li key={i} className="text-gray-700">
                                <span className="font-medium">{item.cantidad}x {item.nombre}</span>
                                <span className="ml-2 text-gray-500">
                                  {fmt(item.precio * item.cantidad)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-end pt-2 border-t border-gray-200 space-x-8 mt-2">
                            <span className="text-gray-600">
                              Subtotal: {fmt(detalle.subtotal)} | Impuesto: {fmt(detalle.impuesto)}
                            </span>
                            <span className="font-bold text-gray-800">Total: {fmt(detalle.total)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <FacturaModal
          onClose={() => setModalAbierto(false)}
          onFacturaCreada={fetchFacturas}
        />
      )}

      {reimpresion && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 overflow-y-auto py-8"
          onClick={() => setReimpresion(null)}
        >
          <div className="max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-4 px-4">
              <button
                onClick={() => setReimpresion(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-md"
              >
                Cerrar
              </button>
            </div>
            <FacturaReceipt factura={reimpresion} />
          </div>
        </div>
      )}
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
