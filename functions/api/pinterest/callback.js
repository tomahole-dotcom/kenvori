const APP_ID = '1605380';
const REDIRECT_URI = 'https://kenvori.no/api/pinterest/callback';

function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function redirectWithError(message) {
  const url = new URL('/pinterest-publisher.html', 'https://kenvori.no');
  url.searchParams.set('error', message);
  return Response.redirect(url.toString(), 302);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = getCookie(context.request, 'kenvori_pinterest_state');

  if (!code) return redirectWithError('Missing authorization code');
  if (!state || !expectedState || state !== expectedState) return redirectWithError('Invalid OAuth state');
  if (!context.env.PINTEREST_APP_SECRET) return redirectWithError('Server secret is not configured');

  const basic = btoa(`${APP_ID}:${context.env.PINTEREST_APP_SECRET}`);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    continuous_refresh: 'true'
  });

  // Trial Access Pin creation runs in Pinterest Sandbox, so the OAuth code
  // must also be exchanged for a Sandbox token. Production and Sandbox
  // tokens are not interchangeable.
  const tokenResponse = await fetch('https://api-sandbox.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.access_token) {
    return redirectWithError(tokenData.message || tokenData.error || 'Sandbox token exchange failed');
  }

  const maxAge = Math.max(60, Math.min(Number(tokenData.expires_in) || 2592000, 2592000));
  const headers = new Headers();
  headers.set('Location', '/pinterest-publisher.html?connected=1');
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  headers.append('Set-Cookie', `kenvori_pinterest_token=${encodeURIComponent(tokenData.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
  headers.append('Set-Cookie', 'kenvori_pinterest_state=; Path=/api/pinterest; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  return new Response(null, { status: 302, headers });
}
