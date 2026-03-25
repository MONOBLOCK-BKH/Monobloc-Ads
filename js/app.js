(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const setup = () => {
    const img = document.querySelector(".onepage__img");
    const target = document.querySelector(".click-target");
    if (!img || !target) return;

    const baseW = Number(img.dataset.baseW) || 1080;
    const baseH = Number(img.dataset.baseH) || 2554;

    const dw = img.clientWidth;
    const dh = img.clientHeight;
    if (!dw || !dh) return;

    const sx = dw / baseW;
    const sy = dh / baseH;

    // 비율에 따른 좌표 및 크기 계산
    const tx = Number(target.dataset.x) * sx;
    const ty = Number(target.dataset.y) * sy;
    const tw = Number(target.dataset.w) * sx;
    const th = Number(target.dataset.h) * sy;

    // 시작점(왼쪽 상단) 기준으로 배치
    target.style.left = `${tx}px`;
    target.style.top = `${ty}px`;
    target.style.width = `${tw}px`;
    target.style.height = `${th}px`;

    target.onclick = (e) => {
      e.preventDefault();
      const tel = target.dataset.tel;
      if (tel) window.location.href = `tel:${tel}`;
    };
  };

  const img = document.querySelector(".onepage__img");
  if (img.complete) setup();
  else img.addEventListener("load", setup);

  window.addEventListener("resize", setup);
})();