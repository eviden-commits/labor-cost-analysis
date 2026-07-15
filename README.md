# 노무비 분석 및 적정성 판단 프로그램

사양서: [사양서.md](./사양서.md)

## 초기 설정 (직접 진행 필요 항목)

clasp 로그인/스크립트 생성은 본인 Google 계정 인증이 필요해서 아래 명령은 직접 실행해야 합니다.

```
npm install
npx clasp login
npx clasp create --type webapp --title "노무비 분석" --rootDir ./src
```

`clasp create`를 실행하면 `.clasp.json`이 생성되고 새 Google Sheets(또는 연결할 스프레드시트)와
Apps Script 프로젝트가 만들어집니다. 이후 스프레드시트 ID를 스크립트 속성에 등록해야 합니다.

Apps Script 편집기(확장 프로그램 > Apps Script) 또는 `clasp open-script` 후
프로젝트 설정 > 스크립트 속성에서 `SPREADSHEET_ID` 값을 등록하세요.

## 코드 push

```
npm run push
```

## 폴더 구조

```
src/
  appsscript.json      GAS 매니페스트 (webapp 설정)
  Code.js              doGet 라우팅
  Auth.js              로그인 처리 (미구현 - 로그인 방식 확정 필요)
  SheetService.js       스프레드시트 접근 헬퍼
  UserLogin.html        사용자 로그인 화면
  AdminLogin.html        어드민 로그인 화면
  UserDashboard.html    사용자 - 노무비 적정성 확인
  AdminDashboard.html   어드민 - 노임 추이
```
