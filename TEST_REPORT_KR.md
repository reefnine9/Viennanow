# ViennaNow Cloudflare 전환 테스트 기록

- 날짜: 2026-11-04
- 원본: ViennaNow Phase 24 지도 수정본 (`ViennaNow_Phase24_MapFix`)
- 호스팅 전환: Netlify Functions → Cloudflare Pages Functions (`/api/*`)
- 정적 사이트: `public/` 전체 유지, 지도 타일 위치 스타일 포함
- 기능: 5개 하단 메뉴, 48 관광명소, 24개 카페/식당/공연/바·클럽, 일정 생성·편집·재계산, 사진 카드, GPS/지도, 시설 조회
- Node.js 22에서 `npm test` 실행: **99 / 99 통과**
- `npm run check`: **통과** (정적 파일·API 경로·탭·데이터 검사)
- Cloudflare API 모의 시험: 허용 레이어, WFS 좌표 처리, 표본 진단, API 키 비노출, 도보 응답, 상류 429 오류 처리 통과

## 검증되지 않은 항목

- 실제 사용자의 GitHub 저장소 생성·업로드 및 Cloudflare Pages 계정 배포
- Cloudflare Pages 빌드 시스템의 실배포 성공 여부
- 실인터넷 비엔나시 WFS, openrouteservice/HeiGIT 응답
- 실제 iPhone 지도 타일, 사진 외부 URL 로딩 및 72곳 개별 사진 라이선스 전체 확인
- 관광명소 16곳의 출입구 위치 정밀 검증

## 꼭 확인할 배포 직후 점검

1. 첫 화면과 5개 메뉴
2. `내주변`에서 화면의 대부분을 차지하는 지도 타일이 정렬돼 보이는지
3. `/api/route-status`가 JSON을 반환하는지
4. `/api/diagnostics?layer=wc`가 표본 데이터를 반환하는지
5. 도보 키 입력 후 `/api/route?from=A01&to=A02` 응답이 `status:ok`인지
6. 원격 이미지 누락 시 장소 이름 대체 화면이 표시되는지
7. 여행 일정 생성·편집 및 브라우저 재시작 후 데이터 보존
