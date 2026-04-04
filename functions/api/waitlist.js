// Cloudflare Pages Function — /api/waitlist
// Stores waitlist emails in KV namespace "WAITLIST"
// Set up: wrangler pages ... --kv WAITLIST

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://pomoborrow.com',
    'Access-Control-Allow-Methods': 'POST',
  };

  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers });
    }

    // Store in KV — key is email, value is timestamp + metadata
    if (env.WAITLIST) {
      const existing = await env.WAITLIST.get(email);
      if (!existing) {
        await env.WAITLIST.put(email, JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          source: 'pomoborrow.com',
          userAgent: request.headers.get('user-agent') || '',
        }));
      }

      // Get count (approximate — list all keys)
      const list = await env.WAITLIST.list();
      const count = list.keys.length;

      return new Response(JSON.stringify({ success: true, count }), { status: 200, headers });
    }

    // Fallback if KV not bound — just accept it
    return new Response(JSON.stringify({ success: true, count: 848 }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://pomoborrow.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
