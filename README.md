# ViennaNow — GitHub + Cloudflare Pages 버전

**기준:** Phase 24 지도 수정본을 유지하고 Netlify 전용 함수만 Cloudflare Pages Functions로 전환했습니다.

- **하단 5개 메뉴:** 홈 / 볼거리 / 먹거리 / 계획 / 내주변
- **기존 콘텐츠:** 관광명소 48곳과 카페·식당·공연·술집·클럽 24곳
- **계획:** 일정 생성·편집, 날짜별 가능시간, 고정 예약, 현지 일정 재계산
- **지도:** Leaflet, 사용 시 GPS 권한 요청, 큰 내주변 지도, 지도 타일 위치 CSS 수정 유지
- **데이터:** 비엔나시 WFS 3종 및 openrouteservice 도보 경로; 실제 운영·실시간 예약 제공 아님

## 프로젝트 구조

```text
public/               Cloudflare Pages 정적 웹사이트 (빌드 결과 폴더)
  index.html           ViennaNow 앱
  _routes.json         /api/*만 Functions에 전달 (정적 요청 무료)
  _headers             보안·검색엔진 헤더
functions/api/         Cloudflare Pages Functions (GET)
  ogd.js               비엔나시 WFS 시설 데이터
  diagnostics.js       일부 표본 연결 진단
  route.js             도보 경로 프록시 (API 키 비공개)
  route-status.js      API 키 존재 여부만 확인
lib/                   기존 핵심 비즈니스 로직
scripts/               배포 전 자동 검사
 tests/                기존 및 신규 단위 테스트
```

**주의:** 이전 Netlify 계정과 프로젝트를 삭제하지 않아도 됩니다. 이 ZIP을 GitHub에 새 저장소로 업로드할 수 있습니다. Cloudflare 계정 연결 및 배포는 사용자가 승인해야 합니다.

개발 PC에 Python 설치는 필요 없습니다. GitHub 웹사이트 업로드와 Cloudflare 대시보드로 첫 배포가 가능합니다. 이후 수정할 때는 GitHub 저장소에 바뀐 파일을 업로드하면 자동 배포됩니다.

자세한 절차는 `GITHUB_CLOUDFLARE_SETUP_KR.md`를 참조하세요.

```sh
npm install
npm test
npm run check
npm run dev                 # Wrangler 로컬 테스트 (Node.js 필요)
```

API는 `/api/ogd?layer=wc`, `/api/diagnostics?layer=wc`, `/api/route-status`, `/api/route?from=A01&to=A02` 로 제공됩니다.

### 현재 검증 범위

Cloudflare Pages 실배포 및 외부 API 응답은 계정 연결 후 검증해야 합니다. 테스트는 모의 응답을 사용합니다. 장소 입구 좌표는 근사값이며, 48개 사진 온라인 로딩·라이선스 전체 검토가 완료된 것이 아닙니다.

비엔나시 OGD 출처: `Datenquelle: Stadt Wien – data.wien.gv.at`
