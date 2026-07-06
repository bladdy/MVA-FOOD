import { useEffect, useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { facturaService } from "@/Services/facturaService";
import { formatPrice } from "@/lib/currency";
import type { FacturaDetalleDto } from "@/Types/Restaurante";

interface Props {
  facturaId: string;
}

function InvoiceInner({ facturaId }: Props) {
  const [factura, setFactura] = useState<FacturaDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facturaService
      .getById(facturaId)
      .then(setFactura)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [facturaId]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Factura no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Factura {factura.numeroFactura}
        </h1>
        <a
          href="/admin/facturacion"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Volver
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-orange-600">Mr. Menús</h2>
            <p className="text-sm text-gray-500">Plataforma de gestión de menús</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">FACTURA</p>
            <p className="text-sm text-gray-600">N° {factura.numeroFactura}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Cliente</p>
            <p className="text-sm font-medium text-gray-800">{factura.restauranteNombre}</p>
            <p className="text-sm text-gray-600">{factura.restauranteDireccion}</p>
            {factura.restauranteRnc && (
              <p className="text-sm text-gray-600">RNC: {factura.restauranteRnc}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase">Emisión</p>
            <p className="text-sm text-gray-800">
              {new Date(factura.fechaEmision).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {factura.fechaPago && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Pagado</p>
                <p className="text-sm text-gray-800">
                  {new Date(factura.fechaPago).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between items-center py-2">
          <p className="text-sm text-gray-700">{factura.concepto}</p>
          <p className="text-lg font-bold text-gray-800">{formatPrice(factura.monto, factura.moneda)}</p>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between items-center">
          <p className="text-base font-bold text-gray-800">Total</p>
          <p className="text-xl font-bold text-gray-800">{formatPrice(factura.monto, factura.moneda)}</p>
        </div>

        {factura.pagado ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-semibold">
              Pagada el{" "}
              {factura.fechaPago
                ? new Date(factura.fechaPago).toLocaleDateString("es-ES")
                : ""}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-700 font-semibold">Pendiente de pago</p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <a
            href={facturaService.getPdfUrl(factura.id)}
            target="_blank"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Descargar PDF
          </a>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceViewer({ facturaId }: Props) {
  return (
    <UserProvider>
      <InvoiceInner facturaId={facturaId} />
    </UserProvider>
  );
}
