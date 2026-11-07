# ViennaNow 개발·운영 노트

**기준일:** 2026년 11월 6일 (비엔나)  
**정본 소스:** https://github.com/reefnine9/Viennanow (main)  
**웹앱:** https://viennanow.pages.dev  
**목적:** 새로운 대화에서도 현재 개발 상태, 파일 위치, 배포 방법, 계정·광고·스토어 진행상황을 정확히 복구하는 개발 인수인계 문서.

**표시 기준:** [확인] 실제 GitHub 파일/Actions 또는 사용자가 제공한 콘솔 화면으로 확인 / [부분] 코드가 있지만 실제 기기 또는 서비스 검증 필요 / [대기] 아직 완료 확인 불가. GitHub 코드 반영, 자동 빌드 성공, Play 스토어 업로드, 실기기 테스트는 각각 다른 단계다.

## 1. 한눈에 보는 현황

| 분야 | 현황 | 다음 확인 |
|---|---|---|
| 웹앱 | [확인] GitHub + Cloudflare Pages 구조 및 주소 | 마지막 Cloudflare 배포 성공/실제 브라우저 확인 |
| 주요 기능 | [확인] 홈, 볼거리, 맛집, 계획, 내주변, 한/영, 지도, 찜, 추천코스, 쇼핑 | 실기기 번역·UI·사진 QA |
| Android | [확인] Capacitor 기반 서명된 AAB versionCode 4 CI 성공 | 비공개 트랙에 v4 수동 업로드 및 기기 테스트 |
| Google Play | [부분] 비공개 테스트 트랙과 테스터 모집 준비 | 실제 등록된 테스터/참여 링크/연속 참여 기간 확인 |
| AdMob | [확인] 본인 AdMob 앱·배너 단위 생성, Android 앱 ID 연결 | 현재는 테스트 배너 요청, 계정/앱 승인 및 실기기 검증 필요 |
| iOS | [부분] Capacitor 설정과 iOS Simulator 빌드 워크플로 | 서명된 IPA·App Store/ TestFlight 미확인 |
| 공개 출시 | [대기] 법적 고지·사진 권리·정책·실기기 QA | 정식 출시 전 체크리스트 완료 |

**중요한 최신 확인:** GitHub Actions **Google Play signed AAB 실행 #17**이 2026-11-06 00:21 UTC 시작해 **success**로 완료. 실행: https://github.com/reefnine9/Viennanow/actions/runs/42136168779, 해당 커밋 1141f02a596369f02b34e7c99e533b45ae8ef475. 서명된 아티팩트 이름은 viennanow-google-play-signed-aab, ZIP 크기 약 6.5 MB, GitHub 표시 만료일은 **2026-11-13 00:22 UTC**. GitHub 성공만으로 실제 화면에서 광고가 나타나거나 Play에 자동 등록되지는 않는다.

## 2. 연결된 서비스와 식별자

| 용도 | 서비스/주소 | 프로젝트 식별자 |
|---|---|---|
| 소스코드·버전·자동빌드 | https://github.com/reefnine9/Viennanow | GitHub 계정 reefnine9, 저장소 Viennanow, branch main |
| 일반 웹사이트/PWA | https://viennanow.pages.dev | Cloudflare Pages 프로젝트 viennanow |
| 웹 배포 관리 | https://dash.cloudflare.com | Workers & Pages → viennanow |
| Android 앱 | https://play.google.com/console | 패키지명 app.viennanow.travel |
| Google Play 비공개 테스트 | Play Console | 트랙 이름 비공개트랙 비엔나우 (별도 Alpha 트랙과 구별) |
| 테스터 모집 | https://groups.google.com | ViennaNow Android Testers, viennanow-testers@googlegroups.com |
| 광고 관리 | https://admob.google.com | ViennaNow Android, ViennaNow Top Banner |
| GitHub Actions | https://github.com/reefnine9/Viennanow/actions | Google Play signed AAB 등 |

**테스터 가입 링크 후보:** https://groups.google.com/g/viennanow-testers/about. 그룹 주소에서 유추한 링크이므로 외부 구글 계정으로 실제 가입 동작을 확인해야 한다. **Play 비공개 테스트 참여 링크는 Play Console ‘테스트 참여 방법’에서 실제 표시된 링크를 복사해야 하며**, 추정 URL을 확정 링크로 안내하지 않는다.

**보안 메모:** 저장소는 현재 Public. 비밀번호, Google 계정 복구정보, 서명용 키 파일, Cloudflare API 토큰, ORS_API_KEY의 실제 값은 이 문서나 GitHub에 올리지 않는다.

## 3. 지금 프로그램은 어디에 있는가?

~~~
GitHub reefnine9/Viennanow (main)
  ├─ public/                        Cloudflare에서 제공하는 실제 웹 리소스
  │   ├─ index.html                 웹앱의 핵심 화면/코드 (수정 우선)
  │   ├─ data/restaurants.json      맛집 데이터
  │   ├─ catalog_48.json ...        관광명소·콘텐츠 데이터
  │   ├─ privacy.html               개인정보 안내: 아직 초안
  │   ├─ legal.html                 운영자/법적 고지: 아직 초안
  │   ├─ photo-credits.html         사진 출처
  │   ├─ manifest.webmanifest       설치형 웹앱(PWA) 설정
  │   └─ _routes.json               /api/*를 Pages Functions로 연결
  ├─ functions/api/                 Cloudflare Pages Functions
  │   ├─ ogd.js                     비엔나시 OGD 시설/화장실 데이터
  │   ├─ diagnostics.js             API 데이터 진단
  │   ├─ route.js                   도보 경로 프록시
  │   ├─ route-status.js            경로 API 키 설정 확인
  │   └─ _middleware.js             CORS
  ├─ lib/                           계획·경로·OGD 공통 로직
  ├─ tests/                         단위/회귀 테스트
  ├─ scripts/                       배포 검증, 아이콘, 네이티브/광고 스크립트
  │   ├─ build-native.mjs           웹 리소스를 앱용으로 복사 및 API 주소 변경
  │   └─ configure-android-test-ads.mjs  AdMob/UMP Android 생성 코드
  ├─ capacitor.config.ts            앱 ID/이름/웹 리소스 디렉터리
  ├─ package.json                   Node/Capacitor 의존성과 명령
  ├─ .github/workflows/             자동 테스트·AAB·iOS 검사
  ├─ DEVELOPMENT_STATUS.md          기존 상세 개발 이력/대화 인계
  ├─ QA_RELEASE_AUDIT_2026-11-05.md 데이터·사진·위치 QA
  ├─ RELEASE_READINESS_KR.md        정식 출시 준비
  ├─ docs/                          출시·패키징·본 개발 노트
  └─ index_old.html                 이전 개발 단계 HTML 보관본 (배포용 아님)
~~~

**매우 중요한 주의:** 저장소 루트의 오래된 화면은 **index_old.html**로 보관한다. 현재 앱의 유일한 배포 진입점은 **public/index.html**이며, **루트 index.html은 존재하지 않는다.** 예전 화면을 배포용에 덮어쓰면 최근 기능이 사라질 수 있다. 수정 전에 GitHub main 최신 HEAD와 파일 내용을 읽고 수정한다.

**웹과 Android의 관계:** 같은 public/ 웹 리소스를 공통 원본으로 사용한다. Android 빌드 때 scripts/build-native.mjs가 이를 dist-native/로 복사하고 /api 경로를 Cloudflare HTTPS 서버에 연결한 뒤 Capacitor WebView에 포함시킨다. 따라서 웹 디자인 수정은 Cloudflare 재배포 대상이고, Android 사용자가 받으려면 새 AAB도 필요하다.

## 4. 어떻게 여기까지 만들었는가 — 앱 기능과 결정

- **앱 목적:** 비엔나 방문 관광객이 볼거리·맛집·코스를 탐색하고 찜해서 여행 동선을 구성하는 모바일 우선 여행 가이드. 한국인 여행자 중심으로 시작해 영어 제공.
- **홈:** 대표 비엔나 사진, ‘비엔나 이야기’ 스토리(빨강·하양 깃발, 성당/괴물 이야기, 모차르트 관련 등), 여행정보와 추천 쇼핑목록.
- **볼거리:** 관광명소·박물관·공연장, 대표 사진, 역사/관람 설명, 저장용 빨간 하트, 큰 사진 상세와 타일·설명 목록 보기, 좌우 스와이프, 길찾기.
- **맛집:** 대표 맛집·현지 추천/미쉐린/빕 구르망 및 한식·아시아 분류, 주요 음식과 선정 이유, 음식·식당 사진, 즐겨찾기, Google 지도에서 상세정보 확인, 좌우 스와이프.
- **계획:** 추천 1일/반나절 코스 및 주제별 동선, 코스 경유지와 이동시간 정보, 코스 상세에서 내주변 지도 연결, 찜한 장소/계획 관리.
- **내주변:** GPS 또는 슈테판 성당 중심 이동, 볼거리·맛집·공공화장실 지도와 핀 팝업, 상세 연계, 저장한 곳만 보기, 지도 필터. 마커 클러스터링 제거 요청 반영.
- **지도:** Leaflet 기반 지도, basemap.at 고해상도 타일을 기본 방향으로 선택. 비용이 발생하는 Google Maps 지도 SDK 대신 자체 내주변 지도 + 외부 Google Maps 링크 사용. 비엔나시 OGD 공공시설 데이터를 연동.
- **시각 디자인:** V 강조 로고, 일정한 버튼 높이·모서리 둥글기·글씨 크기, 하트 색상 빨강, 하단 5개 메뉴, 상단 한/English 선택, 상세화면에서 손가락을 따라 움직이는 자연스러운 스와이프.
- **사진/번역:** 상업적 사용권과 원본 표시가 확실한 사진 위주 사용, 누락 시 중립 대체. 한국어/영어 전체 UI·상세·팝업 일관성을 목표로 번역 보완, 다만 최종 전수 검증은 남음.

**QA 감사 스냅샷 (2026-11-05):** 관광지 48개/식당 82개. 관광지 32개는 별도 도로주소가 없고 식당 22개는 주소, 15개는 좌표가 없다. 식당 사진 표지 중 검토 기록 21/82, 나머지 61/82는 라이선스 확인 미완료. 저장된 좌표는 실제 출입구·현장 경로를 보증하지 않는다. 이는 그날 기준 데이터 감사 수치이지 변하지 않는 최종 데이터 개수는 아니다.

## 5. GitHub와 Cloudflare Pages 배포

**왜 이전했나?** 초기 Netlify 웹앱 운영 중 크레딧 문제를 겪어 GitHub + Cloudflare Pages로 이전. 기존 대화에서 GitHub 자동 연결을 설정했다.

**기존 Cloudflare 설정 기록:**
- 프로젝트 이름: viennanow
- GitHub 생산 브랜치: main
- Framework preset: None / No framework
- Build command: exit 0 또는 동등한 no-op
- Build output directory: public
- Pages Functions: functions/api/*.js 자동 배포
- public/_routes.json에 /api/*만 함수 경유

**데이터/API:** 비엔나시 OGD WFS → /api/ogd?layer=wc 등의 엔드포인트. Cloudflare Pages의 외부 경로에서 지도·공공화장실 데이터 요청. openrouteservice 도보 경로에 필요한 ORS_API_KEY는 필요한 경우 Cloudflare Secret에 저장하며, 키 유무는 /api/route-status로 확인.

**배포/문제진단:** https://viennanow.pages.dev/deploy-check.html, /qa-smoke.html, /health.html, /api/diagnostics?layer=wc, /api/route-status. GitHub main 커밋 성공 = Cloudflare 실제 서비스 확인은 아니므로 대시보드의 배포 로그와 모바일 브라우저 작동을 별도로 본다. 이번 노트 작성 시 웹 실서버 상태는 직접 확인되지 않았다.

**기본 검사 명령:** npm install; npm test; npm run check; npm run check:stores; npm run check:native:release. Node.js 20 이상 필요. 작업용 Windows PC는 설치 권한 제약이 있었고, 웹 GitHub 편집 또는 Mac/GitHub Actions로 개발해 왔다.

## 6. Android / Google Play 빌드 프로세스

**도구/환경:** Capacitor 7; capacitor.config.ts: appId app.viennanow.travel, appName ViennaNow, webDir dist-native. GitHub Actions에서 Node 22, Java 21, Android API target/compile 36, 최소 SDK 24 사용.

**Google Play signed AAB 워크플로:** .github/workflows/google-play-aab.yml.
1. GitHub main의 최신 public/와 코드 checkout.
2. npm 의존성·앱 아이콘 생성; 자동 검사.
3. Android 프로젝트를 CI에서 생성 (현재 Android 프로젝트 폴더를 GitHub에 영구 저장하지 않는 방식).
4. scripts/build-native.mjs가 public/을 dist-native/에 복사, Cloudflare API origin 연결 후 Capacitor sync.
5. scripts/configure-android-test-ads.mjs가 AdMob 및 UMP Android 코드를 주입.
6. versionCode 4 설정 (이 문서 작성 시), GitHub Secrets에 저장한 암호화 업로드 서명키로 AAB 서명.
7. ./gradlew bundleRelease → viennanow-google-play-signed-aab 아티팩트 업로드.

**서명 Secret 이름(값 기록 금지):** ANDROID_ENCRYPTED_KEYSTORE_BASE64, ANDROID_KEY_BACKUP_PASSWORD, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD. 암호화된 원본 서명키 백업을 안전한 위치에 보존할 필요가 있다.

**별도 워크플로 주의:** native-android.yml은 디버그 APK 검사, native-ios.yml은 iOS 시뮬레이터 비서명 빌드 검사. Google Play 출시는 Google Play signed AAB 워크플로의 서명된 AAB를 사용한다.

**AAB 업로드 매뉴얼:**
1. https://github.com/reefnine9/Viennanow/actions → Google Play signed AAB → 최신 성공 실행.
2. 화면 아래 artifact viennanow-google-play-signed-aab ZIP 다운로드, 압축을 풀어 app-release.aab 확인.
3. https://play.google.com/console → ViennaNow → 비공개 테스트 → **비공개트랙 비엔나우** → 새 버전 만들기/업데이트 → AAB 업로드 후 검토/출시.
4. 테스터 기기에 설치하여 UI/지도/사진/GPS/광고/동의를 검증.
5. 다음 번 수정 시 Play에 제출된 빌드보다 **versionCode를 반드시 증가**시킨 뒤 새 AAB 생성.

**버전 이력:** versionCode 2는 과거 비공개 테스트 버전, versionCode 3 AAB는 준비했던 기록이 있음. 현재 CI는 v4 성공. **v4를 실제 Play Console에 업로드/출시했는지 확인되지 않았으므로 ‘출시 완료’로 표시하지 말 것.**

## 7. Google Play 비공개 테스트 현황

- Google Play 개인 개발자 계정에서 ViennaNow 등록.
- 실제 사용할 트랙은 **비공개트랙 비엔나우**. 별도로 보이는 Alpha 트랙은 현재 대상이 아님.
- 테스터 모집용 Google Group **ViennaNow Android Testers**, 이메일 **viennanow-testers@googlegroups.com** 생성.
- 그룹 설정 화면에서 ‘그룹에 가입할 수 있는 사용자 = 웹상의 모든 사용자가 가입 가능’ 확인. 그룹 볼 수 있는 사용자는 그룹 멤버.
- Google Groups 가입 주소 후보는 https://groups.google.com/g/viennanow-testers/about. 외부 계정에서 실제 열리는지는 확인 필요.
- Play Console ‘테스터’ 탭에 **Google Group 이메일을 등록했는지**와 테스터들이 실제로 선택 참여(opt-in)했는지는 아직 최종 화면으로 확인하지 못함.
- Play 테스트 참여 URL은 Console의 실제 표시 링크를 복사해야 함. Google Group 가입과 Play 테스트 참여는 **서로 다른 절차**이고, 같은 Google 계정 사용을 권장.
- 과거 대화에서 신규 개인 개발자 계정 기준 **12명/14일**을 안내했으나, 적용 중인 정확한 생산 출시 조건/충족 여부는 반드시 Play Console 표시로 확인.
- 스토어 아이콘, 스크린샷, 1024×500 대표 그래픽, 한국어/영어 설명 자료도 준비 논의했지만 현재 콘솔에 최종 승인된 자산은 미확인.

## 8. Google AdMob — 현재까지 실제 진행한 것

**사용자 제공 AdMob 화면에서 확인:**
- AdMob Android 앱 ViennaNow 생성.
- 배너 광고 단위 **ViennaNow Top Banner** 1개 생성.
- 앱 스토어 연결 미완료 (현재 Play 공개 검색에서 앱 찾기 어려움).
- 계정 승인 상태 ‘검토 필요/아직 승인되지 않음’, ‘광고 게재 제한’ 표시.
- 지급 프로필 완료.
- 미디에이션 그룹 0개는 Google 광고만 사용하는 경우 별도 설정이 필수라는 뜻이 아님.

**ID — 계정 비밀번호가 아닌 광고 식별자:**
- 본인 AdMob **앱 ID**: ca-app-pub-7209491348764750~2179713762
- 실제 수익용 **상단 배너 ID**: ca-app-pub-7209491348764750/5746358028
- 현재 사용하는 Google 공식 **테스트 배너 ID**: ca-app-pub-3940256099942544/6300978111

**코드 연결 방식:** scripts/configure-android-test-ads.mjs가 AndroidManifest에 본인 앱 ID를 등록. Google Mobile Ads SDK 및 UMP(광고 동의) 코드를 Android 빌드 때 생성한다. 광고 요청에 쓰는 배너 단위 ID는 **Google 테스트 ID**이므로 현재 수익 발생은 없다. 본인 실제 배너 ID는 주석으로 기록해 두었고 활성화하지 않았다.

**광고 위치 문제와 수정 이력:** 최초부터 웹앱 상단에 광고 자리 (#ad-slot) 54px가 존재. 한 번 하단으로 옮겼다가 사용자 요청에 따라 기존 상단으로 복구. 네이티브 오버레이가 고정 좌표로 뜨는 문제를 해결하기 위해 WebView에서 해당 요소의 실제 위치를 읽어 맞추도록 수정. 로딩 성공 전에 숨기고 실패 시 숨기는 코드도 추가. **GitHub 빌드는 성공했지만 실제 Android 기기에서 광고와 웹 슬롯 위치 일치, 동의 UI, 화면 크기별 겹침은 아직 검증되지 않았다.**

**중요:** Cloudflare 브라우저 웹앱의 상단 영역은 ‘광고 자리표시자’이다. Android 네이티브 SDK로 만든 AdMob 광고가 일반 웹브라우저 페이지에서도 자동 표시되는 것은 아니다. 웹사이트 광고가 필요하면 별도 웹용 구현이 필요.

**app-ads.txt:** 아직 현재 저장소 트리에 public/app-ads.txt가 없다. 추가할 Google 판매자 선언 내용은 다음과 같다.

~~~text
google.com, pub-7209491348764750, DIRECT, f08c47fec0942fa0
~~~

GitHub public/app-ads.txt를 만들면 Cloudflare 정상 배포 시 https://viennanow.pages.dev/app-ads.txt에서 제공 가능. 단, AdMob 검증에는 Play Console 개발자 웹사이트의 도메인/URL 설정이 일치해야 함. 계정 검토·스토어 연결·앱 준비·유럽 광고 동의 메시지·정책/개인정보 고지가 끝나야 수익 광고 전환을 최종 결정할 수 있다.

## 9. iPhone / App Store

Capacitor 설정과 .github/workflows/native-ios.yml의 iOS 시뮬레이터 컴파일 단계까지 코드가 있다. **서명된 iOS IPA, App Store Connect 등록, TestFlight, iOS 광고 SDK 및 App Store 심사 승인 여부는 아직 확인되지 않음.** iPhone에서 웹앱을 보는 것과 Apple App Store 정식 앱 출시는 별개.

## 10. 시기별 작업 기록

| 시기 | 작업 내용 |
|---|---|
| 2026-11-03 전후 | 여행 앱 기획, 주요 메뉴·관광지·지도·추천코스의 첫 구현 |
| 2026-11-04 | Netlify에서 GitHub/Cloudflare Pages로 이전, 볼거리·맛집·쇼핑·비엔나 이야기 확장, 디자인·로고 개선 |
| 2026-11-04~05 | 48 관광지/82 식당 QA 기록, 사진 라이선스 표시, 한/영 번역, 상세 스와이프, 버튼/하트 디자인 통일, 자동 테스트 |
| 2026-11-05 | Capacitor 네이티브 패키징, Cloudflare API 연결/CORS, GitHub signed AAB, Play Console 비공개 테스트, 화장실/거리정보 보완 |
| 2026-11-05~06 | Google Group 테스터 모집 준비, AdMob 앱/배너 단위 생성, UMP 테스트광고/상단 슬롯 정렬 코드 |
| 2026-11-06 | 본인 AdMob 앱 ID 연결 + 테스트 광고 유지, **Google Play signed AAB #17 성공**, 본 개발·운영 노트 작성 |

## 11. 공개 출시 전 미완료 체크리스트

### P0 — 우선순위 가장 높음
- [ ] #17의 서명된 AAB 아티팩트 다운로드/안전 보관 (2026-11-13 UTC 만료 예정).
- [ ] Play Console의 비공개트랙 비엔나우에 v4 AAB 실제 업로드 여부 확인; 다음 버전 번호 기록.
- [ ] Play Console 테스터에 Google Group 등록, 실제 참여 URL 확인, 실제 14일 요건/테스터 수 확인.
- [ ] Android 실기기: 광고 상단 배치, UMP 동의 메시지, 언어/찜/지도/공공화장실/스와이프/GPS 권한 테스트.
- [ ] Cloudflare Pages 최신 배포와 /api/ogd, 공공화장실 등 실제 API 응답 확인.

### P1 — 정식 공개 전
- [ ] AdMob 계정 검토 통과 및 앱 스토어 연결, 본인 실제 배너 ID 전환 시점 확정.
- [ ] app-ads.txt 파일 업로드 및 개발자 웹사이트 도메인/검증 확인.
- [ ] public/privacy.html 개인정보 처리방침과 public/legal.html 운영자·사업자 고지 **초안 문구 정식 확정**.
- [ ] Play 정책상 광고 포함/위치정보/데이터 보안/어린이 대상 여부 등 정확한 선언.
- [ ] 관광지·맛집 좌표/주소와 링크, 상업적 사진 이용 권리 확인(특히 식당 61개 미확인 표지).
- [ ] 전체 한국어/영어 번역·소형 Android·iPhone 화면·접근성·외부 지도 링크 검증.
- [ ] 스토어 설명·스크린샷·아이콘·대표 그래픽·지원 연락처 점검.

### P2 — 출시 이후/별도 계획
- [ ] iOS 실제 서명 빌드·TestFlight·App Store Connect 별도 추진.
- [ ] 오류/광고 수익/외부 API 용량, 오래된 식당·관광지 데이터 모니터링.
- [ ] 앱을 수정할 때마다 본 문서와 DEVELOPMENT_STATUS.md에 날짜/커밋/배포/검증 결과 기록.

## 12. 앞으로의 운영 절차

**웹 업데이트:** GitHub main 최신 public/index.html 및 관련 데이터/함수 확인 → 최소 범위 수정 → npm test 및 npm run check → GitHub 커밋 → Cloudflare Pages 배포 로그 확인 → 모바일 웹 실사용 확인.

**Android 업데이트:** 웹 수정 유지 → Android 네이티브 스크립트와 빌드 설정 확인 → Play에 올라간 버전보다 versionCode 증가 → Google Play signed AAB Actions 성공 → ZIP에서 AAB 추출 → Play Console 올바른 비공개 트랙에 **수동 업로드** → 기기에 설치해 광고/동의/앱 기능 확인.

**AdMob:** 앱 ID와 광고 단위 ID 구별 → 비공개 테스트는 데모 광고 ID → 계정·앱 승인, UMP, app-ads.txt, 개인정보 고지 검토 → 실제 배너 ID로 전환해 정식 수익 광고 시작. 기존 웹앱 상단 슬롯은 하나만 유지.

**항상 구분해서 보고할 네 가지:** ① GitHub 코드 수정 완료, ② GitHub Actions CI 성공, ③ Play Console 업로드/배포 확인, ④ 실제 스마트폰 검증 완료. 앞 단계가 뒷 단계 성공을 의미하지 않는다.

## 13. 새로운 ChatGPT 대화에서 바로 쓰는 시작 문구

> ViennaNow 개발을 이어서 하자. GitHub: https://github.com/reefnine9/Viennanow (main), 웹: https://viennanow.pages.dev. 먼저 docs/VIENNANOW_DEV_NOTE_KR.md와 DEVELOPMENT_STATUS.md를 읽고 GitHub 최신 커밋과 public/index.html, .github/workflows/google-play-aab.yml, scripts/configure-android-test-ads.mjs를 확인해줘. 과거 요청사항과 실제 구현된 기능을 구분하고 기존 앱을 덮어쓰지 마. 변경할 때마다 어떤 파일을 바꾸고 어떤 Actions가 성공했는지, Cloudflare/Play/실기기 검증은 무엇이 남았는지 개발 노트를 갱신해줘.

## 14. 다음 작업마다 추가할 개발 로그 양식

~~~text
[YYYY-MM-DD 업데이트]
- 이번 목적:
- 변경한 기능/화면:
- 수정 파일:
- GitHub commit SHA:
- 자동 테스트/Actions 결과 및 링크:
- Cloudflare 실제 배포 확인:
- Play 트랙 / 업로드 versionCode:
- AdMob 광고/동의 상태:
- Android/iOS 실기기 결과:
- 완료:
- 미확인:
- 다음 할 일:
~~~

**기존 참고 문서:** DEVELOPMENT_STATUS.md / QA_RELEASE_AUDIT_2026-11-05.md / RELEASE_READINESS_KR.md / GITHUB_CLOUDFLARE_SETUP_KR.md / docs/RELEASE_PHASE40_ACCEPTANCE.md. 이 문서는 최신 상태의 입구이며, 과거 단계별 상세 수치/라이선스 검토와 충돌하면 실제 GitHub main 및 콘솔 화면을 다시 확인해야 한다.

---
*작성 기준: 2026-11-06 GitHub 실파일/Actions #17 결과 + 이전 ViennaNow 개발 대화 + 사용자가 제공한 Google Play/AdMob 화면. Cloudflare 실배포, 최신 Play 업로드, 승인 상태, Android 광고 실기기 동작까지 확인했다고 주장하지 않는다.*


## 15. 2026-11-06 파일명 혼동 방지 정리
- [확인] 루트의 오래된 `index.html`은 **`index_old.html`**로 이름을 변경해 보존했다(HTML 내용 변경 없음).
- [확인] 실제 Cloudflare 웹앱 진입점은 **`public/index.html`** 그대로이고, Android도 이 파일을 사용한다.
- [확인] 과거 루트 HTML 내용을 검사하는 역사적 회귀 테스트 2개는 `index_old.html`을 참조하도록 변경했다. 이 테스트들은 **현재 앱의 기능 인증이 아님**.
- [확인] 잘못 사용하면 최신 앱을 덮어쓰는 `scripts/sync_html.py`는 실행 시 오류와 안내를 출력하도록 비활성화했다.
- [확인] `scripts/check-cloudflare.mjs`가 루트 `index.html`의 재생성을 금지하도록 변경했다.
- **실무 규칙:** 새 개발에서는 오직 `public/index.html`을 수정하고 `index_old.html`은 과거 참고용으로만 사용한다.


## 2026-11-07: 계획 상세 → 내주변 지도 → 하단 계획 복귀
- 요청: 추천코스 상세 페이지 하단의 ‘내주변 지도에서 이 코스 보기’로 이동한 다음 하단 ‘계획’ 탭을 누르면 목록 상단이 아니라 **그 코스 상세와 원래 스크롤 위치로 복귀**해야 함.
- 코드: `public/index.html`의 `vn-course-near-map` 동작에 출발 코스 ID 및 `#main` scrollTop을 일시 저장하고, `navTo('itinerary')`가 내주변의 계획 지도로부터 호출되면 `planSection='premium'`, 해당 코스 `vnCourseDetail` 및 읽던 스크롤 위치 복원.
- 다른 메뉴 방문 시 일시 복귀 상태를 정리하며, `tests/course-near-return.test.mjs`에 회귀 테스트 추가.
- 수정 커밋: `895be19865d044415cf389ece9a995abcd84dd3f`; 테스트 추가: `67e71738c0395f8eadb832ce21bb965569c5fe71`.
- Cloudflare 자동 배포와 Android 새 AAB 반영/실기기 동작은 별도 검증 필요. 현재 Play 스토어 설치 버전이 자동 변경되지는 않음.
