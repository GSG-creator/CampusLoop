import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import App from '../App';
import { Navbar } from '../components/Navbar';
import { SupportedSessionConfirmation } from '../components/SupportedSessionConfirmation';
import { MilestoneCelebrationModal } from '../components/MilestoneCelebrationModal';
import { RewardsView } from '../components/RewardsView';
import { SEED_USERS } from '../data/seedData';
import type { MentoringSession } from '../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
function text(node: ReactTestInstance | string): string { return typeof node === 'string' ? node : node.children.map(text).join(''); }
const button = (label: string) => {
  const node = renderer.root.findAllByType('button').find((item) => text(item).includes(label));
  assert.ok(node, `Missing button: ${label}`);
  return node;
};
afterEach(async () => { await act(async () => renderer?.unmount()); });

async function confirmSupportedSession(rating: number) {
  const session: MentoringSession = {
    id: 'milestone-session', studentId: 'aarav', studentName: 'Aarav Patel', studentGrade: 'Grade 10',
    mentorId: 'rohan', mentorName: 'Rohan Verma', subject: 'Mathematics', topic: 'Fractions', grade: 'Grade 10',
    date: '2030-10-10', time: '14:00', description: 'Supported practice', status: 'awaiting_learner_confirmation',
    requestedAt: '2030-10-09T10:00:00Z', creditAwarded: false, assessmentMode: 'supported', sessionMinutes: 20,
    learningSupport: { needs: ['memory'], strengths: 'Recipes', goal: 'Practise comparing fractions', responseMode: 'spoken', sessionMinutes: 20, breakEveryMinutes: 5 },
  };
  const values = new Map<string, string>([
    ['CAMPUSLOOP_STATE_V3_SESSIONS', JSON.stringify([session])],
    ['CAMPUSLOOP_STATE_V3_USERS', JSON.stringify(SEED_USERS)],
    ['CAMPUSLOOP_STATE_V3_CURRENT_USER_ID', 'aarav'],
  ]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  await act(async () => { renderer = create(<App />); });
  await act(async () => renderer.root.findByType(Navbar).props.setActiveTab('mentoring'));
  await act(async () => button('Reflect & Confirm Attendance').props.onClick());
  const reflection = renderer.root.findByType(SupportedSessionConfirmation);
  await act(async () => {
    reflection.findAllByType('input').find((node) => node.props.type === 'checkbox')!.props.onChange({ target: { checked: true } });
    reflection.findAllByType('input').find((node) => node.props.value === 'needs_more_support')!.props.onChange();
    reflection.findByType('select').props.onChange({ target: { value: String(rating) } });
  });
  await act(async () => reflection.findByType('form').props.onSubmit({ preventDefault() {} }));
  return values;
}

test('60-credit supported confirmation celebrates Rohan’s actual 10,000 balance while Aarav remains selected', async () => {
  const storage = await confirmSupportedSession(3);
  const modal = renderer.root.findByType(MilestoneCelebrationModal);
  assert.equal(modal.props.isOpen, true);
  assert.equal(modal.props.targetUser.id, 'rohan');
  assert.equal(modal.props.targetUser.credits, 10000);
  assert.equal(modal.props.isOwnMilestone, false);
  assert.ok(text(modal).includes('Congratulations, Rohan Verma'));
  assert.ok(text(modal).includes('10,000 CR balance'));
  assert.equal(text(modal).includes('Congratulations, Aarav'), false);
  assert.equal(text(modal).includes('10,010'), false);
  assert.equal(text(modal).includes('9,940'), false);
  assert.equal(storage.get('CAMPUSLOOP_STATE_V3_CURRENT_USER_ID'), 'aarav');
  assert.equal(JSON.parse(storage.get('CAMPUSLOOP_STATE_V3_USERS')!).aarav.credits, 350);
  await act(async () => modal.props.onClose());
  assert.equal(storage.get('CAMPUSLOOP_STATE_V3_CURRENT_USER_ID'), 'aarav');
});

test('70-credit milestone displays the actual balance and changes persona only through the explicit rewards action', async () => {
  const storage = await confirmSupportedSession(5);
  assert.ok(text(renderer.root.findByType(MilestoneCelebrationModal)).includes('10,010 CR balance'));
  assert.equal(storage.get('CAMPUSLOOP_STATE_V3_CURRENT_USER_ID'), 'aarav');
  await act(async () => button('Switch to Rohan and view rewards').props.onClick());
  assert.equal(storage.get('CAMPUSLOOP_STATE_V3_CURRENT_USER_ID'), 'rohan');
  assert.equal(renderer.root.findAllByType(RewardsView).length, 1);
  assert.equal(renderer.root.findByType(MilestoneCelebrationModal).props.isOpen, false);
});
