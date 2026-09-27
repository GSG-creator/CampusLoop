import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppProvider, useApp } from '../context/AppContext';
import { REWARD_CATALOGUE } from '../data/rewardData';

// Exercise the real provider and its React batching, rather than copied business logic.
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

function Probe() {
  app = useApp();
  return null;
}

async function mount() {
  await act(async () => {
    renderer = create(<React.StrictMode><AppProvider><Probe /></AppProvider></React.StrictMode>);
  });
}

async function run<T>(action: () => T): Promise<T> {
  let result: T;
  await act(async () => { result = action(); });
  return result!;
}

const reward = (id: string) => REWARD_CATALOGUE.find((item) => item.id === id)!;
const request = {
  mentorId: 'rohan', subject: 'Mathematics', topic: 'Applications of Trigonometry',
  grade: 'Grade 10', date: '2026-10-20', time: '12:30', description: 'Trigonometry help',
  baselineAnswers: [1, 0, 1],
};
const finalQuiz = { finalAnswers: [1, 2, 0], rating: 5 };

async function pendingConfirmation() {
  const result = await run(() => app.requestMentoringSession(request));
  assert.equal(result.success, true);
  const id = result.sessionId!;
  await run(() => app.switchUser('rohan'));
  assert.equal((await run(() => app.acceptMentoringSession(id))).success, true);
  assert.equal((await run(() => app.finishMentoringSession(id))).success, true);
  await run(() => app.switchUser('aarav'));
  return id;
}

describe('AppProvider workflow regressions', () => {
  beforeEach(async () => { storage.clear(); await mount(); });
  afterEach(async () => { await act(async () => renderer.unmount()); });

  it('rejects a second reservation in the same React batch', async () => {
    const results = await run(() => [
      app.reserveBook('book-rd-sharma-10'), app.reserveBook('book-rd-sharma-10'),
    ]);
    assert.deepEqual(results.map((result) => result.success), [true, false]);
    assert.equal(app.notifications.filter((item) => item.title === 'New Book Reservation').length, 1);
  });

  it('awards a donation once, even through a retained action callback', async () => {
    await run(() => app.reserveBook('book-rd-sharma-10'));
    await run(() => app.switchUser('meera'));
    const confirm = app.confirmHandover;
    const results = await run(() => [confirm('book-rd-sharma-10'), confirm('book-rd-sharma-10')]);
    assert.deepEqual(results.map((result) => result.success), [true, false]);
    assert.equal(app.users.meera.credits, 1300);
    assert.equal(app.transactions.filter((tx) => tx.type === 'donation_reward').length, 1);
    assert.equal((await run(() => confirm('book-rd-sharma-10'))).success, false);
  });

  it('commits independent book rewards without losing a balance update', async () => {
    await run(() => {
      app.reserveBook('book-rd-sharma-10');
      app.reserveBook('book-hc-verma-physics');
      app.switchUser('meera');
      assert.equal(app.confirmHandover('book-hc-verma-physics').success, true);
      assert.equal(app.confirmHandover('book-rd-sharma-10').success, true);
      assert.equal(app.confirmReturn('book-hc-verma-physics').success, true);
      assert.equal(app.confirmReturn('book-hc-verma-physics').success, false);
    });
    assert.equal(app.users.meera.credits, 1320);
    assert.equal(app.transactions.filter((tx) => tx.userId === 'meera').reduce((sum, tx) => sum + tx.amount, 0), 1320);
  });

  it('blocks conflicting requests before a rerender and gives distinct sessions unique IDs', async () => {
    const results = await run(() => [
      app.requestMentoringSession(request), app.requestMentoringSession(request),
      app.requestMentoringSession({ ...request, time: '13:30' }),
    ]);
    assert.deepEqual(results.map((result) => result.success), [true, false, true]);
    assert.notEqual(results[0].sessionId, results[2].sessionId);
  });

  it('finalizes mentoring exactly once and persists its balance and ledger together', async () => {
    const id = await pendingConfirmation();
    const results = await run(() => [app.confirmAndFinalizeSession(id, finalQuiz), app.confirmAndFinalizeSession(id, finalQuiz)]);
    assert.deepEqual(results.map((result) => result.success), [true, false]);
    assert.equal(app.users.rohan.credits, 10010);
    assert.equal(app.users.aarav.credits, 350);
    assert.equal(app.transactions.filter((tx) => tx.relatedSessionId === id).length, 1);
    assert.equal(app.showMilestoneModal, true);
    await act(async () => renderer.unmount());
    await mount();
    assert.equal(app.users.rohan.credits, 10010);
    assert.equal(app.sessions.find((session) => session.id === id)?.creditAwarded, true);
    assert.equal((await run(() => app.confirmAndFinalizeSession(id, finalQuiz))).success, false);
  });

  it('allows only the assigned mentor or admin to decline a pending request', async () => {
    const result = await run(() => app.requestMentoringSession(request));
    const id = result.sessionId!;
    assert.equal((await run(() => app.declineMentoringSession(id))).success, false);
    await run(() => app.switchUser('meera'));
    assert.equal((await run(() => app.declineMentoringSession(id))).success, false);
    await run(() => app.switchUser('rohan'));
    assert.equal((await run(() => app.acceptMentoringSession(id))).success, true);
    assert.equal((await run(() => app.declineMentoringSession(id))).success, false);
  });

  it('enforces admin verification and prevents suspended mentors from finishing', async () => {
    const result = await run(() => app.requestMentoringSession(request));
    const id = result.sessionId!;
    assert.equal((await run(() => app.toggleMentorVerification('aarav'))).success, false);
    await run(() => app.switchUser('rohan'));
    await run(() => app.acceptMentoringSession(id));
    await run(() => app.switchUser('ananya'));
    assert.equal((await run(() => app.toggleMentorVerification('rohan'))).success, true);
    await run(() => app.switchUser('rohan'));
    assert.equal((await run(() => app.finishMentoringSession(id))).success, false);
    assert.equal(app.sessions[0].status, 'accepted');
  });

  it('enforces freebie quotas before a rerender', async () => {
    await run(() => app.switchUser('meera'));
    const snack = reward('snack-samosa-chai');
    const results = await run(() => [app.redeemCanteenItem(snack, true), app.redeemCanteenItem(snack, true)]);
    assert.deepEqual(results.map((result) => result.success), [true, false]);
    assert.equal(app.redemptions.length, 1);
    assert.equal(app.users.meera.credits, 1250);
  });

  it('deducts every accepted purchase from the latest balance with unique vouchers', async () => {
    await run(() => app.switchUser('meera'));
    const snack = reward('snack-samosa-chai');
    const results = await run(() => Array.from({ length: 40 }, () => app.redeemCanteenItem(snack, false)));
    const accepted = results.filter((result) => result.success).length;
    assert.equal(accepted, 19); // Last purchase drops Bronze balance from 530 to 490.
    assert.equal(app.users.meera.credits, 1250 - accepted * snack.creditCost);
    assert.equal(app.transactions.filter((tx) => tx.type === 'canteen_redemption').length, accepted);
    assert.equal(new Set(app.redemptions.map((item) => item.id)).size, accepted);
    assert.equal(new Set(app.redemptions.map((item) => item.code)).size, accepted);
  });

  it('uses catalogue prices and blocks tier, category, and Tech Vault bypasses', async () => {
    assert.equal((await run(() => app.redeemCanteenItem(reward('snack-samosa-chai'), false))).success, false);
    await run(() => app.switchUser('meera'));
    assert.equal((await run(() => app.redeemCanteenItem({ ...reward('snack-samosa-chai'), creditCost: 0 }, false))).success, true);
    assert.equal(app.users.meera.credits, 1210);
    assert.equal((await run(() => app.redeemCanteenItem(reward('stat-print-notes'), true))).success, false);
    assert.equal((await run(() => app.redeemCanteenItem(reward('tech-ipad-air'), true))).success, false);
    assert.equal((await run(() => app.requestMajorReward(reward('snack-samosa-chai')))).success, false);
    assert.equal(app.redemptions.length, 1);
  });

  it('keeps the Legend welcome combo one-time even when requested as a purchase', async () => {
    const id = await pendingConfirmation();
    await run(() => app.confirmAndFinalizeSession(id, finalQuiz));
    await run(() => app.switchUser('rohan'));
    const results = await run(() => [
      app.redeemCanteenItem(reward('meal-legend-combo'), false),
      app.redeemCanteenItem(reward('meal-legend-combo'), false),
    ]);
    assert.deepEqual(results.map((result) => result.success), [true, false]);
    assert.equal(app.redemptions[0].isFreebie, true);
    assert.equal(app.redemptions[0].periodKey, 'legend-welcome');
    assert.equal(app.users.rohan.credits, 10010);
  });

  it('restricts reward review to admins and finalizes a request once', async () => {
    const sessionId = await pendingConfirmation();
    await run(() => app.confirmAndFinalizeSession(sessionId, finalQuiz));
    await run(() => app.switchUser('rohan'));
    const results = await run(() => [app.requestMajorReward(reward('tech-ipad-air')), app.requestMajorReward(reward('tech-ipad-air'))]);
    assert.deepEqual(results.map((result) => result.success), [true, false]);
    const id = app.majorRewardRequests[0].id;
    assert.equal((await run(() => app.approveMajorReward(id, true))).success, false);
    await run(() => app.switchUser('ananya'));
    const reviews = await run(() => [app.approveMajorReward(id, true), app.approveMajorReward(id, false)]);
    assert.deepEqual(reviews.map((result) => result.success), [true, false]);
    assert.equal(app.majorRewardRequests[0].status, 'approved');
  });

  it('allows voucher collection only by its owner or admin and rejects repeated scans', async () => {
    await run(() => app.switchUser('meera'));
    const result = await run(() => app.redeemCanteenItem(reward('snack-samosa-chai'), true));
    const id = result.redemption!.id;
    await run(() => app.switchUser('aarav'));
    assert.equal((await run(() => app.scanCanteenCode(id))).success, false);
    await run(() => app.switchUser('ananya'));
    const scans = await run(() => [app.scanCanteenCode(id), app.scanCanteenCode(id)]);
    assert.deepEqual(scans.map((result) => result.success), [true, false]);
  });
});
