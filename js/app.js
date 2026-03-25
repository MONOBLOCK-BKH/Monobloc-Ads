(() => {
  // 디버그 모드 확인
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const setupClickArea = (figure) => {
    const img = figure.querySelector(".onepage__img");
    const target = figure.querySelector(".click-target");
    if (!img || !target) return;

    // 원본 이미지 기준 사이즈 및 좌표
    const baseW = Number(img.dataset.baseW);
    const baseH = Number(img.dataset.baseH);
    const targetX = Number(target.dataset.x);
    const targetY = Number(target.dataset.y);

    // 현재 화면의 이미지 사이즈
    const dw = img.clientWidth;
    const dh = img.clientHeight;

    if (!dw || !dh) return;

    // 비율 계산
    const sx = dw / baseW;
    const sy = dh / baseH;

    // 1. 투명 클릭 영역 위치 및 크기 조절 (CSS에서 transform-origin: center 설정됨)
    target.style.left = `${targetX * sx}px`;
    target.style.top = `${targetY * sy}px`;
    
    // 원본 크기(300x120)도 비율에 맞게 조절
    target.style.width = `${300 * sx}px`; 
    target.style.height = `${120 * sy}px`;

    // 2. ✅ 클릭 아이콘 이미지 동적 생성 및 배치 (예시 페이지 핵심 기능)
    // 중복 생성 방지
    if (!figure.querySelector(".click-icon")) {
      const iconImg = document.createElement("img");
      iconImg.src = "/images/click_icon.png"; // ✅ 반짝이는 아이콘 이미지 파일 필요
      iconImg.className = "click-icon";
      
      // 아이콘 크기 설정 (화면 크기에 비례하여 조절, 원본 기준 약 150px 정도로 가정)
      const iconSize = 150 * sx;
      iconImg.style.width = `${iconSize}px`;
      iconImg.style.height = `${iconSize}px`;
      
      // target과 같은 중심점에 배치
      iconImg.style.left = `${targetX * sx}px`;
      iconImg.style.top = `${targetY * sy}px`;
      
      figure.appendChild(iconImg);
    } else {
      // 리사이즈 시 위치만 재조정
      const iconImg = figure.querySelector(".click-icon");
      const iconSize = 150 * sx;
      iconImg.style.width = `${iconSize}px`;
      iconImg.style.height = `${iconSize}px`;
      iconImg.style.left = `${targetX * sx}px`;
      iconImg.style.top = `${targetY * sy}px`;
    }

    // 3. 클릭 이벤트 바인딩
    target.onclick = () => {
      const tel = target.dataset.tel;
      if (tel) {
        window.location.href = `tel:${tel}`;
      }
    };
  };

  const run = () => {
    const figures = document.querySelectorAll(".onepage");
    figures.forEach(setupClickArea);
    
    // 화면 크기 변경 시 재계산
    window.addEventListener("resize", () => figures.forEach(setupClickArea));
  };

  // 이미지 로드 후 실행
  const img = document.querySelector(".onepage__img");
  if (img.complete) {
    run();
  } else {
    img.addEventListener("load", run);
  }
})();