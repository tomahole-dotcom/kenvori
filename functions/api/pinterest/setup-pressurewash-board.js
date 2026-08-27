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
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

const API_BASE = 'https://api-sandbox.pinterest.com/v5';

export async function onRequestPost(context) {
  const token = getCookie(context.request, 'kenvori_pinterest_token');
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);

  const listResponse = await fetch(`${API_BASE}/boards?page_size=100`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  const listData = await listResponse.json().catch(() => ({}));
  if (!listResponse.ok) {
    return json({ error: listData.message || listData.error || 'Could not load boards' }, listResponse.status);
  }

  const boards = Array.isArray(listData.items) ? listData.items : [];
  const existing = boards.find(b => String(b.name || '').trim().toLowerCase() === 'pressurewash pro');
  if (existing) {
    return json({ created: false, id: existing.id, name: existing.name });
  }

  const createResponse = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'PressureWash Pro',
      description: 'Pressure washing business tips, quoting tools, pricing ideas and resources from Kenvori.',
      privacy: 'PUBLIC'
    })
  });

  const createData = await createResponse.json().catch(() => ({}));
  if (!createResponse.ok) {
    const message = createData.message || createData.error || createData.code || `Pinterest returned HTTP ${createResponse.status}`;
    return json({ error: String(message), pinterest_status: createResponse.status }, createResponse.status);
  }

  return json({ created: true, id: createData.id, name: createData.name || 'PressureWash Pro' }, 201);
}
