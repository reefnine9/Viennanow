# ViennaNow GitHub + Cloudflare 배포 (설치 없이 웹브라우저 사용 가능)

## 1. GitHub에 코드 저장하기

1. https://github.com/new 에서 새 저장소 `viennanow` 생성. 처음에는 **Private** 추천.
2. ZIP 파일을 풀고 프로젝트 **폴더 안의 내용 전체**를 저장소 최상단(root)에 업로드합니다. GitHub 웹사이트의 `Add file` → `Upload files` 또는 Mac의 GitHub Desktop을 사용하세요.
3. `public/`, `functions/`, `lib/`, `package.json`, `README.md`가 저장소 최상단에 보여야 합니다. **ZIP 파일만 한 개 업로드하면 안 됩니다.**
4. `ORS_API_KEY`, `.dev.vars`, API 비밀키가 들어 있는 파일은 GitHub에 업로드하면 안 됩니다.

## 2. Cloudflare Pages와 GitHub 연결하기

1. https://dash.cloudflare.com 에 로그인하고 `Workers & Pages` → `Create application` → `Pages` → **Git repository 연결**을 선택합니다. (화면 문구는 변경될 수 있음.)
2. GitHub를 승인하고 `viennanow` 저장소만 연결하도록 접근 범위를 정합니다.
3. Cloudflare Pages 새 프로젝트의 설정:

| 항목 | 설정값 |
|---|---|
| Framework preset | None / No framework |
| Production branch | `main` |
| Build command | `exit 0` (또는 `true`) |
| Build output directory | `public` |
| Root directory | 저장소 루트 |

`functions/api/*.js`는 Cloudflare Pages가 자동으로 Pages Functions로 배포합니다. `public/_routes.json`은 정적 파일을 함수 요금에 포함하지 않도록 `/api/*`만 동적으로 처리합니다.

4. `Deploy`를 누르면 `https://<프로젝트명>.pages.dev` 주소가 생성됩니다.

## 3. 도보 경로 API 키 설정 (선택사항)

Cloudflare 프로젝트 → `Settings` → `Variables and Secrets` (또는 `Environment variables`) → 새 Secret 추가:

- Name: `ORS_API_KEY`
- Value: openrouteservice/HeiGIT에서 발급받은 개인 API 키
- Scope: Production (Preview도 사용하면 Preview에도 별도 설정)

환경 변수를 변경했다면 **새 배포를 시작**합니다. 브라우저 화면이나 GitHub 소스코드에 키를 입력하지 마세요.

API 키를 설정하지 않아도 관광지 탐색, 일정 생성, 수동 경로 확인은 작동합니다. 도보 자동 경로 계산만 이용할 수 없습니다.

## 4. 첫 배포 후 테스트

`https://<프로젝트명>.pages.dev/` 에서 5개 메뉴 표시, 사진, iPhone Safari의 큰 지도, 관광지 상세, 일정 생성/저장을 확인하세요.

추가 점검 주소:

- `/api/route-status` — JSON으로 구성 여부 확인. `configured:false`이면 비밀키 미설정.
- `/api/diagnostics?layer=wc` — 공공화장실 WFS **표본 검사**.
- `/api/diagnostics?layer=water` — 음용 식수대 표본 검사.
- `/api/diagnostics?layer=stops` — 정류장 표본 검사.
- `/api/route?from=A01&to=A02` — 설정된 경우 실제 도보 경로 시험.
- `/deploy-check.html` — 이미지·서버 진단.
- `/health.html` — 시설 데이터 품질 점검.

기존의 근사 위치 데이터는 출입구 검증 전이므로 관광객에게 실제 이동 경로가 확정됐다고 표시하지 마세요.

## 5. 개발·배포 방법

수정 후 GitHub `main` 브랜치로 커밋하면 Cloudflare Pages가 자동 배포합니다. 배포 내역과 Preview 배포도 Cloudflare에서 확인할 수 있습니다.

Windows 업무 PC처럼 설치 권한이 없는 환경에서도 GitHub 웹사이트에서 HTML을 편집하고 저장할 수 있습니다. Node.js가 가능한 개인 Mac에서는 `npm test`와 `npm run check`로 변경 사항을 배포 전에 시험하세요.

## 6. 무료 플랜 및 비용 주의

- Cloudflare 정적 페이지 요청은 무료입니다. API/Functions는 Workers Free 사용량 한도 (현재 100,000 요청/일)가 적용됩니다.
- 이미지 CDN, OpenStreetMap 타일 서버, WFS·경로 API는 각각 별도 사용 정책과 제한이 있습니다. OSM 공용 타일을 상업적 대규모 트래픽에 제한 없이 쓰면 안 됩니다.
- 기능 동작 여부는 **실제 배포 후** 확인해야 하며, 로컬 자동 테스트는 서비스 연결을 증명하지 않습니다.

Cloudflare 공식 문서:
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/functions/routing/
- https://developers.cloudflare.com/pages/functions/bindings/
