import ShareIcon from "@/components/Icons/ShareIcon.tsx";
import React from "react";
 // Asegúrate de que este SVG existe

export default function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Mva Foods - ${title}`,
        text: `Mira el menú de ${title}`,
        url: window.location.href,
      });
    } else {
      alert("Tu navegador no soporta la función de compartir.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-full hover:bg-orange-100 transition"
      title="Compartir menú"
    >
      <ShareIcon className="w-6 h-6 text-orange-600" />
    </button>
  );
}
