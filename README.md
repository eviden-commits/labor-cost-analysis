# 노무비 분석 및 적정성 판단 프로그램

사양서: [사양서.md](./사양서.md)

## 초기 설정 (직접 진행 필요 항목)

clasp 로그인/스크립트 생성은 본인 Google 계정 인증이 필요해서 아래 명령은 직접 실행해야 합니다.

```
npm install
npx clasp login
npx clasp create --type webapp --title "노무비 분석" --rootDir ./src
```

`clasp create`를 실행하면 `.clasp.json`이 생성되고 Apps Script 프로젝트(standalone)가 만들어집니다.

이후 `clasp push`로 코드를 올린 뒤, Apps Script 편집기(확장 프로그램 > Apps Script 또는
`clasp open-script`)에서 함수 목록 중 `initializeWorkbook`을 선택해 한 번 실행하세요.
- 최초 실행 시 Google 계정 권한 승인 팝업이 뜹니다 (Drive/Sheets 접근 허용 필요)
- 실행되면 "노무비 분석 데이터"라는 이름의 새 스프레드시트가 내 구글 드라이브에 자동 생성되고,
  `EmployeeMaster`/`WageRecords` 시트와 헤더가 자동으로 만들어지며, 스프레드시트 ID가
  스크립트 속성 `SPREADSHEET_ID`에 자동 저장됩니다 (수동 등록 불필요)
- 실행 로그(또는 반환값)에 표시되는 URL로 생성된 스프레드시트를 바로 확인할 수 있습니다

xlsx 업로드 기능은 Advanced Drive Service(v3)를 사용합니다. `clasp push`로
`appsscript.json`의 `enabledAdvancedServices`가 반영되면 별도 설정 없이 동작해야 하지만,
안 될 경우 Apps Script 편집기 좌측 "서비스(Services)"에서 Drive API를 직접 추가하세요.

## 코드 push

```
npm run push
```

## 폴더 구조

```
src/
  appsscript.json      GAS 매니페스트 (webapp 설정, Advanced Drive Service)
  Code.js              doGet 라우팅
  Auth.js              로그인 처리 (미구현 - 로그인 방식 확정 필요)
  SheetService.js       스프레드시트 접근 헬퍼 (ensureSheet, findRowByValue 등)
  Setup.js             initializeWorkbook - 스프레드시트/시트/헤더 최초 자동 생성
  Preprocess.js        ERP xlsx 행 파싱/마스킹 로직 (Node에서도 테스트 가능)
  Upload.js            xlsx 업로드 → 임시 구글시트 변환 → EmployeeMaster/WageRecords 저장
  UserLogin.html        사용자 로그인 화면
  AdminLogin.html        어드민 로그인 화면
  UserDashboard.html    사용자 - 노무비 적정성 확인
  AdminDashboard.html   어드민 - 노임 추이, 데이터 업로드 버튼
test/
  preprocess.test.js    Preprocess.js 단위 테스트 (npm test)
```
