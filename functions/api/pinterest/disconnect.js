export async function onRequestPost() {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  headers.append('Set-Cookie', 'kenvori_pinterest_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', 'kenvori_pinterest_token=; Path=/api/pinterest; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', 'kenvori_pinterest_state=; Path=/api/pinterest; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
