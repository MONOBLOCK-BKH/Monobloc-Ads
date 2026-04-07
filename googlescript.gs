// 1

// 1. 신청서 제출 및 중복 체크 (POST 방식)
function doPost(e) {
  // ✅ '신청현황' 시트 지정
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("신청현황");
  SpreadsheetApp.flush();
  
  const now = new Date();
  // ✅ 핵심: 현재 월에 1을 더해 '이벤트 대상 월'을 설정
  const eventDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const eventMonth = eventDate.getMonth() + 1; 
  
  const timestamp = Utilities.formatDate(now, "GMT+9", "yyyy-MM-dd HH:mm:ss.SSS");
  const data = JSON.parse(e.postData.contents);

  const inputTel = data.tel.toString().replace(/[^0-9]/g, "");
  const inputName = data.name.trim();
  const inputEmail = data.email.trim();
  const inputContent = data.content ? data.content.trim() : "";

  // ✅ [추가] 빈 행(내용이 지워진 행)을 실제로 삭제하여 위로 밀기
  let tempRows = sheet.getDataRange().getValues();
  // 아래에서 위로 올라가며 지워야 행 번호가 꼬이지 않습니다.
  for (let i = tempRows.length - 1; i >= 1; i--) {
    // 성함(B열)과 연락처(C열)가 모두 비어있으면 관리자가 삭제한 것으로 간주
    if (!tempRows[i][1] && !tempRows[i][2]) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush(); // 삭제 작업 즉시 반영

  // ✅ 삭제 후 갱신된 데이터를 다시 읽어옴
  const rows = sheet.getDataRange().getValues();
  let currentMonthDataIndices = []; 
  // 중복 발생 시 결과를 담아둘 변수
  let duplicateResult = null;

  // ✅ 1. 데이터베이스 스캔 및 실시간 순번 계산용 리스트업
  for (let i = 1; i < rows.length; i++) {
    // A열에 기록된 신청시간이 아닌, 다른 열에 '대상 월'을 기록하지 않는다면 
    // 일단 기존 데이터의 신청 시간을 기준으로 판별하거나 로직을 정해야 합니다.
    // 여기서는 '신청한 달'이 아닌 '대상 월'을 기준으로 중복을 체크하도록 구성합니다.
    
    // 만약 시트에 '대상 월' 열을 따로 만들지 않았다면, 
    // 신청 시간(A열)이 현재 월(3월)인 데이터들을 뒤져서 중복을 찾습니다.
    const rowDate = new Date(rows[i][0]);
    // 빈 행 건너뛰기
    if (!rows[i][0] || isNaN(rowDate.getTime())) continue;

    const rowAppliedMonth = rowDate.getMonth() + 1;
    
    // 이번 달(신청 기간)에 들어온 데이터만 검증 대상으로 삼음
    if (rowAppliedMonth === (now.getMonth() + 1)) {
      // 실제 시트 행 번호(1-based) 저장
      currentMonthDataIndices.push(i + 1); 
      
      let savedName = rows[i][1] ? rows[i][1].toString().trim() : "";
      let savedTel = rows[i][2] ? rows[i][2].toString().replace(/[^0-9]/g, "") : "";
      let savedEmail = rows[i][3] ? rows[i][3].toString().trim() : "";
      let savedContent = rows[i][4] ? rows[i][4].toString() : "";

      // 실시간으로 현재 이 사람이 몇 번째인지 계산 (삭제된 행 제외)
      let currentOrder = currentMonthDataIndices.length;
      let currentStatusText = currentOrder <= 30 ? currentOrder + "번째" : "예비 " + (currentOrder - 30) + "번";

      // 중복 체크 (결과를 바로 리턴하지 않고 변수에 담아둠)
      if (savedTel === inputTel && !duplicateResult) {
        if (savedName === inputName && savedEmail === inputEmail) {          
          duplicateResult = {
            result: "fail", 
            message: `[신청 확인]\n${savedName}님, 이미 ${eventMonth}월 이벤트 신청이 완료되었습니다.\n\n` +
                     // ✅ 여기서 업데이트된 순번을 보여줌
                     `• 순번: ${currentStatusText}\n` + 
                     `• 사연: [ ${savedContent} ]\n\n` +
                     `※ 본인 확인이 완료되어 상세 정보를 표시합니다.`
          };
        } else {
          let diffDetail = (savedEmail !== inputEmail) ? "이메일" : "성함";
          duplicateResult = {
            result: "fail",
            message: `이미 등록된 연락처입니다.\n\n입력하신 [${diffDetail}] 정보가 기존 신청 정보와 일치하지 않습니다.`
          };
        }
      }

      if (savedEmail === inputEmail && savedTel !== inputTel && !duplicateResult) {
        duplicateResult = {
          result: "fail",
          message: `이미 사용 중인 이메일 주소입니다.`
        };
      }
    }
  }

  // ✅ 2. [핵심] 기존 데이터 순번 실시간 업데이트 (중복이든 신규든 상관없이 일단 시트 정리)
  for (let j = 0; j < currentMonthDataIndices.length; j++) {
    let rowNum = currentMonthDataIndices[j];
    let orderNum = j + 1;
    let newStatusText = orderNum <= 30 ? orderNum + "번째" : "예비 " + (orderNum - 30) + "번";
    // 시트의 기존 값과 다를 때만 업데이트 (속도 향상)
    if (rows[rowNum-1][5] !== newStatusText) {
      sheet.getRange(rowNum, 6).setValue(newStatusText);
    }
  }

  // 🚨 [핵심] 중복 조회일 경우 여기서 종료 (메일 발송 안 함)
  if (duplicateResult) {
    return ContentService.createTextOutput(JSON.stringify(duplicateResult)).setMimeType(ContentService.MimeType.JSON);
  }

  // ✅ 3. 신규 신청자 기간 제한 검사
  const getFirstWorkingDayServer = (year, month) => {
    const holidays = ["2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-03-01", "2026-03-02", "2026-05-05", "2026-05-24", "2026-05-25", "2026-06-06", "2026-08-15", "2026-08-17", "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-28", "2026-10-03", "2026-10-09", "2026-12-25"];
    let date = new Date(year, month, 1, 9, 0, 0);
    while (true) {
      const dayOfWeek = date.getDay();
      const dateStr = Utilities.formatDate(date, "GMT+9", "yyyy-MM-dd");
      if (dayOfWeek === 0 || dayOfWeek === 6 || holidays.indexOf(dateStr) !== -1) {
        date.setDate(date.getDate() + 1);
      } else { break; }
    }
    return date;
  };

  const startDay = getFirstWorkingDayServer(now.getFullYear(), now.getMonth());
  // 마감은 월말까지.
  const endDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  if (now < startDay) {
    const m = startDay.getMonth() + 1;
    const d = startDay.getDate();
    return ContentService.createTextOutput(JSON.stringify({
      result: "fail",
      message: `현재는 신청 기간이 아닙니다.\n이번 달은 ${m}월 ${d}일 09:00부터 신청 가능합니다.`
    })).setMimeType(ContentService.MimeType.JSON);
  }
  if (now > endDay) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "fail",
      message: `이번 달 신청 기간이 마감되었습니다.\n(매월 말일 종료)`
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ✅ 3. 마감 체크 (정원 50명 기준)
  if (currentMonthDataIndices.length >= 50) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "full",
      message: `죄송합니다. ${eventMonth}월달 게시 이벤트 모집이 이미 마감되었습니다.`
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ✅ 5. 신규 신청자 기록
  const nextNum = currentMonthDataIndices.length + 1; 
  const statusText = nextNum <= 30 ? nextNum + "번째" : "예비 " + (nextNum - 30) + "번";
  
  // 4. 데이터 기록
  sheet.appendRow([
    "'" + timestamp, 
    inputName, 
    "'" + inputTel, 
    inputEmail, 
    inputContent, 
    statusText
  ]);
  SpreadsheetApp.flush();

  // -------------------------------------------------------------------------
  // 📧 [업데이트] 관리자 및 신청자 이메일 알림 발송 (noreply 적용)
  // -------------------------------------------------------------------------
  try {
    const fromAddress = "noreply@monobloc.co.kr"; // 발신 전용 계정
    const senderName = "Monobloc Operation Team"; // 표시될 발신인 이름

    // 발신 옵션 공통 설정 (반드시 Gmail에 등록된 noreply 주소여야 합니다)
    const mailOptions = {
      from: fromAddress,
      name: senderName
    };

    // 1. 관리자 알림용 세팅
    const adminEmails = "mono@monobloc.co.kr, yellow@monobloc.co.kr, spilky67@monobloc.co.kr, aiden@monobloc.co.kr, kimbs0712@junggu.seoul.kr";
    const adminSubject = `[신규 신청] ${eventMonth}월 이벤트 신청 접수 (${inputName}님)`;
    const adminBody = `새로운 이벤트 신청이 접수되었습니다.\n\n` +
                      `• 성함: ${inputName}\n` +
                      `• 연락처: ${inputTel}\n` +
                      `• 이메일: ${inputEmail}\n` +
                      `• 순번: ${statusText}\n` +
                      `• 사연: ${inputContent}\n\n` +
                      `구글 시트에서 상세 내용을 확인하세요.\n` +
                      `https://docs.google.com/spreadsheets/d/190gYbqNm3-nEEYrmWKBJ0w-njifasrKRZhUt541dSOY/edit?usp=sharing`;
    
    // 2. 신청자 확인용 세팅 (자동 답장)
    const userSubject = `[스마트 쉼터] ${inputName}님의  ${eventMonth}월의 소중한 사연이 정상적으로 접수되었습니다.`;
    const userBody = `안녕하세요, ${inputName}님!\n\n` +
                     `우리 동네 스마트 쉼터의 ‘광고 이벤트’에 사연을 보내주셔서 진심으로 감사합니다.\n\n` +
                     `[접수 내용 확인]\n` +
                     `• 신청 월: ${eventMonth}월\n` +
                     `• 신청 순번: ${statusText}\n` +
                     `• 작성 사연: [ ${inputContent} ]\n\n` +
                     `선정된 사연은 화면에 게시될 디자인 작업 논의 및 안내를 위해 추후 개별적으로 연락 드릴 예정입니다.\n` +
                     `기분 좋은 소식으로 다시 연락드리겠습니다.\n\n` +
                     `※ 본 메일은 발신 전용으로 회신이 되지 않습니다.\n` +
                     `감사합니다.\n${senderName} 드림`;

    // 관리자와 신청자에게 각각 발송 (MailApp 대신 기능이 더 많은 GmailApp 사용)
    GmailApp.sendEmail(adminEmails, adminSubject, adminBody, mailOptions);
    // 신청자에게는 입력한 이메일로 자동 답장 발송
    GmailApp.sendEmail(inputEmail, userSubject, userBody, mailOptions);

  } catch (err) {
    console.log("메일 알림 발송 실패: " + err.toString());
  }
  // -------------------------------------------------------------------------
  
  return ContentService.createTextOutput(JSON.stringify({
    result: "success", 
    message: `${eventMonth}월에 게시될 이벤트에 ${statusText}로 신청되었습니다!`
  })).setMimeType(ContentService.MimeType.JSON);
}