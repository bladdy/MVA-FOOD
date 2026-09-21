import { useEffect, useMemo, useRef, useState } from "react";
import { menuService } from "@/Services/menuService";
import { comboService } from "@/Services/comboService";
import { metodoPagoService } from "@/Services/metodoPagoService";
import { facturaVentaService } from "@/Services/facturaVentaService";
import { getCurrencySymbol } from "@/lib/currency";
import type {
  ComboResponse,
  ConfigFacturacionDto,
  CrearFacturaVentaDto,
  FacturaVentaDetalleDto,
  FacturaVentaItemDto,
  Menu,
  MetodoPagoResponse,
} from "@/Types/Restaurante";
import FacturaReceipt from "@/React/Admin/FacturaReceipt";

interface Props {
  restauranteId: string;
  onFacturaCreada?: (factura: FacturaVentaDetalleDto) => void;
  onCerrar?: () => void;
}

type Sugerencia = {
  tipo: "menu" | "combo";
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
};

const TIPOS_ENTREGA = ["recoger", "domicilio", "en mesa"];

function parseOpcionesTexto(opciones?: string): string {
  if (!opciones) return "";
  try {
    const arr = JSON.parse(opciones);
    return Array.isArray(arr) ? arr.map(String).join(", ") : String(opciones);
  } catch {
    return opciones;
  }
}

export default function VentaRapida({ restauranteId, onFacturaCreada, onCerrar }: Props) {
  const [config, setConfig] = useState<ConfigFacturacionDto | null>(null);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoResponse[]>([]);
  const [combos, setCombos] = useState<ComboResponse[]>([]);

  const [items, setItems] = useState<FacturaVentaItemDto[]>([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteNumeroFiscal, setClienteNumeroFiscal] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("recoger");
  const [metodoPago, setMetodoPago] = useState("");
  const [nota, setNota] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [menusCargados, setMenusCargados] = useState<Menu[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buscadorRef = useRef<HTMLDivElement | null>(null);

  const [productoConfigurando, setProductoConfigurando] = useState<Menu | null>(null);
  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<FacturaVentaDetalleDto | null>(null);

  useEffect(() => {
    if (!restauranteId) return;
    Promise.all([
      facturaVentaService.getConfig(restauranteId),
      metodoPagoService.getAll(restauranteId),
      comboService.getAll(restauranteId),
    ])
      .then(([cfg, pagos, combosData]) => {
        setConfig(cfg);
        setMetodosPago(pagos.filter((p) => p.activo));
        setCombos(combosData.filter((c) => c.activo));
      })
      .catch((e) => setError(e.message));
  }, [restauranteId]);

  const buscar = useMemo(
    () => async (q: string) => {
      const norm = q.trim().toLowerCase();
      if (!norm) {
        setSugerencias([]);
        setBuscando(false);
        return;
      }
      setBuscando(true);
      try {
        const menusRes = await menuService.getMenus({
          search: q.trim(),
          restauranteId,
          activo: true,
          pageSize: 5,
          orderBy: "nombre",
          orderDirection: "asc",
        });
        setMenusCargados(menusRes.items);
        const menus: Sugerencia[] = menusRes.items.map((m) => ({
          tipo: "menu",
          id: m.id,
          nombre: m.nombre,
          precio: m.precio,
          imagen: m.imagen,
        }));
        const combosFiltrados: Sugerencia[] = combos
          .filter((c) => c.nombre.toLowerCase().includes(norm))
          .slice(0, 5)
          .map((c) => ({
            tipo: "combo",
            id: c.id,
            nombre: c.nombre,
            precio: c.precio ?? 0,
            imagen: c.imagen || "",
          }));
        setSugerencias([...menus, ...combosFiltrados].slice(0, 5));
      } catch {
        setSugerencias([]);
      } finally {
        setBuscando(false);
      }
    },
    [restauranteId, combos],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buscar(busqueda);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda, buscar]);

  useEffect(() => {
    const cerrarFuera = (e: MouseEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target as Node)) {
        setBuscadorAbierto(false);
      }
    };
    document.addEventListener("mousedown", cerrarFuera);
    return () => document.removeEventListener("mousedown", cerrarFuera);
  }, []);

  const agregarMenu = (m: Menu) => {
    if ((m.variantes || []).length > 0) {
      setProductoConfigurando(m);
      setSelecciones({});
      setBusqueda("");
      setSugerencias([]);
      setBuscadorAbierto(false);
      return;
    }
    setItems((prev) => [...prev, { nombre: m.nombre, precio: m.precio, cantidad: 1, opciones: "" }]);
    setBusqueda("");
    setSugerencias([]);
    setBuscadorAbierto(false);
  };

  const agregarCombo = (c: ComboResponse) => {
    const comboItemsJson = JSON.stringify(
      (c.items || []).map((it) => ({
        menuId: it.menuId,
        nombre: it.menuNombre,
        cantidad: it.cantidad,
        precio: 0,
        opciones: [],
      })),
    );
    setItems((prev) => [
      ...prev,
      {
        nombre: c.nombre,
        precio: c.precio ?? 0,
        cantidad: 1,
        opciones: "",
        esCombo: true,
        comboNombre: c.nombre,
        comboItemsJson,
      },
    ]);
    setBusqueda("");
    setSugerencias([]);
    setBuscadorAbierto(false);
  };

  const toggleSeleccion = (grupoId: string, opcion: string) => {
    const variantes = productoConfigurando?.variantes || [];
    const grupo = variantes.find((v) => v.id === grupoId);
    const max = grupo?.maxSeleccion ?? 1;
    const seleccionadas = selecciones[grupoId] || [];
    if (max === 1) {
      setSelecciones((prev) => ({ ...prev, [grupoId]: [opcion] }));
    } else {
      let nuevas: string[];
      if (seleccionadas.includes(opcion)) {
        nuevas = seleccionadas.filter((o) => o !== opcion);
      } else if (seleccionadas.length < max) {
        nuevas = [...seleccionadas, opcion];
      } else {
        nuevas = seleccionadas;
      }
      setSelecciones((prev) => ({ ...prev, [grupoId]: nuevas }));
    }
  };

  const precioConOpciones = () => {
    if (!productoConfigurando) return 0;
    let total = productoConfigurando.precio;
    (productoConfigurando.variantes || []).forEach((grupo) => {
      (selecciones[grupo.id] || []).forEach((nombre) => {
        const op = grupo.opciones.find((o) => o.nombre === nombre);
        total += op?.precio ?? 0;
      });
    });
    return total;
  };

  const confirmarProducto = () => {
    if (!productoConfigurando) return;
    const faltantes = (productoConfigurando.variantes || [])
      .filter((v) => v.obligatorio)
      .filter((v) => !selecciones[v.id] || selecciones[v.id].length === 0)
      .map((v) => v.name);
    if (faltantes.length > 0) {
      setError(`Selecciona: ${faltantes.join(", ")}`);
      return;
    }
    const opcionesArr: string[] = [];
    (productoConfigurando.variantes || []).forEach((grupo) => {
      (selecciones[grupo.id] || []).forEach((nombre) => opcionesArr.push(nombre));
    });
    setItems((prev) => [
      ...prev,
      {
        nombre: productoConfigurando.nombre,
        precio: precioConOpciones(),
        cantidad: 1,
        opciones: JSON.stringify(opcionesArr),
      },
    ]);
    setError("");
    setProductoConfigurando(null);
    setSelecciones({});
  };

  const cambiarCantidad = (idx: number, delta: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, cantidad: Math.max(1, (it.cantidad || 1) + delta) } : it)),
    );
  };

  const quitarItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
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

  const handleCrear = async () => {
    if (items.length === 0 || items.some((i) => !i.nombre || !i.cantidad)) {
      setError("Agrega al menos un producto con cantidad");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const dto: CrearFacturaVentaDto = {
        clienteNombre,
        clienteTelefono,
        clienteNumeroFiscal: clienteNumeroFiscal || undefined,
        tipoEntrega,
        metodoPago: metodoPago || undefined,
        nota: nota || undefined,
        items,
      };
      const factura = await facturaVentaService.crearVentaRapida(restauranteId, dto);
      setResultado(factura);
      onFacturaCreada?.(factura);
      setTimeout(() => window.print(), 400);
    } catch (e: any) {
      setError(e?.message || "Error al crear factura");
    } finally {
      setCreating(false);
    }
  };

  const nuevaVenta = () => {
    setResultado(null);
    setItems([]);
    setClienteNombre("");
    setClienteTelefono("");
    setClienteNumeroFiscal("");
    setTipoEntrega("recoger");
    setMetodoPago("");
    setNota("");
    setBusqueda("");
    setSugerencias([]);
  };

  if (resultado) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-800 font-semibold">Factura {resultado.numeroFactura} creada</p>
          <div className="flex gap-2">
            <button
              onClick={nuevaVenta}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md font-medium"
            >
              Nueva venta
            </button>
            {onCerrar && (
              <button
                onClick={onCerrar}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm rounded-md"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
        <FacturaReceipt factura={resultado} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
      )}

      {/* Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <input
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            placeholder="Nombre del cliente"
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            placeholder="Teléfono"
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RNC/RFC (opcional)</label>
          <input
            value={clienteNumeroFiscal}
            onChange={(e) => setClienteNumeroFiscal(e.target.value)}
            placeholder="Opcional"
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
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
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          >
            {TIPOS_ENTREGA.map((t) => (
              <option key={t} value={t}>
                {t === "recoger" ? "Para recoger" : t === "domicilio" ? "A domicilio" : "En mesa"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          >
            <option value="">Seleccionar...</option>
            {metodosPago.map((m) => (
              <option key={m.id} value={m.nombre}>
                {m.nombre}
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
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>
      </div>

      {/* Búsqueda de productos y combos */}
      <div className="pt-2 border-t border-gray-100">
        <div ref={buscadorRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar producto o combo</label>
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setBuscadorAbierto(true);
            }}
            onFocus={() => setBuscadorAbierto(true)}
            placeholder="Escribe para buscar (ej: hamburguesa, combo)..."
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
          {buscando && (
            <p className="text-xs text-gray-400 mt-1">Buscando...</p>
          )}
          {buscadorAbierto && busqueda.trim() && !productoConfigurando && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {sugerencias.length === 0 && !buscando && (
                <li className="px-4 py-3 text-sm text-gray-400 italic">Sin resultados</li>
              )}
              {sugerencias.map((s) => (
                <li key={`${s.tipo}-${s.id}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (s.tipo === "menu") {
                        const m = menusCargados.find((mm) => mm.id === s.id);
                        if (m) agregarMenu(m);
                      } else {
                        const c = combos.find((cb) => cb.id === s.id);
                        if (c) agregarCombo(c);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50 transition-colors"
                  >
                    <img
                      src={s.imagen || "/mva-logo-rb.png"}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.nombre}</p>
                      {s.tipo === "combo" && <p className="text-xs text-orange-600">Combo</p>}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{fmt(s.precio)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Configuración de variantes del producto */}
      {productoConfigurando && (
        <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">{productoConfigurando.nombre}</h3>
            <button
              onClick={() => {
                setProductoConfigurando(null);
                setSelecciones({});
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
          {(productoConfigurando.variantes || []).map((grupo) => (
            <div key={grupo.id} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-700">{grupo.name}</p>
                {grupo.obligatorio && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">obligatorio</span>
                )}
                {grupo.maxSeleccion && grupo.maxSeleccion > 1 && (
                  <span className="text-xs text-gray-500">hasta {grupo.maxSeleccion}</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grupo.opciones.map((op) => {
                  const checked = (selecciones[grupo.id] || []).includes(op.nombre);
                  return (
                    <button
                      type="button"
                      key={op.nombre}
                      onClick={() => toggleSeleccion(grupo.id, op.nombre)}
                      className={`flex justify-between items-center px-3 py-2 rounded-md border text-sm transition-colors ${
                        checked ? "bg-orange-100 border-orange-400" : "bg-white border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <span className="text-gray-800">{op.nombre}</span>
                      {op.precio > 0 && <span className="text-orange-600 font-medium">+{fmt(op.precio)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Subtotal: <strong className="text-gray-800">{fmt(precioConOpciones())}</strong>
            </span>
            <button
              onClick={confirmarProducto}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md font-medium"
            >
              Agregar producto
            </button>
          </div>
        </div>
      )}

      {/* Items agregados */}
      <div>
        <label className="text-sm font-medium text-gray-700">Productos en la venta</label>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-3">
            Busca y agrega productos o combos para empezar.
          </p>
        ) : (
          <div className="mt-1 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5 bg-white">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.nombre}
                    {item.esCombo && <span className="text-orange-600 text-xs ml-1">(combo)</span>}
                  </p>
                  {item.opciones && item.opciones !== "[]" && (
                    <p className="text-xs text-gray-500 truncate">
                      + {parseOpcionesTexto(item.opciones)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cambiarCantidad(idx, -1)}
                    className="h-7 w-7 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(idx, 1)}
                    className="h-7 w-7 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right text-sm font-semibold text-gray-800">
                  {fmt((item.precio || 0) * (item.cantidad || 0))}
                </span>
                <button
                  onClick={() => quitarItem(idx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleCrear}
          disabled={creating}
          className={`px-5 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2 ${
            creating ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {creating ? "Creando..." : "Facturar e imprimir"}
        </button>
      </div>
    </div>
  );
}
