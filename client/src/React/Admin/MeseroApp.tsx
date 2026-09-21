import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { menuService } from "@/Services/menuService";
import { comboService } from "@/Services/comboService";
import { pedidoService, type PedidoResponse } from "@/Services/pedidoService";
import { mesaService } from "@/Services/mesaService";
import { cuentaMesaService } from "@/Services/cuentaMesaService";
import { facturaVentaService } from "@/Services/facturaVentaService";
import { UserProvider, useUser } from "@/context/UserContext.tsx";
import { HUB_URL } from "@/lib/apiConfig";
import type {
  CerrarCuentaMesaDto,
  ComboResponse,
  CreatePedidoDto,
  CuentaMesaDetalleDto,
  FacturaVentaDetalleDto,
  Menu,
  Mesa,
} from "@/Types/Restaurante.ts";
import CartPanel from "@/React/Admin/Mesero/CartPanel";
import Carta from "@/React/Admin/Mesero/Carta";
import ModalItem from "@/React/Admin/Mesero/ModalItem";
import ModalCerrarCuenta from "@/React/Admin/Mesero/ModalCerrarCuenta";
import ModalCuentaCerrada from "@/React/Admin/Mesero/ModalCuentaCerrada";
import { IconFlecha, IconUtensilios } from "@/React/Admin/Mesero/icons";
import { fmt, parseComboInternos, parseOpciones, type CartItem } from "@/React/Admin/Mesero/utils";

const ESTADOS = ["Pendiente", "En Proceso", "Completado", "Entregado"];

type CartPorMesa = Record<string, CartItem[]>;

function MeseroAppInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaActiva, setMesaActiva] = useState<Mesa | null>(null);
  const [pedidosMesa, setPedidosMesa] = useState<PedidoResponse[]>([]);
  const [cartPorMesa, setCartPorMesa] = useState<CartPorMesa>({});

  const [menus, setMenus] = useState<Menu[]>([]);
  const [combos, setCombos] = useState<ComboResponse[]>([]);

  const [productoConfigurando, setProductoConfigurando] = useState<Menu | null>(null);
  const [editarIdx, setEditarIdx] = useState<number | null>(null);
  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});
  const [errorConfig, setErrorConfig] = useState("");

  const [cartAbierto, setCartAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [entregandoId, setEntregandoId] = useState<string | null>(null);
  const [liberandoMesa, setLiberandoMesa] = useState(false);
  const [facturados, setFacturados] = useState<string[]>([]);
  const [cuentaMesa, setCuentaMesa] = useState<CuentaMesaDetalleDto | null>(null);
  const [cargandoCuenta, setCargandoCuenta] = useState(false);
  const [modalCerrarCuenta, setModalCerrarCuenta] = useState(false);
  const [cerrandoCuenta, setCerrandoCuenta] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState("");
  const [facturaCuenta, setFacturaCuenta] = useState<FacturaVentaDetalleDto | null>(null);

  const mesaActivaRef = useRef<Mesa | null>(null);
  useEffect(() => {
    mesaActivaRef.current = mesaActiva;
  }, [mesaActiva]);

  const cargarMesas = useCallback(async () => {
    if (!restauranteId) return;
    try {
      setMesas(await mesaService.getAll(restauranteId));
    } catch {
      setError("No se pudieron cargar las mesas");
    }
  }, [restauranteId]);

  const cargarPedidosMesa = useCallback(async (mesaId: string) => {
    try {
      setPedidosMesa(await pedidoService.getByMesa(mesaId));
    } catch {
      setPedidosMesa([]);
    }
  }, []);

  const cargarCuentaMesa = useCallback(async (mesaId: string) => {
    setCargandoCuenta(true);
    try {
      setCuentaMesa(await cuentaMesaService.getByMesa(mesaId));
    } catch {
      setCuentaMesa(null);
    } finally {
      setCargandoCuenta(false);
    }
  }, []);

  useEffect(() => {
    cargarMesas();
  }, [cargarMesas]);

  useEffect(() => {
    if (!restauranteId) return;
    Promise.all([
      menuService.getMenus({
        restauranteId,
        activo: true,
        pageSize: 100,
        orderBy: "nombre",
        orderDirection: "asc",
      }),
      comboService.getAll(restauranteId),
    ])
      .then(([resMenus, resCombos]) => {
        setMenus(resMenus.items);
        setCombos(resCombos.filter((c) => c.activo));
      })
      .catch(() => {});
  }, [restauranteId]);

  useEffect(() => {
    if (mesaActiva) {
      cargarPedidosMesa(mesaActiva.id);
      cargarCuentaMesa(mesaActiva.id);
    }
  }, [mesaActiva, cargarPedidosMesa, cargarCuentaMesa]);

  useEffect(() => {
    if (!restauranteId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    const refrescar = () => {
      cargarMesas();
      const mesa = mesaActivaRef.current;
      if (mesa) cargarPedidosMesa(mesa.id);
    };

    connection.on("NuevoPedido", refrescar);
    connection.on("EstadoPedidoActualizado", refrescar);

    const joinGroup = () =>
      connection.invoke("JoinRestaurantGroup", restauranteId).catch(console.error);
    connection.onreconnected(joinGroup);

    connection
      .start()
      .then(joinGroup)
      .catch((err) => console.error("[Mesero] SignalR:", err));

    return () => {
      connection.stop().catch(() => {});
    };
  }, [restauranteId, cargarMesas, cargarPedidosMesa]);

  const cart = mesaActiva ? cartPorMesa[mesaActiva.id] || [] : [];
  const cartCount = cart.reduce((acc, i) => acc + i.cantidad, 0);
  const cartTotal = cart.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const pendientesDeFacturar = pedidosMesa.filter((p) => !facturados.includes(p.id));

  const abrirMesa = (mesa: Mesa) => {
    setMesaActiva(mesa);
    setCartAbierto(false);
    setMensaje("");
    setError("");
  };

  const volverAMesas = () => {
    setMesaActiva(null);
    setPedidosMesa([]);
    setCartAbierto(false);
  };

  const setCartDeMesa = (mesaId: string, actualizar: (prev: CartItem[]) => CartItem[]) => {
    setCartPorMesa((prev) => ({
      ...prev,
      [mesaId]: actualizar(prev[mesaId] || []),
    }));
  };

  const cerrarModalItem = () => {
    setProductoConfigurando(null);
    setEditarIdx(null);
    setSelecciones({});
    setErrorConfig("");
  };

  const abrirConfig = (m: Menu, idx: number | null) => {
    setEditarIdx(idx);
    setProductoConfigurando(m);
    setSelecciones({});
    setErrorConfig("");
  };

  const agregarMenu = (m: Menu) => {
    if ((m.variantes || []).length > 0) {
      abrirConfig(m, null);
      return;
    }
    if (!mesaActiva) return;
    setCartDeMesa(mesaActiva.id, (prev) => [
      ...prev,
      { nombre: m.nombre, precio: m.precio, cantidad: 1, opciones: "", notas: "", menuId: m.id },
    ]);
  };

  const editarItem = (idx: number) => {
    const item = cart[idx];
    if (!item || item.esCombo || !mesaActiva) return;
    const menu = menus.find((m) => m.id === item.menuId);
    if (!menu || (menu.variantes || []).length === 0) return;
    const opcionesArr = parseOpciones(item.opciones);
    const preseleccion: Record<string, string[]> = {};
    menu.variantes.forEach((g) => {
      preseleccion[g.id] = g.opciones
        .filter((o) => opcionesArr.includes(o.nombre))
        .map((o) => o.nombre);
    });
    setEditarIdx(idx);
    setProductoConfigurando(menu);
    setSelecciones(preseleccion);
    setErrorConfig("");
  };

  const agregarCombo = (c: ComboResponse) => {
    if (!mesaActiva) return;
    const comboItemsJson = JSON.stringify(
      (c.items || []).map((it) => ({
        menuId: it.menuId,
        nombre: it.menuNombre,
        cantidad: it.cantidad,
        precio: 0,
        opciones: [],
      })),
    );
    setCartDeMesa(mesaActiva.id, (prev) => [
      ...prev,
      {
        nombre: c.nombre,
        precio: c.precio ?? 0,
        cantidad: 1,
        opciones: "",
        notas: "",
        esCombo: true,
        comboId: c.id,
        comboNombre: c.nombre,
        comboItemsJson,
      },
    ]);
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

  const precioConOpciones = useMemo(() => {
    if (!productoConfigurando) return 0;
    let total = productoConfigurando.precio;
    (productoConfigurando.variantes || []).forEach((grupo) => {
      (selecciones[grupo.id] || []).forEach((nombre) => {
        const op = grupo.opciones.find((o) => o.nombre === nombre);
        total += op?.precio ?? 0;
      });
    });
    return total;
  }, [productoConfigurando, selecciones]);

  const confirmarProducto = () => {
    if (!productoConfigurando || !mesaActiva) return;
    const faltantes = (productoConfigurando.variantes || [])
      .filter((v) => v.obligatorio)
      .filter((v) => !selecciones[v.id] || selecciones[v.id].length === 0)
      .map((v) => v.name);
    if (faltantes.length > 0) {
      setErrorConfig(`Selecciona: ${faltantes.join(", ")}`);
      return;
    }
    const opcionesArr: string[] = [];
    (productoConfigurando.variantes || []).forEach((grupo) => {
      (selecciones[grupo.id] || []).forEach((nombre) => opcionesArr.push(nombre));
    });
    const nuevo: CartItem = {
      nombre: productoConfigurando.nombre,
      precio: precioConOpciones,
      cantidad: 1,
      opciones: JSON.stringify(opcionesArr),
      notas: "",
      menuId: productoConfigurando.id,
    };
    setCartDeMesa(mesaActiva.id, (prev) =>
      editarIdx != null && prev[editarIdx]
        ? prev.map((it, i) => (i === editarIdx ? nuevo : it))
        : [...prev, nuevo],
    );
    cerrarModalItem();
  };

  const cambiarCantidad = (idx: number, delta: number) => {
    if (!mesaActiva) return;
    setCartDeMesa(mesaActiva.id, (prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, cantidad: Math.max(1, it.cantidad + delta) } : it,
      ),
    );
  };

  const quitarItem = (idx: number) => {
    if (!mesaActiva) return;
    setCartDeMesa(mesaActiva.id, (prev) => prev.filter((_, i) => i !== idx));
  };

  const vaciarCart = () => {
    if (!mesaActiva) return;
    setCartDeMesa(mesaActiva.id, () => []);
  };

  const enviarACocina = async () => {
    if (!mesaActiva || !restauranteId) return;
    if (cart.length === 0) {
      setError("Agrega al menos un producto");
      return;
    }
    setCreando(true);
    setError("");
    try {
      const dto: CreatePedidoDto = {
        clienteNombre: `Mesa ${mesaActiva.numero}`,
        clienteTelefono: "",
        tipoEntrega: "en mesa",
        restauranteId,
        mesaId: mesaActiva.id,
        items: cart.map((i) => ({
          menuId: i.menuId,
          cantidad: i.cantidad,
          precio: i.precio,
          notas: i.notas,
          opciones: i.opciones,
          esCombo: i.esCombo,
          comboId: i.comboId,
          comboNombre: i.comboNombre,
          comboItemsJson: i.comboItemsJson,
        })),
      };
      await pedidoService.create(dto);
      try {
        setCuentaMesa(await cuentaMesaService.abrir(mesaActiva.id));
      } catch {
        // La cuenta se reabrirá al momento de cobrar
      }
      setCartPorMesa((prev) => ({ ...prev, [mesaActiva.id]: [] }));
      setCartAbierto(false);
      setMensaje("Orden enviada a cocina");
      await cargarMesas();
      await cargarPedidosMesa(mesaActiva.id);
      await cargarCuentaMesa(mesaActiva.id);
    } catch (e) {
      setError((e as Error).message || "Error al enviar la orden");
    } finally {
      setCreando(false);
    }
  };

  const liberarMesa = async () => {
    if (!mesaActiva || !restauranteId) return;
    setLiberandoMesa(true);
    setError("");
    try {
      await mesaService.liberar(mesaActiva.id);
      setCartPorMesa((prev) => ({ ...prev, [mesaActiva.id]: [] }));
      setFacturaCuenta(null);
      setCuentaMesa(null);
      setMensaje("Mesa liberada");
      volverAMesas();
      await cargarMesas();
    } catch (e) {
      setError((e as Error).message || "No se pudo liberar la mesa");
    } finally {
      setLiberandoMesa(false);
    }
  };

  const seguirAgregando = () => {
    setFacturaCuenta(null);
    setMensaje("Factura generada. Puedes seguir agregando órdenes");
  };

  const abrirModalCerrarCuenta = async () => {
    if (!mesaActiva) return;
    setErrorCuenta("");
    try {
      let cuenta = cuentaMesa;
      if (!cuenta) {
        cuenta = await cuentaMesaService.abrir(mesaActiva.id);
        setCuentaMesa(cuenta);
      }
      if (cuenta.items.length === 0) {
        setErrorCuenta("La cuenta no tiene productos para cobrar");
        return;
      }
      setModalCerrarCuenta(true);
    } catch (e) {
      setErrorCuenta((e as Error).message || "Error al abrir la cuenta");
    }
  };

  const cerrarCuenta = async (dto: CerrarCuentaMesaDto) => {
    if (!mesaActiva) return;
    setCerrandoCuenta(true);
    setErrorCuenta("");
    try {
      const cerrada = await cuentaMesaService.cerrar(mesaActiva.id, dto);
      setFacturados((prev) =>
        Array.from(
          new Set([
            ...prev,
            ...pedidosMesa.filter((p) => !prev.includes(p.id)).map((p) => p.id),
          ]),
        ),
      );
      setModalCerrarCuenta(false);
      setCuentaMesa(null);
      if (cerrada.facturaVentaId) {
        const factura = await facturaVentaService.getById(cerrada.facturaVentaId);
        setFacturaCuenta(factura);
      }
      setMensaje("Cuenta cerrada y factura generada");
      await cargarMesas();
      await cargarPedidosMesa(mesaActiva.id);
    } catch (e) {
      setErrorCuenta((e as Error).message || "Error al cerrar la cuenta");
    } finally {
      setCerrandoCuenta(false);
    }
  };

  const marcarEntregada = async (pedidoId: string) => {
    if (entregandoId) return;
    setEntregandoId(pedidoId);
    setError("");
    try {
      await pedidoService.updateEstado(pedidoId, 3);
      if (mesaActiva) await cargarPedidosMesa(mesaActiva.id);
      setMensaje("Orden marcada como entregada");
    } catch (e) {
      setError((e as Error).message || "No se pudo marcar como entregada");
    } finally {
      setEntregandoId(null);
    }
  };

  if (!restauranteId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!mesaActiva) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Mesero</h1>
          <p className="text-sm text-gray-500">
            {mesas.filter((m) => m.estaOcupada).length} mesas ocupadas
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => abrirMesa(mesa)}
              className={`relative rounded-2xl border-2 p-5 text-left transition hover:scale-[1.02] ${
                mesa.estaOcupada ? "border-orange-400 bg-orange-50" : "border-green-400 bg-green-50"
              }`}
            >
              <span
                className={`absolute right-3 top-3 h-3 w-3 rounded-full ${
                  mesa.estaOcupada ? "bg-orange-500" : "bg-green-500"
                }`}
              />
              <p className="text-3xl font-bold text-gray-800">{mesa.numero}</p>
              <p className="mt-1 text-xs text-gray-500">Capacidad: {mesa.capacidad}</p>
              <p
                className={`mt-2 text-xs font-semibold ${
                  mesa.estaOcupada ? "text-orange-600" : "text-green-600"
                }`}
              >
                {mesa.estaOcupada ? "Ocupada" : "Libre"}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">Toca una mesa para tomar su orden</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={volverAMesas}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          <IconFlecha />
          Mesas
        </button>
        <div
          className={`h-3 w-3 rounded-full ${
            mesaActiva.estaOcupada ? "bg-orange-500" : "bg-green-500"
          }`}
        />
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Mesa {mesaActiva.numero}
          <span className="ml-2 text-sm font-normal text-gray-500">
            Capacidad {mesaActiva.capacidad}
          </span>
        </h1>
      </div>

      {mensaje && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {pedidosMesa.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Órdenes de la mesa
          </h2>
          <div className="space-y-3">
            {pedidosMesa.map((pedido) => (
              <div key={pedido.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      pedido.estado === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : pedido.estado === 1
                          ? "bg-blue-100 text-blue-700"
                          : pedido.estado === 2
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {ESTADOS[pedido.estado] || "—"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(pedido.fecha).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {pedido.items?.map((item, i) => {
                    if (item.esCombo) {
                      const internos = parseComboInternos(item.comboItemsJson);
                      return (
                        <li key={i}>
                          <span className="font-medium text-orange-700">
                            {item.comboNombre || "Combo"}
                          </span>
                          {internos.length > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              {internos.map((int) => `${int.cantidad}x ${int.nombre}`).join(", ")}
                            </span>
                          )}
                        </li>
                      );
                    }
                    const opcionesArr = parseOpciones(item.opciones);
                    return (
                      <li key={i}>
                        <span className="font-medium">
                          {item.cantidad}x {item.producto?.nombre || item.comboNombre || ""}
                        </span>
                        {opcionesArr.length > 0 && (
                          <span className="ml-2 text-xs text-orange-600">
                            + {opcionesArr.join(", ")}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">{fmt(pedido.total)}</p>
                  {facturados.includes(pedido.id) ? (
                    <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                      Facturado
                    </span>
                  ) : pedido.estado === 2 ? (
                    <button
                      onClick={() => marcarEntregada(pedido.id)}
                      disabled={entregandoId === pedido.id}
                      className="rounded-lg border border-orange-600 px-3 py-1.5 text-sm font-medium text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {entregandoId === pedido.id ? "Marcando..." : "Marcar entregada"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-700">
            Cuenta de la mesa
          </h2>
          {cuentaMesa && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              Abierta
            </span>
          )}
        </div>

        {cargandoCuenta ? (
          <p className="text-sm text-gray-500">Cargando cuenta...</p>
        ) : (
          <>
            {cuentaMesa && cuentaMesa.items.length > 0 && (
              <ul className="mb-3 max-h-40 space-y-1 overflow-y-auto text-sm text-gray-700">
                {cuentaMesa.items.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <span>
                      <span className="font-medium">
                        {item.cantidad}x {item.nombre}
                      </span>
                      {item.esCombo && item.comboItemsJson && (
                        <span className="ml-2 text-xs text-gray-500">
                          {parseComboInternos(item.comboItemsJson)
                            .map((int) => `${int.cantidad}x ${int.nombre}`)
                            .join(", ")}
                        </span>
                      )}
                      {parseOpciones(item.opciones).length > 0 && (
                        <span className="ml-2 text-xs text-orange-600">
                          + {parseOpciones(item.opciones).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{fmt(item.precio * item.cantidad)}</span>
                  </li>
                ))}
              </ul>
            )}

            {cuentaMesa ? (
              <div className="mb-3 space-y-0.5 border-t border-orange-200 pt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{fmt(cuentaMesa.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuesto</span>
                  <span>{fmt(cuentaMesa.impuesto)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>{fmt(cuentaMesa.total)}</span>
                </div>
              </div>
            ) : (
              <p className="mb-3 text-sm text-gray-500">La cuenta se abrirá al momento de cobrar.</p>
            )}

            {pendientesDeFacturar.length > 0 ? (
              <button
                onClick={abrirModalCerrarCuenta}
                className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Cerrar cuenta y facturar
              </button>
            ) : (
              <p className="text-xs text-gray-500">No hay órdenes pendientes por cobrar.</p>
            )}
          </>
        )}

        {errorCuenta && <p className="mt-2 text-xs text-red-600">{errorCuenta}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <Carta
            menus={menus}
            combos={combos}
            onAgregarMenu={agregarMenu}
            onAgregarCombo={agregarCombo}
          />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
            <CartPanel
              mesaNumero={mesaActiva.numero}
              cart={cart}
              cartCount={cartCount}
              cartTotal={cartTotal}
              creando={creando}
              error={error}
              onCambiarCantidad={cambiarCantidad}
              onEditar={editarItem}
              onQuitar={quitarItem}
              onVaciar={vaciarCart}
              onEnviar={enviarACocina}
            />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        {cart.length > 0 && (
          <button
            onClick={() => setCartAbierto((v) => !v)}
            className="flex w-full items-center justify-between bg-orange-600 px-5 py-4 text-white shadow-card-hover"
          >
            <span className="flex items-center gap-2 font-semibold">
              <IconUtensilios />
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
            <span className="font-bold">{fmt(cartTotal)}</span>
            <span className="text-sm">{cartAbierto ? "Ocultar" : "Ver orden"}</span>
          </button>
        )}

        {cartAbierto && cart.length > 0 && (
          <div className="flex h-[75vh] flex-col overflow-hidden rounded-t-2xl border-t border-gray-200 bg-white p-4 shadow-2xl">
            <CartPanel
              mesaNumero={mesaActiva.numero}
              cart={cart}
              cartCount={cartCount}
              cartTotal={cartTotal}
              creando={creando}
              error={error}
              onCambiarCantidad={cambiarCantidad}
              onEditar={editarItem}
              onQuitar={quitarItem}
              onVaciar={vaciarCart}
              onEnviar={enviarACocina}
              onCerrar={() => setCartAbierto(false)}
            />
          </div>
        )}
      </div>

      {productoConfigurando && (
        <ModalItem
          producto={productoConfigurando}
          selecciones={selecciones}
          error={errorConfig}
          precioTotal={precioConOpciones}
          onToggleSeleccion={toggleSeleccion}
          onConfirmar={confirmarProducto}
          onCancelar={cerrarModalItem}
        />
      )}

      {modalCerrarCuenta && cuentaMesa && (
        <ModalCerrarCuenta
          cuenta={cuentaMesa}
          cerrando={cerrandoCuenta}
          error={errorCuenta}
          onCerrar={cerrarCuenta}
          onCancelar={() => {
            setModalCerrarCuenta(false);
            setErrorCuenta("");
          }}
        />
      )}

      {facturaCuenta && mesaActiva && (
        <ModalCuentaCerrada
          mesaNumero={mesaActiva.numero}
          factura={facturaCuenta}
          liberando={liberandoMesa}
          onLiberar={liberarMesa}
          onSeguir={seguirAgregando}
        />
      )}
    </div>
  );
}

export default function MeseroApp() {
  return (
    <UserProvider>
      <MeseroAppInner />
    </UserProvider>
  );
}
