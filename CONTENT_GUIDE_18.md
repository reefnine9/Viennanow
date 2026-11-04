# ViennaNow 18단계 — 관광명소 콘텐츠 설계 / Editorial Content Specification

## 화면 정보 구조
1. 대표 사진(원본 링크·저작권 제공) + 명소명(한국어, 독일어 원어)
2. 한국어/EN 설명 전환 — 짧은 개요 + 볼거리 2개
3. 권장 방문시간(기획용 범위) 및 입장료 유형(실내 유료, 야외 무료, 혼합)
4. 운영시간·마지막 입장·날짜 예외가 있으면 조건부로 안내
5. 예약 조건 및 현지 여행 팁
6. 공식 기관/관광안내 링크; 없으면 검증 대기
7. 지도 열기 / ♡ 가고 싶은 곳 저장 / 일정 만들기(검증된 16곳만)

## JSON 필드
- `overview_ko`, `overview_en`: 사용자용 소개 — 자체 작성
- `highlights_ko`, `highlights_en`: 미리 확인할 볼거리 2개
- `tip_ko`, `tip_en`: 관광객 현장 팁
- `estimated_minutes_min`, `estimated_minutes_max`: 일정용 추정 체류시간
- `price_type`: `free_public`, `free_grounds`, `paid_indoor`, `mixed`, `verify`
- `price_example_ko/en`: *공식 자료 조회일 기준* 확인된 숫자만
- `hours_note_ko/en`: 운용시간·휴관일·시즌 예외가 반영된 주의문
- `booking_ko/en`: 공연, 입장 시간대, 신분증 등 예약 관련 조건
- `official_url`: 장소별 공개 정보 URL; 미확인 시 null
- `official_link_status`: `direct_source_checked` 또는 `not_yet_attached`
- `operational_status`: `partially_checked` 또는 `needs_date_check`
- `planner_eligible`: 첫 출시 범위의 대표 16곳만 true
- `last_editorial_review`: 콘텐츠 검토 날짜. **실시간 데이터 최종 갱신 날짜와 다름**

## 근거 페이지 예시 (2026-11-04 확인)
- 쇤브룬 궁전 (시즌·예외): https://www.schoenbrunn.at/en/visitor-information/opening-times
- 상벨베데레: https://www.belvedere.at/en/visit/upper-belvedere
- 황실 보물관 (시간지정): https://www.kaiserliche-schatzkammer.at/besuchen/besucherinformation/oeffnungszeiten-eintrittspreise/
- 시시 박물관 (공사 임시단축): https://www.sisimuseum-hofburg.at/en/visitor-information/opening-hours/
- 레오폴트 미술관: https://www.leopoldmuseum.org/en/visit/opening-hours
- 모차르트 하우스 (마지막 입장): https://www.mozarthausvienna.at/en/plan-your-visit
- 자연사박물관 (화요일/특별일): https://www.nhm.at/en/information
- 제체시온: https://secession.at/en/information_tickets
- 국회의사당 방문자센터: https://www.parlament.gv.at/en/experience/visitor-center
- 쇤브룬 동물원: https://www.zoovienna.at/besuch-und-tickets/besucherinformation/
- 글로리에테: https://www.schoenbrunn.at/en/visitor-information/opening-times
- 중앙묘지: https://www.bestattungwien.at/web/friedhofe-wien/visit-vienna-central-cemetery
- 앙커 시계: https://www.wien.info/en/see-do/sights-from-a-to-z/anker-clock-339092
- 오토 바그너 파빌리온: https://www.wienmuseum.at/otto_wagner_pavillon_karlsplatz
- 아우가르텐 정원: https://www.bundesgaerten.at/augarten/oeffnungszeiten.html

**주의**: 출처 URL이 있다고 해당 시설의 2027년 이후 시간표를 확인한 것은 아닙니다. 일반 관광 가이드 정보와 시간 제약을 구분해 표시해야 합니다. 사진 라이선스도 별도 검증이 필요합니다.
