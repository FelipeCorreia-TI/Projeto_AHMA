(function () {
  const alvos = document.querySelectorAll(".box-sobre, [data-reveal]");
  if (!alvos.length) return;

  // Sem suporte a IntersectionObserver: mostra tudo direto, sem animação
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((el) => el.classList.add("ahma-visivel"));
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("ahma-visivel");
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  alvos.forEach((el) => observer.observe(el));
})();