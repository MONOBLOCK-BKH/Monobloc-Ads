(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwjkiKwJ2X2G6YXkyouwd2QcX6qJGwlkk1e7i5tLUm3hVxX5RZMOV8AjdzmvRI5_stsAA/exec";

  const setup = () => {
    const img = document.querySelector(".onepage__img");
    const targets = document.querySelectorAll(".click-target");
    const modal = document.getElementById("modal");
    const applyForm = document.getElementById("applyForm");

    if (!img || targets.length === 0) return;

    const baseW = 1080;      
    const dw = img.clientWidth;
    const ratio = dw / baseW;

    targets.forEach(t => {
      // 1. 위치 및 크기 설정
      t.style.left = `${Number(t.dataset.x) * ratio}px`;
      t.style.top = `${Number(t.dataset.y) * ratio}px`;
      t.style.width = `${Number(t.dataset.w) * ratio}px`;
      t.style.height = `${Number(t.dataset.h) * ratio}px`;

      // 2. 클릭 이벤트 설정
      if (!t.hasAttribute('onclick')) {
        t.onclick = (e) => {
          e.preventDefault();
          if (modal) modal.style.display = "flex";
        };
      }
    });
    
    // ✅ 1. 신청 모달 닫기: 닫을 때 내용을 싹 지웁니다 (개인정보 보호)
    const closeBtn = document.getElementById("closeBtn");
    if (closeBtn && modal) {
      closeBtn.onclick = () => { 
        modal.style.display = "none"; 
        if (applyForm) applyForm.reset(); 
      };
    }

    // ✅ 2. 결과 모달 닫기 버튼 연결
    const resultCloseBtn = document.getElementById("resultCloseBtn");
    const resultModal = document.getElementById("resultModal");
    if (resultCloseBtn && resultModal) {
      resultCloseBtn.onclick = () => { resultModal.style.display = "none"; };
    }
  };

  // 신청서 전송 로직
  const applyForm = document.getElementById("applyForm");
  if (applyForm) {
    applyForm.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("submitBtn");
      const modal = document.getElementById("modal");
      const resultModal = document.getElementById("resultModal");
      const resultText = document.getElementById("resultText");

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
        
        // ✅ 3. 결과 알림창 대신 큰 메세지 모달 띄우기
        if (resultText && resultModal) {
          resultText.innerText = data.message;
          resultModal.style.display = "flex";
        }

        if (data.result === "success") {
          if (modal) modal.style.display = "none";
          applyForm.reset(); // 성공 시 폼 초기화
        }
      } catch (err) {
        alert("연결 오류가 발생했습니다.");
      } finally {
        btn.disabled = false;
        btn.innerText = "신청하기 / 순번 확인";
      }
    };
  }

  // 초기 실행 및 리사이즈 대응
  const mainImg = document.querySelector(".onepage__img");
  if (mainImg) {
    if (mainImg.complete) setup();
    else mainImg.addEventListener("load", setup);
  }
  window.addEventListener("resize", setup);
})();