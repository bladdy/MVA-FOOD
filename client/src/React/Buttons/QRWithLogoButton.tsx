import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeWithLogoProps {
  url: string;
}

export default function QRCodeWithLogo({ url }: QRCodeWithLogoProps) {
  const qrRef = useRef(null);

  // Crear instancia de QR
  const qrCode = useRef(
    new QRCodeStyling({
      width: 300,
      height: 300,
      data: url,
      image: "/mva-logo-rb.png", // Debe estar en /public/
      dotsOptions: {
        color: "#000",
        type: "rounded"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: 0.3 // Tamaño del logo dentro del QR
      }
    })
  );

  useEffect(() => {
    qrCode.current.update({ data: url });
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, [url]);

  const handleDownload = () => {
    qrCode.current.download({ name: "codigo_qr", extension: "png" });
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 w-full mt-10">
      <h2 className="text-2xl font-bold text-gray-800">QR con logo embebido</h2>
      <div ref={qrRef} className="bg-gray-100 rounded" />
      <button
        onClick={handleDownload}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition duration-200"
      >
        Descargar QR
      </button>
    </div>
  );
}
