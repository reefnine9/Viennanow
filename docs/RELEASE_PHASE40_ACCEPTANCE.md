# Phase 40 — release gate and device acceptance checklist

## Implemented
- `npm run check:native:release` checks native staging, CORS middleware/test presence, GPS usage and public legal/media release warnings.
- Android CI generates PNG icons **before** `check:stores`, fixing the earlier false failure caused by missing generated files.
- Both manual native build workflows include the native release audit.
- Warnings do **not** mean approval. A build may pass while app-store submission remains blocked.

## Required physical-device acceptance tests
| Area | Acceptance criterion |
| --- | --- |
| Initial launch | App opens without a blank screen; V Now icon renders |
| Sight/restaurant data | Lists, photos and details load with no broken links |
| Nearby map | Pins, route lines and details open; no overlap blocks key controls |
| GPS | Permission granted/denied/revoked cases show correct behavior |
| Cloudflare OGD | Public toilets/water/stops load or provide an honest retry message |
| Route API | Successful route and unavailable-key/network-error states work |
| Language | Korean and English navigation and content are consistent |
| Offline | Offline state is explained; no misleading availability claims |
| Privacy | Operator and processing disclosures are reviewed and published |
| Rights | Commercial use of photos and location accuracy are verified |

## Unresolved before store submission
1. Run GitHub Actions with the actual production HTTPS origin and review logs.
2. Resolve any build failures, validate Android debug APK and iOS simulator build.
3. Configure iOS location usage descriptions and Android permission behavior, then test on real devices.
4. Prepare platform-native icons and signing identities, then create release AAB and IPA.
5. Finalize operator/legal notice, privacy policy, rights and app-store declarations.
6. Confirm the provisional app ID before registration.

No CI run or real-device test is claimed as complete in Phase 40.
