(function () {
  const alvos = document.querySelectorAll(".box-sobre, [data-reveal]");
  if (!alvos.length) return;

  // Sem suporte a IntersectionObserver: nem esconde, mostra direto.
  if (!("IntersectionObserver" in window)) return;

  alvos.forEach((el) => el.classList.add("ahma-oculto"));

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.remove("ahma-oculto");
          entrada.target.classList.add("ahma-visivel");
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  alvos.forEach((el) => observer.observe(el));
})();