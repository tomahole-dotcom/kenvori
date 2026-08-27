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

function isHttpsUrl(value) {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export async function onRequestPost(context) {
  const token = getCookie(context.request, 'kenvori_pinterest_token');
  if (!token) return json({ error: 'Pinterest is not connected' }, 401);

  const body = await context.request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid request body' }, 400);

  const boardId = String(body.board_id || '').trim();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const link = String(body.link || '').trim();
  const imageUrl = String(body.image_url || '').trim();

  const errors = [];
  if (!/^\d+$/.test(boardId)) errors.push('Select a valid Pinterest board');
  if (!title || title.length > 100) errors.push('Title must be 1–100 characters');
  if (!description || description.length > 800) errors.push('Description must be 1–800 characters');
  if (!isHttpsUrl(link)) errors.push('Destination URL must use HTTPS');
  if (!isHttpsUrl(imageUrl)) errors.push('Image URL must be a public HTTPS URL');
  if (errors.length) return json({ error: `QA failed: ${errors.join('. ')}` }, 400);

  const pinterestBody = {
    board_id: boardId,
    title,
    description,
    link,
    media_source: {
      source_type: 'image_url',
      url: imageUrl,
      is_standard: true
    }
  };

  // Trial Access apps must create Pins against Pinterest's API Sandbox.
  // After Standard Access approval this host can be switched to api.pinterest.com.
  const response = await fetch('https://api-sandbox.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(pinterestBody)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.message || data.error || 'Pinterest rejected the Pin' }, response.status);

  return json({ id: data.id || null, link: data.link || null, board_id: data.board_id || boardId, environment: 'sandbox' }, 201);
}
