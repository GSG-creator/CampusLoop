/**
 * Automated Verification Suite for Virtual Study Rooms
 * (Live Collaborative Text & ASL-Supported Sessions)
 */

import { SEED_STUDY_ROOMS, STEM_ASL_GESTURES, AAC_STUDY_PROMPTS } from '../data/studyRoomData';
import { VirtualStudyRoom, StudyRoomParticipant, StudyRoomMessage } from '../types';

export function runVirtualStudyRoomVerification() {
  console.log('=== STARTING VIRTUAL STUDY ROOM VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // --- SUITE 1: SEED STUDY ROOMS CATALOG & CONFIGURATION ---
  console.log('--- Test Suite 1: Seed Study Rooms Catalog ---');
  assert(SEED_STUDY_ROOMS.length >= 3, `At least 3 collaborative study rooms configured (found ${SEED_STUDY_ROOMS.length})`);

  const trigRoom = SEED_STUDY_ROOMS.find((r) => r.id === 'room-trig-asl-10');
  assert(Boolean(trigRoom), 'Found Trigonometry & Heights study room');
  assert(trigRoom?.mode === 'asl_supported', 'Trigonometry room is ASL-Supported');
  assert(trigRoom?.hostName === 'Rohan Verma', 'Rohan Verma is host of Trigonometry room');
  assert(trigRoom?.subject === 'Mathematics', 'Subject is Mathematics');
  assert(trigRoom?.participants.length === 3, 'Trigonometry room has initial participants (Rohan, Aarav, Meera)');

  const mechanicsRoom = SEED_STUDY_ROOMS.find((r) => r.id === 'room-physics-vectors-11');
  assert(Boolean(mechanicsRoom), 'Found Physics Mechanics study room');
  assert(mechanicsRoom?.mode === 'text_based', 'Physics room is text-based collaborative desk');
  assert(mechanicsRoom?.hostName === 'Meera Sharma', 'Meera Sharma is host of Physics desk');

  const inclusiveRoom = SEED_STUDY_ROOMS.find((r) => r.id === 'room-inclusive-stem-asl');
  assert(Boolean(inclusiveRoom), 'Found Inclusive STEM Sign Language Circle');
  assert(inclusiveRoom?.mode === 'asl_supported', 'Inclusive Circle is ASL-supported');

  // --- SUITE 2: JOINING & PARTICIPANT MANAGEMENT ---
  console.log('\n--- Test Suite 2: Joining & Participant State ---');
  let rooms: VirtualStudyRoom[] = JSON.parse(JSON.stringify(SEED_STUDY_ROOMS));

  function joinRoom(roomId: string, user: { id: string; name: string; avatar: string; grade: string; role: any }) {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return { success: false, message: 'Room not found' };

    const exists = targetRoom.participants.some((p) => p.id === user.id);
    if (!exists) {
      targetRoom.participants.push({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        grade: user.grade,
        role: user.role,
        isAudioOn: false,
        isVideoOn: true,
        isAslMode: targetRoom.mode === 'asl_supported',
        isHandRaised: false,
        isSpeaking: false,
        isSigning: false,
        lastActive: 'Just now',
      });
      targetRoom.participantCount = targetRoom.participants.length;
    }
    return { success: true, room: targetRoom };
  }

  const joinRes = joinRoom('room-physics-vectors-11', {
    id: 'rohan',
    name: 'Rohan Verma',
    avatar: 'https://avatar.cc/rohan',
    grade: 'Grade 12',
    role: 'mentor',
  });
  assert(joinRes.success === true, 'Rohan successfully joined Physics room');
  assert(
    Boolean(rooms.find((r) => r.id === 'room-physics-vectors-11')?.participants.some((p) => p.id === 'rohan')),
    'Rohan is now in Physics room participant list'
  );

  // Duplicate join prevention
  const dupJoin = joinRoom('room-physics-vectors-11', {
    id: 'rohan',
    name: 'Rohan Verma',
    avatar: 'https://avatar.cc/rohan',
    grade: 'Grade 12',
    role: 'mentor',
  });
  const physicsRoomNow = rooms.find((r) => r.id === 'room-physics-vectors-11');
  const rohanCount = physicsRoomNow?.participants.filter((p) => p.id === 'rohan').length;
  assert(rohanCount === 1, 'Duplicate participant entry prevented');

  // --- SUITE 3: TEXT-BASED COLLABORATIVE MESSAGING ---
  console.log('\n--- Test Suite 3: Collaborative Messaging & Math Notation ---');
  function sendMessage(
    roomId: string,
    sender: { id: string; name: string; role: string },
    text: string,
    options?: { isAslSigned?: boolean; gestureTag?: string; aacQuickChip?: boolean }
  ) {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return null;
    const msg: StudyRoomMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: 'https://avatar.cc/' + sender.id,
      senderRole: sender.role,
      text,
      timestamp: '10:15 AM',
      isAslSigned: options?.isAslSigned,
      gestureTag: options?.gestureTag,
      aacQuickChip: options?.aacQuickChip,
    };
    targetRoom.messages.push(msg);
    return msg;
  }

  const mathMsg = sendMessage(
    'room-trig-asl-10',
    { id: 'aarav', name: 'Aarav Patel', role: 'learner' },
    'Is tan(60°) = √3?',
    { isAslSigned: true, gestureTag: 'TRIANGLE' }
  );
  assert(Boolean(mathMsg), 'Math question message sent');
  assert(mathMsg?.isAslSigned === true, 'Message marked with ASL signing flag');
  assert(mathMsg?.gestureTag === 'TRIANGLE', 'Message tagged with TRIANGLE gesture');

  // Non-verbal AAC prompt
  const aacMsg = sendMessage(
    'room-trig-asl-10',
    { id: 'aarav', name: 'Aarav Patel', role: 'learner' },
    AAC_STUDY_PROMPTS[0].text,
    { aacQuickChip: true, gestureTag: 'WHITEBOARD' }
  );
  assert(aacMsg?.aacQuickChip === true, 'AAC rapid prompt successfully sent');
  assert(aacMsg?.gestureTag === 'WHITEBOARD', 'Correct AAC gesture attached');

  // --- SUITE 4: ASL STEM GESTURE LIBRARY & FINGER-SPELLING ENGINE ---
  console.log('\n--- Test Suite 4: ASL STEM Gesture Library & Sign Engine ---');
  assert(STEM_ASL_GESTURES.length >= 10, `At least 10 STEM ASL gestures available (found ${STEM_ASL_GESTURES.length})`);

  const triangleGesture = STEM_ASL_GESTURES.find((g) => g.name === 'TRIANGLE');
  assert(Boolean(triangleGesture), 'Found TRIANGLE gesture');
  assert(triangleGesture?.symbol === '📐', 'Triangle symbol verified');

  const angleGesture = STEM_ASL_GESTURES.find((g) => g.name === 'ANGLE / THETA');
  assert(Boolean(angleGesture), 'Found ANGLE / THETA gesture');

  const formulaGesture = STEM_ASL_GESTURES.find((g) => g.name === 'FORMULA / EQUATION');
  assert(Boolean(formulaGesture), 'Found FORMULA gesture');

  const elevationGesture = STEM_ASL_GESTURES.find((g) => g.name === 'ELEVATION (LOOK UP)');
  assert(Boolean(elevationGesture), 'Found ELEVATION gesture');

  const solveGesture = STEM_ASL_GESTURES.find((g) => g.name === 'SOLVED / ANSWER');
  assert(Boolean(solveGesture), 'Found SOLVED gesture');

  // Finger-spelling sanitization & mapping check
  function sanitizeForFingerspelling(word: string): string[] {
    return word.replace(/[^A-Z0-9 ]/gi, '').toUpperCase().split('');
  }
  const spelled = sanitizeForFingerspelling('tan(60°) = √3');
  assert(spelled.includes('T') && spelled.includes('A') && spelled.includes('N'), 'Correctly extracted letters T-A-N');
  assert(spelled.includes('6') && spelled.includes('0'), 'Correctly extracted numbers 6 and 0');

  // --- SUITE 5: COLLABORATIVE WHITEBOARD & SHARED NOTES ---
  console.log('\n--- Test Suite 5: Shared Whiteboard & Formulas ---');
  function addNote(
    roomId: string,
    author: { id: string; name: string },
    type: 'concept' | 'formula' | 'solution' | 'doubt',
    text: string
  ) {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return null;
    const note = {
      id: `note-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      type,
      text,
      timestamp: '10:20 AM',
    };
    targetRoom.whiteboardNotes.push(note);
    return note;
  }

  const formulaNote = addNote(
    'room-trig-asl-10',
    { id: 'rohan', name: 'Rohan Verma (Mentor)' },
    'formula',
    'tan(θ) = Opposite / Adjacent'
  );
  assert(Boolean(formulaNote), 'Whiteboard sticky note posted');
  assert(formulaNote?.type === 'formula', 'Note categorized as formula');

  const currentNotes = rooms.find((r) => r.id === 'room-trig-asl-10')?.whiteboardNotes;
  assert((currentNotes?.length || 0) >= 4, 'Whiteboard contains multiple collaborative stickies');

  // --- SUITE 6: VISUAL & AUDITORILY IMPAIRED ACCESSIBILITY ---
  console.log('\n--- Test Suite 6: Visual & Auditorily impaired Accessibility Features ---');
  function raiseHand(roomId: string, userId: string) {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return false;
    let state = false;
    targetRoom.participants.forEach((p) => {
      if (p.id === userId) {
        p.isHandRaised = !p.isHandRaised;
        state = p.isHandRaised;
      }
    });
    return state;
  }

  const handState = raiseHand('room-trig-asl-10', 'aarav');
  assert(handState === true, 'Hand raised triggers visual state');
  const aaravInRoom = rooms.find((r) => r.id === 'room-trig-asl-10')?.participants.find((p) => p.id === 'aarav');
  assert(aaravInRoom?.isHandRaised === true, 'Participant hand raised state saved');

  // --- SUITE 7: SESSION-LINKED STUDY ROOM GENERATION ---
  console.log('\n--- Test Suite 7: Session-Linked Study Room ---');
  const mockAcceptedSession = {
    id: 'session-demo-trig',
    studentId: 'aarav',
    studentName: 'Aarav Patel',
    studentGrade: 'Grade 10',
    mentorId: 'rohan',
    mentorName: 'Rohan Verma',
    subject: 'Mathematics',
    topic: 'Applications of Trigonometry',
    grade: 'Grade 10',
    date: '2026-09-27',
    time: '12:30',
    description: 'Help with heights and distances',
    status: 'accepted' as const,
    requestedAt: '2026-09-26T10:00:00Z',
    creditAwarded: false,
  };

  function getOrCreateSessionRoom(session: typeof mockAcceptedSession) {
    const existing = rooms.find((r) => r.sessionId === session.id);
    if (existing) return existing;

    const newRoom: VirtualStudyRoom = {
      id: `room-session-${session.id}`,
      title: `${session.topic} (Live Collaborative Studio)`,
      subject: session.subject,
      topic: session.topic,
      grade: session.grade,
      mode: 'asl_supported',
      hostId: session.mentorId,
      hostName: session.mentorName,
      hostAvatar: 'https://avatar.cc/rohan',
      hostBadge: 'Verified Peer Mentor',
      description: `Official collaborative study room for ${session.topic}`,
      isLive: true,
      participantCount: 2,
      sessionId: session.id,
      participants: [
        {
          id: session.mentorId,
          name: session.mentorName,
          avatar: 'https://avatar.cc/rohan',
          grade: 'Grade 12',
          role: 'mentor',
          isAudioOn: true,
          isVideoOn: true,
          isAslMode: true,
          isHandRaised: false,
          isSpeaking: false,
          isSigning: true,
          lastActive: 'Just now',
        },
        {
          id: session.studentId,
          name: session.studentName,
          avatar: 'https://avatar.cc/aarav',
          grade: session.studentGrade,
          role: 'learner',
          isAudioOn: false,
          isVideoOn: true,
          isAslMode: true,
          isHandRaised: false,
          isSpeaking: false,
          isSigning: false,
          lastActive: 'Just now',
        },
      ],
      createdAt: new Date().toISOString(),
      tags: [session.subject, session.grade, 'Mentoring Session', 'ASL Supported'],
      whiteboardNotes: [
        {
          id: `note-s1-${session.id}`,
          authorId: session.mentorId,
          authorName: session.mentorName,
          type: 'concept',
          text: `Session: ${session.topic}. Target score 3/3 for +20 CR bonus!`,
          timestamp: '12:30 PM',
        },
      ],
      messages: [],
    };
    rooms.push(newRoom);
    return newRoom;
  }

  const sessionRoom = getOrCreateSessionRoom(mockAcceptedSession);
  assert(Boolean(sessionRoom), 'Generated session-linked study room');
  assert(sessionRoom.sessionId === 'session-demo-trig', 'Session ID linked');
  assert(sessionRoom.mode === 'asl_supported', 'Default mode is inclusive ASL-supported');
  assert(sessionRoom.participants.length === 2, 'Mentor and student automatically enrolled');

  // Verify idempotency
  const sessionRoom2 = getOrCreateSessionRoom(mockAcceptedSession);
  assert(sessionRoom2.id === sessionRoom.id, 'Idempotent room lookup returns existing session room');

  // --- SUITE 8: CUSTOM STUDY ROOM CREATION ---
  console.log('\n--- Test Suite 8: Custom Study Room Creation ---');
  function createCustomRoom(data: {
    title: string;
    subject: string;
    topic: string;
    grade: string;
    mode: 'asl_supported' | 'text_based';
    description: string;
  }) {
    if (!data.title.trim()) return { success: false, message: 'Title required' };
    const room: VirtualStudyRoom = {
      id: `room-${Date.now()}`,
      title: data.title,
      subject: data.subject,
      topic: data.topic,
      grade: data.grade,
      mode: data.mode,
      hostId: 'aarav',
      hostName: 'Aarav Patel',
      hostAvatar: 'https://avatar.cc/aarav',
      description: data.description,
      isLive: true,
      participantCount: 1,
      participants: [],
      createdAt: new Date().toISOString(),
      whiteboardNotes: [],
      messages: [],
      tags: [data.subject, data.grade],
    };
    rooms.push(room);
    return { success: true, room };
  }

  const customRes = createCustomRoom({
    title: 'Organic Chemistry Functional Groups Study Hub',
    subject: 'Chemistry',
    topic: 'Alcohols, Phenols and Ethers',
    grade: 'Grade 12',
    mode: 'text_based',
    description: 'Shared reaction mechanism desk and IUPAC doubt solving.',
  });
  assert(customRes.success === true, 'Custom study room created');
  assert(customRes.room?.subject === 'Chemistry', 'Subject set to Chemistry');
  assert(customRes.room?.mode === 'text_based', 'Mode set to text_based');

  console.log(`\n=================================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================`);

  return { passed, failed };
}

const result = runVirtualStudyRoomVerification();
if (result.failed > 0) process.exitCode = 1;
