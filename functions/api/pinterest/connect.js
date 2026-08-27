const APP_ID = '1605380';
const REDIRECT_URI = 'https://kenvori.no/api/pinterest/callback';

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet() {
  const state = randomState();
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'boards:read,boards:write,pins:read,pins:write',
    state
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://www.pinterest.com/oauth/?${params.toString()}`,
      'Set-Cookie': `kenvori_pinterest_state=${state}; Path=/api/pinterest; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store'
    }
  });
}
