function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestGet(context) {
  const token = getCookie(context.request, 'kenvori_pinterest_token');
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);

  const response = await fetch('https://api.pinterest.com/v5/boards?page_size=100', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.message || data.error || 'Could not load Pinterest boards' }, response.status);

  return json({ items: Array.isArray(data.items) ? data.items.map(b => ({ id: b.id, name: b.name })) : [] });
}
