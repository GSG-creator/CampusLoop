import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { AppProvider, useApp } from '../context/AppContext';
import { RequestMentoringModal } from '../components/RequestMentoringModal';
import { LearnerConfirmationModal } from '../components/LearnerConfirmationModal';
import { createLearningPlanDraft } from '../data/learningSupport';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
let app: ReturnType<typeof useApp>;
const noop = () => {};
function Capture() { app = useApp(); return null; }
function text(node: ReactTestInstance | string): string { return typeof node === 'string' ? node : node.children.map(text).join(''); }
function button(label: string) {
  const result = renderer.root.findAllByType('button').find(node => text(node) === label);
  assert.ok(result, `Missing ${label}`); return result;
}
function inputIn(label: string, type: 'input' | 'textarea' | 'select' = 'input') {
  const result = renderer.root.findAllByType('label').find(node => text(node).startsWith(label));
  assert.ok(result, `Missing label ${label}`); return result.findByType(type);
}
async function change(label: string, value: unknown, type: 'input' | 'textarea' | 'select' = 'input') {
  await act(async () => inputIn(label, type).props.onChange({ target: { value, checked: value } }));
}
async function mount() {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } });
  await act(async () => { renderer = create(<AppProvider><Capture /><RequestMentoringModal isOpen onClose={noop} onSuccess={noop} /></AppProvider>); });
}
afterEach(async () => { await act(async () => renderer?.unmount()); });

test('supported request and completion work without quizzes or invented scores', async () => {
  await mount();
  await change('Create an adapted learning plan', true);
  await change('Remembering and revisiting', true);
  await change('My learning goal', 'Use a step card to maintain a familiar maths skill.', 'textarea');
  await change('My strengths', 'I enjoy making models.');
  await change('How I would like to respond', 'pointing', 'select');
  await change('Planned session length', '15', 'select');
  await change('Online — video or audio', true);
  await change('Meeting link (optional)', 'https://school.example/room');
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.ok(text(renderer.root).includes('Review your learning request'));
  assert.equal(renderer.root.findAllByType('input').filter(node => node.props.type === 'radio').length, 0);
  await act(async () => button('Submit Mentoring Request').props.onClick());
  const session = app.sessions[0];
  assert.equal(session.assessmentMode, 'supported');
  assert.equal(session.baselineQuiz, undefined);
  assert.deepEqual(session.learningSupport?.needs, ['memory']);
  assert.equal(session.learningSupport?.responseMode, 'pointing');
  assert.equal(session.sessionMinutes, 15);
  assert.equal(session.classMode, 'online');
  assert.equal(session.meetingLink, 'https://school.example/room');
  assert.equal(session.location, undefined);
  await act(async () => {
    app.switchUser('rohan');
    assert.equal(app.acceptMentoringSession(session.id).success, true);
    assert.equal(app.saveLearningPlan(session.id, createLearningPlanDraft(session), true).success, true);
    app.switchUser('aarav');
    assert.equal(app.respondToLearningPlan(session.id, 'agreed').success, true);
    app.switchUser('rohan');
    assert.equal(app.finishMentoringSession(session.id).success, true);
    app.switchUser('aarav');
  });
  let closed = false;
  await act(async () => renderer.update(<AppProvider><Capture /><LearnerConfirmationModal session={app.sessions[0]} onClose={() => { closed = true; }} onSuccess={noop} /></AppProvider>));
  assert.ok(text(renderer.root).includes('How did your learning session go?'));
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.equal(app.sessions[0].status, 'awaiting_learner_confirmation');
  assert.ok(text(renderer.root).includes('Confirm that you took part'));
  await change('I took part', true);
  await change('I would like more support', true);
  await change('How helpful was the session?', '4', 'select');
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.equal(closed, true);
  assert.equal(app.sessions[0].status, 'completed');
  assert.equal(app.sessions[0].finalQuiz, undefined);
  assert.equal(app.sessions[0].goalReview, 'needs_more_support');
  assert.equal(app.sessions[0].creditBreakdown?.total, 70);
  assert.equal(app.sessions[0].creditBreakdown?.supportCompletionBonus, 20);
});

test('turning off an adapted plan restores the ordinary quiz requirement', async () => {
  await mount();
  await change('Create an adapted learning plan', true);
  await change('My learning goal', 'Practise with a familiar example.', 'textarea');
  await change('Create an adapted learning plan', false);
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.ok(text(renderer.root).includes('Pre-Session Baseline Assessment'));
  await act(async () => button('Submit Mentoring Request').props.onClick());
  assert.equal(app.sessions.length, 0);
  assert.ok(text(renderer.root).includes('Please answer all 3 baseline questions'));
});

test('adapted requests require a learner goal before advancing', async () => {
  await mount();
  await change('Create an adapted learning plan', true);
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.ok(text(renderer.root).includes('Please add a learning goal'));
  assert.equal(app.sessions.length, 0);
});

test('switching an online request to offline saves only the selected location', async () => {
  await mount();
  await change('Create an adapted learning plan', true);
  await change('My learning goal', 'Practise a familiar skill together.', 'textarea');
  await change('Online — video or audio', true);
  await change('Meeting link (optional)', 'https://school.example/old-room');
  await change('Offline — in person', true);
  await change('Classroom or campus location (optional)', 'Library accessible study room');
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.ok(text(renderer.root).includes('Library accessible study room'));
  await act(async () => button('Submit Mentoring Request').props.onClick());
  assert.equal(app.sessions[0].classMode, 'offline');
  assert.equal(app.sessions[0].location, 'Library accessible study room');
  assert.equal(app.sessions[0].meetingLink, undefined);
});
