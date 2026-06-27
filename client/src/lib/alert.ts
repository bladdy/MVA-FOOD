const ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
};

const COLORS = {
  success: { border: "border-green-400", bg: "bg-green-50", btn: "bg-green-600 hover:bg-green-700" },
  error: { border: "border-red-400", bg: "bg-red-50", btn: "bg-red-600 hover:bg-red-700" },
  info: { border: "border-orange-400", bg: "bg-orange-50", btn: "bg-orange-600 hover:bg-orange-700" },
};

export function showAlert(message: string, type: "success" | "error" | "info" = "info") {
  const existing = document.getElementById("mva-alert-overlay");
  if (existing) existing.remove();

  const color = COLORS[type];
  const overlay = document.createElement("div");
  overlay.id = "mva-alert-overlay";
  overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.2s ease";

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center ${color.bg} ${color.border} border-2">
      <div class="flex justify-center mb-3">${ICONS[type]}</div>
      <p class="text-gray-800 text-base font-medium mb-5">${message}</p>
      <button class="w-full ${color.btn} text-white font-semibold py-2.5 rounded-xl transition-colors focus:outline-none">
        Aceptar
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  const btn = overlay.querySelector("button")!;
  const close = () => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 200);
  };
  btn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}
