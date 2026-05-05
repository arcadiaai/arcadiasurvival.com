interface Env {
  WAITLIST_EMAILS: KVNamespace;
  WAITLIST_RATELIMIT: KVNamespace;
  DAILY_SALT: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_SOURCES = new Set(['home', 'waitlist', 'footer']);
const MAX_EMAIL_LEN = 254;
const RATE_LIMIT_PER_HOUR = 10;

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function handle({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  const accept = request.headers.get('accept') ?? '';
  const ct = request.headers.get('content-type') ?? '';
  const wantsJson = accept.includes('application/json');

  if (wantsJson && !ct.includes('application/json')) {
    return new Response('Unsupported Media Type', { status: 415 });
  }

  let body: Record<string, unknown>;
  if (ct.includes('application/json')) {
    body = (await request.json()) as Record<string, unknown>;
  } else if (ct.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    body = Object.fromEntries(new URLSearchParams(text).entries());
  } else if (ct.includes('multipart/form-data')) {
    const fd = await request.formData();
    body = Object.fromEntries(fd.entries() as IterableIterator<[string, string]>);
  } else {
    return new Response('Unsupported Media Type', { status: 415 });
  }

  // Validate inputs
  const rawEmail = typeof body.email === 'string' ? body.email : '';
  const rawSource = typeof body.source === 'string' ? body.source : '';
  if (!rawEmail || rawEmail.length > MAX_EMAIL_LEN || !EMAIL.test(rawEmail)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (!ALLOWED_SOURCES.has(rawSource)) {
    return Response.json({ error: 'invalid_source' }, { status: 400 });
  }

  // Honeypot — silent success, no row written
  if (typeof body.hp_company === 'string' && body.hp_company !== '') {
    return wantsJson
      ? Response.json({ ok: true })
      : new Response(null, { status: 303, headers: { location: '/thank-you' } });
  }

  const email = rawEmail.toLowerCase().trim();
  const source = rawSource;

  const ip = request.headers.get('cf-connecting-ip') ?? '0.0.0.0';
  const country = request.headers.get('cf-ipcountry') ?? '??';
  const ua = request.headers.get('user-agent') ?? '';

  const ipHash = await sha256(`${ip}:${env.DAILY_SALT}`);
  const uaHash = await sha256(ua);

  // Rate limit
  const hourBucket = Math.floor(Date.now() / 3_600_000);
  const rlKey = `rl:${ipHash}:${hourBucket}`;
  const current = parseInt((await env.WAITLIST_RATELIMIT.get(rlKey)) ?? '0', 10);
  if (current >= RATE_LIMIT_PER_HOUR) {
    return new Response(JSON.stringify({ error: 'rate_limited', retry_after: 3600 }), {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': '3600' },
    });
  }
  await env.WAITLIST_RATELIMIT.put(rlKey, String(current + 1), { expirationTtl: 3600 });

  // Write the signup
  try {
    await env.WAITLIST_EMAILS.put(
      email,
      JSON.stringify({
        ts: new Date().toISOString(),
        source,
        country,
        ip_hash: ipHash,
        ua_hash: uaHash,
      }),
    );
  } catch {
    return new Response(JSON.stringify({ error: 'kv_write_failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  return wantsJson
    ? Response.json({ ok: true })
    : new Response(null, { status: 303, headers: { location: '/thank-you' } });
}

export const onRequest: PagesFunction<Env> = handle as PagesFunction<Env>;
export default { onRequest: handle };
