import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "@/lib/apiConfig";

type Handler = (...args: unknown[]) => void;

/**
 * Conexión compartida al hub OrderHub.
 *
 * El servidor auto-une la conexión al grupo `restaurant_{id}` a partir del claim del JWT
 * (`OrderHub.OnConnectedAsync`), así que `restauranteId` solo se usa para re-unirse tras
 * una reconexión.
 *
 * Los handlers se guardan en un ref para que pasar una función inline (recreada en cada
 * render) no reabra la conexión.
 */
export function useSignalR(
  restauranteId: string | undefined,
  handlers: Record<string, Handler>,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!restauranteId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    const eventos = Object.keys(handlersRef.current);
    eventos.forEach((evento) => {
      connection.on(evento, (...args: unknown[]) => {
        handlersRef.current[evento]?.(...args);
      });
    });

    const joinGroup = () =>
      connection.invoke("JoinRestaurantGroup", restauranteId).catch(console.error);
    connection.onreconnected(joinGroup);

    connection.start().then(joinGroup).catch((err) => console.error("[SignalR]", err));

    return () => {
      connection.stop().catch(() => {});
    };
  }, [restauranteId]);
}
