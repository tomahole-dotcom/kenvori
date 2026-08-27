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

export async function onRequestGet(context) {
  const token = tokenFrom(context);
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);

  const response = await fetch('https://api.pinterest.com/v5/boards?page_size=100', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.message || data.error || 'Could not load Pinterest boards' }, response.status);

  return json({ items: Array.isArray(data.items) ? data.items.map(b => ({ id: b.id, name: b.name })) : [] });
}

export async function onRequestPost(context) {
  const token = tokenFrom(context);
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);

  const input = await context.request.json().catch(() => ({}));
  const name = String(input.name || '').trim();
  const description = String(input.description || '').trim();

  if (name.length < 3 || name.length > 180) {
    return json({ error: 'Board name must be between 3 and 180 characters' }, 400);
  }
  if (description.length > 500) {
    return json({ error: 'Board description is too long' }, 400);
  }

  const response = await fetch('https://api.pinterest.com/v5/boards', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      privacy: 'PUBLIC'
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({ error: data.message || data.error || 'Could not create Pinterest board' }, response.status);
  }

  return json({ id: data.id, name: data.name || name, description: data.description || description }, 201);
}
