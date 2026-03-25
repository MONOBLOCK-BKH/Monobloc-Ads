(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const setupClickArea = (figure) => {
    const img = figure.querySelector(".onepage__img");
    const target = figure.querySelector(".click-target");
    if (!img || !target) return;

    const baseW = Number(img.dataset.baseW);
    const baseH = Number(img.dataset.baseH);
    const targetX = Number(target.dataset.x);
    const targetY = Number(target.dataset.y);

    const dw = img.clientWidth;
    const dh = img.clientHeight;
    if (!dw || !dh) return;

    const sx = dw / baseW;
    const sy = dh / baseH;

    // 1. 투명 클릭 영역 크기 및 위치 (문의처 텍스트 크기에 맞춰 조절)
    target.style.left = `${targetX * sx}px`;
    target.style.top = `${targetY * sy}px`;
    target.style.width = `${350 * sx}px`; 
    target.style.height = `${100 * sy}px`;

    // 2. 클릭 유도 아이콘 생성 및 리사이징
    let iconImg = figure.querySelector(".click-icon");
    if (!iconImg) {
      iconImg = document.createElement("img");
      iconImg.src = "/images/click_icon.png"; // ✅ 해당 경로에 아이콘 이미지가 있어야 함
      iconImg.className = "click-icon";
      figure.appendChild(iconImg);
    }
    
    // 아이콘 크기를 화면 비율에 맞게 (약 100px 기준)
    const iconSize = 100 * sx;
    iconImg.style.width = `${iconSize}px`;
    iconImg.style.height = `${iconSize}px`;
    iconImg.style.left = `${targetX * sx}px`;
    iconImg.style.top = `${targetY * sy}px`;

    // 3. 전화걸기 동작
    target.onclick = () => {
      const tel = target.dataset.tel;
      if (tel) window.location.href = `tel:${tel}`;
    };
  };

  const run = () => {
    const figures = document.querySelectorAll(".onepage");
    figures.forEach(setupClickArea);
    window.addEventListener("resize", () => figures.forEach(setupClickArea));
  };

  const img = document.querySelector(".onepage__img");
  if (img.complete) run();
  else img.addEventListener("load", run);
})();