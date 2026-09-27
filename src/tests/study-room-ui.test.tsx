import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer, type TestRendererOptions } from 'react-test-renderer';
import { useApp } from '../context/AppContext';
import { VirtualStudyRoomModal } from '../components/VirtualStudyRoomModal';
import { SEED_STUDY_ROOMS } from '../data/studyRoomData';
import { TestProviders } from './testProviders';
import type { MentoringSession, VirtualStudyRoom } from '../types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
let app: ReturnType<typeof useApp>;
const originalFetch = globalThis.fetch;
const noop = () => {};

function text(node: ReactTestInstance | string): string {
  return typeof node === 'string' ? node : node.children.map(text).join('');
}

function button(label: string): ReactTestInstance {
  const result = renderer!.root.findAllByType('button').find((node) => text(node).includes(label));
  assert.ok(result, `Button not found: ${label}`);
  return result;
}

function room(overrides: Partial<VirtualStudyRoom> = {}): VirtualStudyRoom {
  return {
    ...structuredClone(SEED_STUDY_ROOMS[0]), id: 'room-ui', title: 'Physics study group',
    subject: 'Physics', topic: 'Motion and velocity', grade: 'Grade 9',
    description: 'Work through one example together.', messages: [], whiteboardNotes: [], tags: [],
    ...overrides,
  };
}

function session(overrides: Partial<MentoringSession> = {}): MentoringSession {
  return {
    id: 'session-ui', studentId: 'aarav', studentName: 'Aarav Patel', studentGrade: 'Grade 10',
    mentorId: 'rohan', mentorName: 'Rohan Verma', subject: 'Physics', topic: 'Motion and velocity',
    grade: 'Grade 9', date: '2099-10-10', time: '16:30', description: 'Test session',
    status: 'accepted', requestedAt: '2099-10-09T10:00:00Z', creditAwarded: false,
    baselineQuiz: { answers: [1, 2, 0], score: 3, totalQuestions: 3, percentage: 100, completedAt: '2099-10-09T10:00:00Z' },
    ...overrides,
  };
}

function supportedSession(overrides: Partial<MentoringSession> = {}): MentoringSession {
  return session({
    assessmentMode: 'supported', baselineQuiz: undefined,
    learningSupport: {
      needs: ['memory'], goal: 'Practise a familiar routine', strengths: 'Enjoys practical examples',
      responseMode: 'pointing', sessionMinutes: 20, breakEveryMinutes: 5,
    },
    ...overrides,
  });
}

async function mount(
  studyRoom: VirtualStudyRoom,
  options: {
    sessions?: MentoringSession[];
    userId?: string;
    onOpenFinalQuiz?: (value: MentoringSession) => void;
    createNodeMock?: TestRendererOptions['createNodeMock'];
  } = {},
) {
  const values = new Map([
    ['CAMPUSLOOP_STATE_V3_STUDY_ROOMS', JSON.stringify([studyRoom])],
    ['CAMPUSLOOP_STATE_V3_SESSIONS', JSON.stringify(options.sessions ?? [])],
    ['CAMPUSLOOP_STATE_V3_CURRENT_USER_ID', options.userId ?? 'aarav'],
  ]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  } });
  function Harness() {
    app = useApp();
    const liveRoom = app.studyRooms.find((value) => value.id === studyRoom.id)!;
    return <VirtualStudyRoomModal room={liveRoom} onClose={noop} onOpenFinalQuiz={options.onOpenFinalQuiz} />;
  }
  await act(async () => {
    renderer = create(<TestProviders><Harness /></TestProviders>, {
      createNodeMock: options.createNodeMock ?? (() => null),
    });
  });
}

afterEach(async () => {
  await act(async () => renderer?.unmount());
  renderer = undefined;
  globalThis.fetch = originalFetch;
});

test('a same-topic public study room cannot finish an unrelated mentoring session', async () => {
  await mount(room(), { sessions: [session()], userId: 'rohan' });
  const output = text(renderer!.root);
  assert.equal(output.includes('Linked Mentoring:'), false);
  assert.equal(output.includes('Mark Session Finished'), false);
  assert.equal(output.includes('Baseline:'), false);
  assert.equal(app.sessions[0].status, 'accepted');
});

test('supported mentoring hides quiz scores and displays the real reason completion is blocked', async () => {
  await mount(room({ sessionId: 'session-ui' }), { sessions: [supportedSession()], userId: 'rohan' });
  assert.ok(text(renderer!.root).includes('(Supported participation)'));
  assert.equal(text(renderer!.root).includes('Baseline:'), false);
  assert.equal(text(renderer!.root).includes('Baseline not recorded'), false);
  await act(async () => button('Mark Session Finished').props.onClick());
  const alerts = renderer!.root.findAll((node) => node.props.role === 'alert');
  assert.ok(alerts.some((node) => text(node) === 'Share the learning plan and ask the learner to agree before finishing this supported session.'));
  assert.equal(app.sessions[0].status, 'accepted');
  await act(async () => button('Optional Practice').props.onClick());
  assert.ok(text(renderer!.root).includes('Supported participation · no quiz required'));
});

test('a supported learner opens participation confirmation rather than a final quiz', async () => {
  let opened: MentoringSession | undefined;
  const supported = supportedSession({ status: 'awaiting_learner_confirmation' });
  await mount(room({ sessionId: supported.id }), {
    sessions: [supported], onOpenFinalQuiz: (value) => { opened = value; },
  });
  assert.equal(text(renderer!.root).includes('Take Final Quiz'), false);
  await act(async () => button('Confirm Supported Participation').props.onClick());
  assert.equal(opened?.id, supported.id);
  assert.equal(opened?.assessmentMode, 'supported');
});

test('a failed send preserves the message so the learner can rejoin and retry', async () => {
  const studyRoom = room();
  await mount(studyRoom);
  await act(async () => { app.leaveStudyRoom(studyRoom.id); });
  const messageInput = () => renderer!.root.findAllByType('input').find((node) => node.props.placeholder === 'Ask a question or explain a formula...')!;
  assert.ok(messageInput());
  const draft = 'Please explain the second step again.';
  await act(async () => messageInput().props.onChange({ target: { value: draft } }));
  await act(async () => renderer!.root.findByType('form').props.onSubmit({ preventDefault: noop }));
  assert.equal(messageInput().props.value, draft);
  assert.equal(app.studyRooms[0].messages.length, 0);
  assert.ok(text(renderer!.root).includes('Message was not sent. Rejoin an active room and try again.'));
});

test('the concept explainer requests this room topic and never presents an offline reply as live teaching', async () => {
  const requests: Array<{ url: unknown; init?: RequestInit }> = [];
  globalThis.fetch = (async (url, init) => {
    requests.push({ url, init });
    return new Response(JSON.stringify({ status: 'offline', reply: 'Use tan theta to find the tower height.' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  await mount(room());
  await act(async () => button('AI Concept Explainer').props.onClick());
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/api/loop-ai');
  assert.equal(requests[0].init?.method, 'POST');
  assert.equal(JSON.parse(String(requests[0].init?.body)).message,
    'Explain the topic Motion and velocity in Physics for Grade 9. Use short steps and a checked worked example.');
  assert.ok(text(renderer!.root).includes('Live AI explanation is unavailable.'));
  assert.equal(text(renderer!.root).includes('Use tan theta to find the tower height.'), false);

  globalThis.fetch = (async () => new Response(JSON.stringify({ status: 'live', reply: 'A cart travels 20 m in 4 s. Its average speed is 5 m/s.' }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;
  await act(async () => button('AI Concept Explainer').props.onClick());
  assert.ok(text(renderer!.root).includes('A cart travels 20 m in 4 s. Its average speed is 5 m/s.'));
  assert.equal(text(renderer!.root).includes('Live AI explanation is unavailable.'), false);
});

test('pointer drawing maps a responsive canvas to its backing dimensions and stops on cancel', async () => {
  const moves: number[][] = [];
  const lines: number[][] = [];
  const captures: number[] = [];
  const context = { beginPath: noop, moveTo: (x: number, y: number) => moves.push([x, y]),
    lineTo: (x: number, y: number) => lines.push([x, y]), stroke: noop };
  const canvas = { width: 700, height: 320, getContext: () => context,
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 350, height: 160 }),
    setPointerCapture: (pointerId: number) => captures.push(pointerId) };
  await mount(room(), { createNodeMock: (element) => element.type === 'canvas' ? canvas : null });
  await act(async () => button('Shared Whiteboard').props.onClick());
  const board = () => renderer!.root.findByType('canvas');
  await act(async () => board().props.onPointerDown({ clientX: 185, clientY: 100, pointerId: 7 }));
  await act(async () => board().props.onPointerMove({ clientX: 360, clientY: 180, pointerId: 7 }));
  assert.deepEqual(moves, [[350, 160]]);
  assert.deepEqual(lines, [[700, 320]]);
  assert.deepEqual(captures, [7]);
  await act(async () => board().props.onPointerCancel());
  await act(async () => board().props.onPointerMove({ clientX: 100, clientY: 100, pointerId: 7 }));
  assert.equal(lines.length, 1, 'A cancelled pointer must not continue drawing.');
});
