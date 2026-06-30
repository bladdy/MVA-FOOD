import { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { pedidoService, type PedidoResponse } from "@/Services/pedidoService.ts";
import { UserProvider, useUser } from "@/context/UserContext.tsx";
import { HUB_URL } from "@/lib/apiConfig";

const ESTADOS = ["Pendiente", "En Proceso", "Completado"] as const;
const estadosColores = ["border-yellow-500", "border-blue-500", "border-green-500"];

function OrdenesManagerInner() {
  const { user } = useUser();
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const restauranteId = user?.restauranteId;

  const playNotification = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/notification.mp3");
      }
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  useEffect(() => {
    if (!restauranteId) {
      console.log("[SignalR] No hay restauranteId, saltando conexión");
      return;
    }

    console.log("[SignalR] Iniciando para restauranteId:", restauranteId);
    pedidoService.getAll(restauranteId).then(setPedidos).catch(console.error);

    const hubUrl = HUB_URL;
    console.log("[SignalR] Hub URL:", hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.onreconnecting(() =>
      console.log("[SignalR] Reconnecting...")
    );
    connection.onreconnected(() =>
      console.log("[SignalR] Reconnected")
    );
    connection.onclose(() =>
      console.log("[SignalR] Connection closed")
    );

    connection.on("NuevoPedido", (pedido: PedidoResponse) => {
      console.log("[SignalR] NuevoPedido recibido:", pedido);
      setPedidos((prev) => [pedido, ...prev]);
      playNotification();
    });

    connection.on("EstadoPedidoActualizado", (pedido: PedidoResponse) => {
      console.log("[SignalR] EstadoPedidoActualizado:", pedido);
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? pedido : p))
      );
    });

    const joinGroup = () => {
      console.log("[SignalR] Uniendo a grupo restaurant_", restauranteId);
      return connection
        .invoke("JoinRestaurantGroup", restauranteId)
        .then(() => console.log("[SignalR] Grupo unido exitosamente"))
        .catch(console.error);
    };

    connection.onreconnected(joinGroup);

    connection
      .start()
      .then(() => {
        console.log("[SignalR] Conectado exitosamente");
        joinGroup();
      })
      .catch((err) => console.error("[SignalR] Error de conexión:", err));

    connectionRef.current = connection;

    return () => {
      console.log("[SignalR] Limpiando conexión");
      connection.stop().catch(() => {});
    };
  }, [restauranteId, playNotification]);

  const handleAceptar = async (id: string) => {
    try {
      await pedidoService.updateEstado(id, 1);
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: 1 } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompletar = async (id: string) => {
    try {
      await pedidoService.updateEstado(id, 2);
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: 2 } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleEntregar = async (id: string) => {
    try {
      await pedidoService.updateEstado(id, 3);
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: 3 } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm("¿Cancelar este pedido?")) return;
    try {
      await pedidoService.delete(id);
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const columnas = ESTADOS.map((label, idx) => ({
    label,
    estado: idx,
    pedidos: pedidos.filter((p) => p.estado === idx),
  }));

  if (!restauranteId) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
        <p className="mt-5 text-base text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
        <span className="text-sm text-gray-500">
          {pedidos.filter((p) => p.estado === 0).length} pendientes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnas.map((col) => (
          <div key={col.estado} className="bg-gray-100 rounded-xl p-4">
            <div
              className={`font-semibold text-lg mb-3 border-l-4 pl-2 ${estadosColores[col.estado]}`}
            >
              {col.label}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({col.pedidos.length})
              </span>
            </div>

            <div className="space-y-3">
              {col.pedidos.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  Sin órdenes
                </p>
              )}

              {col.pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-white rounded-lg shadow p-4 border-l-4"
                  style={{
                    borderLeftColor:
                      col.estado === 0
                        ? "#ef4444"
                        : col.estado === 1
                          ? "#eab308"
                          : "#22c55e",
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-800">
                        {pedido.clienteNombre}
                      </span>
                      <span
                        className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                          pedido.tipoEntrega === "domicilio"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pedido.tipoEntrega === "domicilio"
                          ? "A domicilio"
                          : "Para recoger"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(pedido.fecha).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {pedido.clienteTelefono && (
                    <p className="text-xs text-gray-500 mb-2">
                      {pedido.clienteTelefono}
                    </p>
                  )}

                  {pedido.tipoEntrega === "domicilio" && pedido.direccion && (
                    <p className="text-xs text-blue-600 mb-2">
                      {pedido.direccion}
                    </p>
                  )}

                  <ul className="text-sm text-gray-700 space-y-2 mb-3">
                    {pedido.items?.map((item, i) => {
                      let opcionesArr: string[] = [];
                      try {
                        opcionesArr = JSON.parse(item.opciones || "[]");
                      } catch {}

                      if (item.esCombo) {
                        let internos: { nombre: string; cantidad: number; precio: number; opciones: string[] }[] = [];
                        try {
                          internos = JSON.parse(item.comboItemsJson || "[]");
                        } catch {}

                        return (
                          <li key={i}>
                            <div className="font-medium text-orange-700 flex justify-between">
                              <span>{item.comboNombre || "Combo"}</span> <span>${(item.precio * item.cantidad).toFixed(2)}</span>

                            </div>
                            {internos.map((int, ii) => (
                              <div key={ii} className="text-xs text-gray-600 ml-4">
                                <span className="font-medium">{int.cantidad}x {int.nombre}</span>
                                {int.opciones?.length > 0 && (
                                  <span className="text-orange-500"> + {int.opciones.join(", ")}</span>
                                )}
                                <span className="ml-2">${(int.precio * int.cantidad).toFixed(2)}</span>
                              </div>
                            ))}
                          </li>
                        );
                      }

                      return (
                        <li key={i}>
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.cantidad}x {item.producto?.nombre || ""}
                            </span>
                            <span className="font-medium">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                          {opcionesArr.length > 0 && (
                            <div className="text-xs text-orange-600 ml-4">
                              + {opcionesArr.join(", ")}
                            </div>
                          )}
                          {item.notas && (
                            <div className="text-xs text-gray-400 italic ml-4">
                              {item.notas}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex justify-end items-center border-t pt-2">
                    <span className="font-bold text-gray-800">
                      Total: ${pedido.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {col.estado === 0 && (
                      <button
                        onClick={() => handleAceptar(pedido.id)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1.5 rounded-lg font-medium"
                      >
                        Aceptar
                      </button>
                    )}
                    {col.estado === 1 && (
                      <button
                        onClick={() => handleCompletar(pedido.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1.5 rounded-lg font-medium"
                      >
                        Completar
                      </button>
                    )}
                    {col.estado === 2 && pedido.clienteTelefono && (
                      <a
                        href={`https://wa.me/${pedido.clienteTelefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${pedido.clienteNombre}, su orden ya está lista.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 rounded-lg font-medium text-center"
                      >
                        WhatsApp
                      </a>
                    )}
                    {col.estado === 2 && (
                      <button
                        onClick={() => handleEntregar(pedido.id)}
                        className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-sm py-1.5 rounded-lg font-medium"
                      >
                        Entregado
                      </button>
                    )}
                    {col.estado < 2 && (
                      <button
                        onClick={() => handleCancelar(pedido.id)}
                        className="px-3 bg-red-100 hover:bg-red-200 text-red-700 text-sm py-1.5 rounded-lg"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdenesManager() {
  return (
    <UserProvider>
      <OrdenesManagerInner />
    </UserProvider>
  );
}

