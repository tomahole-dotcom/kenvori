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

async function createBoard(token, name) {
  const response = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description: 'Pressure washing business tips, quoting tools, pricing ideas and resources from Kenvori.',
      privacy: 'PUBLIC'
    })
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

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
  const existing = boards.find(b => String(b.name || '').trim().toLowerCase().startsWith('pressurewash pro'));
  if (existing) return json({ created: false, id: existing.id, name: existing.name, environment: 'sandbox' });

  let name = 'PressureWash Pro';
  let attempt = await createBoard(token, name);

  // Sandbox can report a duplicate even while List boards has not surfaced the entity yet.
  // In that case create a one-off demo board and return its ID immediately.
  const message = String(attempt.data.message || attempt.data.error || '').toLowerCase();
  if (!attempt.response.ok && message.includes('already have a board with this name')) {
    const suffix = String(Date.now()).slice(-6);
    name = `PressureWash Pro Demo ${suffix}`;
    attempt = await createBoard(token, name);
  }

  if (!attempt.response.ok) {
    const msg = attempt.data.message || attempt.data.error || attempt.data.code || `Pinterest returned HTTP ${attempt.response.status}`;
    return json({ error: String(msg), pinterest_status: attempt.response.status }, attempt.response.status);
  }

  return json({ created: true, id: attempt.data.id, name: attempt.data.name || name, environment: 'sandbox' }, 201);
}
