(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const figures = Array.from(document.querySelectorAll(".onepage"));
  if (figures.length === 0) return;

  const layoutFigure = (figure) => {
    const img = figure.querySelector(".onepage__img");
    const hotspots = Array.from(
      figure.querySelectorAll(".hotspot[data-x1][data-y1][data-x2][data-y2]")
    );
    if (!img || hotspots.length === 0) return;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const baseW = Number(img.dataset.baseW || nw) || nw;
    const baseH = Number(img.dataset.baseH || nh) || nh;

    const dw = img.clientWidth;
    const dh = img.clientHeight;

    if (!dw || !dh || !baseW || !baseH) return;

    const sx = dw / baseW;
    const sy = dh / baseH;

    const pad = 8;     // 클릭 영역 여유(디스플레이 px)
    const minH = 44;   // 터치 최소 높이(디스플레이 px)
    const minW = 44;   // 터치 최소 폭(디스플레이 px)

    for (const el of hotspots) {
      const x1 = Number(el.dataset.x1);
      const y1 = Number(el.dataset.y1);
      const x2 = Number(el.dataset.x2);
      const y2 = Number(el.dataset.y2);

      let left = x1 * sx - pad;
      let top = y1 * sy - pad;
      let width = (x2 - x1) * sx + pad * 2;
      let height = (y2 - y1) * sy + pad * 2;

      // 터치 최소 크기 보정(중앙 기준으로 확장)
      if (height < minH) { const d = (minH - height) / 2; top -= d; height = minH; }
      if (width < minW)  { const d = (minW - width) / 2; left -= d; width = minW; }

      // 이미지 밖으로 나가지 않게
      left = Math.max(0, left);
      top = Math.max(0, top);
      width = Math.min(dw - left, width);
      height = Math.min(dh - top, height);

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    }
  };

  const layoutAll = () => {
    for (const fig of figures) layoutFigure(fig);
  };

  const run = () => {
    layoutAll();
    window.addEventListener("resize", layoutAll, { passive: true });
  };

  // 이미지 로드 타이밍 대응
  const imgs = figures.map(f => f.querySelector(".onepage__img")).filter(Boolean);
  let pending = imgs.length;

  const done = () => {
    pending -= 1;
    if (pending <= 0) run();
  };

  for (const im of imgs) {
    if (im.complete) done();
    else im.addEventListener("load", done, { once: true });
  }
})();
