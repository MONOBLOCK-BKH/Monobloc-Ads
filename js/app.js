(() => {
  const params = new URLSearchParams(window.location.search);
  // 주소창 뒤에 ?debug 를 붙이면 버튼 위치를 빨간 선으로 확인할 수 있습니다.
  if (params.has("debug")) document.body.classList.add("debug");

  // ✅ 구글 웹 앱 주소
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyCbGzZpO_Xft_3YmNQv1wmcow5AroevZsqJSQzo8RIMhCQfP3aLHLExBIbCOL4qi8NSQ/exec";
  
  const setup = () => {
    const img = document.querySelector(".onepage__img");
    const targets = document.querySelectorAll(".click-target"); // 모든 버튼 찾기
    const modal = document.getElementById("modal");

    if (!img || targets.length === 0) return;

    const baseW = 1080;      
    const dw = img.clientWidth;

    // 가로 비율(sx)을 기준으로 세로 비율(sy)도 동일하게 적용 (이미지 비율 유지)
    const sx = dw / baseW;
    const sy = sx; 

    targets.forEach(t => {
      // 각 버튼의 좌표와 크기를 이미지 비율에 맞춰 재설정
      t.style.left = `${Number(t.dataset.x) * sx}px`;
      t.style.top = `${Number(t.dataset.y) * sy}px`;
      t.style.width = `${Number(t.dataset.w) * sx}px`;
      t.style.height = `${Number(t.dataset.h) * sy}px`;

      // 광고 신청 버튼(onclick 속성이 있는 경우)은 기존 링크 유지, 없는 경우에만 모달 띄움
      if (!t.hasAttribute('onclick')) {
        t.onclick = (e) => {
          e.preventDefault();
          if (modal) modal.style.display = "flex";
        };
      }
    });
    
    // 모달 닫기 버튼 설정
    const closeBtn = document.getElementById("closeBtn");
    if (closeBtn) closeBtn.onclick = () => { if (modal) modal.style.display = "none"; };
  };

  // 신청서 전송 로직
  const applyForm = document.getElementById("applyForm");
  if (applyForm) {
    applyForm.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("submitBtn");

      const name = document.getElementById("userName").value.trim();
      const tel = document.getElementById("userTel").value.replace(/[^0-9]/g, ''); 
      const email = document.getElementById("userEmail").value.trim();
      const content = document.getElementById("applyContent").value.trim();

      if (tel.length < 10 || tel.length > 11) {
        alert("연락처를 정확히 입력해주세요. (10~11자리 숫자)");
        return;
      }
      if (!email.includes("@") || !email.includes(".")) {
        alert("올바른 이메일 형식이 아닙니다.");
        return;
      }

      btn.disabled = true;
      btn.innerText = "처리 중...";

      try {
        const res = await fetch(GAS_URL, { method: "POST", body: JSON.stringify({ name, tel, email, content }) });
        const data = await res.json();
        alert(data.message);
        if (data.result === "success") {
          document.getElementById("modal").style.display = "none";
          applyForm.reset();
        }
      } catch (err) {
        alert("연결 오류가 발생했습니다.");
      } finally {
        btn.disabled = false;
        btn.innerText = "신청하기";
      }
    };
  }

  // 이미지 로딩 상태에 따른 실행
  const mainImg = document.querySelector(".onepage__img");
  if (mainImg) {
    if (mainImg.complete) setup();
    else mainImg.addEventListener("load", setup);
  }

  // 화면 크기 변경 시 버튼 위치 재조정
  window.addEventListener("resize", setup);
})();