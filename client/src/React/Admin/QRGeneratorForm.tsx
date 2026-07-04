import { useEffect, useRef, useState } from 'react';
import { useUser } from "@/context/UserContext.tsx";
import QRCodeStyling from 'qr-code-styling';
import ImageUpload from "@/React/Components/ImageUpload";
import { getRestaurante } from "@/Services/restauranteService.ts";
export default function QRGeneratorForm() {
  const { user } = useUser();
  const [url, setUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.3);
  const [loading, setLoading] = useState(true);
  const [qrSize, setQrSize] = useState(300);

  const containerRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.restauranteId) {
      getRestaurante(user.restauranteId).then((restaurante) => {
        setUrl(`https://mr-menus.com/menus/d/${restaurante.slug}`);
        setLoading(false);
      }).catch((error) => {
        console.error("Error fetching restaurante URL:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?.restauranteId]);

  useEffect(() => {
    const el = rightColRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth;
      const size = Math.floor(Math.min(Math.max(w - 48, 280), 450));
      setQrSize(size);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!url) return;

    const image = logoPreview || undefined;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    qrCode.current = new (QRCodeStyling as any)({
      width: qrSize,
      height: qrSize,
      data: url,
      image,
      dotsOptions: {
        color: "#000",
        type: "rounded"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: logoSize
      }
    });

    if (containerRef.current) {
      qrCode.current?.append(containerRef.current);
    }
  }, [url, logoPreview, logoSize, qrSize]);

  const handleDownload = async () => {
    try {
      await qrCode.current?.download({ name: "codigo_qr", extension: "png" });
    } catch (e) {
      console.error("QR download failed", e);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md lg:h-full lg:max-w-none lg:mx-0 lg:bg-transparent lg:shadow-none lg:p-0 lg:space-y-0 lg:grid lg:grid-cols-[360px_1fr] lg:gap-8">
      <div className="space-y-6 lg:self-start lg:sticky lg:top-0 lg:p-6 lg:bg-white lg:rounded-lg lg:shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-orange-200 pb-3">
          Generar QR
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL del menú</label>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Cargando...</p>
          ) : (
            <input
              type="text"
              value={url}
              disabled
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-600 outline-none transition-colors"
            />
          )}
        </div>

        <ImageUpload
          value={logo}
          onChange={(file) => {
            setLogo(file);
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            setLogoPreview(file ? URL.createObjectURL(file) : null);
          }}
          label="Logo"
          id="qr-logo-upload"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño del logo: {Math.round(logoSize * 100)}%
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={logoSize}
            onChange={(e) => setLogoSize(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Escanea para ver el menú"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="hidden lg:block w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded transition duration-200 font-medium"
        >
          Descargar QR
        </button>
      </div>

      <div ref={rightColRef} className="flex flex-col items-center gap-4 lg:h-full lg:justify-center lg:items-center">
        <div ref={containerRef} className="flex justify-center" />
        {title && (
          <p className="text-center text-gray-700 font-medium">{title}</p>
        )}

        <button
          type="button"
          onClick={handleDownload}
          className="lg:hidden bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded transition duration-200 font-medium"
        >
          Descargar QR
        </button>
      </div>
    </div>
  );
}
