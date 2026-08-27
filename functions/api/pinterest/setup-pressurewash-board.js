function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function redirect(status, message) {
  const url = new URL('/pinterest-publisher.html', 'https://kenvori.no');
  url.searchParams.set('board_setup', status);
  if (message) url.searchParams.set('board_message', message);
  return Response.redirect(url.toString(), 302);
}

export async function onRequestGet(context) {
  const token = getCookie(context.request, 'kenvori_pinterest_token');
  if (!token) return redirect('error', 'Pinterest is not connected');

  const listResponse = await fetch('https://api.pinterest.com/v5/boards?page_size=100', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  const listData = await listResponse.json().catch(() => ({}));
  if (!listResponse.ok) return redirect('error', listData.message || 'Could not load boards');

  const boards = Array.isArray(listData.items) ? listData.items : [];
  const existing = boards.find(b => String(b.name || '').trim().toLowerCase() === 'pressurewash pro');
  if (existing) return redirect('existing', 'PressureWash Pro board is ready');

  const createResponse = await fetch('https://api.pinterest.com/v5/boards', {
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
  if (!createResponse.ok) return redirect('error', createData.message || createData.error || 'Could not create board');

  return redirect('created', 'PressureWash Pro board created through the Pinterest API');
}
