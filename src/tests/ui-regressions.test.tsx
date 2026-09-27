import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import React from 'react';
import { act, create, ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { useApp } from '../context/AppContext';
import { TestProviders } from './testProviders';
import { SEED_USERS } from '../data/seedData';
import { BookExchange } from '../components/BookExchange';
import { BookCard } from '../components/BookCard';
import { MentoringView } from '../components/MentoringView';
import { RequestMentoringModal } from '../components/RequestMentoringModal';
import { RewardsView } from '../components/RewardsView';
import { CanteenRedemptionModal } from '../components/CanteenRedemptionModal';
import { LoopAIView } from '../components/LoopAIView';
import { FloatingLoopAI } from '../components/FloatingLoopAI';
import { LoopAISessionCard } from '../components/LoopAISessionCard';
import type { MentoringSession } from '../types';
import App from '../App';
import { AdminAuditView } from '../components/AdminAuditView';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
let app: ReturnType<typeof useApp>;
const originalFetch = globalThis.fetch;
const noop = () => {};

function text(node: ReactTestInstance | string): string {
  return typeof node === 'string' ? node : node.children.map(text).join('');
}

function button(label: string): ReactTestInstance {
  const found = renderer!.root.findAllByType('button').find((node) => text(node).includes(label));
  assert.ok(found, `Button not found: ${label}`);
  return found;
}

async function mount(element: React.ReactElement, fixtures: Record<string, unknown> = {}) {
  const values = new Map(Object.entries(fixtures).map(([key, value]) => [`CAMPUSLOOP_STATE_V3_${key}`, typeof value === 'string' ? value : JSON.stringify(value)]));
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  } });
  function Capture() { app = useApp(); return null; }
  await act(async () => { renderer = create(element.type === App ? element : <TestProviders><Capture />{element}</TestProviders>); });
}

afterEach(async () => {
  await act(async () => renderer?.unmount());
  renderer = undefined;
  globalThis.fetch = originalFetch;
});

function session(overrides: Partial<MentoringSession> = {}): MentoringSession {
  return {
    id: 'session-ui', studentId: 'aarav', studentName: 'Aarav Patel', studentGrade: 'Grade 10',
    mentorId: 'rohan', mentorName: 'Rohan Verma', subject: 'Mathematics', topic: 'Applications of Trigonometry',
    grade: 'Grade 10', date: '2030-10-10', time: '16:30', description: 'Test session',
    status: 'awaiting_learner_confirmation', requestedAt: '2030-10-09T10:00:00Z', creditAwarded: false,
    baselineQuiz: { answers: [1, 2, 0], score: 3, totalQuestions: 3, percentage: 100, completedAt: '2030-10-09T10:00:00Z' },
    ...overrides,
  };
}

test('Grade 12 includes a Grade 11-12 book, and padded search finds it', async () => {
  await mount(<BookExchange onOpenListingModal={noop} />);
  await act(async () => renderer!.root.findAllByType('select')[0].props.onChange({ target: { value: 'Grade 12' } }));
  assert.ok(renderer!.root.findAllByType(BookCard).some((node) => node.props.book.grade === 'Grade 11-12'));
  const search = renderer!.root.findAllByType('input').find((node) => node.props.type === 'text')!;
  await act(async () => search.props.onChange({ target: { value: '  Concepts of Physics  ' } }));
  assert.equal(renderer!.root.findAllByType(BookCard).length, 1);
});

test('suspended mentors cannot be selected through a stale mentor role', async () => {
  const users = structuredClone(SEED_USERS);
  users.rohan.isVerifiedMentor = false;
  await mount(<RequestMentoringModal isOpen onClose={noop} onSuccess={noop} />, { USERS: users });
  assert.ok(text(renderer!.root).includes('No verified mentors are available'));
  await act(async () => renderer!.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.ok(text(renderer!.root).includes('Please select a verified mentor.'));
  assert.equal(renderer!.root.findAllByType('input').filter((node) => node.props.type === 'radio' && node.props.name?.startsWith('baseline-q-')).length, 0);
});

test('completed mentoring ledger preserves zero bonuses and zero gain', async () => {
  const completed = session({ status: 'completed', creditAwarded: true, rating: 2, completedAt: '2030-10-10T17:30:00Z',
    creditBreakdown: { baseCompletion: 40, feedbackBonus: 0, quizImprovementBonus: 0, total: 40, baselinePercentage: 100, finalPercentage: 100, observedImprovement: 0, rating: 2 } });
  await mount(<MentoringView />, { SESSIONS: [completed] });
  const output = text(renderer!.root);
  assert.ok(output.includes('Rating (2★)+0 CR'));
  assert.ok(output.includes('Observed Quiz Gain+0 pp (+0 CR)'));
});

test('reopening a learner confirmation starts with unanswered quiz questions', async () => {
  await mount(<MentoringView />, { SESSIONS: [session()] });
  await act(async () => button('Take Final Quiz').props.onClick());
  await act(async () => button('Demo Seed: Final 3/3').props.onClick());
  assert.equal(renderer!.root.findAllByType('input').filter((node) => node.props.type === 'radio' && node.props.checked).length, 3);
  await act(async () => button('Cancel').props.onClick());
  await act(async () => button('Take Final Quiz').props.onClick());
  assert.equal(renderer!.root.findAllByType('input').filter((node) => node.props.type === 'radio' && node.props.checked).length, 0);
});

test('open canteen voucher updates to collected immediately after its store record changes', async () => {
  await mount(<RewardsView />, { CURRENT_USER_ID: 'meera' });
  const redeem = renderer!.root.findAllByType('button').find((node) => text(node) === 'Redeem Voucher' && !node.props.disabled)!;
  assert.ok(redeem);
  await act(async () => redeem.props.onClick());
  await act(async () => {
    button('DEMO SCAN').props.onClick();
    await new Promise((resolve) => setTimeout(resolve, 450));
  });
  assert.ok(text(renderer!.root).includes('Voucher Collected!'));
  assert.equal(renderer!.root.findAllByType('button').some((node) => text(node).includes('DEMO SCAN')), false);
});

test('catalogue blocks vouchers below their advertised minimum tier', async () => {
  await mount(<RewardsView />);
  const bronze = renderer!.root.findAllByType('button').filter((node) => text(node) === 'Requires Bronze Tier');
  assert.ok(bronze.length > 0);
  assert.ok(bronze.every((node) => node.props.disabled));
});

test('persona switches close admin views and discard the previous user’s late AI response', async () => {
  let finishRequest!: (response: Response) => void;
  globalThis.fetch = () => new Promise<Response>((resolve) => { finishRequest = resolve; });
  await mount(<App />, { CURRENT_USER_ID: 'ananya' });
  await act(async () => button('Admin Audit').props.onClick());
  assert.equal(renderer!.root.findAllByType(AdminAuditView).length, 1);
  await act(async () => button('Aarav').props.onClick());
  assert.equal(renderer!.root.findAllByType(AdminAuditView).length, 0);
  await act(async () => button('Loop AI').props.onClick());
  const input = renderer!.root.findAllByType('input').find((node) => node.props.type === 'text')!;
  await act(async () => input.props.onChange({ target: { value: 'Aarav private draft' } }));
  await act(async () => { renderer!.root.findByType('form').props.onSubmit({ preventDefault: noop }); });
  await act(async () => button('Meera').props.onClick());
  assert.ok(text(renderer!.root.findByType(LoopAIView)).includes('Hello **Meera Sharma**'));
  await act(async () => finishRequest(new Response(JSON.stringify({ status: 'live', text: 'Late reply for Aarav', model: 'test' }), { headers: { 'Content-Type': 'application/json' } })));
  const output = text(renderer!.root.findByType(LoopAIView));
  assert.equal(output.includes('Aarav private draft'), false);
  assert.equal(output.includes('Late reply for Aarav'), false);
});

for (const floating of [false, true]) {
  test(`${floating ? 'floating' : 'full'} AI displays upcoming sessions and sends mentoring drafts through the real quiz`, async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ status: 'offline', offlineReason: 'test offline' }), { headers: { 'Content-Type': 'application/json' } });
    await mount(floating ? <FloatingLoopAI onNavigateTab={noop} /> : <LoopAIView onNavigateToBooks={noop} onNavigateToMentoring={noop} onNavigateToRewards={noop} />, { SESSIONS: [session({ status: 'accepted' })] });
    if (floating) await act(async () => renderer!.root.findAllByType('button').find((node) => node.props.title === 'Open LOOP AI Campus Copilot')!.props.onClick());
    assert.equal(text(renderer!.root).includes('gemini-3.8-flash'), false);
    const ask = async (value: string) => {
      const input = renderer!.root.findAllByType('input').find((node) => node.props.type === 'text')!;
      await act(async () => input.props.onChange({ target: { value } }));
      await act(async () => { renderer!.root.findByType('form').props.onSubmit({ preventDefault: noop }); });
    };
    await ask('Show my upcoming sessions');
    const cards = renderer!.root.findAllByType(LoopAISessionCard);
    assert.equal(cards.length, 1);
    assert.ok(text(cards[0]).includes('2030-10-10 at 16:30'));
    await ask('I need trigonometry help tomorrow at lunch.');
    await act(async () => button('Review Details & Take Baseline Quiz').props.onClick());
    assert.equal(app.sessions.length, 1, 'opening the draft must not submit fabricated answers');
    const modal = renderer!.root.findByType(RequestMentoringModal);
    assert.equal(modal.props.isOpen, true);
    await act(async () => modal.findByType('form').props.onSubmit({ preventDefault: noop }));
    await act(async () => button('Submit Mentoring Request').props.onClick());
    assert.ok(text(renderer!.root).includes('Please answer all 3 baseline questions'));
    assert.equal(app.sessions.length, 1);
  });
}
