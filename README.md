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

이어서 `initializeCredentials`도 한 번 실행하세요. 최초 어드민 비밀번호가 랜덤 생성되어
반환값(실행 로그)에 **한 번만** 표시됩니다 — 꼭 적어두고, 어드민으로 로그인한 뒤
"비밀번호 관리"에서 admin/user 비밀번호를 원하는 값으로 바꾸세요. 사용자(user) 공용
비밀번호는 어드민이 로그인 후 직접 지정해야 초기 로그인이 가능합니다.

xlsx 업로드 기능은 Advanced Drive Service(v3)를 사용합니다. `clasp push`로
`appsscript.json`의 `enabledAdvancedServices`가 반영되면 별도 설정 없이 동작해야 하지만,
안 될 경우 Apps Script 편집기 좌측 "서비스(Services)"에서 Drive API를 직접 추가하세요.

**새 배포를 만들 때는 반드시 "액세스 권한이 있는 사용자"를 "모든 사용자"로 지정**하세요.
API(clasp deploy)로 만든 배포는 기본값이 "나만"이라 익명 접속이 막힙니다 — 배포 관리(Manage
deployments)에서 직접 "모든 사용자"로 바꿔야 합니다.

## 아키텍처: GAS는 JSON API, 화면은 GitHub Pages 정적 사이트

처음엔 GAS의 HtmlService로 로그인/대시보드 화면까지 직접 서빙했는데, Apps Script
웹앱이 쓰는 `googleusercontent.com` 샌드박스 iframe이 브라우저 환경(타사 쿠키 차단 등)에
따라 원인 파악이 어려운 빈 화면을 일으키는 문제가 있었다. 그래서 이전
`../complit/01_web_github_pages` 프로젝트와 동일한 구조로 전환:

- **GAS(`src/`)**: `doGet`/`doPost`로 JSON만 응답하는 API 서버 (화면 없음)
- **화면(`docs/`)**: 순수 정적 HTML/CSS/JS, GitHub Pages로 서빙, `fetch()`로 GAS API 호출

이 구조에서는 화면이 구글의 iframe 샌드박스를 전혀 거치지 않아서 이전의 빈 화면 문제가
원천적으로 발생하지 않는다. `docs/api.js`의 `API_BASE_URL`은 clasp deploy로 만든 `/exec`
URL을 그대로 가리키면 된다 (재배포해도 배포 ID가 같으면 URL은 바뀌지 않음).

## 코드 push

```
npm run push
```

## 폴더 구조

```
src/                   Google Apps Script (JSON API 백엔드)
  appsscript.json      GAS 매니페스트 (webapp 설정, Advanced Drive Service)
  Code.js              doGet/doPost 액션 라우팅 (healthCheck/login/uploadContractFile/setPassword)
  Auth.js              로그인/세션 처리 (역할별 공용 비밀번호 + 세션 토큰)
  Utils.js             JSON 응답/요청 파싱 헬퍼 (jsonOutput_, successResponse_ 등)
  SheetService.js       스프레드시트 접근 헬퍼 (ensureSheet, findRowByValue 등)
  Setup.js             initializeWorkbook/initializeCredentials - 최초 1회 자동 생성
  Preprocess.js        ERP xlsx 행 파싱/마스킹 로직 (Node에서도 테스트 가능)
  Upload.js            xlsx 업로드 → 임시 구글시트 변환 → EmployeeMaster/WageRecords 저장
docs/                  정적 프론트엔드 (GitHub Pages)
  index.html           로그인 화면 + 사용자/어드민 대시보드
  style.css            세방테크 브랜드 스타일
  api.js               apiGet/apiPost (fetch 기반 GAS API 클라이언트)
  app.js               로그인/업로드/비밀번호 변경 등 화면 로직
test/
  preprocess.test.js    Preprocess.js 단위 테스트 (npm test)
```
