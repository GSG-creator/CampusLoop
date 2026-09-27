import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppProvider, useApp } from '../context/AppContext';
import { SEED_STUDY_ROOMS } from '../data/studyRoomData';
import { SEED_USERS } from '../data/seedData';
import type { MentoringSession, StudyRoomMode } from '../types';

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
const roomData = {
  title: 'Practice together', subject: 'Mathematics', topic: 'Vectors', grade: 'Grade 11',
  mode: 'text_based' as StudyRoomMode, description: 'A local study space.',
};
const roomById = (id: string) => app.studyRooms.find((room) => room.id === id)!;
async function acceptedSession(supported = false) {
  const result = await run(() => app.requestMentoringSession({
    mentorId: 'rohan', subject: supported ? 'English' : 'Mathematics',
    topic: supported ? 'Reading a familiar story' : 'Applications of Trigonometry',
    grade: 'Grade 10', date: '2099-10-20', time: '12:30', description: 'A study session',
    assessmentMode: supported ? 'supported' : 'quiz', baselineAnswers: supported ? [] : [0, 0, 1],
    ...(supported ? { learningSupport: {
      needs: ['memory' as const], goal: 'Maintain a familiar reading routine', strengths: 'Likes stories',
      responseMode: 'pointing' as const, sessionMinutes: 20, breakEveryMinutes: 5,
    } } : {}),
  }));
  assert.equal(result.success, true, result.message);
  await run(() => app.switchUser('rohan'));
  assert.equal((await run(() => app.acceptMentoringSession(result.sessionId!))).success, true);
  return app.sessions.find((session) => session.id === result.sessionId)!;
}

describe('Study room integration with the real CampusLoop provider', () => {
  beforeEach(async () => { storage.clear(); await mount(); });
  afterEach(async () => { await act(async () => renderer.unmount()); });

  it('creates and joins a room in the same event without duplicate IDs or participants', async (t) => {
    t.mock.method(Date, 'now', () => 1234);
    const results = await run(() => {
      const first = app.createStudyRoom(roomData);
      assert.equal(first.success, true);
      assert.equal(app.joinStudyRoom(first.room!.id).success, true);
      assert.equal(app.joinStudyRoom(first.room!.id).success, true);
      const second = app.createStudyRoom({ ...roomData, title: 'Second study space' });
      return [first.room!, second.room!];
    });
    assert.notEqual(results[0].id, results[1].id);
    assert.equal(app.activeStudyRoomId, results[1].id);
    assert.equal(roomById(results[1].id).participants.length, 1);
    assert.equal(roomById(results[0].id).participants.length, 0, 'Creating another room leaves the previous room.');
  });

  it('uses the active persona in retained callbacks and clears the previous persona’s room', async () => {
    const send = app.sendStudyRoomMessage;
    const created = await run(() => app.createStudyRoom(roomData));
    await run(() => app.switchUser('ananya'));
    assert.equal(app.activeStudyRoomId, null);
    assert.equal(roomById(created.room!.id).participants.some((person) => person.id === 'aarav'), false);
    await run(() => app.joinStudyRoom(created.room!.id));
    const sent = await run(() => send(created.room!.id, 'Reviewing the study space.'));
    assert.equal(sent.success, true);
    const message = roomById(created.room!.id).messages.find((item) => item.id === sent.messageId)!;
    assert.equal(message.senderId, 'ananya');
    assert.equal(message.senderRole, 'admin');
    assert.equal(roomById(created.room!.id).participants[0].role, 'admin');
  });

  it('maintains participant counts and repeated hand changes, and leaves cleanly', async () => {
    const created = await run(() => app.createStudyRoom(roomData));
    const id = created.room!.id;
    const raised = await run(() => [app.toggleStudyRoomHandRaise(id), app.toggleStudyRoomHandRaise(id), app.toggleStudyRoomHandRaise(id)]);
    assert.deepEqual(raised, [true, false, true]);
    assert.equal(roomById(id).participants[0].isHandRaised, true);
    await run(() => app.setActiveStudyRoomId(null));
    assert.equal(app.activeStudyRoomId, null);
    assert.equal(roomById(id).participantCount, 0);
    assert.equal((await run(() => app.sendStudyRoomMessage(id, 'I left'))).success, false);
    assert.equal((await run(() => app.toggleStudyRoomHandRaise(id))), false);
  });

  it('rejects invalid rooms, outsiders and malformed content without modifying stored data', async () => {
    const created = await run(() => app.createStudyRoom(roomData));
    const id = created.room!.id;
    await run(() => app.switchUser('meera'));
    const before = JSON.stringify(roomById(id));
    await run(() => {
      assert.equal(app.sendStudyRoomMessage('missing-room', 'Hello').success, false);
      assert.equal(app.sendStudyRoomMessage(id, 'Not joined').success, false);
      app.addStudyRoomWhiteboardNote(id, { text: 'Not joined', type: 'concept' });
      app.clearStudyRoomWhiteboard(id);
      assert.equal(app.toggleStudyRoomHandRaise(id), false);
    });
    assert.equal(JSON.stringify(roomById(id)), before);
    await run(() => app.joinStudyRoom(id));
    const joined = JSON.stringify(roomById(id));
    await run(() => {
      assert.equal(app.sendStudyRoomMessage(id, ' ').success, false);
      assert.equal(app.sendStudyRoomMessage(id, 'x'.repeat(4001)).success, false);
      app.addStudyRoomWhiteboardNote(id, { text: '', type: 'formula' });
      app.addStudyRoomWhiteboardNote(id, { text: 'Bad type', type: 'unknown' as 'formula' });
    });
    assert.equal(JSON.stringify(roomById(id)), joined);
    assert.equal((await run(() => app.createStudyRoom({ ...roomData, mode: 'invalid' as StudyRoomMode }))).success, false);
    assert.equal((await run(() => app.createStudyRoom({ ...roomData, title: 'x'.repeat(161) }))).success, false);
  });

  it('keeps repeated messages and notes distinct and reserves clearing for the host or admin', async () => {
    const created = await run(() => app.createStudyRoom(roomData));
    const id = created.room!.id;
    await run(() => app.switchUser('meera'));
    await run(() => app.joinStudyRoom(id));
    await run(() => {
      for (let index = 0; index < 5; index++) {
        assert.equal(app.sendStudyRoomMessage(id, `Question ${index}`).success, true);
        app.addStudyRoomWhiteboardNote(id, { text: `Note ${index}`, type: 'doubt' });
      }
    });
    const room = roomById(id);
    assert.equal(room.messages.length, 6);
    assert.equal(new Set(room.messages.map((message) => message.id)).size, 6);
    assert.equal(room.whiteboardNotes.length, 6);
    assert.equal(new Set(room.whiteboardNotes.map((note) => note.id)).size, 6);
    await run(() => app.clearStudyRoomWhiteboard(id));
    assert.equal(roomById(id).whiteboardNotes.length, 6);
    await run(() => app.switchUser('ananya'));
    await run(() => app.clearStudyRoomWhiteboard(id));
    assert.equal(roomById(id).whiteboardNotes.length, 0);
    assert.deepEqual(app.users, SEED_USERS, 'Study room activity never awards credits.');
  });

  it('opens one authoritative session room and joins it in the same event', async () => {
    const session = await acceptedSession();
    const result = await run(() => {
      const room = app.getOrCreateSessionStudyRoom({ ...session, topic: 'Forged caller topic' })!;
      const again = app.getOrCreateSessionStudyRoom(session)!;
      assert.equal(room.id, again.id);
      assert.equal(app.joinStudyRoom(room.id).success, true);
      return room;
    });
    assert.equal(app.studyRooms.filter((room) => room.sessionId === session.id).length, 1);
    assert.equal(app.activeStudyRoomId, result.id);
    assert.equal(result.topic, session.topic);
    assert.match(result.whiteboardNotes[0].text, /score: 0\/3/);
    assert.doesNotMatch(result.whiteboardNotes[0].text, /Target.*3\/3/);
    await run(() => app.switchUser('meera'));
    assert.equal((await run(() => app.getOrCreateSessionStudyRoom(session))), undefined);
    assert.equal((await run(() => app.joinStudyRoom(result.id))).success, false);
    assert.equal((await run(() => app.getOrCreateSessionStudyRoom({ ...session, id: 'invented' }))), undefined);
  });

  it('uses supported goals and plan activities without inventing quiz results or unrelated formulas', async () => {
    const session = await acceptedSession(true);
    const savedDraft = await run(() => app.saveLearningPlan(session.id, {
      goal: 'Practise reading', strengths: 'Likes stories', startingPoint: 'Ask which story is familiar.',
      strategies: ['Pause when needed.'], lessons: [{
        title: 'Story practice', objective: 'Choose a picture', activities: 'PRIVATE DRAFT ACTIVITY', evidence: 'Learner response',
      }], materials: 'Picture cards', responseMode: 'pointing', reviewDate: '2099-10-21', teacherGuidance: '',
    }, false));
    assert.equal(savedDraft.success, true);
    await run(() => app.switchUser('aarav'));
    const room = await run(() => app.getOrCreateSessionStudyRoom(session));
    assert.ok(room);
    assert.match(room.whiteboardNotes[0].text, /Maintain a familiar reading routine/);
    assert.doesNotMatch(room.whiteboardNotes.map((note) => note.text).join(' '), /[013]\/3|tan\(|sin\(|cos\(/);
    assert.doesNotMatch(room.whiteboardNotes.map((note) => note.text).join(' '), /PRIVATE DRAFT ACTIVITY/);
    assert.equal(room.messages[0].senderId, 'system');
    assert.match(room.description, /Local demo workspace/);
    assert.ok(room.participants.every((participant) => !participant.isAudioOn && !participant.isVideoOn));
  });

  it('cancels pending simulated replies on reset, persona switch and leaving a room', async (t) => {
    const callbacks: Array<() => void> = [];
    const cleared: unknown[] = [];
    t.mock.method(globalThis, 'setTimeout', ((callback: () => void) => {
      callbacks.push(callback);
      return callbacks.length as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout);
    t.mock.method(globalThis, 'clearTimeout', (timer: unknown) => { cleared.push(timer); });
    const id = 'room-trig-asl-10';
    await run(() => app.joinStudyRoom(id));
    await run(() => app.sendStudyRoomMessage(id, 'What is an angle?'));
    assert.equal(callbacks.length, 1);
    await run(() => app.resetAllData());
    await run(() => callbacks[0]());
    assert.deepEqual(app.studyRooms, SEED_STUDY_ROOMS);
    await run(() => app.joinStudyRoom(id));
    await run(() => app.sendStudyRoomMessage(id, 'Another angle question'));
    await run(() => app.switchUser('meera'));
    const afterSwitch = JSON.stringify(app.studyRooms);
    await run(() => callbacks[1]());
    assert.equal(JSON.stringify(app.studyRooms), afterSwitch);
    await run(() => app.switchUser('aarav'));
    await run(() => app.joinStudyRoom(id));
    await run(() => app.sendStudyRoomMessage(id, 'One final angle question'));
    await run(() => app.leaveStudyRoom(id));
    const afterLeave = JSON.stringify(app.studyRooms);
    await run(() => callbacks[2]());
    assert.equal(JSON.stringify(app.studyRooms), afterLeave);
    assert.equal(cleared.length, 3);
  });

  it('persists study content and resets it across a provider reload', async () => {
    const created = await run(() => app.createStudyRoom(roomData));
    const id = created.room!.id;
    await run(() => {
      app.sendStudyRoomMessage(id, 'Saved question');
      app.addStudyRoomWhiteboardNote(id, { text: 'Saved note', type: 'concept' });
    });
    await act(async () => renderer.unmount());
    await mount();
    assert.equal(app.activeStudyRoomId, null);
    assert.equal(roomById(id).messages.at(-1)?.text, 'Saved question');
    assert.equal(roomById(id).whiteboardNotes.at(-1)?.text, 'Saved note');
    await run(() => app.resetAllData());
    assert.deepEqual(app.studyRooms, SEED_STUDY_ROOMS);
    assert.equal(app.activeStudyRoomId, null);
    await act(async () => renderer.unmount());
    await mount();
    assert.deepEqual(app.studyRooms, SEED_STUDY_ROOMS);
    assert.equal((await run(() => app.reserveBook('book-rd-sharma-10'))).success, true);
    assert.equal((await run(() => app.reserveBook('book-rd-sharma-10'))).success, false);
  });
});
