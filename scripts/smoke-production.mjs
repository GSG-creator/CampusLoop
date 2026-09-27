import assert from 'node:assert/strict';
import { once } from 'node:events';

// Exercise the production launcher on an ephemeral local port without spending
// API credits, even if the developer has a configured .env file.
process.env.PORT = '0';
process.env.GEMINI_API_KEY = '';
process.env.NODE_ENV = 'development';
const { server } = await import('./start.mjs');
if (!server.listening) await once(server, 'listening');
const address = server.address();
assert.ok(address && typeof address === 'object');
const base = `http://127.0.0.1:${address.port}`;

try {
  assert.equal(process.env.NODE_ENV, 'production');
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  const status = await health.json();
  assert.equal(status.status, 'ok');
  assert.equal(status.geminiKeyConfigured, false);

  const page = await fetch(base);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /<html/i);
  assert.doesNotMatch(html, /\/@vite\/client|\/src\/main\.tsx/);
  const asset = html.match(/src="(\/assets\/[^\"]+\.js)"/);
  assert.ok(asset, 'The page must reference a built JavaScript asset.');
  const script = await fetch(`${base}${asset[1]}`);
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type') || '', /javascript/);
  const deepLink = await fetch(`${base}/mentoring`);
  assert.equal(deepLink.status, 200);
  assert.equal(await deepLink.text(), html);

  const offline = await fetch(`${base}/api/loop-ai`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Hello' }),
  });
  assert.equal(offline.status, 200);
  assert.equal((await offline.json()).status, 'offline');
  const malformed = await fetch(`${base}/api/loop-ai`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(`${base}/api/not-a-route`)).status, 404);
  console.log('Production smoke passed: built page/assets, SPA route, health, offline API and request errors.');
} finally {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
