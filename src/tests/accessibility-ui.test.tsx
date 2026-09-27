import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import App from '../App';
import { AppProvider } from '../context/AppContext';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';
import { LanguageProvider, useTranslation } from '../context/LanguageContext';
import { CampusTranslatorModal } from '../components/CampusTranslatorModal';
import { LiveCaptionsOverlay } from '../components/LiveCaptionsOverlay';
import { MuteHandoverAssistantModal } from '../components/MuteHandoverAssistantModal';
import { AccessibilitySuiteModal } from '../components/AccessibilitySuiteModal';
import { BookCard } from '../components/BookCard';
import { BookDetailsModal } from '../components/BookDetailsModal';
import { SEED_BOOKS, SEED_USERS } from '../data/seedData';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
let access: ReturnType<typeof useAccessibility>;
let language: ReturnType<typeof useTranslation>;
let storage: Map<string, string>;
const originalFetch = globalThis.fetch;
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const text = (node: ReactTestInstance | string): string => typeof node === 'string' ? node : node.children.map(text).join('');
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
function Probe() { access = useAccessibility(); language = useTranslation(); return null; }
function Harness({ sessionKey = 'aarav-0', children }: { sessionKey?: string; children?: React.ReactNode }) {
  return <AppProvider><LanguageProvider sessionKey={sessionKey}><AccessibilityProvider sessionKey={sessionKey}>
    <Probe /><CampusTranslatorModal /><LiveCaptionsOverlay /><MuteHandoverAssistantModal /><AccessibilitySuiteModal />{children}
  </AccessibilityProvider></LanguageProvider></AppProvider>;
}
async function mount(view = <Harness />) { await act(async () => { renderer = create(view); }); }
function button(label: string) {
  const found = renderer.root.findAllByType('button').find(node => text(node) === label || node.props['aria-label'] === label || node.props.title === label);
  assert.ok(found, `Missing button ${label}`); return found;
}
async function click(label: string) { await act(async () => button(label).props.onClick()); }
beforeEach(() => {
  storage = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
  globalThis.fetch = originalFetch;
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else Reflect.deleteProperty(globalThis, 'window');
});

test('unsupported microphone captions remain usable as typed notes without claiming to listen', async () => {
  await mount();
  await act(async () => access.startCaptions());
  assert.equal(access.captionStatus, 'unavailable');
  assert.equal(access.liveTranscripts.length, 0);
  assert.match(text(renderer.root), /unavailable in this browser/);
  const input = renderer.root.findByProps({ 'aria-label': 'Add a typed caption note' });
  await act(async () => input.props.onChange({ target: { value: 'Please repeat the equation' } }));
  await click('Add note');
  assert.equal(access.liveTranscripts[0].text, 'Please repeat the equation');
});

test('recognition is single-instance, handles denied permission and releases capture on session change and unmount', async () => {
  const instances: any[] = [];
  class Recognition {
    starts = 0; aborts = 0; onstart: any; onresult: any; onerror: any; onend: any;
    constructor() { instances.push(this); }
    start() { this.starts++; this.onstart?.(); }
    abort() { this.aborts++; this.onend?.(); }
  }
  (globalThis as any).window.SpeechRecognition = Recognition;
  await mount();
  await act(async () => { access.startCaptions(); access.startCaptions(); });
  assert.equal(instances.length, 1);
  assert.equal(access.captionStatus, 'listening');
  await act(async () => instances[0].onerror({ error: 'not-allowed' }));
  assert.equal(access.captionStatus, 'error');
  assert.equal(instances[0].aborts, 1);
  await act(async () => { access.startCaptions(); access.addTranscriptItem('Private learner note'); access.openMuteHandoverModal({ otp: '9876' }); access.setHighContrast(true); });
  const staleResult = instances[1].onresult;
  await act(async () => renderer.update(<Harness sessionKey="meera-0" />));
  assert.equal(instances[1].aborts, 1);
  assert.equal(access.isCaptionsActive, false);
  assert.equal(access.isMuteHandoverModalOpen, false);
  assert.equal(access.muteHandoverConfig, null);
  assert.equal(access.highContrast, true, 'visual preferences survive account changes');
  await act(async () => staleResult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'late private speech' } }] }));
  assert.deepEqual(access.liveTranscripts, []);
  await act(async () => access.startCaptions());
  await act(async () => renderer.unmount());
  assert.equal(instances[2].aborts, 1);
});

test('offline translation is rejected and never cached or persisted as a successful translation', async () => {
  storage.set('CAMPUSLOOP_TRANSLATION_CACHE_V1', JSON.stringify({ 'hi:::private note': 'old private text' }));
  globalThis.fetch = async () => response({ status: 'offline', translatedText: 'private note' });
  await mount();
  await act(async () => { await assert.rejects(language.translateTextWithAI('private note', 'Hindi'), /unavailable/); });
  assert.equal(language.cacheStats.cachedCount, 0);
  assert.equal(storage.has('CAMPUSLOOP_TRANSLATION_CACHE_V1'), false);
  globalThis.fetch = async () => response({ status: 'success', translatedText: 'मेरी टिप्पणी' });
  await act(async () => { assert.equal(await language.translateTextWithAI('private note', 'Hindi'), 'मेरी टिप्पणी'); });
  assert.equal(language.cacheStats.cachedCount, 1);
  assert.equal([...storage.values()].some(value => value.includes('private note')), false);
});

test('pending translation cannot repopulate the next demo session cache', async () => {
  let finish!: (response: Response) => void;
  let signal!: AbortSignal;
  globalThis.fetch = (_url, init) => { signal = init!.signal as AbortSignal; return new Promise(resolve => { finish = resolve; }); };
  await mount();
  let pending!: Promise<void>;
  await act(async () => { pending = assert.rejects(language.translateTextWithAI('Old private note', 'Hindi')); });
  await act(async () => renderer.update(<Harness sessionKey="aarav-1" />));
  assert.equal(signal.aborted, true);
  await act(async () => { finish(response({ status: 'success', translatedText: 'Old response' })); await pending; });
  assert.equal(language.cacheStats.cachedCount, 0);
  assert.equal(language.isTranslating, false);
});

test('translator labels unavailable service honestly and a closed dialog discards a late result', async () => {
  globalThis.fetch = async () => response({ status: 'offline', translatedText: 'Not translated' });
  await mount();
  await act(async () => access.setIsTranslatorModalOpen(true));
  assert.equal(renderer.root.findByProps({ role: 'dialog' }).props['aria-modal'], 'true');
  await click('Translate into Hindi');
  assert.match(text(renderer.root), /AI translation is unavailable/);
  assert.equal(text(renderer.root).includes('Hindi AI Translation:'), false);
  assert.equal(access.activeAlertPulse, null);
  let finish!: (value: Response) => void;
  globalThis.fetch = () => new Promise(resolve => { finish = resolve; });
  await act(async () => { button('Translate into Hindi').props.onClick(); });
  await act(async () => access.setIsTranslatorModalOpen(false));
  await act(async () => access.setIsTranslatorModalOpen(true));
  await act(async () => finish(response({ status: 'success', translatedText: 'Old response' })));
  assert.equal(text(renderer.root).includes('Old response'), false);
  assert.equal(access.activeAlertPulse, null);
});

test('failed caption summary keeps original notes and never reports verified key points', async () => {
  globalThis.fetch = async () => response({ message: 'Unavailable' }, 503);
  await mount();
  await act(async () => { access.startCaptions(); access.addTranscriptItem('Force equals mass times acceleration'); });
  await click('AI Summary');
  assert.match(text(renderer.root), /AI summary is unavailable/);
  assert.match(text(renderer.root), /Force equals mass times acceleration/);
  assert.equal(text(renderer.root).includes('Key points verified'), false);
  await click('Clear Log');
  assert.equal(text(renderer.root).includes('AI summary is unavailable'), false);
  assert.deepEqual(access.liveTranscripts, []);
});

test('communication cards never invent a handover OTP and reopen with a fresh draft', async () => {
  await mount();
  await act(async () => access.openMuteHandoverModal());
  assert.equal(text(renderer.root).includes('Verification OTP Code'), false);
  const input = renderer.root.findByProps({ 'aria-label': 'Your message to display or speak' });
  await act(async () => input.props.onChange({ target: { value: 'Private message' } }));
  await click('Done');
  await act(async () => access.openMuteHandoverModal({ otp: '1234', bookTitle: 'Actual book' }));
  assert.equal(renderer.root.findByProps({ 'aria-label': 'Your message to display or speak' }).props.value, '');
  assert.match(text(renderer.root), /#1234/);
  assert.match(text(renderer.root), /Actual book/);
});

test('real app persona switch and same-persona reset close captions and erase their private notes', async () => {
  await mount(<App />);
  async function writeNote(note: string) {
    await click('Accessibility and language settings'); await click('Captions & notes');
    await act(async () => renderer.root.findByProps({ 'aria-label': 'Add a typed caption note' }).props.onChange({ target: { value: note } }));
    await click('Add note');
  }
  await writeNote('Aarav private note');
  const meera = renderer.root.findAllByType('button').find(node => node.props.title?.startsWith('Switch to Meera'))!;
  await act(async () => meera.props.onClick());
  assert.equal(renderer.root.findAllByProps({ 'aria-label': 'Captions and typed notes' }).length, 0);
  await writeNote('Meera private note');
  assert.equal(text(renderer.root).includes('Aarav private note'), false);
  await click('Reset Seed Data'); await click('Confirm reset');
  await writeNote('Fresh note');
  assert.equal(text(renderer.root).includes('Meera private note'), false);
  await click('Reset Seed Data'); await click('Confirm reset');
  assert.equal(renderer.root.findAllByProps({ 'aria-label': 'Captions and typed notes' }).length, 0);
});

for (const mode of ['card', 'details'] as const) {
  test(`book ${mode} clears stale translations after language/book changes and labels unavailable results`, async () => {
    const props = {
      currentUser: SEED_USERS.aarav, onClose() {}, onReserve() {}, onConfirmHandover() {}, onConfirmReturn() {}, onCancelReservation() {}, onOpenDetails() {},
    };
    const view = (index: number) => <Harness>{mode === 'card'
      ? <BookCard {...props} book={SEED_BOOKS[index]} />
      : <BookDetailsModal {...props} book={SEED_BOOKS[index]} />}</Harness>;
    globalThis.fetch = async (_url, init) => response({ status: 'success', translatedText: `Translated ${JSON.parse(String(init?.body)).text}` });
    await mount(view(0));
    await act(async () => language.setLanguageByCode('hi'));
    const translate = async () => {
      const label = mode === 'card' ? `Translate with Gemini AI into ${language.currentLanguage.name}` : `Translate (${language.currentLanguage.name})`;
      await act(async () => button(label).props.onClick({ stopPropagation() {} }));
    };
    await translate();
    assert.match(text(renderer.root), /Translated /);
    await act(async () => language.setLanguageByCode('es'));
    assert.equal(text(renderer.root).includes(`Translated ${SEED_BOOKS[0].title}`), false);
    const pending: ((value: Response) => void)[] = [];
    globalThis.fetch = () => new Promise(resolve => pending.push(resolve));
    const label = mode === 'card' ? 'Translate with Gemini AI into Spanish' : 'Translate (Spanish)';
    await act(async () => { button(label).props.onClick({ stopPropagation() {} }); });
    await act(async () => renderer.update(view(1)));
    await act(async () => pending.forEach(finish => finish(response({ status: 'success', translatedText: 'Wrong previous book' }))));
    assert.equal(text(renderer.root).includes('Wrong previous book'), false);
    assert.ok(text(renderer.root).includes(SEED_BOOKS[1].title));
    globalThis.fetch = async () => response({ status: 'offline', translatedText: 'Original' });
    await translate();
    assert.match(text(renderer.root), /Translation is unavailable. Showing the original text./);
  });
}
