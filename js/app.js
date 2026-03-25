(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const layoutFigure = (figure) => {
    const img = figure.querySelector(".onepage__img");
    const hotspots = Array.from(figure.querySelectorAll(".hotspot"));
    if (!img || hotspots.length === 0) return;

    const baseW = Number(img.dataset.baseW);
    const baseH = Number(img.dataset.baseH);
    const dw = img.clientWidth;
    const dh = img.clientHeight;

    if (!dw || !dh) return;

    const sx = dw / baseW;
    const sy = dh / baseH;

    for (const el of hotspots) {
      const x1 = Number(el.dataset.x1);
      const y1 = Number(el.dataset.y1);
      const x2 = Number(el.dataset.x2);
      const y2 = Number(el.dataset.y2);

      el.style.left = `${x1 * sx}px`;
      el.style.top = `${y1 * sy}px`;
      el.style.width = `${(x2 - x1) * sx}px`;
      el.style.height = `${(y2 - y1) * sy}px`;
    }
  };

  const run = () => {
    const figures = document.querySelectorAll(".onepage");
    figures.forEach(layoutFigure);
    window.addEventListener("resize", () => figures.forEach(layoutFigure));
  };

  const img = document.querySelector(".onepage__img");
  if (img.complete) run();
  else img.addEventListener("load", run);
})();