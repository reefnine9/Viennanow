const nativeOrigins = new Set(['capacitor://localhost', 'http://localhost']);

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin');
  const allowed = nativeOrigins.has(origin);
  if (context.request.method === 'OPTIONS') {
    if (!allowed) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Access-Control-Max-Age': '600',
      'Vary': 'Origin'
    } });
  }
  const response = await context.next();
  if (!allowed) return response;
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.append('Vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
