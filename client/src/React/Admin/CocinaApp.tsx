import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import * as signalR from "@microsoft/signalr";
import { pedidoService, type PedidoResponse } from "@/Services/pedidoService";
import { UserProvider, useUser } from "@/context/UserContext.tsx";
import { HUB_URL } from "@/lib/apiConfig";

type FiltroId = "todas" | "urgentes" | 0 | 1 | 2;
type OrdenTipo = "antiguas" | "nuevas" | "prioridad";

const URGENTE_MIN = 15;
const CRITICO_MIN = 20;
const ADVERTENCIA_MIN = 10;
const NUEVO_ORDEN_MS = 8000;
const TAMANIO_COLUMNAS = 12;

const COLUMNAS = [
  {
    estado: 0 as const,
    nombre: "Pendientes",
    icono: "reloj" as const,
    acento: "#f59e0b",
    vacio: "Sin pedidos pendientes",
  },
  {
    estado: 1 as const,
    nombre: "En preparación",
    icono: "olla" as const,
    acento: "#3b82f6",
    vacio: "Sin productos en preparación",
  },
  {
    estado: 2 as const,
    nombre: "Listas",
    icono: "check" as const,
    acento: "#22c55e",
    vacio: "Sin listas",
  },
] as const;

const FILTROS: { id: FiltroId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: 0, label: "Pendientes" },
  { id: 1, label: "En preparación" },
  { id: 2, label: "Listas" },
  { id: "urgentes", label: "Urgentes (15+ min)" },
];

interface InternoKDS {
  nombre: string;
  cantidad: number;
  opciones: string[];
}

interface ItemKDS {
  id: string;
  nombre: string;
  cantidad: number;
  opciones: string[];
  notas: string;
  esCombo: boolean;
  internos: InternoKDS[];
  estado: number;
}

interface OrdenCard {
  pedidoId: string;
  mesa: number | null;
  cliente: string;
  tipoEntrega: string;
  metodoPago?: string;
  fecha: string;
  items: ItemKDS[];
  estadoColumna: 0 | 1 | 2;
}

function parseOpciones(opciones?: string): string[] {
  if (!opciones) return [];
  try {
    const arr = JSON.parse(opciones);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function toItemKDS(item: PedidoResponse["items"][number]): ItemKDS {
  let internos: InternoKDS[] = [];
  if (item.esCombo) {
    try {
      const raw = JSON.parse(item.comboItemsJson || "[]");
      internos = Array.isArray(raw)
        ? raw.map(
            (i: {
              nombre?: string;
              cantidad?: number;
              opciones?: unknown;
            }) => ({
              nombre: i.nombre || "Plato",
              cantidad: i.cantidad ?? 1,
              opciones: Array.isArray(i.opciones) ? i.opciones.map(String) : [],
            }),
          )
        : [];
    } catch {}
  }
  return {
    id: item.id,
    nombre: item.esCombo
      ? item.comboNombre || "Combo"
      : item.producto?.nombre || "Producto",
    cantidad: item.cantidad,
    opciones: parseOpciones(item.opciones),
    notas: item.notas || "",
    esCombo: !!item.esCombo,
    internos,
    estado: item.estado ?? 0,
  };
}

function agruparItems(items: ItemKDS[]): ItemKDS[] {
  const mapa = new Map<string, ItemKDS>();
  for (const it of items) {
    const clave = [
      it.nombre,
      JSON.stringify(it.opciones),
      JSON.stringify(it.internos),
      it.notas,
      it.esCombo ? "1" : "0",
    ].join("|");
    const previo = mapa.get(clave);
    if (previo) {
      previo.cantidad += it.cantidad;
      previo.estado = Math.max(previo.estado, it.estado);
    } else {
      mapa.set(clave, { ...it });
    }
  }
  return [...mapa.values()];
}

function construirOrdenes(pedidos: PedidoResponse[]): OrdenCard[] {
  const ordenes: OrdenCard[] = [];
  for (const p of pedidos) {
    if (p.estado === 3) continue;
    const items = agruparItems((p.items || []).map(toItemKDS));
    const estados = items.map((i) => i.estado);
    let estadoColumna: 0 | 1 | 2 = 0;
    if (estados.length === 0) {
      estadoColumna = 0;
    } else if (estados.every((e) => e >= 2)) {
      estadoColumna = 2;
    } else if (estados.some((e) => e >= 1)) {
      estadoColumna = 1;
    }
    ordenes.push({
      pedidoId: p.id,
      mesa: p.numeroMesa ?? null,
      cliente: p.clienteNombre || "Cliente",
      tipoEntrega: p.tipoEntrega || "",
      metodoPago: p.metodoPago,
      fecha: p.fecha,
      items,
      estadoColumna,
    });
  }
  return ordenes;
}

function codigoOrden(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function horaLocal(fecha: string): string {
  return new Date(fecha).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tiempoClase(mins: number): string {
  if (mins >= CRITICO_MIN) return "bg-red-500 text-white";
  if (mins >= URGENTE_MIN) return "bg-orange-500 text-white";
  if (mins >= ADVERTENCIA_MIN) return "bg-amber-400 text-amber-950";
  return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
}

type IconoNombre =
  | "reloj"
  | "olla"
  | "check"
  | "llama"
  | "sonidoOn"
  | "sonidoOff"
  | "luna"
  | "sol"
  | "expandir"
  | "minimizar"
  | "papelera"
  | "campana";

const ICONOS: Record<IconoNombre, ReactElement> = {
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  olla: (
    <>
      <path d="M2 12h20a10 10 0 0 1-20 0Z" />
      <path d="M2 12V8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4" />
      <path d="M4 4V2M12 4V2" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  llama: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  sonidoOn: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </>
  ),
  sonidoOff: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="m23 9-6 6" />
      <path d="m17 9 6 6" />
    </>
  ),
  luna: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />,
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  expandir: (
    <>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="m21 3-7 7" />
      <path d="m3 21 7-7" />
    </>
  ),
  minimizar: (
    <>
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="m14 10 7-7" />
      <path d="m3 21 7-7" />
    </>
  ),
  papelera: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  campana: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
};

function Icono({
  nombre,
  className = "w-5 h-5",
}: {
  nombre: IconoNombre;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONOS[nombre]}
    </svg>
  );
}

interface TarjetaOrdenProps {
  orden: OrdenCard;
  acento: string;
  prioritario: boolean;
  esNueva: boolean;
  ocupado: boolean;
  minutos: number;
  onPrioridad: () => void;
  onAccion: () => void;
}

function TarjetaOrden({
  orden,
  acento,
  prioritario,
  esNueva,
  ocupado,
  minutos,
  onPrioridad,
  onAccion,
}: TarjetaOrdenProps) {
  const accion =
    orden.estadoColumna === 0
      ? "Empezar"
      : orden.estadoColumna === 1
        ? "Listo"
        : "Entregar";
  const accionClases =
    orden.estadoColumna === 0
      ? "bg-blue-500 hover:bg-blue-600"
      : orden.estadoColumna === 1
        ? "bg-green-500 hover:bg-green-600"
        : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600";

  return (
    <article
      className={`relative rounded-xl border border-gray-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover dark:border-gray-700 dark:bg-gray-800 border-l-4 ${
        prioritario ? "ring-2 ring-orange-400/70 dark:ring-orange-500/60" : ""
      }`}
      style={{ borderLeftColor: acento }}
    >
      {esNueva && (
        <div className="absolute -top-3 left-4 flex animate-pulse items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
          <Icono nombre="campana" className="h-3.5 w-3.5" />
          Nueva orden
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-extrabold leading-none text-gray-900 dark:text-white">
              {orden.mesa ? `Mesa ${orden.mesa}` : "Para llevar"}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {codigoOrden(orden.pedidoId)}
            </span>
            {prioritario && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-orange-600 dark:text-orange-400">
                <Icono nombre="llama" className="h-3.5 w-3.5" />
                Prioridad
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {orden.cliente}
            {orden.metodoPago ? ` - ${orden.metodoPago}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${tiempoClase(minutos)}`}
          >
            {minutos} min
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {horaLocal(orden.fecha)}
          </span>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {orden.items.map((it, i) => (
          <li key={i} className="text-gray-800 dark:text-gray-200">
            <p className="flex items-baseline gap-1.5 text-[15px] font-bold leading-tight">
              <span className="text-gray-400 dark:text-gray-500">
                {it.cantidad}x
              </span>
              <span>{it.nombre}</span>
              {it.esCombo && (
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                  COMBO
                </span>
              )}
            </p>
            {it.internos.length > 0 && (
              <div className="ml-6 mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                {it.internos.map((int, j) => (
                  <div key={j}>
                    <span className="font-medium">
                      {int.cantidad}x {int.nombre}
                    </span>
                    {int.opciones.length > 0 && (
                      <span className="text-orange-500 dark:text-orange-400">
                        {" "}
                        + {int.opciones.join(", ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {it.opciones.length > 0 && (
              <p className="ml-6 mt-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                + {it.opciones.join(", ")}
              </p>
            )}
            {it.notas && (
              <p className="ml-6 mt-1 text-xs italic text-gray-500 dark:text-gray-400">
                Nota: {it.notas}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onPrioridad}
          aria-label={prioritario ? "Quitar prioridad" : "Marcar prioridad"}
          aria-pressed={prioritario}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
            prioritario
              ? "border-orange-400 bg-orange-500 text-white"
              : "border-gray-200 bg-white text-gray-400 hover:text-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
          }`}
        >
          <Icono nombre="llama" className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button
          onClick={onAccion}
          disabled={ocupado}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800 ${accionClases}`}
        >
          {ocupado ? "Procesando..." : accion}
        </button>
      </div>
    </article>
  );
}

function CocinaAppInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [ahora, setAhora] = useState(Date.now());
  const [prioritarios, setPrioritarios] = useState<Set<string>>(new Set());
  const [nuevos, setNuevos] = useState<Record<string, number>>({});
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("kds-sound") !== "off";
  });
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("kds-dark") === "1";
  });
  const [fs, setFs] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [filtro, setFiltro] = useState<FiltroId>("todas");
  const [orden, setOrden] = useState<OrdenTipo>("antiguas");
  const [tabActivo, setTabActivo] = useState<0 | 1 | 2>(0);
  const [ocupado, setOcupado] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);

  const vistosRef = useRef<Set<string>>(new Set());
  const soundRef = useRef(soundOn);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const f11Ref = useRef(false);

  useEffect(() => {
    soundRef.current = soundOn;
    localStorage.setItem("kds-sound", soundOn ? "on" : "off");
  }, [soundOn]);

  useEffect(() => {
    localStorage.setItem("kds-dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const corte = Date.now() - NUEVO_ORDEN_MS;
      setNuevos((prev) => {
        const claves = Object.keys(prev).filter((k) => prev[k] >= corte);
        if (claves.length === Object.keys(prev).length) return prev;
        const next: Record<string, number> = {};
        claves.forEach((k) => {
          next[k] = prev[k];
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const playDing = useCallback(() => {
    if (!soundRef.current) return;
    try {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctor();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const beep = (freq: number, offset: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t0 = ctx.currentTime + offset;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
      };
      beep(880, 0, 0.16);
      beep(1318, 0.2, 0.26);
    } catch {}
  }, []);

  useEffect(() => {
    if (!restauranteId) return;

    pedidoService
      .getAll(restauranteId)
      .then((lista) => {
        const vivos = lista.filter((p) => p.estado !== 3);
        setPedidos(vivos);
        vistosRef.current = new Set(vivos.map((p) => p.id));
      })
      .catch(console.error)
      .finally(() => setCargando(false));

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection.on("NuevoPedido", (pedido: PedidoResponse) => {
      if (!pedido || pedido.estado === 3) return;
      setPedidos((prev) =>
        prev.some((p) => p.id === pedido.id)
          ? prev.map((p) => (p.id === pedido.id ? pedido : p))
          : [...prev, pedido],
      );
      if (!vistosRef.current.has(pedido.id)) {
        vistosRef.current.add(pedido.id);
        setNuevos((prev) => ({ ...prev, [pedido.id]: Date.now() }));
        playDing();
      }
    });

    connection.on("EstadoPedidoActualizado", (pedido: PedidoResponse) => {
      setPedidos((prev) =>
        pedido.estado === 3
          ? prev.filter((p) => p.id !== pedido.id)
          : prev.map((p) => (p.id === pedido.id ? pedido : p)),
      );
    });

    connection.on(
      "EstadoItemActualizado",
      (ev: { pedidoId: string; itemId: string; estado: number }) => {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === ev.pedidoId
              ? {
                  ...p,
                  items: (p.items || []).map((it) =>
                    it.id === ev.itemId ? { ...it, estado: ev.estado } : it,
                  ),
                }
              : p,
          ),
        );
      },
    );

    const joinGroup = () =>
      connection
        .invoke("JoinRestaurantGroup", restauranteId)
        .catch(console.error);
    connection.onreconnected(joinGroup);
    connection.start().then(joinGroup).catch(console.error);

    return () => {
      connection.stop().catch(() => {});
    };
  }, [restauranteId, playDing]);

  useEffect(() => {
    const onFsChange = () => {
      const active = !!document.fullscreenElement;
      setFs(active);
      document.body.classList.toggle("kds-fullscreen", active);
      if (active && localStorage.getItem("kds-dark") === null) setDark(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        f11Ref.current = !f11Ref.current;
        setFs(f11Ref.current);
        document.body.classList.toggle("kds-fullscreen", f11Ref.current);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("kds-fullscreen");
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const minutos = useCallback(
    (fecha: string) => {
      const diff = ahora - new Date(fecha).getTime();
      return Math.max(0, Math.floor(diff / 60000));
    },
    [ahora],
  );

  const ordenes = useMemo(() => construirOrdenes(pedidos), [pedidos]);

  const togglePrioridad = (pedidoId: string) => {
    setPrioritarios((prev) => {
      const next = new Set(prev);
      if (next.has(pedidoId)) {
        next.delete(pedidoId);
      } else {
        next.add(pedidoId);
      }
      return next;
    });
  };

  const recargar = useCallback(() => {
    if (!restauranteId) return;
    pedidoService
      .getAll(restauranteId)
      .then((lista) => setPedidos(lista.filter((p) => p.estado !== 3)))
      .catch(console.error);
  }, [restauranteId]);

  const marcarItems = useCallback(
    async (pedido: OrdenCard, destino: number) => {
      const pendientes = pedido.items.filter((i) => i.estado < destino);
      if (pendientes.length === 0) return;
      setOcupado((prev) => new Set(prev).add(pedido.pedidoId));
      try {
        await Promise.all(
          pendientes.map((i) =>
            pedidoService.updateItemEstado(pedido.pedidoId, i.id, destino),
          ),
        );
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === pedido.pedidoId
              ? {
                  ...p,
                  items: (p.items || []).map((it) =>
                    pendientes.some((i) => i.id === it.id)
                      ? { ...it, estado: destino }
                      : it,
                  ),
                }
              : p,
          ),
        );
      } catch (err) {
        console.error(err);
        recargar();
      } finally {
        setOcupado((prev) => {
          const next = new Set(prev);
          next.delete(pedido.pedidoId);
          return next;
        });
      }
    },
    [recargar],
  );

  const entregar = useCallback(
    async (pedidoId: string) => {
      setOcupado((prev) => new Set(prev).add(pedidoId));
      try {
        await pedidoService.updateEstado(pedidoId, 3);
        setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
      } catch (err) {
        console.error(err);
        recargar();
      } finally {
        setOcupado((prev) => {
          const next = new Set(prev);
          next.delete(pedidoId);
          return next;
        });
      }
    },
    [recargar],
  );

  const limpiarCompletadas = () => {
    const ids = new Set(
      ordenes.filter((o) => o.estadoColumna === 2).map((o) => o.pedidoId),
    );
    setPedidos((prev) => prev.filter((p) => !ids.has(p.id)));
  };

  const comparador = useCallback(
    (a: OrdenCard, b: OrdenCard): number => {
      const pa = prioritarios.has(a.pedidoId) ? 1 : 0;
      const pb = prioritarios.has(b.pedidoId) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      const ta = new Date(a.fecha).getTime();
      const tb = new Date(b.fecha).getTime();
      if (orden === "nuevas") return tb - ta;
      const ua = minutos(a.fecha) >= URGENTE_MIN ? 1 : 0;
      const ub = minutos(b.fecha) >= URGENTE_MIN ? 1 : 0;
      if (orden === "prioridad" && ua !== ub) return ub - ua;
      return ta - tb;
    },
    [prioritarios, orden, minutos],
  );

  const columnas = useMemo(() => {
    return COLUMNAS.map((col) => {
      let lista = ordenes.filter((o) => o.estadoColumna === col.estado);
      const count = lista.length;
      if (filtro === "urgentes") {
        lista = lista.filter((o) => minutos(o.fecha) >= URGENTE_MIN);
      }
      if (col.estado === 2) {
        lista = [...lista]
          .sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
          )
          .slice(0, TAMANIO_COLUMNAS);
      } else {
        lista = [...lista].sort(comparador);
      }
      const esperaMax = lista.reduce(
        (m, o) => Math.max(m, minutos(o.fecha)),
        0,
      );
      return { ...col, ordenes: lista, count, esperaMax };
    });
  }, [ordenes, filtro, comparador, minutos]);

  const aplicarFiltro = (id: FiltroId) => {
    setFiltro(id);
    if (id === "urgentes") setTabActivo(0);
    else if (typeof id === "number") setTabActivo(id);
  };

  const columnaVisible = (estado: 0 | 1 | 2): boolean => {
    if (filtro === "urgentes") return estado !== 2;
    if (filtro === "todas") return true;
    return filtro === estado;
  };

  const seccionClases = (estado: 0 | 1 | 2): string => {
    if (!columnaVisible(estado)) return "hidden";
    return estado === tabActivo ? "flex lg:flex" : "hidden lg:flex";
  };

  const gridClases =
    filtro === "todas"
      ? "lg:grid-cols-3"
      : filtro === "urgentes"
        ? "lg:grid-cols-2"
        : "lg:grid-cols-1";

  const raizClases = `flex flex-col ${
    fs
      ? "fixed inset-0 z-[200] bg-[#f3f4f6] dark:bg-gray-950"
      : "h-full bg-transparent"
  } ${dark ? "kds-dark" : ""}`;

  if (!restauranteId || cargando) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={raizClases}>
      <header className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white">
            <Icono nombre="olla" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight text-gray-800 dark:text-gray-100">
              Cocina
            </h1>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              Tablero de preparación
            </p>
          </div>
        </div>

        <button
          onClick={() => setPausado((v) => !v)}
          aria-pressed={pausado}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
            pausado
              ? "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              : "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              pausado ? "bg-red-500" : "animate-pulse bg-green-500"
            }`}
          />
          {pausado ? "Pausada" : "Operativa"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          {columnas.map((kpi) => (
            <button
              key={kpi.estado}
              onClick={() => {
                setFiltro((f) => (f === kpi.estado ? "todas" : kpi.estado));
                setTabActivo(kpi.estado);
              }}
              aria-label={`Filtrar ${kpi.nombre}`}
              className={`flex flex-col items-center rounded-xl border-l-4 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                filtro === kpi.estado
                  ? "ring-2 ring-orange-500/40"
                  : "border-gray-200 dark:border-gray-700"
              }`}
              style={{ borderLeftColor: kpi.acento }}
            >
              <span className="text-xl font-bold leading-none text-gray-800 dark:text-gray-100">
                {kpi.count}
              </span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {kpi.nombre}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenTipo)}
            aria-label="Orden de las tarjetas"
            className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="antiguas">Más antiguas primero</option>
            <option value="nuevas">Más nuevas primero</option>
            <option value="prioridad">Urgentes primero</option>
          </select>

          <button
            onClick={() => setSoundOn((v) => !v)}
            aria-label={
              soundOn ? "Silenciar notificaciones" : "Activar notificaciones"
            }
            aria-pressed={soundOn}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Icono
              nombre={soundOn ? "sonidoOn" : "sonidoOff"}
              className="h-5 w-5"
            />
          </button>

          <button
            onClick={() => setDark((v) => !v)}
            aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-pressed={dark}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Icono nombre={dark ? "sol" : "luna"} className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label={fs ? "Salir de pantalla completa" : "Pantalla completa"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Icono nombre={fs ? "minimizar" : "expandir"} className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1 px-4 pt-3 md:px-6">
        {FILTROS.map((f) => (
          <button
            key={String(f.id)}
            onClick={() => aplicarFiltro(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
              filtro === f.id
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-4 pt-3 lg:hidden">
        {columnas.map((col) => (
          <button
            key={col.estado}
            onClick={() => setTabActivo(col.estado)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-b-2 px-2 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
              tabActivo === col.estado
                ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                : "border-transparent bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {col.nombre}
            <span className="text-xs">{col.count}</span>
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 px-4 py-3 md:px-6">
        {pausado && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/70 backdrop-blur-sm dark:bg-gray-950/70">
            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
              Cocina en pausa
            </p>
            <button
              onClick={() => setPausado(false)}
              className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              Reanudar
            </button>
          </div>
        )}

        <div className={`grid h-full grid-cols-1 gap-4 ${gridClases}`}>
          {columnas.map((col) => (
            <section
              key={col.estado}
              className={`flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 min-h-0 ${seccionClases(col.estado)}`}
            >
              <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{
                    backgroundColor: `${col.acento}22`,
                    color: col.acento,
                  }}
                >
                  <Icono nombre={col.icono} className="h-4 w-4" />
                </span>
                <h2 className="font-bold text-gray-800 dark:text-gray-100">
                  {col.nombre}
                </h2>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: `${col.acento}22`,
                    color: col.acento,
                  }}
                >
                  {col.count}
                </span>
                {col.estado === 2 && col.count > 0 && (
                  <button
                    onClick={limpiarCompletadas}
                    aria-label="Limpiar lista de completadas"
                    className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <Icono nombre="papelera" className="h-3.5 w-3.5" />
                    Limpiar
                  </button>
                )}
                {col.esperaMax > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                      col.estado !== 2 ? tiempoClase(col.esperaMax) : ""
                    }`}
                  >
                    Máx {col.esperaMax} min
                  </span>
                )}
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {col.ordenes.length === 0 && (
                  <p className="py-6 text-center text-sm italic text-gray-400 dark:text-gray-500">
                    {col.vacio}
                  </p>
                )}
                {col.ordenes.map((orden) => (
                  <TarjetaOrden
                    key={orden.pedidoId}
                    orden={orden}
                    acento={col.acento}
                    prioritario={prioritarios.has(orden.pedidoId)}
                    esNueva={nuevos[orden.pedidoId] !== undefined}
                    ocupado={ocupado.has(orden.pedidoId)}
                    minutos={minutos(orden.fecha)}
                    onPrioridad={() => togglePrioridad(orden.pedidoId)}
                    onAccion={() => {
                      if (orden.estadoColumna === 2) {
                        void entregar(orden.pedidoId);
                      } else {
                        void marcarItems(orden, orden.estadoColumna + 1);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CocinaApp() {
  return (
    <UserProvider>
      <CocinaAppInner />
    </UserProvider>
  );
}
