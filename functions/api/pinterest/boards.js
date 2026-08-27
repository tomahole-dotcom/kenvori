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

function tokenFrom(context) {
  return getCookie(context.request, 'kenvori_pinterest_token');
}

const API_BASE = 'https://api-sandbox.pinterest.com/v5';

async function fetchAllBoards(token) {
  const items = [];
  let bookmark = '';
  let pages = 0;
  do {
    const url = new URL(`${API_BASE}/boards`);
    url.searchParams.set('page_size', '100');
    if (bookmark) url.searchParams.set('bookmark', bookmark);
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.message || data.error || 'Could not load Pinterest Sandbox boards'), { status: response.status });
    if (Array.isArray(data.items)) items.push(...data.items);
    bookmark = typeof data.bookmark === 'string' ? data.bookmark : '';
    pages += 1;
  } while (bookmark && pages < 10);
  return items;
}

export async function onRequestGet(context) {
  const token = tokenFrom(context);
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);
  try {
    const items = await fetchAllBoards(token);
    return json({ items: items.map(b => ({ id: b.id, name: b.name })) });
  } catch (error) {
    return json({ error: error.message || 'Could not load Pinterest Sandbox boards' }, error.status || 502);
  }
}

export async function onRequestPost(context) {
  const token = tokenFrom(context);
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);

  const input = await context.request.json().catch(() => ({}));
  const name = String(input.name || '').trim();
  const description = String(input.description || '').trim();

  if (name.length < 3 || name.length > 180) return json({ error: 'Board name must be between 3 and 180 characters' }, 400);
  if (description.length > 500) return json({ error: 'Board description is too long' }, 400);

  const response = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, privacy: 'PUBLIC' })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.message || data.error || 'Could not create Pinterest Sandbox board' }, response.status);
  return json({ id: data.id, name: data.name || name, description: data.description || description, environment: 'sandbox' }, 201);
}
