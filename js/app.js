(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) document.body.classList.add("debug");

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwzOOee9dAjL4QYAxSKgw29vn1PtxsR-C48Q7b1MaTjjw8qW6SAmOG89SGU_oYelkApxg/exec";
  
  // ✅ 주말 및 공휴일을 피해 첫 영업일(오전 9시)을 찾는 함수
  const getFirstWorkingDay = (year, month) => {
    // 💡 여기에 쉬는 날(공휴일, 대체휴무일 등)을 YYYY-MM-DD 형식으로 적어주세요.
    const holidays = [
      // --- 2026년 ---
      "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", // 신정, 설날 연휴
      "2026-03-01", "2026-03-02", // 삼일절 및 대체휴일
      "2026-05-05", "2026-05-24", "2026-05-25", // 어린이날, 부처님오신날 및 대체휴일
      "2026-06-06", // 현충일
      "2026-08-15", "2026-08-17", // 광복절 및 대체휴일
      "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-28", // 추석 연휴 및 대체휴일
      "2026-10-03", "2026-10-09", // 개천절, 한글날
      "2026-12-25", // 크리스마스

      // --- 2027년 ---
      "2027-01-01", // 신정
      "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09", // 설날 연휴 및 대체휴일
      "2027-03-01", // 삼일절
      "2027-05-05", "2027-05-13", // 어린이날, 부처님오신날
      "2027-06-06", "2027-08-15", "2027-08-16", // 현충일, 광복절 및 대체휴일
      "2027-10-03", "2027-10-04", "2027-10-05", "2027-10-06", // 추석 연휴 및 개천절 대체휴일
      "2027-10-07", "2027-10-08", "2027-10-09", "2027-10-11", // 징검다리 연휴 및 한글날 대체휴일
      "2027-12-25", "2027-12-27" // 크리스마스 및 대체휴일
    ];

    let date = new Date(year, month, 1, 9, 0, 0); // 매월 1일 09시 00분 00초부터 시작

    while (true) {
      const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
      
      // 날짜를 YYYY-MM-DD 형태로 변환하여 비교 준비
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      // 토/일요일이거나 holidays 배열에 있는 날짜라면 하루(24시간)를 더함
      if (dayOfWeek === 0 || dayOfWeek === 6 || holidays.includes(dateString)) {
        date.setDate(date.getDate() + 1);
      } else {
        break; // 평일 영업일을 찾으면 반복문 종료
      }
    }
    return date;
  };

  const setup = () => {
    // ---------------------------------------------------------
    // ✅ [추가] 화면 안내 텍스트 자동 업데이트 (매달 자동 계산)
    // ---------------------------------------------------------
    const now = new Date();
    const startDay = getFirstWorkingDay(now.getFullYear(), now.getMonth());
    const m = startDay.getMonth() + 1;
    const d = startDay.getDate();
    
    const periodText = document.getElementById("periodText");
    if (periodText) {
      periodText.innerHTML = `이번 달은 ${m}월 ${d}일 09:00부터<br>${m}월 20일 23:59:59까지 신청 가능합니다.<br>(30명 한정)`;
    }
    // ---------------------------------------------------------

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
    const headerCloseBtn = document.getElementById("headerCloseBtn"); // ✨ 추가
    if (closeBtn && modal) {
      closeBtn.onclick = () => { 
        modal.style.display = "none"; 
        if (applyForm) applyForm.reset(); 
      };
    }
    if (headerCloseBtn && modal) { // ✨ 추가
      headerCloseBtn.onclick = () => { 
        modal.style.display = "none"; 
        if (applyForm) applyForm.reset(); 
      };
    }

    // ✅ 2. 결과 모달 닫기 버튼 연결
    const resultCloseBtn = document.getElementById("resultCloseBtn");
    const resultHeaderCloseBtn = document.getElementById("resultHeaderCloseBtn"); // ✨ 추가
    const resultModal = document.getElementById("resultModal");
    if (resultCloseBtn && resultModal) {
      resultCloseBtn.onclick = () => { resultModal.style.display = "none"; };
    }
    if (resultHeaderCloseBtn && resultModal) { // ✨ 추가
      resultHeaderCloseBtn.onclick = () => { resultModal.style.display = "none"; };
    }
  };

  // 신청서 전송 로직
  const applyForm = document.getElementById("applyForm");
  if (applyForm) {
    applyForm.onsubmit = async (e) => {
      e.preventDefault();

      // ✅ 개인정보 동의 체크 여부 확인 로직
      // ✅ [추가] 브라우저 영어 메시지 대신 한국어 알림 처리
      const name = document.getElementById("userName").value.trim();
      const tel = document.getElementById("userTel").value.replace(/[^0-9]/g, ''); 
      const email = document.getElementById("userEmail").value.trim();
      const agreePrivacy = document.getElementById("agreePrivacy");

      if (!name) {
        alert("성함을 입력해주세요.");
        nameInput.focus();
        return;
      }
      if (!tel) {
        alert("연락처를 입력해주세요.");
        telInput.focus();
        return;
      }
      if (!email) {
         alert("이메일을 입력해주세요.");
          emailInput.focus();
          return;
      }
      if (agreePrivacy && !agreePrivacy.checked) {
        alert("개인정보 수집 및 이용에 동의해야 신청이 가능합니다.");
        agreePrivacy.focus();
        return;
      }

      const btn = document.getElementById("submitBtn");
      const modal = document.getElementById("modal");
      const resultModal = document.getElementById("resultModal");
      const resultText = document.getElementById("resultText");
      const content = document.getElementById("applyContent").value.trim();

      if (tel.length < 10 || tel.length > 11) {
        alert("연락처를 정확히 입력해주세요. (10~11자리 숫자)");
        telInput.focus();
        return;
      }
      if (!email.includes("@") || !email.includes(".")) {
        alert("올바른 이메일 형식이 아닙니다.");
        emailInput.focus();
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