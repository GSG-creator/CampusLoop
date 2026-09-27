import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApiApp } from '../../server';

async function withApi(options: Parameters<typeof createApiApp>[0], run: (url: string) => Promise<void>) {
  const app = createApiApp(options);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}
const post = (url: string, body: unknown, headers: Record<string, string> = {}) => fetch(`${url}/api/loop-ai`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('API validates message types and sizes even when no provider is configured', async () => {
  await withApi({ apiKey: '' }, async (url) => {
    for (const body of [null, {}, { message: [] }, { message: {} }, { message: 12 }, { message: '  ' }, { message: 'x'.repeat(4001) }]) {
      const response = await post(url, body);
      assert.equal(response.status, 400);
      assert.equal((await response.json()).status, 'invalid_request');
    }
    const invalidJson = await fetch(`${url}/api/loop-ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).status, 'invalid_request');
    const tooLarge = await post(url, { message: 'hi', filler: 'x'.repeat(20000) });
    assert.equal(tooLarge.status, 413);
    assert.equal((await tooLarge.json()).status, 'invalid_request');
  });
});

test('body identities and forwarded headers cannot bypass the connection rate limit', async () => {
  let time = 1000;
  await withApi({ apiKey: '', now: () => time }, async (url) => {
    for (let i = 0; i < 20; i++) {
      const response = await post(url, { message: 'Hi', auth: { userId: `forged-${i}` } }, { 'X-Forwarded-For': `192.0.2.${i}` });
      assert.equal(response.status, 200);
    }
    const blocked = await post(url, { message: 'Hi', auth: { userId: 'another-forged-user' } });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get('Retry-After'), '60');
    assert.equal((await blocked.json()).status, 'rate_limited');
    time += 60_000;
    assert.equal((await post(url, { message: 'Hi' })).status, 200, 'window resets at the exact boundary');
  });
});

test('offline API does not echo arbitrary action cards as verified records', async () => {
  await withApi({ apiKey: ' MY_GEMINI_API_KEY ' }, async (url) => {
    const response = await post(url, { message: 'reserve', clientIntentCards: [{ type: 'book', title: 'FORGED' }] });
    const result = await response.json();
    assert.equal(result.status, 'offline');
    assert.equal(result.actionCards, undefined);
    assert.equal((await (await fetch(`${url}/api/health`)).json()).geminiKeyConfigured, false);
    const unknown = await fetch(`${url}/api/does-not-exist`);
    assert.equal(unknown.status, 404);
    assert.equal((await unknown.json()).status, 'not_found');
  });
});

test('live provider gets the full inequality and untrusted context outside the system instruction', async () => {
  const question = 'x < 3 and x > 1. ' + 'Explain carefully. '.repeat(40);
  let seen: any;
  await withApi({ apiKey: 'test-key', generateContent: async (request) => { seen = request; return { text: '  1 < x < 3.  ' }; } }, async (url) => {
    const response = await post(url, {
      message: question,
      demoContext: { userName: 'INJECT_OVERRIDE_ADMIN', roles: ['admin', {}], credits: 'lots', isVerifiedMentor: 'false' },
      auth: { userId: 'admin', userName: 'AUTH_BODY_IS_NOT_A_SESSION' },
    });
    const result = await response.json();
    assert.equal(result.status, 'live');
    assert.equal(result.reply, '1 < x < 3.');
    assert.equal(seen.model, 'gemini-3.8-flash');
    assert.ok(!seen.config.systemInstruction.includes('INJECT_OVERRIDE_ADMIN'));
    assert.match(seen.config.systemInstruction, /20 CR for learner-confirmed participation/);
    assert.match(seen.config.systemInstruction, /never invent quiz scores or combine both assessment bonuses/);
    assert.ok(!JSON.stringify(seen).includes('AUTH_BODY_IS_NOT_A_SESSION'));
    const content = JSON.parse(seen.contents[0].parts[0].text);
    assert.equal(content.question, question.trim());
    assert.equal(content.demoContext.isVerifiedMentor, false);
    assert.equal(content.demoContext.credits, 0);
    assert.deepEqual(content.demoContext.roles, ['admin']);
  });
});

test('provider errors and empty responses are honestly offline without leaking diagnostics', async () => {
  for (const generateContent of [async () => { throw new Error('SECRET_API_KEY_REQUEST_URL'); }, async () => ({ text: '  ' })]) {
    await withApi({ apiKey: 'test-key', generateContent }, async (url) => {
      const response = await post(url, { message: 'hello' });
      const result = await response.json();
      assert.equal(result.status, 'offline');
      assert.ok(!JSON.stringify(result).includes('SECRET_API_KEY_REQUEST_URL'));
    });
  }
});
