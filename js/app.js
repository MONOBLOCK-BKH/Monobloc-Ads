(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  // ✅ 구글 웹 앱 주소
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyCbGzZpO_Xft_3YmNQv1wmcow5AroevZsqJSQzo8RIMhCQfP3aLHLExBIbCOL4qi8NSQ/exec";
  
  const setup = () => {
    const img = document.querySelector(".onepage__img");
    const target = document.querySelector(".click-target");
    const modal = document.getElementById("modal");
    if (!img || !target) return;

    const baseW = 1080;
    const baseH = 2554;
    
    const dw = img.clientWidth;
    const dh = img.clientHeight;

    const sx = dw / baseW;
    const sy = dh / baseH;

    // 데이터 좌표에 비율을 곱해 절대 위치 지정 (기존 로직 동일)
    target.style.left = `${Number(target.dataset.x) * sx}px`;
    target.style.top = `${Number(target.dataset.y) * sy}px`;
    target.style.width = `${Number(target.dataset.w) * sx}px`;
    target.style.height = `${Number(target.dataset.h) * sy}px`;

    // ✅ [변경] 클릭 시 전화걸기 대신 모달(신청란) 띄우기
    target.onclick = (e) => {
      e.preventDefault();
      if (modal) modal.style.display = "flex";
    };
    
    // 모달 닫기 버튼
    const closeBtn = document.getElementById("closeBtn");
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };
  };

  // --------------------------------------------------
  // [추가] 신청서 전송 로직 (기존 코드에는 없던 새 기능)
  // --------------------------------------------------
  applyForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submitBtn");
    
    const name = document.getElementById("userName").value.trim();
    const tel = document.getElementById("userTel").value.replace(/[^0-9]/g, ''); 
    const email = document.getElementById("userEmail").value.trim();
    const content = document.getElementById("applyContent").value.trim();

    // ✅ 가짜 번호/이메일 차단 로직 추가
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

  const img = document.querySelector(".onepage__img");
  if (img.complete) setup();
  else img.addEventListener("load", setup);

  window.addEventListener("resize", setup);
})();