import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeWithLogoProps {
  url: string;
  logo: string | File | null;
}

export default function QRCodeWithLogo({ url,logo }: QRCodeWithLogoProps) {
  const qrRef = useRef(null);

  // Crear instancia de QR
  const qrCode = useRef<any>(null);

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new (QRCodeStyling as any)({
        width: 300,
        height: 300,
        data: url,
        image: logo ?? undefined,//Debe estar en /public/
        dotsOptions: {
          color: "#000",
          type: "rounded"
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
          imageSize: 0.3 // Tamaño del logo dentro del QR
        }
      });
    }
    qrCode.current.update({ data: url });
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, [url]);

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

      <button onClick={handleDownload}
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded transition duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" 
        className="icon icon-tabler icons-tabler-outline icon-tabler-qrcode">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
          <path d="M7 17l0 .01" />
          <path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
          <path d="M7 7l0 .01" />
          <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
          <path d="M17 7l0 .01" /><path d="M14 14l3 0" />
          <path d="M20 14l0 .01" /><path d="M14 14l0 3" />
          <path d="M14 20l3 0" /><path d="M17 17l3 0" />
          <path d="M20 17l0 3" />
        </svg>
        
      </button>
  );
}
