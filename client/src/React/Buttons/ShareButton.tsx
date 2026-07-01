import ShareIcon from "@/components/Icons/ShareIcon.tsx";
import { showAlert } from "@/lib/alert.ts";
import React from "react";

export default function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Mva Foods - ${title}`,
        text: `Mira el menú de ${title}`,
        url: window.location.href,
      });
    } else {
      showAlert("Tu navegador no soporta la función de compartir.", "info");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-3 py-3 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full"
      title="Compartir menú"
    >
      <ShareIcon className="w-6 h-6 text-white" />
    </button>
  );
}
