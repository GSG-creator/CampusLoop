import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppProvider, useApp } from '../context/AppContext';
import { SEED_USERS } from '../data/seedData';
import type { LearningPlanDraft, LearningSupport, MentoringSession } from '../types';

let app: ReturnType<typeof useApp>;
let renderer: ReactTestRenderer;
const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  },
});
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() { app = useApp(); return null; }
async function mount() {
  await act(async () => {
    renderer = create(<React.StrictMode><AppProvider><Probe /></AppProvider></React.StrictMode>);
  });
}
async function run<T>(action: () => T): Promise<T> {
  let result!: T;
  await act(async () => { result = action(); });
  return result;
}

const support = (): LearningSupport => ({
  needs: ['memory', 'processing', 'energy'], strengths: 'I enjoy sorting pictures.',
  goal: 'Practise choosing the steps for a familiar daily task.', responseMode: 'pointing',
  sessionMinutes: 20, breakEveryMinutes: 5,
});
const request = () => ({
  mentorId: 'rohan', subject: 'Mathematics', topic: 'Everyday sequences', grade: 'Grade 10',
  date: '2099-10-20', time: '12:30', description: 'Use picture cards and flexible pauses.',
  baselineAnswers: [], assessmentMode: 'supported' as const, learningSupport: support(),
});
const plan = (): LearningPlanDraft => ({
  goal: 'Choose the next step in a familiar routine.', strengths: 'Recognises familiar pictures.',
  startingPoint: 'Ask the learner which routine feels comfortable to practise.',
  strategies: ['Offer one step at a time and allow extra response time.'],
  lessons: [{
    title: 'Choose the next step', objective: 'Choose between two familiar picture cards.',
    activities: 'Model the sequence, offer two cards, then practise together with pauses.',
    evidence: 'Ask whether the learner wants to repeat, change or stop the activity.',
  }],
  materials: 'Large picture cards', responseMode: 'pointing', reviewDate: '2099-10-21',
  teacherGuidance: 'Check the activity and adapt it with the learner.',
});
async function createSupported(overrides: Partial<ReturnType<typeof request>> = {}) {
  await run(() => app.switchUser('aarav'));
  const result = await run(() => app.requestMentoringSession({ ...request(), ...overrides }));
  assert.equal(result.success, true, result.message);
  return result.sessionId!;
}
async function finish(id: string) {
  await run(() => app.switchUser('rohan'));
  assert.equal((await run(() => app.saveLearningPlan(id, plan(), true))).success, true);
  await run(() => app.switchUser('aarav'));
  assert.equal((await run(() => app.respondToLearningPlan(id, 'agreed'))).success, true);
  await run(() => app.switchUser('rohan'));
  assert.equal((await run(() => app.acceptMentoringSession(id))).success, true);
  const result = await run(() => app.finishMentoringSession(id));
  assert.equal(result.success, true);
  assert.doesNotMatch(result.message, /quiz/i);
  await run(() => app.switchUser('aarav'));
}

describe('Needs-based supported mentoring state', () => {
  beforeEach(async () => { storage.clear(); await mount(); });
  afterEach(async () => { await act(async () => renderer.unmount()); });

  it('creates a supported session from learner preferences without fabricating a baseline quiz', async () => {
    const preferences = support();
    const id = await createSupported({ learningSupport: preferences });
    const session = app.sessions.find((item) => item.id === id)!;
    assert.equal(session.assessmentMode, 'supported');
    assert.equal(session.sessionMinutes, 20);
    assert.equal(session.baselineQuiz, undefined);
    assert.deepEqual(session.learningSupport, preferences);
    preferences.needs.push('motor');
    preferences.goal = 'Changed after submission';
    assert.deepEqual(session.learningSupport?.needs, ['memory', 'processing', 'energy']);
    assert.notEqual(session.learningSupport?.goal, preferences.goal);
    assert.equal(app.users.aarav.credits, 350);
    assert.equal(app.users.rohan.credits, 9940);
    assert.doesNotMatch(app.notifications[0].message, /baseline|score/i);
  });

  it('rejects unsupported preferences and invalid bounds without adding a session', async () => {
    const invalid: unknown[] = [
      undefined, null, { ...support(), goal: '  ' }, { ...support(), goal: 'x'.repeat(501) },
      { ...support(), strengths: 'x'.repeat(501) }, { ...support(), needs: ['diagnosis'] },
      { ...support(), needs: ['memory', 'memory'] }, { ...support(), needs: Array(1) },
      { ...support(), responseMode: 'mandatory speech' }, { ...support(), sessionMinutes: 0 },
      { ...support(), sessionMinutes: 91 }, { ...support(), sessionMinutes: 20.5 },
      { ...support(), breakEveryMinutes: -1 }, { ...support(), breakEveryMinutes: 21 },
    ];
    for (const learningSupport of invalid) {
      const result = await run(() => app.requestMentoringSession({ ...request(), learningSupport: learningSupport as LearningSupport }));
      assert.equal(result.success, false, JSON.stringify(learningSupport));
    }
    assert.equal(app.sessions.length, 0);
    // Learners can choose an adapted response format without naming any support need.
    assert.equal((await run(() => app.requestMentoringSession({ ...request(), learningSupport: { ...support(), needs: [], breakEveryMinutes: 0 } }))).success, true);
  });

  it('keeps the quiz route compatible while requiring complete valid baseline answers', async () => {
    for (const baselineAnswers of [[], [1, 2], [1, 2, 4], [1, -1, 0], [1, Number.NaN, 0], Array(3)]) {
      const result = await run(() => app.requestMentoringSession({ ...request(), assessmentMode: 'quiz', baselineAnswers }));
      assert.equal(result.success, false);
    }
    const result = await run(() => app.requestMentoringSession({
      ...request(), assessmentMode: undefined, learningSupport: undefined,
      topic: 'Applications of Trigonometry', baselineAnswers: [1, 0, 1],
    }));
    assert.equal(result.success, true);
    assert.equal(app.sessions[0].assessmentMode, 'quiz');
    assert.equal(app.sessions[0].sessionMinutes, 45);
    assert.equal(app.sessions[0].baselineQuiz?.score, 1);
  });

  it('requires valid final quiz answers on the quiz route and keeps its original reward calculation', async () => {
    const requested = await run(() => app.requestMentoringSession({
      ...request(), assessmentMode: 'quiz', learningSupport: undefined,
      topic: 'Applications of Trigonometry', baselineAnswers: [1, 0, 1],
    }));
    const id = requested.sessionId!;
    await run(() => app.switchUser('rohan'));
    await run(() => app.acceptMentoringSession(id));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, true);
    await run(() => app.switchUser('aarav'));
    for (const finalAnswers of [[], [1, 2], [1, -1, 0], [1, 2, 4]]) {
      assert.equal((await run(() => app.confirmAndFinalizeSession(id, { finalAnswers, rating: 5 }))).success, false);
    }
    assert.equal(app.users.rohan.credits, 9940);
    const completed = await run(() => app.confirmAndFinalizeSession(id, { finalAnswers: [1, 2, 0], rating: 5 }));
    assert.equal(completed.success, true);
    assert.equal(completed.breakdown?.assessmentMode, 'quiz');
    assert.equal(completed.breakdown?.quizImprovementBonus, 20);
    assert.equal(completed.breakdown?.supportCompletionBonus, 0);
    assert.equal(completed.breakdown?.total, 70);
    assert.equal(app.sessions[0].finalQuiz?.score, 3);
  });

  it('defaults to offline delivery without inventing a venue or link', async () => {
    await createSupported();
    assert.equal(app.sessions[0].classMode, 'offline');
    assert.equal(app.sessions[0].location, undefined);
    assert.equal(app.sessions[0].meetingLink, undefined);
  });

  it('stores only the selected delivery details and persists both online and offline sessions', async () => {
    const online = await run(() => app.requestMentoringSession({
      ...request(), classMode: 'online', meetingLink: ' https://example.org/class?room=campus ',
      location: 'Old offline venue',
    }));
    assert.equal(online.success, true);
    const offline = await run(() => app.requestMentoringSession({
      ...request(), time: '13:30', classMode: 'offline', location: ' Library learning room ',
      meetingLink: 'https://example.org/old-link',
    }));
    assert.equal(offline.success, true);
    const saved = structuredClone(app.sessions);
    const onlineSession = saved.find((item) => item.id === online.sessionId)!;
    const offlineSession = saved.find((item) => item.id === offline.sessionId)!;
    assert.equal(onlineSession.meetingLink, 'https://example.org/class?room=campus');
    assert.equal(onlineSession.location, undefined);
    assert.equal(offlineSession.location, 'Library learning room');
    assert.equal(offlineSession.meetingLink, undefined);
    await act(async () => renderer.unmount());
    await mount();
    assert.deepEqual(app.sessions, saved);
  });

  it('rejects unsafe links, embedded credentials and invalid delivery metadata', async () => {
    for (const meetingLink of [
      'javascript:alert(1)', 'http://example.org/room', 'data:text/html,hello', '/local-path',
      'https://user:password@example.org/room', 'https://', `https://example.org/${'x'.repeat(2048)}`,
    ]) {
      assert.equal((await run(() => app.requestMentoringSession({ ...request(), classMode: 'online', meetingLink }))).success, false);
    }
    assert.equal((await run(() => app.requestMentoringSession({ ...request(), classMode: 'hybrid' as 'online' }))).success, false);
    assert.equal((await run(() => app.requestMentoringSession({ ...request(), location: 'x'.repeat(201) }))).success, false);
    assert.equal(app.sessions.length, 0);
    assert.equal((await run(() => app.requestMentoringSession({ ...request(), classMode: 'online', meetingLink: '' }))).success, true);
    assert.equal(app.sessions[0].meetingLink, undefined);
  });

  it('allows only the assigned verified mentor to save a plan', async () => {
    const id = await createSupported();
    for (const persona of ['aarav', 'meera', 'ananya']) {
      await run(() => app.switchUser(persona));
      assert.equal((await run(() => app.saveLearningPlan(id, plan(), false))).success, false);
    }
    await run(() => app.switchUser('rohan'));
    const draft = plan();
    assert.equal((await run(() => app.saveLearningPlan(id, draft, false))).success, true);
    assert.equal(app.sessions[0].learningPlan?.status, 'draft');
    assert.equal(app.sessions[0].learningPlan?.authorId, 'rohan');
    draft.lessons[0].activities = 'Changed caller data';
    assert.notEqual(app.sessions[0].learningPlan?.lessons[0].activities, draft.lessons[0].activities);
    await run(() => app.switchUser('ananya'));
    await run(() => app.toggleMentorVerification('rohan'));
    await run(() => app.switchUser('rohan'));
    assert.equal((await run(() => app.saveLearningPlan(id, plan(), true))).success, false);
  });

  it('validates complete plans before publishing any change', async () => {
    const id = await createSupported();
    await run(() => app.switchUser('rohan'));
    const invalid: unknown[] = [
      null, { ...plan(), goal: '' }, { ...plan(), startingPoint: '' },
      { ...plan(), strengths: 'x'.repeat(501) }, { ...plan(), strategies: [] },
      { ...plan(), strategies: [''] }, { ...plan(), strategies: Array(1) },
      { ...plan(), lessons: [] }, { ...plan(), lessons: [null] },
      { ...plan(), lessons: [{ ...plan().lessons[0], evidence: '' }] },
      { ...plan(), reviewDate: '2099-02-30' }, { ...plan(), responseMode: 'video' },
      { ...plan(), materials: 'x'.repeat(2001) }, { ...plan(), teacherGuidance: 'x'.repeat(2001) },
    ];
    for (const draft of invalid) {
      assert.equal((await run(() => app.saveLearningPlan(id, draft as LearningPlanDraft, true))).success, false);
    }
    assert.equal(app.sessions[0].learningPlan, undefined);
  });

  it('requires sharing before learner response or teacher review and invalidates both on edits', async () => {
    const id = await createSupported();
    await run(() => app.switchUser('rohan'));
    await run(() => app.saveLearningPlan(id, plan(), false));
    await run(() => app.switchUser('aarav'));
    assert.equal((await run(() => app.respondToLearningPlan(id, 'agreed'))).success, false);
    await run(() => app.switchUser('ananya'));
    assert.equal((await run(() => app.reviewLearningPlan(id, 'Reviewed'))).success, false);
    await run(() => app.switchUser('rohan'));
    await run(() => app.saveLearningPlan(id, plan(), true));
    assert.equal((await run(() => app.reviewLearningPlan(id, 'Self-review'))).success, false);
    await run(() => app.switchUser('meera'));
    assert.equal((await run(() => app.respondToLearningPlan(id, 'agreed'))).success, false);
    await run(() => app.switchUser('aarav'));
    assert.equal((await run(() => app.respondToLearningPlan(id, 'changes_requested', 'Please use larger cards.'))).success, true);
    await run(() => app.switchUser('ananya'));
    assert.equal((await run(() => app.reviewLearningPlan(id, 'Suitable with flexible pauses.'))).success, true);
    assert.equal((await run(() => app.reviewLearningPlan(id, 'Repeat review'))).success, false);
    assert.equal(app.sessions[0].learningPlan?.reviewedBy, 'ananya');
    assert.equal(app.sessions[0].learningPlan?.learnerResponse, 'changes_requested');
    await run(() => app.switchUser('rohan'));
    assert.equal((await run(() => app.saveLearningPlan(id, { ...plan(), materials: 'Larger picture cards' }, true))).success, true);
    const edited = app.sessions[0].learningPlan!;
    assert.equal(edited.status, 'shared');
    for (const field of ['reviewedBy', 'reviewedAt', 'reviewNote', 'learnerResponse', 'learnerNote'] as const) {
      assert.equal(edited[field], undefined, `${field} must be cleared when content changes`);
    }
  });

  it('rejects invalid learner responses and oversized notes without losing valid feedback', async () => {
    const id = await createSupported();
    await run(() => app.switchUser('rohan'));
    await run(() => app.saveLearningPlan(id, plan(), true));
    await run(() => app.switchUser('aarav'));
    await run(() => app.respondToLearningPlan(id, 'agreed', 'This format works for me.'));
    assert.equal((await run(() => app.respondToLearningPlan(id, 'invalid' as 'agreed'))).success, false);
    assert.equal((await run(() => app.respondToLearningPlan(id, 'changes_requested', 'x'.repeat(2001)))).success, false);
    assert.equal(app.sessions[0].learningPlan?.learnerResponse, 'agreed');
    await run(() => app.switchUser('ananya'));
    assert.equal((await run(() => app.reviewLearningPlan(id, 'x'.repeat(2001)))).success, false);
    assert.equal(app.sessions[0].learningPlan?.status, 'shared');
  });

  it('blocks plan edits, reviews and responses once a session is finished or declined', async () => {
    for (const declined of [false, true]) {
      const id = await createSupported({ time: declined ? '13:30' : '12:30' });
      await run(() => app.switchUser('rohan'));
      await run(() => app.saveLearningPlan(id, plan(), true));
      if (declined) await run(() => app.declineMentoringSession(id));
      else {
        await run(() => app.switchUser('aarav'));
        await run(() => app.respondToLearningPlan(id, 'agreed'));
        await run(() => app.switchUser('rohan'));
        await run(() => app.acceptMentoringSession(id));
        assert.equal((await run(() => app.finishMentoringSession(id))).success, true);
      }
      assert.equal((await run(() => app.saveLearningPlan(id, plan(), false))).success, false);
      await run(() => app.switchUser('ananya'));
      assert.equal((await run(() => app.reviewLearningPlan(id, 'Too late'))).success, false);
      await run(() => app.switchUser('aarav'));
      assert.equal((await run(() => app.respondToLearningPlan(id, 'agreed'))).success, false);
    }
  });

  it('requires a shared plan and learner agreement before finishing, including after a plan edit', async () => {
    const id = await createSupported();
    await run(() => app.switchUser('rohan'));
    await run(() => app.acceptMentoringSession(id));
    const noPlan = await run(() => app.finishMentoringSession(id));
    assert.equal(noPlan.success, false);
    assert.match(noPlan.message, /Share the learning plan.*learner to agree/);
    await run(() => app.saveLearningPlan(id, plan(), false));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, false);
    await run(() => app.saveLearningPlan(id, plan(), true));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, false);
    await run(() => app.switchUser('ananya'));
    await run(() => app.reviewLearningPlan(id, 'Teacher review is not learner agreement.'));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, false);
    await run(() => app.switchUser('aarav'));
    await run(() => app.respondToLearningPlan(id, 'agreed'));
    await run(() => app.switchUser('rohan'));
    await run(() => app.saveLearningPlan(id, { ...plan(), materials: 'New picture cards' }, true));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, false);
    await run(() => app.switchUser('aarav'));
    await run(() => app.respondToLearningPlan(id, 'changes_requested', 'Please use fewer cards.'));
    await run(() => app.switchUser('rohan'));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, false);
    await run(() => app.switchUser('aarav'));
    await run(() => app.respondToLearningPlan(id, 'agreed'));
    await run(() => app.switchUser('rohan'));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, true);
    assert.equal(app.sessions[0].learningPlan?.status, 'shared', 'Teacher review is optional.');
  });

  it('rewards participation equally for practice, maintenance and requests for further support without quizzes', async () => {
    const reviews = ['practised', 'maintained', 'needs_more_support'] as const;
    for (const [index, goalReview] of reviews.entries()) {
      const id = await createSupported({ learningSupport: { ...support(), sessionMinutes: (index + 1) * 10 } });
      await finish(id);
      const results = await run(() => [
        app.confirmAndFinalizeSession(id, { finalAnswers: [], rating: 5, participationConfirmed: true, goalReview }),
        app.confirmAndFinalizeSession(id, { finalAnswers: [], rating: 5, participationConfirmed: true, goalReview }),
      ]);
      assert.deepEqual(results.map((result) => result.success), [true, false]);
      assert.equal(results[0].breakdown?.total, 70);
      assert.equal(results[0].breakdown?.supportCompletionBonus, 20);
      assert.equal(results[0].breakdown?.quizImprovementBonus, 0);
      assert.equal(results[0].breakdown?.assessmentMode, 'supported');
      assert.doesNotMatch(results[0].message, /score|quiz|gain/i);
      const session = app.sessions.find((item) => item.id === id)!;
      assert.equal(session.goalReview, goalReview);
      assert.equal(session.baselineQuiz, undefined);
      assert.equal(session.finalQuiz, undefined);
      const transactions = app.transactions.filter((item) => item.relatedSessionId === id);
      assert.equal(transactions.length, 1);
      assert.match(transactions[0].description, /Supported Participation/);
      assert.doesNotMatch(transactions[0].description, /Quiz Gain/);
    }
    assert.equal(app.users.rohan.credits, 9940 + 210);
    assert.equal(app.users.aarav.credits, 350);
    assert.equal(app.getImpactMetrics().mentoringHours, 1);
  });

  it('requires participant confirmation, a valid reflection and rating before awarding supported credits', async () => {
    const id = await createSupported();
    await finish(id);
    const valid = { finalAnswers: [], rating: 5, participationConfirmed: true, goalReview: 'maintained' as const };
    for (const invalid of [
      { ...valid, participationConfirmed: false }, { ...valid, goalReview: undefined },
      { ...valid, goalReview: 'improved' as 'maintained' }, { ...valid, rating: 0 }, { ...valid, rating: 6 },
      { ...valid, feedbackComment: 'x'.repeat(2001) },
    ]) {
      assert.equal((await run(() => app.confirmAndFinalizeSession(id, invalid))).success, false);
    }
    assert.equal(app.users.rohan.credits, 9940);
    assert.equal(app.sessions[0].status, 'awaiting_learner_confirmation');
    await run(() => app.switchUser('meera'));
    assert.equal((await run(() => app.confirmAndFinalizeSession(id, valid))).success, false);
    await run(() => app.switchUser('aarav'));
    const result = await run(() => app.confirmAndFinalizeSession(id, { ...valid, rating: 3 }));
    assert.equal(result.success, true);
    assert.equal(result.breakdown?.total, 60);
    assert.equal(result.breakdown?.feedbackBonus, 0);
    assert.equal(result.breakdown?.supportCompletionBonus, 20);
  });

  it('persists shared plans, review, agreement and support preferences, then clears them on reset', async () => {
    const id = await createSupported();
    await run(() => app.switchUser('rohan'));
    await run(() => app.saveLearningPlan(id, plan(), true));
    await run(() => app.switchUser('ananya'));
    await run(() => app.reviewLearningPlan(id, 'Use learner-led pauses.'));
    await run(() => app.switchUser('aarav'));
    await run(() => app.respondToLearningPlan(id, 'agreed', 'I can point to my choice.'));
    const saved = structuredClone(app.sessions[0]);
    await act(async () => renderer.unmount());
    await mount();
    assert.deepEqual(app.sessions[0], saved);
    assert.equal(app.sessions[0].learningPlan?.status, 'reviewed');
    await run(() => app.resetAllData());
    assert.deepEqual(app.sessions, []);
    assert.deepEqual(app.users, SEED_USERS);
    await act(async () => renderer.unmount());
    await mount();
    assert.deepEqual(app.sessions, []);
  });

  it('counts selected session duration and uses 45 minutes only for legacy records', async () => {
    const id = await createSupported({ learningSupport: { ...support(), sessionMinutes: 15 } });
    await finish(id);
    await run(() => app.confirmAndFinalizeSession(id, {
      finalAnswers: [], rating: 4, participationConfirmed: true, goalReview: 'practised',
    }));
    assert.equal(app.getImpactMetrics().mentoringHours, 0.25);
    const legacy: MentoringSession = { ...app.sessions[0], id: 'legacy-completed', assessmentMode: undefined, sessionMinutes: undefined };
    await act(async () => renderer.unmount());
    storage.set('CAMPUSLOOP_STATE_V3_SESSIONS', JSON.stringify([...app.sessions, legacy]));
    await mount();
    assert.equal(app.getImpactMetrics().mentoringHours, 1);
  });
});
