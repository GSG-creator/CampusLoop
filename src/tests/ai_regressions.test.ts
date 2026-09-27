import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_BOOKS, SEED_USERS } from '../data/seedData';
import { buildActionCardsForQuery, findVerifiedMentors, searchBooksInStore, sendLoopAiQuery, type LoopAiContext } from '../services/loopAiService';
import type { MentoringSession } from '../types';

const context = (): LoopAiContext => ({
  currentUser: structuredClone(SEED_USERS.aarav),
  books: structuredClone(SEED_BOOKS), sessions: [], redemptions: [],
  checkFreebieAvailable: () => ({ available: false, reason: 'Starter tier' }),
});
const session = (overrides: Partial<MentoringSession> = {}): MentoringSession => ({
  id: 'session', studentId: 'aarav', studentName: 'Aarav', studentGrade: 'Grade 10',
  mentorId: 'rohan', mentorName: 'Rohan', subject: 'Physics', topic: 'Motion', grade: 'Grade 10',
  date: '2099-10-01', time: '12:30', description: '', status: 'accepted',
  requestedAt: '2026-09-27T00:00:00Z', creditAwarded: false, ...overrides,
});

test('book lookup understands natural queries and enforces author, grade and availability together', () => {
  const books = structuredClone(SEED_BOOKS);
  assert.deepEqual(searchBooksInStore('Find Class 10 RD Sharma in the book exchange.', books).map((b) => b.id), ['book-rd-sharma-10']);
  assert.deepEqual(searchBooksInStore('Find HC Verma books', books).map((b) => b.id), ['book-hc-verma-physics']);
  assert.deepEqual(searchBooksInStore('Find science books', books).map((b) => b.id), ['book-oswaal-science-10']);
  assert.equal(searchBooksInStore('Class 12 RD Sharma', books).length, 0);
  books[0].status = 'reserved';
  assert.equal(searchBooksInStore('available RD Sharma books', books).length, 0);
  assert.equal(searchBooksInStore('show available books', books).length, books.length - 1);
});

test('book lookup accepts common questions and spaced initials without relaxing grade or author constraints', () => {
  const books = structuredClone(SEED_BOOKS);
  for (const query of ['Is RD Sharma available?', 'Do you have RD Sharma books?', 'Find R. D. Sharma books']) {
    assert.deepEqual(searchBooksInStore(query, books).map((book) => book.id), ['book-rd-sharma-10'], query);
  }
  assert.deepEqual(searchBooksInStore('Find H. C. Verma books', books).map((book) => book.id), ['book-hc-verma-physics']);
  assert.deepEqual(searchBooksInStore('Are there any available physics books?', books).map((book) => book.id),
    ['book-hc-verma-physics', 'book-rohan-sl-arora-12']);
  assert.equal(searchBooksInStore('Do you have Class 12 R. D. Sharma books?', books).length, 0);
  assert.equal(searchBooksInStore('Do you have H. C. Sharma books?', books).length, 0);
  books[0].status = 'reserved';
  assert.equal(searchBooksInStore('Is RD Sharma available?', books).length, 0);
});

test('mentor cards honor the requested subject, verification, current persona and real statistics', () => {
  const state = context();
  state.sessions = [session({ status: 'completed', rating: 5 }), session({ id: 'second', status: 'completed', rating: 3 })];
  const cards = buildActionCardsForQuery('I need physics help tomorrow', state, SEED_USERS);
  assert.equal(cards.find((card) => card.type === 'draft_mentoring')?.draftMentoringData?.subject, 'Physics');
  assert.equal(cards.find((card) => card.type === 'mentor')?.mentorData?.rating, 4);
  assert.equal(cards.find((card) => card.type === 'mentor')?.mentorData?.completedSessions, 2);
  assert.equal(buildActionCardsForQuery('Find a chemistry mentor', state, SEED_USERS).length, 0);
  state.currentUser = SEED_USERS.rohan;
  assert.equal(buildActionCardsForQuery('I need physics help tomorrow', state, SEED_USERS).length, 0);
  const suspended = { ...SEED_USERS, rohan: { ...SEED_USERS.rohan, isVerifiedMentor: false } };
  assert.equal(findVerifiedMentors(suspended).length, 0);
  assert.equal(buildActionCardsForQuery('Find a mentor', context(), suspended).length, 0);
});

test('mentor discovery uses active users instead of a hardcoded Rohan record', () => {
  const users = { ...SEED_USERS };
  delete users.rohan;
  users.other = { ...SEED_USERS.rohan, id: 'other', name: 'Other Mentor' };
  const cards = buildActionCardsForQuery('I need mathematics help tomorrow', context(), users);
  assert.equal(cards.find((card) => card.type === 'draft_mentoring')?.draftMentoringData?.mentorId, 'other');
  const profile = cards.find((card) => card.type === 'mentor')?.mentorData;
  assert.equal(profile?.rating, 0);
  assert.equal(profile?.completedSessions, 0);
  assert.equal(buildActionCardsForQuery('Show verified mentors', context(), users).filter((card) => card.type === 'draft_mentoring').length, 0);
});

test('Physics practice quiz has matching title, subject and topic', () => {
  const quiz = buildActionCardsForQuery('Give me a physics practice quiz', context(), SEED_USERS).find((card) => card.type === 'quiz');
  assert.equal(quiz?.quizData?.subject, 'Physics');
  assert.match(quiz?.title || '', /Physics/);
  assert.match(quiz?.quizData?.topic || '', /Physics/);
  assert.ok(quiz?.quizData?.questions.every((question) => question.id.startsWith('quiz-phys')));
});

test('upcoming sessions exclude declined, completed, past and other students records, and sort by time', () => {
  const state = context();
  state.sessions = [
    session({ id: 'later' }), session({ id: 'earlier', date: '2099-09-01' }),
    session({ id: 'declined', status: 'declined' }), session({ id: 'completed', status: 'completed' }),
    session({ id: 'awaiting', status: 'awaiting_learner_confirmation' }),
    session({ id: 'past', date: '2000-01-01' }), session({ id: 'other', studentId: 'meera' }),
  ];
  const cards = buildActionCardsForQuery('Show my upcoming sessions', state, SEED_USERS);
  assert.deepEqual(cards.map((card) => card.sessionData?.id), ['earlier', 'later']);
  const empty = buildActionCardsForQuery('Show my upcoming sessions', context(), SEED_USERS);
  assert.equal(empty[0].title, 'No upcoming sessions');
});

test('client keeps local action cards and sends only minimal untrusted demo context', async (t) => {
  let sent: any;
  t.mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, options: RequestInit) => {
    sent = JSON.parse(options.body as string);
    return new Response(JSON.stringify({ status: 'live', reply: 'Hello', actionCards: [{ type: 'book', bookData: { id: 'forged' } }] }));
  });
  const message = await sendLoopAiQuery('wallet credits', context(), SEED_USERS);
  assert.equal(message.status, 'live');
  assert.equal(message.actionCards?.[0].type, 'wallet');
  assert.equal(sent.auth, undefined);
  assert.equal(sent.clientIntentCards, undefined);
  assert.equal(sent.demoContext.userName, 'Aarav Patel');
  assert.equal(sent.demoContext.userId, undefined);
});

test('configured offline response includes navigation; lookup results are honestly local', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ status: 'offline', reply: 'Offline', offlineReason: 'Not configured' })));
  const noMatches = await sendLoopAiQuery('Hello', context(), SEED_USERS);
  assert.equal(noMatches.status, 'offline');
  assert.equal(noMatches.actionCards?.[0].type, 'navigation');
  const withMatches = await sendLoopAiQuery('wallet', context(), SEED_USERS);
  assert.equal(withMatches.status, 'system_direct');
  assert.match(withMatches.text, /Local Demo Results/);
});

test('malformed success responses never become live assistant messages', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ reply: 'Missing status' })));
  const message = await sendLoopAiQuery('Hello', context(), SEED_USERS);
  assert.equal(message.status, 'offline');
  assert.equal(message.actionCards?.[0].type, 'navigation');
});

test('HTTP 429 is surfaced with navigation instead of a fake live reply', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ reply: 'Wait 60 seconds.' }), { status: 429 }));
  const message = await sendLoopAiQuery('Hello', context(), SEED_USERS);
  assert.equal(message.status, 'rate_limited');
  assert.equal(message.text, 'Wait 60 seconds.');
  assert.equal(message.actionCards?.[0].type, 'navigation');
});
