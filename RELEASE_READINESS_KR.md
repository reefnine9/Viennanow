# ViennaNow Phase 24–29 공개 준비 검토 / Release Readiness

Updated: 2026-11-05. **개발·자동화 완료와 정식 출시 승인 여부는 다릅니다.** 아래의 미확인 항목이 해소되기 전에는 법적·저작권·모바일 품질이 최종 인증됐다고 표시하지 않습니다.

| Phase | 구현/검증 | 현재 결론 |
|---|---|---|
| 24 사진 | 48명소 출처 목록, 82맛집 중 21개 대표 사진 사용 검토 기록, 실패 시 대체 화면, 별도 출처 페이지. 사진 referrer policy/decoding 개선 | **부분 완료** — 61개 맛집은 사용권 확인 사진 없음. 자동 URL 검사 69 중 18은 주로 HTTP 429로 확인 보류 |
| 25 번역 | 한국어·영어 선택, 추천코스 영문 설명, 내주변 추천코스 지도 핀·팝업 영문 처리 및 양언어 테스트 | **부분 완료** — 모든 긴 문화·맛집 설명의 전문 번역 감수는 별도 작업 |
| 26 디자인 | 공통 버튼 모서리·터치 최소 높이, 모바일 320–430px/글씨확대 테스트, 정보 링크 통일 | **자동 검증 진행** — 실제 디자이너 시각적 전수 검수는 별도 |
| 27 지도·계획 | 추천코스 지도 경유지 연결, 미확인 경유지 별도 경고, 선택한 코스를 내주변에 유지, 찜 목록 저장·복원 테스트 | **부분 완료** — 위치 누락은 경유지 자동 생략. 실시간 보행·대중교통 경로로 오인되지 않도록 안내 필요 |
| 28 모바일 | Chromium Android 유사 환경 및 WebKit iOS Safari 유사 환경, 여러 화면 크기, 스와이프·세로스크롤·메뉴 자동 QA | **에뮬레이션 완료** — 실물 iPhone/Android 및 VoiceOver/TalkBack 검사 미진행 |
| 29 공개 전 고지 | `privacy.html`, `legal.html`, `photo-credits.html` 한국어·영어 자료와 홈 화면 링크, 자동 접근 검사 | **법적 최종 승인 아님** — 운영자/사업자 정보와 최종 개인정보 처리방침 필수 |

## 정식 공개 이전 필수 확인

1. **운영자 신원·주소·연락처·사업자정보**: 운영 형태에 따라 오스트리아 Impressum/ECG/MedienG 등의 요건을 검토하고, `public/legal.html` 초안의 보류 안내를 실제 고지로 교체할 것. 임의의 가짜 회사 정보는 입력하지 않음.
2. **개인정보 및 위치**: 현재 앱은 `localStorage.viennanow_p9`에 사용자의 일정·찜·언어·GPS 선택 기준점을 저장함. 실제 Cloudflare 요청 로그, 외부 지도/사진 요청, 개인정보 책임자/처리근거/보존기간, 삭제 절차를 검토하고 `public/privacy.html`을 완성할 것. 광고/분석 및 비필수 제3자 리소스는 동의 필요성 검토 선행.
3. **사진**: 개별 Wikimedia 원본 파일의 창작자 표시, 라이선스 버전, 가공/크롭, 공유조건, 건물·인물 권리, 장소 일치를 책임자가 직접 확인할 것. 특히 식당 61개 사진 미승인 상태 유지.
4. **방문 정보**: 식당 영업시간·휴업, 공연장 예약, 입장권, 운영 변경 여부와 관광지 주소를 실제 이용일 또는 정기 검수로 업데이트할 것.
5. **지도**: 근사 좌표와 생략된 경유지 재검토, 실시간 경로가 아닌 참고용 경유지 선분이라는 사실 유지. 실제 스마트폰 위치 권한 거부 시 사용성 확인.
6. **기기 QA**: 실물 iPhone Safari와 Android Chrome, 스와이프·세로 스크롤·접근성·저장 복원·오프라인/저속 네트워크에 대한 승인 기록 작성.
7. **보안/출시**: Cloudflare 배포 환경, 라이브 요청, CSP/외부 링크/의존성, 오류 로그와 광고 서비스 정책, 스토어·PWA 정책 등 검토.

## 참고 자료 (공식/원본)
- Austria WKO Impressum: https://www.wko.at/internetrecht/website-impressum
- WKO Datenschutz & Cookies: https://www.wko.at/dsgvo4kmu/datenschutz-webseiten-cookies
- Österreich Unternehmensserviceportal: https://www.usp.gv.at/themen/betrieb-und-umwelt/laufender-betrieb/weitere-informationen-laufender-betrieb/e-commerce-kompetenz/anleitungen-um-das-geschaeft-online-zu-bringen/rechtliche-pflichten-fuer-websites.html
- Creative Commons: https://creativecommons.org/cc-licenses/
- Wikimedia reuse: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/en

This checklist is engineering/editorial support and is not a substitute for qualified Austrian legal review.
