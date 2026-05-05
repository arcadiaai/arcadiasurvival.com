import { env } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../../functions/api/waitlist';

declare module 'cloudflare:test' {
  interface ProvidedEnv {
    WAITLIST_EMAILS: KVNamespace;
    WAITLIST_RATELIMIT: KVNamespace;
    DAILY_SALT: string;
  }
}

const post = (body: object, extraHeaders: Record<string, string> = {}) =>
  new Request('https://example.com/api/waitlist', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'cf-connecting-ip': '127.0.0.1',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

const ctx = (request: Request) =>
  ({
    request,
    env,
    waitUntil: () => {},
    next: async () => new Response(),
    data: {},
    params: {},
  }) as any;

const callWorker = (req: Request) => worker.onRequest(ctx(req));

const clearKV = async (ns: KVNamespace) => {
  for (const k of (await ns.list()).keys) {
    await ns.delete(k.name);
  }
};

describe('POST /api/waitlist', () => {
  beforeEach(async () => {
    await clearKV(env.WAITLIST_EMAILS);
    await clearKV(env.WAITLIST_RATELIMIT);
  });

  it('happy path: 200 + writes one row', async () => {
    const res = await callWorker(post({ email: 'test@example.com', hp_company: '', source: 'home' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const stored = (await env.WAITLIST_EMAILS.get('test@example.com', 'json')) as any;
    expect(stored).toBeTruthy();
    expect(stored.source).toBe('home');
    expect(stored.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('duplicate email is idempotent: still 1 row, 200', async () => {
    await callWorker(post({ email: 'a@b.com', hp_company: '', source: 'home' }));
    const res = await callWorker(post({ email: 'a@b.com', hp_company: '', source: 'home' }));
    expect(res.status).toBe(200);
    const list = await env.WAITLIST_EMAILS.list();
    expect(list.keys.length).toBe(1);
  });

  it('honeypot tripped: silent 200, no row written', async () => {
    const res = await callWorker(post({ email: 'bot@x.com', hp_company: 'Acme Inc', source: 'home' }));
    expect(res.status).toBe(200);
    expect(await env.WAITLIST_EMAILS.get('bot@x.com')).toBeNull();
  });

  it('bad email regex: 400', async () => {
    const res = await callWorker(post({ email: 'not-an-email', hp_company: '', source: 'home' }));
    expect(res.status).toBe(400);
  });

  it('email too long: 400', async () => {
    const long = 'a'.repeat(255) + '@b.com';
    const res = await callWorker(post({ email: long, hp_company: '', source: 'home' }));
    expect(res.status).toBe(400);
  });

  it('invalid source: 400', async () => {
    const res = await callWorker(post({ email: 'a@b.com', hp_company: '', source: 'wherever' }));
    expect(res.status).toBe(400);
  });

  it('GET method: 405', async () => {
    const req = new Request('https://example.com/api/waitlist', { method: 'GET' });
    const res = await callWorker(req);
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });

  it('JSON Accept but missing JSON content-type: 415', async () => {
    const req = new Request('https://example.com/api/waitlist', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'text/plain' },
      body: 'email=a@b.com',
    });
    const res = await callWorker(req);
    expect(res.status).toBe(415);
  });

  it('rate limit: 11th request from same IP hash returns 429', async () => {
    for (let i = 0; i < 10; i++) {
      const r = await callWorker(post({ email: `user${i}@example.com`, hp_company: '', source: 'home' }));
      expect(r.status).toBe(200);
    }
    const res = await callWorker(post({ email: 'spammer@example.com', hp_company: '', source: 'home' }));
    expect(res.status).toBe(429);
    expect(await env.WAITLIST_EMAILS.get('spammer@example.com')).toBeNull();
  });

  it('non-JS form submission (Accept: text/html): 303 to /thank-you', async () => {
    const req = new Request('https://example.com/api/waitlist', {
      method: 'POST',
      headers: {
        accept: 'text/html',
        'content-type': 'application/x-www-form-urlencoded',
        'cf-connecting-ip': '127.0.0.1',
      },
      body: 'email=user%40example.com&hp_company=&source=home',
    });
    const res = await callWorker(req);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/thank-you');
    expect(await env.WAITLIST_EMAILS.get('user@example.com')).toBeTruthy();
  });

  it('KV write throws: 502', async () => {
    const original = env.WAITLIST_EMAILS.put;
    (env.WAITLIST_EMAILS as any).put = (() => Promise.reject(new Error('boom'))) as any;
    try {
      const res = await callWorker(post({ email: 'oops@example.com', hp_company: '', source: 'home' }));
      expect(res.status).toBe(502);
    } finally {
      (env.WAITLIST_EMAILS as any).put = original;
    }
  });
});
