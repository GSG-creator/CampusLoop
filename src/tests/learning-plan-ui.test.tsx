import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { useApp } from '../context/AppContext';
import { TestProviders } from './testProviders';
import { LearningPlanPanel, SessionMeetingDetails } from '../components/LearningPlanPanel';
import { MentoringView } from '../components/MentoringView';
import { AdminAuditView } from '../components/AdminAuditView';
import { WalletView } from '../components/WalletView';
import { createLearningPlanDraft } from '../data/learningSupport';
import type { CreditBreakdown, MentoringSession } from '../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
let app: ReturnType<typeof useApp>;
function text(node: ReactTestInstance | string): string { return typeof node === 'string' ? node : node.children.map(text).join(''); }
const button = (label: string) => {
  const found = renderer.root.findAllByType('button').find((node) => text(node).includes(label));
  assert.ok(found, `Missing button: ${label}`);
  return found;
};
const click = async (label: string) => { await act(async () => button(label).props.onClick()); };
const switchTo = async (user: string) => { await act(async () => app.switchUser(user)); };
function session(overrides: Partial<MentoringSession> = {}): MentoringSession {
  return {
    id: 'supported-ui', studentId: 'aarav', studentName: 'Aarav Patel', studentGrade: 'Grade 10',
    mentorId: 'rohan', mentorName: 'Rohan Verma', subject: 'Mathematics', topic: 'Fractions', grade: 'Grade 10',
    date: '2030-10-10', time: '14:00', description: 'Practise with a step list', status: 'accepted',
    requestedAt: '2030-10-09T10:00:00Z', creditAwarded: false, assessmentMode: 'supported', sessionMinutes: 20,
    learningSupport: { needs: ['memory', 'energy'], strengths: 'Enjoys cooking examples', goal: 'Practise comparing two fractions', responseMode: 'spoken', sessionMinutes: 20, breakEveryMinutes: 5 },
    ...overrides,
  };
}
const supportedBreakdown: CreditBreakdown = { baseCompletion: 40, feedbackBonus: 10, quizImprovementBonus: 0, supportCompletionBonus: 20, assessmentMode: 'supported', total: 70, baselinePercentage: 0, finalPercentage: 0, observedImprovement: 0, rating: 5 };
async function mount(element: React.ReactElement, sessions = [session()], user = 'rohan', extra: Record<string, unknown> = {}) {
  const fixtures: Record<string, unknown> = { SESSIONS: sessions, CURRENT_USER_ID: user, ...extra };
  const storage = new Map(Object.entries(fixtures).map(([key, value]) => [`CAMPUSLOOP_STATE_V3_${key}`, typeof value === 'string' ? value : JSON.stringify(value)]));
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } });
  function Probe() { app = useApp(); return null; }
  await act(async () => { renderer = create(<TestProviders><Probe />{element}</TestProviders>); });
  return storage;
}
afterEach(async () => { await act(async () => renderer?.unmount()); });

test('mentor edits and shares three lessons; learner and teacher responses use the live plan', async () => {
  const storage = await mount(<LearningPlanPanel sessionId="supported-ui" />);
  await click('Create learning plan');
  assert.equal(renderer.root.findAllByType('fieldset').length, 3);
  const goal = renderer.root.findAllByType('textarea').find((node) => node.props.id.endsWith('-goal'))!;
  await act(async () => goal.props.onChange({ target: { value: 'Compare half and quarter using a familiar recipe' } }));
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }));
  assert.equal(app.sessions[0].learningPlan?.status, 'shared');
  assert.equal(app.sessions[0].learningPlan?.goal, 'Compare half and quarter using a familiar recipe');
  assert.equal(JSON.parse(storage.get('CAMPUSLOOP_STATE_V3_SESSIONS')!)[0].learningPlan.lessons.length, 3);
  await switchTo('aarav');
  await click('This plan works for me');
  assert.equal(app.sessions[0].learningPlan?.learnerResponse, 'agreed');
  await switchTo('ananya');
  const review = renderer.root.findAllByType('textarea').find((node) => node.props.id.endsWith('-review-note'))!;
  await act(async () => review.props.onChange({ target: { value: 'Use the learner’s familiar measuring cups.' } }));
  await click('Mark plan reviewed');
  assert.ok(text(renderer.root).includes('Use the learner’s familiar measuring cups.'));
  await switchTo('rohan');
  await click('Edit learning plan');
  await click('Save draft');
  assert.equal(app.sessions[0].learningPlan?.status, 'draft');
  assert.equal(app.sessions[0].learningPlan?.reviewedAt, undefined);
  assert.equal(app.sessions[0].learningPlan?.learnerResponse, undefined);
});

test('draft curriculum is hidden from learner and all plan details are hidden from unrelated students', async () => {
  const item = session();
  item.learningPlan = { ...createLearningPlanDraft(item), goal: 'Private mentor draft wording', status: 'draft', authorId: 'rohan', updatedAt: '2030-10-09T12:00:00Z' };
  await mount(<LearningPlanPanel sessionId={item.id} />, [item], 'aarav');
  assert.equal(text(renderer.root).includes('Private mentor draft wording'), false);
  assert.equal(renderer.root.findAllByType('form').length, 0);
  await switchTo('meera');
  assert.equal(text(renderer.root), '');
});

test('supported session history shows the learner’s reflection instead of invented quiz scores', async () => {
  const item = session({ status: 'completed', creditAwarded: true, goalReview: 'needs_more_support', completedAt: '2030-10-10T14:20:00Z', creditBreakdown: supportedBreakdown });
  const other = session({ ...item, id: 'other-ui', studentId: 'meera', studentName: 'Meera Sharma', topic: 'Other learner private topic', feedbackComment: 'Other learner private feedback' });
  await mount(<MentoringView />, [item, other], 'aarav');
  const output = text(renderer.root);
  assert.ok(output.includes('Would like more support'));
  assert.ok(output.includes('Supported Session Completion+20 CR'));
  assert.equal(output.includes('Other learner private topic'), false);
  assert.equal(output.includes('Other learner private feedback'), false);
  assert.equal(output.includes('0 pp'), false);
  assert.equal(output.includes('Diagnostic Scores'), false);
});

test('admin session audit exposes plan review and labels supported learning without score deltas', async () => {
  const item = session();
  item.learningPlan = { ...createLearningPlanDraft(item), status: 'shared', authorId: 'rohan', updatedAt: '2030-10-09T12:00:00Z' };
  await mount(<AdminAuditView />, [item], 'ananya');
  await click('Mentoring Sessions');
  assert.ok(text(renderer.root).includes('Supported learning · reflection pending'));
  await click('Mark plan reviewed');
  assert.equal(app.sessions[0].learningPlan?.status, 'reviewed');
});

test('wallet explains supported completion without presenting absent scores as zero percent', async () => {
  await mount(<WalletView />, [], 'rohan', { TXS: [{ id: 'supported-tx', userId: 'rohan', userName: 'Rohan Verma', amount: 70, type: 'mentoring_reward', description: 'Supported session complete', breakdown: supportedBreakdown, timestamp: '2030-10-10T14:20:00Z' }] });
  const row = renderer.root.findAllByType('tr').find((node) => text(node).includes('Supported session complete'))!;
  await act(async () => row.props.onClick());
  assert.ok(text(renderer.root).includes('Supported Session Completion+20 CR'));
  assert.ok(text(renderer.root).includes('Learner-confirmed participation and reflection'));
  assert.equal(text(renderer.root).includes('0% → 0%'), false);
});

test('supported mentor completion stays disabled until a shared plan has learner agreement', async () => {
  const item = session();
  await mount(<MentoringView />, [item]);
  assert.equal(button('Mark Session Finished').props.disabled, true);
  await act(async () => { assert.equal(app.saveLearningPlan(item.id, createLearningPlanDraft(item), true).success, true); });
  assert.equal(button('Mark Session Finished').props.disabled, true);
  await switchTo('aarav');
  await click('This plan works for me');
  await switchTo('rohan');
  assert.equal(button('Mark Session Finished').props.disabled, false);
});

test('online meeting links are labelled and only safe HTTPS links become clickable', async () => {
  await mount(<SessionMeetingDetails session={session({ classMode: 'online', meetingLink: 'https://example.org/study-room' })} />);
  const link = renderer.root.findByType('a');
  assert.equal(link.props.href, 'https://example.org/study-room');
  assert.equal(link.props.rel, 'noopener noreferrer');
  assert.ok(text(renderer.root).includes('Online class: Join online class'));
  await act(async () => renderer.update(<SessionMeetingDetails session={session({ classMode: 'online', meetingLink: 'javascript:alert(1)' })} />));
  assert.equal(renderer.root.findAllByType('a').length, 0);
  assert.ok(text(renderer.root).includes('Arrange the meeting link'));
});

test('offline locations and unarranged meeting places are visible', async () => {
  await mount(<SessionMeetingDetails session={session({ classMode: 'offline', location: 'Quiet library room' })} />);
  assert.ok(text(renderer.root).includes('Offline class: Quiet library room'));
  await act(async () => renderer.update(<SessionMeetingDetails session={session({ classMode: 'offline' })} />));
  assert.ok(text(renderer.root).includes('Arrange a meeting place'));
});
