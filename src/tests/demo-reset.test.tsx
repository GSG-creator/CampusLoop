import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import App from '../App';
import { DemoBar } from '../components/DemoBar';
import { BookExchange } from '../components/BookExchange';
import { BookCard } from '../components/BookCard';
import { LoopAIView } from '../components/LoopAIView';
import { SEED_USERS } from '../data/seedData';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
const originalFetch = globalThis.fetch;
const originalConfirm = Object.getOwnPropertyDescriptor(globalThis, 'confirm');

function text(node: ReactTestInstance | string): string {
  return typeof node === 'string' ? node : node.children.map(text).join('');
}
function button(label: string) {
  const found = renderer.root.findAllByType('button').find(node =>
    text(node) === label || node.props['aria-label'] === label || node.props.title === label);
  assert.ok(found, `Missing button: ${label}`);
  return found;
}
async function click(label: string) {
  await act(async () => button(label).props.onClick());
}
async function mount(fixtures: Record<string, unknown> = {}) {
  const values = new Map(Object.entries(fixtures).map(([key, value]) =>
    [`CAMPUSLOOP_STATE_V3_${key}`, typeof value === 'string' ? value : JSON.stringify(value)]));
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } });
  Object.defineProperty(globalThis, 'confirm', { configurable: true, value: () => {
    throw new Error('Browser confirmation dialogs are unavailable in this preview');
  } });
  await act(async () => { renderer = create(<App />); });
  return values;
}
afterEach(async () => {
  await act(async () => renderer?.unmount());
  globalThis.fetch = originalFetch;
  if (originalConfirm) Object.defineProperty(globalThis, 'confirm', originalConfirm);
  else Reflect.deleteProperty(globalThis, 'confirm');
});

test('reset opens an in-page confirmation; cancelling preserves the current demo', async () => {
  const users = structuredClone(SEED_USERS);
  users.meera.credits = 1300;
  const storage = await mount({ USERS: users, CURRENT_USER_ID: 'meera' });
  await click('Reset Seed Data');
  assert.ok(text(renderer.root.findByType(DemoBar)).includes('Reset demo data?'));
  await click('Cancel reset');
  assert.equal(text(renderer.root).includes('Reset demo data?'), false);
  assert.equal(storage.get('CAMPUSLOOP_STATE_V3_CURRENT_USER_ID'), 'meera');
  assert.equal(JSON.parse(storage.get('CAMPUSLOOP_STATE_V3_USERS')!).meera.credits, 1300);
});

test('confirmed reset clears same-persona book filters and visibly reports success', async () => {
  await mount();
  const search = renderer.root.findAllByType('input').find(node => node.props.type === 'text')!;
  await act(async () => search.props.onChange({ target: { value: 'no matching textbook' } }));
  assert.equal(renderer.root.findAllByType(BookCard).length, 0);
  await click('Reset Seed Data');
  await click('Confirm reset');
  assert.equal(renderer.root.findAllByType(BookCard).length, 4);
  assert.equal(renderer.root.findAllByType('input').find(node => node.props.type === 'text')!.props.value, '');
  assert.ok(text(renderer.root).includes('Demo reset complete.'));
  await click('Reset Seed Data');
  await click('Confirm reset');
  assert.equal(renderer.root.findAllByType(BookCard).length, 4, 'repeated resets remain usable');
});

test('reset returns to books and discards pending AI replies even for the same persona', async () => {
  let finishRequest!: (value: Response) => void;
  globalThis.fetch = () => new Promise(resolve => { finishRequest = resolve; });
  await mount();
  await click('AI');
  const ai = renderer.root.findByType(LoopAIView);
  const input = ai.findAllByType('input').find(node => node.props.type === 'text')!;
  await act(async () => input.props.onChange({ target: { value: 'Old demo conversation' } }));
  await act(async () => { ai.findByType('form').props.onSubmit({ preventDefault() {} }); });
  await click('Reset Seed Data');
  await click('Confirm reset');
  assert.equal(renderer.root.findAllByType(BookExchange).length, 1);
  await click('AI');
  await act(async () => finishRequest(new Response(JSON.stringify({ status: 'live', reply: 'Old pending reply', model: 'test' }))));
  const output = text(renderer.root.findByType(LoopAIView));
  assert.equal(output.includes('Old demo conversation'), false);
  assert.equal(output.includes('Old pending reply'), false);
  assert.ok(output.includes('Hello **Aarav Patel**'));
});
