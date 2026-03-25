(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const setup = () => {
    const img = document.querySelector(".onepage__img");
    const target = document.querySelector(".click-target");
    if (!img || !target) return;

    const baseW = 1080;
    const baseH = 2554;
    
    const dw = img.clientWidth;
    const dh = img.clientHeight;

    const sx = dw / baseW;
    const sy = dh / baseH;

    // 비율에 따른 좌표 및 크기 계산
    const tx = Number(target.dataset.x) * sx;
    const ty = Number(target.dataset.y) * sy;
    const tw = Number(target.dataset.w) * sx;
    const th = Number(target.dataset.h) * sy;

    // 데이터 좌표에 비율을 곱해 절대 위치 지정
    target.style.left = `${Number(target.dataset.x) * sx}px`;
    target.style.top = `${Number(target.dataset.y) * sy}px`;
    target.style.width = `${Number(target.dataset.w) * sx}px`;
    target.style.height = `${Number(target.dataset.h) * sy}px`;

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