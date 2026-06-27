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
      className="p-2 rounded-full hover:bg-orange-100 transition"
      title="Compartir menú"
    >
      <ShareIcon className="w-6 h-6 text-orange-600" />
    </button>
  );
}
