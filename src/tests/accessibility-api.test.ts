import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createApiApp } from '../../server';

const page = {
  subject: 'Mathematics', chapter: 'Trigonometry', topic: 'Tower height', gradeLevel: 'Grade 10',
  page_summary: 'At a distance of 20 m, a 45 degree angle gives h = 20 tan(45°) = 20 m.',
  key_concepts: ['tan(angle) = opposite / adjacent'], definitions: [], equations: [],
  examples: [], diagram_descriptions: [], difficult_sections: [],
};
const explanation = { mode: 'simple', headline: 'Find the tower height', simpleWordsIntro: ['Use the tangent ratio.'], difficultConceptsBreakdown: [], keyTakeaways: ['The height is 20 m.'] };
const video = {
  title: 'Tower height', audience: 'Grade 10', subject: 'Mathematics', learningObjective: 'Use the tangent ratio.',
  style: 'Clear labels and narration', endingSummary: 'The height is 20 m.', finalCheck: 'Teacher should check the example.', rawStructuredPromptText: 'Explain the triangle, identify the ratio, solve for the height.',
  scenes: [1, 2, 3].map((sceneNumber) => ({ sceneNumber, durationSeconds: 15, visualDescription: 'A labelled right triangle.', narration: 'The angle is 45 degrees.', onScreenText: 'tan(45°) = h / 20', animationInstruction: 'Highlight the adjacent side.', transition: 'Continue.' })),
};
const quiz = [1, 2, 3, 4].map((i) => ({ id: `q${i}`, type: 'multiple_choice', question: `Tower practice question ${i}`, options: ['10 m', '20 m', '30 m', '40 m'], correctAnswer: 1, conceptTested: 'Tangent', explanation: '20 tan(45°) = 20 m.' }));
// Binary signatures exercise transport validation; the AI call is always mocked.
const png = (size = 100) => {
  const data = Buffer.alloc(size);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(data);
  return `data:image/png;base64,${data.toString('base64')}`;
};
const requests = [
  { path: '/api/translate', body: { text: 'Hello', targetLanguage: 'Hindi' } },
  { path: '/api/translate-batch', body: { texts: ['Hello', 'Thank you'], targetLanguage: 'Hindi' } },
  { path: '/api/accessibility/summarize-captions', body: { transcripts: ['Teacher: Use the tangent ratio.'] } },
  { path: '/api/tutor/scan-page', body: { imageBase64: png() } },
  { path: '/api/tutor/generate-video', body: { structuredPage: page } },
  { path: '/api/tutor/generate-quiz', body: { structuredPage: page } },
  { path: '/api/tutor/chat', body: { message: 'Explain the tower height.', context: { currentTopic: 'Trigonometry', pageSummary: page.page_summary } } },
];

async function withApi(options: Parameters<typeof createApiApp>[0], run: (request: (path: string, body: unknown, headers?: Record<string, string>) => Promise<Response>, url: string) => Promise<void>) {
  const server = createApiApp(options).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = (path: string, body: unknown, headers: Record<string, string> = {}) => fetch(url + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
  try { await run(request, url); } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('all seven assistive endpoints honestly report missing AI instead of fake translations or unrelated lessons', async () => {
  await withApi({ apiKey: ' MY_GEMINI_API_KEY ', generateContent: async () => { throw new Error('must not call provider'); } }, async (post) => {
    for (const { path, body } of requests) {
      const response = await post(path, body);
      assert.equal(response.status, 200, path);
      const result = await response.json();
      assert.equal(result.status, 'offline', path);
      assert.match(result.message, /no AI result was generated/);
      assert.equal(result.pageData, undefined);
      assert.equal(result.videoPrompt, undefined);
      assert.equal(result.quiz, undefined);
      assert.doesNotMatch(JSON.stringify(result), /Newton|\[Hindi\]|verified|Complete practice quiz/i);
      if (path === '/api/translate') assert.equal(result.translatedText, 'Hello');
      if (path === '/api/translate-batch') assert.deepEqual(result.translations, ['Hello', 'Thank you']);
      if (path.includes('captions')) assert.deepEqual(result.keyPoints, ['Teacher: Use the tangent ratio.']);
    }
  });
});

test('live contracts return validated translations, captions, page, storyboard, quiz and topic-aware chat', async () => {
  const outputs = ['नमस्ते', JSON.stringify(['नमस्ते', 'धन्यवाद']), 'Use the tangent ratio to find the height.', JSON.stringify({ pageData: page, explanation }), JSON.stringify(video), JSON.stringify(quiz), 'The tower is 20 m high.'];
  const calls: any[] = [];
  await withApi({ apiKey: 'test-key', generateContent: async (request) => { calls.push(request); return { text: outputs[calls.length - 1] }; } }, async (post) => {
    for (const { path, body } of requests) {
      const response = await post(path, body);
      assert.equal(response.status, 200, path);
      const result = await response.json();
      assert.equal(result.status, 'success', path);
      assert.equal(result.source, 'live_gemini');
      if (path.endsWith('scan-page')) {
        assert.match(result.pageData.id, /^page-/);
        assert.equal(result.pageData.topic, 'Tower height');
        assert.equal(result.explanation.mode, 'simple');
      }
      if (path.endsWith('generate-video')) assert.deepEqual(result.videoPrompt, video);
      if (path.endsWith('generate-quiz')) assert.deepEqual(result.quiz, quiz);
    }
    assert.equal(calls.length, 7);
    assert.ok(calls.every((call) => typeof call.config.systemInstruction === 'string'));
    assert.equal(calls[3].contents[0].parts[0].inlineData.mimeType, 'image/png');
    assert.match(calls[4].contents[0].parts[0].text, /Tower height/);
    assert.match(calls[5].contents[0].parts[0].text, /Tower height/);
    assert.match(calls[6].contents[0].parts[0].text, /Trigonometry/);
  });
});

test('all endpoints reject missing, wrongly typed, or invalid request fields before contacting the provider', async () => {
  let calls = 0;
  await withApi({ apiKey: 'test-key', generateContent: async () => { calls++; return { text: 'bad' }; } }, async (post) => {
    for (const { path } of requests) {
      const response = await post(path, {});
      assert.equal(response.status, 400, path);
      assert.equal((await response.json()).status, 'invalid_request');
    }
    for (const [path, body] of [
      ['/api/translate', { text: 'Hello', targetLanguage: {} }],
      ['/api/translate-batch', { texts: ['hello', { dangerous: true }] }],
      ['/api/accessibility/summarize-captions', { transcripts: [12] }],
      ['/api/tutor/scan-page', { imageBase64: png(), mode: 'unknown' }],
      ['/api/tutor/generate-quiz', { structuredPage: { ...page, isUnreadable: true } }],
      ['/api/tutor/chat', { message: [], context: {} }],
      ['/api/tutor/chat', { message: 'Hi', accessibilityPrefs: { captions: 'yes' } }],
      ['/api/tutor/chat', { message: 'Hi', context: { pageSummary: {} } }],
    ] as const) assert.equal((await post(path, body)).status, 400, path);
    assert.equal(calls, 0);
  });
});

test('page uploads above 16 KiB reach the provider with detected MIME; image limits do not expand text routes', async () => {
  let seen: any;
  await withApi({ apiKey: 'test-key', generateContent: async (request) => { seen = request; return { text: JSON.stringify({ pageData: page, explanation }) }; } }, async (post, url) => {
    const image = png(20_000);
    assert.equal((await post('/api/tutor/scan-page', { imageBase64: image })).status, 200);
    assert.equal(seen.contents[0].parts[0].inlineData.mimeType, 'image/png');
    assert.equal(Buffer.from(seen.contents[0].parts[0].inlineData.data, 'base64').length, 20_000);
    for (const imageBase64 of [image.replace('image/png', 'image/jpeg'), 'not-base64!', 'data:image/svg+xml;base64,PHN2Zz4=', png(4 * 1024 * 1024 + 1)]) {
      assert.equal((await post('/api/tutor/scan-page', { imageBase64 })).status, 400);
    }
    assert.equal((await post('/api/tutor/scan-page', { imageBase64: 'A'.repeat(6 * 1024 * 1024) })).status, 413);
    assert.equal((await post('/api/translate', { text: 'Hello', filler: 'x'.repeat(20_000) })).status, 413);
    const invalidJson = await fetch(url + '/api/tutor/scan-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).status, 'invalid_request');
  });
});

test('provider failures across every endpoint return generic errors without leaking provider diagnostics', async () => {
  await withApi({ apiKey: 'test-key', generateContent: async () => { throw new Error('SECRET_KEY_REQUEST_URL'); } }, async (post) => {
    for (const { path, body } of requests) {
      const response = await post(path, body);
      assert.equal(response.status, 502, path);
      const result = await response.json();
      assert.equal(result.status, 'error');
      assert.doesNotMatch(JSON.stringify(result), /SECRET_KEY_REQUEST_URL/);
    }
  });
});

test('empty text, malformed JSON, wrong output shapes and invalid quiz answers never become successful results', async () => {
  for (const output of [' ', 'not JSON', '{}', 'null']) {
    await withApi({ apiKey: 'test-key', generateContent: async () => ({ text: output }) }, async (post) => {
      for (const index of [1, 3, 4, 5]) {
        const { path, body } = requests[index];
        assert.equal((await post(path, body)).status, 502, `${path}: ${output}`);
      }
      if (!output.trim()) {
        for (const index of [0, 2, 6]) assert.equal((await post(requests[index].path, requests[index].body)).status, 502);
      }
    });
  }
  await withApi({ apiKey: 'test-key', generateContent: async () => ({ text: JSON.stringify(quiz.map((item) => ({ ...item, correctAnswer: 8 }))) }) }, async (post) => {
    assert.equal((await post('/api/tutor/generate-quiz', { structuredPage: page })).status, 502);
  });
  await withApi({ apiKey: 'test-key', generateContent: async () => ({ text: JSON.stringify([{}, {}]) }) }, async (post) => {
    assert.equal((await post('/api/translate-batch', { texts: ['one', 'two'] })).status, 502);
  });
});

test('unreadable pages return a retake request without fabricated analysis', async () => {
  await withApi({ apiKey: 'test-key', generateContent: async () => ({ text: '{"isUnreadable":true}' }) }, async (post) => {
    const response = await post('/api/tutor/scan-page', { imageBase64: png() });
    const result = await response.json();
    assert.equal(result.status, 'unreadable');
    assert.match(result.message, /retake the photo/);
    assert.equal(result.pageData, undefined);
  });
});

test('one shared connection limit covers all AI routes, cannot be bypassed with forged identity, and resets exactly', async () => {
  let time = 1000;
  await withApi({ apiKey: '', now: () => time }, async (post, url) => {
    const all = [...requests, { path: '/api/loop-ai', body: { message: 'Hi' } }];
    for (let i = 0; i < 20; i++) {
      const { path, body } = all[i % all.length];
      assert.equal((await post(path, { ...body, auth: { userId: `forged-${i}` } }, { 'X-Forwarded-For': `192.0.2.${i}` })).status, 200);
    }
    for (const { path, body } of all) {
      const response = await post(path, body);
      assert.equal(response.status, 429, path);
      assert.equal(response.headers.get('Retry-After'), '60');
    }
    assert.equal((await fetch(url + '/api/health')).status, 200);
    time += 60_000;
    assert.equal((await post('/api/translate', { text: 'Hi' })).status, 200);
  });
});
