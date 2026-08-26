(function () {
  const header = document.querySelector(".top-header");
  if (!header) return;

  const LIMIAR_SCROLL = 8; // px rolados antes de mostrar a sombra

  function atualizarSombra() {
    if (window.scrollY > LIMIAR_SCROLL) {
      header.classList.add("ahma-header-rolado");
    } else {
      header.classList.remove("ahma-header-rolado");
    }
  }

  atualizarSombra();
  window.addEventListener("scroll", atualizarSombra, { passive: true });
})();