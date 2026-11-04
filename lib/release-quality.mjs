/** Quality signals: these do not certify physical access, live availability or completeness. */
export function coverageOf(geo, received, limit) {
  const raw = geo?.numberMatched ?? geo?.totalFeatures ?? geo?.totalCount;
  const total = typeof raw === 'number' ? raw : (/^\d+$/.test(String(raw ?? '')) ? Number(raw) : null);
  if (total != null && Number.isSafeInteger(total) && total >= 0) {
    return { status: total > received ? 'partial' : 'service-count-complete', totalReported: total };
  }
  if (received >= limit) return { status:'limit-reached', totalReported:null };
  return { status:'unknown', totalReported:null };
}

export function evaluateRelease({apiChecks={}, coordinateCount=0, routeChecked=false, deviceChecked=false, permissionsChecked=false}={}) {
  const required=['wc','water','stops'];
  const apiPassed=required.every(k=>apiChecks[k]?.status==='ok' && apiChecks[k]?.isSampleOnly===true && apiChecks[k]?.usableFeatures>0);
  const failed=required.filter(k=>apiChecks[k]?.status==='error');
  const warnings=[];
  if(!apiPassed) warnings.push('공식 WFS 3종 표본 연결 검증 대기');
  if(coordinateCount < 16) warnings.push(`명소 출입구 좌표 수동 검토 ${coordinateCount}/16`);
  if(!routeChecked) warnings.push('실제 이동 경로 현장·기기 검증 대기');
  if(!deviceChecked) warnings.push('iPhone/Android 실기기 테스트 대기');
  if(!permissionsChecked) warnings.push('사진·지도·OGD 저작권 및 위치정보 고지 검토 대기');
  return {status:warnings.length?'not-ready':'manual-review-required',apiPassed,failedLayers:failed,issues:warnings};
}
