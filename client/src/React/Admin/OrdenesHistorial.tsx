import { useEffect, useState } from "react";
import { pedidoService, type PedidoResponse, type PagedResultPedidos } from "@/Services/pedidoService.ts";
import { useUser } from "@/context/UserContext.tsx";

const ESTADOS = ["Pendiente", "En Proceso", "Completado", "Entregado"];

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdenesHistorial() {
  const { user } = useUser();
  const [paged, setPaged] = useState<PagedResultPedidos | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const restauranteId = user?.restauranteId;

  const fetchHistorial = async () => {
    if (!restauranteId) return;
    try {
      const data = await pedidoService.getHistorial({
        restauranteId,
        fechaDesde: filters.fechaDesde || undefined,
        fechaHasta: filters.fechaHasta || undefined,
        estado: filters.estado !== "" ? Number(filters.estado) : undefined,
        search: filters.search || undefined,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
      });
      setPaged(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [restauranteId, filters.pageNumber, filters.pageSize]);

  const handleFilter = () => {
    setFilters((prev) => ({ ...prev, pageNumber: 1 }));
    fetchHistorial();
  };

  const handleLimpiar = () => {
    setFilters({
      fechaDesde: "",
      fechaHasta: "",
      estado: "",
      search: "",
      pageNumber: 1,
      pageSize: 10,
    });
  };

  if (!restauranteId) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Historial de Órdenes</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => setFilters((prev) => ({ ...prev, fechaDesde: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => setFilters((prev) => ({ ...prev, fechaHasta: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {ESTADOS.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nombre o teléfono..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-md font-medium"
            >
              Filtrar
            </button>
            <button
              onClick={handleLimpiar}
              className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 rounded-md"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {paged && paged.items.length === 0 && (
        <p className="text-center text-gray-400 py-10">No se encontraron órdenes</p>
      )}

      {paged && paged.items.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.items.map((pedido) => (
                  <>
                    <tr
                      key={pedido.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{pedido.clienteNombre}</td>
                      <td className="px-4 py-3 text-gray-600">{pedido.clienteTelefono}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          pedido.tipoEntrega === "domicilio"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {pedido.tipoEntrega === "domicilio" ? "A domicilio" : "Para recoger"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={pedido.estado} />
                      </td>
                      <td className="px-4 py-3 font-medium">${pedido.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(pedido.fecha)}</td>
                      <td className="px-4 py-3 text-gray-400">{expandido === pedido.id ? "▲" : "▼"}</td>
                    </tr>
                    {expandido === pedido.id && (
                      <tr key={`${pedido.id}-detalle`}>
                        <td colSpan={7} className="px-4 py-3 bg-gray-50">
                          <div className="text-sm space-y-2">
                            {pedido.direccion && (
                              <p className="text-blue-600">📍 {pedido.direccion}</p>
                            )}
                            {pedido.metodoPago && (
                              <p className="text-gray-600">💳 {pedido.metodoPago}</p>
                            )}
                            <ul className="space-y-1">
                              {pedido.items?.map((item, i) => {
                                let opcionesArr: string[] = [];
                                try { opcionesArr = JSON.parse(item.opciones || "[]"); } catch {}

                                if (item.esCombo) {
                                  let internos: { nombre: string; cantidad: number; precio: number; opciones: string[] }[] = [];
                                  try { internos = JSON.parse(item.comboItemsJson || "[]"); } catch {}

                                  return (
                                    <li key={i} className="border-l-2 border-orange-300 pl-3">
                                      <span className="font-medium text-orange-700">{item.comboNombre || "Combo"} — ${(item.precio * item.cantidad).toFixed(2)}</span>
                                      {internos.map((int, ii) => (
                                        <div key={ii} className="text-xs text-gray-600 ml-2">
                                          {int.cantidad}x {int.nombre} — ${(int.precio * int.cantidad).toFixed(2)}
                                          {int.opciones?.length > 0 && <span className="text-orange-500"> + {int.opciones.join(", ")}</span>}
                                        </div>
                                      ))}
                                    </li>
                                  );
                                }

                                return (
                                  <li key={i}>
                                    <span className="font-medium">{item.cantidad}x {item.producto?.nombre || ""}</span> — ${(item.precio * item.cantidad).toFixed(2)}
                                    {opcionesArr.length > 0 && <span className="text-orange-600 ml-2">+ {opcionesArr.join(", ")}</span>}
                                    {item.notas && <p className="text-xs text-gray-400 italic ml-4">{item.notas}</p>}
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="text-right font-bold text-gray-800 pt-2 border-t">
                              Total: ${pedido.total.toFixed(2)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-500">
              Mostrando {(paged.pageNumber - 1) * paged.pageSize + 1}-{Math.min(paged.pageNumber * paged.pageSize, paged.totalItems)} de {paged.totalItems}
            </span>
            <div className="flex gap-2">
              <button
                disabled={paged.pageNumber <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
                className="px-3 py-1 border rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Anterior
              </button>
              <button
                disabled={paged.pageNumber >= paged.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
                className="px-3 py-1 border rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: number }) {
  const colores = [
    "bg-yellow-100 text-yellow-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-gray-200 text-gray-600",
  ];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colores[estado] || "bg-gray-100 text-gray-600"}`}>
      {ESTADOS[estado] || "Desconocido"}
    </span>
  );
}
