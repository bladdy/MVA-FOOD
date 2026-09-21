import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { facturaVentaService } from "@/Services/facturaVentaService";
import { getCurrencySymbol } from "@/lib/currency";
import type {
  ConfigFacturacionDto,
  CrearFacturaVentaDto,
  FacturaVentaDetalleDto,
  PedidoFacturableDto,
} from "@/Types/Restaurante";
import FacturaReceipt from "@/React/Admin/FacturaReceipt";
import VentaRapida from "@/React/Admin/VentaRapida";

interface Props {
  onClose: () => void;
  pedidoIdInicial?: string;
  onFacturaCreada?: (factura: FacturaVentaDetalleDto, pedidoIds: string[]) => void;
}

const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia", "QR"];

export default function FacturaModal({ onClose, pedidoIdInicial, onFacturaCreada }: Props) {
  const { user } = useUser();
  const restauranteId = user?.restauranteId || "";

  const [mode, setMode] = useState<"pedido" | "rapida">(pedidoIdInicial ? "pedido" : "rapida");
  const [pedidos, setPedidos] = useState<PedidoFacturableDto[]>([]);
  const [pedidoId, setPedidoId] = useState<string>(pedidoIdInicial || "");
  const [grupoIds, setGrupoIds] = useState<string[]>([]);
  const [config, setConfig] = useState<ConfigFacturacionDto | null>(null);
  const [items, setItems] = useState<FacturaVentaDetalleDto["items"]>([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteNumeroFiscal, setClienteNumeroFiscal] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("recoger");
  const [metodoPago, setMetodoPago] = useState("");
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<FacturaVentaDetalleDto | null>(null);

  useEffect(() => {
    if (!restauranteId) return;
    Promise.all([
      facturaVentaService.getConfig(restauranteId),
      facturaVentaService.getFacturables(restauranteId),
    ])
      .then(([cfg, facturables]) => {
        setConfig(cfg);
        setPedidos(facturables);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [restauranteId]);

  useEffect(() => {
    if (pedidoIdInicial && pedidos.length > 0) {
      setPedidoId(pedidoIdInicial);
      seleccionarPedido(pedidoIdInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidos.length]);

  const seleccionarPedido = (id: string) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (!pedido) return;
    const grupo = pedido.mesaId ? pedidos.filter((p) => p.mesaId === pedido.mesaId) : null;
    const fuentes = grupo && grupo.length > 1 ? grupo : [pedido];
    setItems(consolidarItems(fuentes.flatMap((p) => p.items)));
    setGrupoIds(grupo && grupo.length > 1 ? grupo.map((p) => p.id) : []);
    setClienteNombre(pedido.clienteNombre);
    setClienteTelefono(pedido.clienteTelefono);
    setTipoEntrega(pedido.tipoEntrega === "domicilio" ? "domicilio" : "recoger");
    setMetodoPago(pedido.metodoPago || "");
  };

  const consolidarItems = (items: FacturaVentaDetalleDto["items"]) => {
    const mapa = new Map<string, FacturaVentaDetalleDto["items"][number]>();
    for (const item of items) {
      const clave = `${item.nombre}|${item.opciones || ""}|${item.esCombo ? "1" : "0"}|${item.comboNombre || ""}|${item.comboItemsJson || ""}`;
      const existente = mapa.get(clave);
      if (existente) existente.cantidad += item.cantidad;
      else mapa.set(clave, { ...item });
    }
    return Array.from(mapa.values());
  };

  const handleSelectPedido = (id: string) => {
    setPedidoId(id);
    seleccionarPedido(id);
  };

  const { subtotal, impuesto, total } = useMemo(() => {
    const st = items.reduce((acc, i) => acc + (i.precio || 0) * (i.cantidad || 0), 0);
    const pct = config?.porcentajeImpuesto ?? 0;
    let imp = 0;
    let tot = st;
    if (config?.impuestoIncluido && pct > 0) {
      imp = st - st / (1 + pct / 100);
      tot = st;
    } else if (pct > 0) {
      imp = (st * pct) / 100;
      tot = st + imp;
    }
    return { subtotal: st, impuesto: Math.round(imp * 100) / 100, total: Math.round(tot * 100) / 100 };
  }, [items, config]);

  const simb = getCurrencySymbol(config?.moneda || "DOP");
  const fmt = (n: number) => `${simb}${n.toFixed(2)}`;
  const grupoMesaNumero = grupoIds.length > 1 ? pedidos.find((p) => p.id === pedidoId)?.numeroMesa : undefined;

  const cambiarModo = (m: "pedido" | "rapida") => {
    setMode(m);
    setError("");
    setResultado(null);
    if (m === "pedido") setPedidoId(pedidoIdInicial || "");
  };

  const handleCrearDesdePedido = async () => {
    if (!restauranteId) return;
    if (!pedidoId || items.length === 0) {
      setError("Selecciona un pedido");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const dto: CrearFacturaVentaDto = {
        pedidoId,
        ...(grupoIds.length > 1 ? { pedidosIds: grupoIds } : {}),
        clienteNombre,
        clienteTelefono,
        clienteNumeroFiscal: clienteNumeroFiscal || undefined,
        tipoEntrega,
        metodoPago: metodoPago || undefined,
        nota: nota || undefined,
        items,
      };
      const factura = await facturaVentaService.crearDesdePedido(dto);
      setResultado(factura);
      onFacturaCreada?.(factura, grupoIds.length > 1 ? grupoIds : [pedidoId]);
      setTimeout(() => window.print(), 400);
    } catch (e: any) {
      setError(e?.message || "Error al crear factura");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8" onClick={(e) => e.stopPropagation()}>
          <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-orange-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 overflow-y-auto py-8" onClick={onClose}>
        <div className="max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 px-4">
            <p className="text-white text-lg font-semibold">Factura {resultado.numeroFactura} creada</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-md"
            >
              Cerrar
            </button>
          </div>
          <FacturaReceipt factura={resultado} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Nueva Factura</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => cambiarModo("pedido")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "pedido" ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Desde pedido
            </button>
            <button
              onClick={() => cambiarModo("rapida")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "rapida" ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Venta rápida
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {mode === "rapida" ? (
            <VentaRapida restauranteId={restauranteId} onFacturaCreada={onFacturaCreada} onCerrar={onClose} />
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                  {error}
                </div>
              )}

              {/* Selector de pedido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pedido completado sin facturar
                </label>
                <select
                  value={pedidoId}
                  onChange={(e) => handleSelectPedido(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                >
                  <option value="">Selecciona un pedido...</option>
                  {pedidos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numeroMesa ? `Mesa ${p.numeroMesa} - ` : ""}
                  {p.clienteNombre} - {fmt(p.total)} ({new Date(p.fecha).toLocaleDateString("es-MX")})
                </option>
                  ))}
                </select>
                {pedidos.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No hay pedidos completados pendientes de facturar.
                  </p>
                )}
              </div>

              {/* Items del pedido */}
              <div>
                <label className="text-sm font-medium text-gray-700">Productos</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-52 overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-3">
                      Selecciona un pedido para ver sus productos.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm flex justify-between gap-2">
                          <span>
                            <span className="font-medium">
                              {item.cantidad}x {item.nombre}
                            </span>
                            {item.esCombo && item.comboNombre ? (
                              <span className="text-orange-600"> (combo)</span>
                            ) : null}
                            {item.opciones && <span className="text-orange-600"> + {item.opciones}</span>}
                          </span>
                          <span className="font-medium text-gray-700">{fmt(item.precio * item.cantidad)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {grupoMesaNumero !== undefined && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
                  Incluye {grupoIds.length} órdenes de la mesa {grupoMesaNumero} en una sola factura.
                </div>
              )}

              {/* Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="Teléfono"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RNC/RFC (opcional)</label>
                  <input
                    value={clienteNumeroFiscal}
                    onChange={(e) => setClienteNumeroFiscal(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              {/* Entrega y pago */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de entrega</label>
                  <select
                    value={tipoEntrega}
                    onChange={(e) => setTipoEntrega(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="recoger">Para recoger</option>
                    <option value="domicilio">A domicilio</option>
                    <option value="en mesa">En mesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Seleccionar...</option>
                    {METODOS_PAGO.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                  <input
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Número de factura</span>
                  <span className="font-semibold text-gray-800">{config?.siguienteNumero}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                  <span>
                    Impuesto{config && config.porcentajeImpuesto > 0 ? ` (${config.porcentajeImpuesto}%)` : ""}
                  </span>
                  <span>{fmt(impuesto)}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-200">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-orange-700">{fmt(total)}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearDesdePedido}
                  disabled={creating}
                  className={`px-5 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2 ${
                    creating ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {creating ? "Creando..." : "Facturar e imprimir"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
