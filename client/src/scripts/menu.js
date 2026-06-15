export function initMenu() {
  const languageButton = document.getElementById("languageButton");
  const languageMenu = document.getElementById("languageMenu");
  const selectedFlag = document.getElementById("selectedFlag");

  languageButton?.addEventListener("click", () => {
    languageMenu?.classList.toggle("hidden");
  });

  document.querySelectorAll(".language-option").forEach((option) => {
    option.addEventListener("click", () => {
      const flag = option.dataset.flag;
      const lang = option.dataset.lang;

      if (selectedFlag) {
        selectedFlag.src = flag;
      }

      languageMenu?.classList.add("hidden");

      console.log("Idioma:", lang);
    });
  });

  document.addEventListener("click", (e) => {
    if (
      !languageButton?.contains(e.target) &&
      !languageMenu?.contains(e.target)
    ) {
      languageMenu?.classList.add("hidden");
    }
  });

  document.querySelectorAll(".categoria-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      if (category === "all") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const section = document.getElementById(category);

      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  document
    .getElementById("shareButton")
    ?.addEventListener("click", async () => {
      if (!navigator.share) return;

      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    });

  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const span = btn.querySelector("span");

      if (span) {
        span.textContent =
          String(Number(span.textContent) + 1);
      }
    });
  });
}