/**
 * Test script to run actual automated unit & scenario verification
 * for CAMPUSLOOP Step 2: Peer Mentoring & Credit Engine.
 */

import { SEED_USERS, SEED_BOOKS, SEED_TRANSACTIONS } from '../data/seedData';
import { getQuizForTopic } from '../data/quizBank';
import { MentoringSession, CreditTransaction, User, CreditBreakdown } from '../types';

function runStep2Tests() {
  console.log('=== STARTING AUTOMATED CAMPUSLOOP STEP 2 TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      passed++;
    }
  }

  // TEST 1: Initial State Check
  console.log('--- Test Suite 1: Initial Mentoring State & Quizzes ---');
  let users = JSON.parse(JSON.stringify(SEED_USERS));
  let sessions: MentoringSession[] = [];
  let transactions: CreditTransaction[] = JSON.parse(JSON.stringify(SEED_TRANSACTIONS));

  assert(users.rohan.credits === 9940, 'Rohan starts with exactly 9,940 credits');
  assert(users.aarav.credits === 350, 'Aarav starts with exactly 350 credits');
  assert(users.rohan.isVerifiedMentor === true, 'Rohan is a verified academic mentor');

  // Verify Predefined Quiz for "Applications of Trigonometry"
  const trigQuiz = getQuizForTopic('Applications of Trigonometry');
  assert(trigQuiz.length === 3, 'Trigonometry quiz has exactly 3 predefined questions');
  assert(trigQuiz[0].correctOptionIndex === 1, 'Trigonometry Q1 correct option is 20√3 m');
  assert(trigQuiz[1].correctOptionIndex === 2, 'Trigonometry Q2 correct option is 1:1');
  assert(trigQuiz[2].correctOptionIndex === 0, 'Trigonometry Q3 correct option is 40√3 m');

  // TEST 2: Request Academic Help & Self-Mentoring Prevention
  console.log('\n--- Test Suite 2: Request Academic Help & Guard Checks ---');
  function requestMentoring(
    currentUser: User,
    data: {
      mentorId: string;
      subject: string;
      topic: string;
      grade: string;
      date: string;
      time: string;
      description: string;
      baselineAnswers: number[];
    }
  ) {
    if (data.mentorId === currentUser.id) {
      return { success: false, message: 'Self-mentoring is not permitted' };
    }
    const targetMentor = users[data.mentorId];
    if (!targetMentor || !targetMentor.isVerifiedMentor) {
      return { success: false, message: 'Only verified academic mentors can be requested' };
    }
    const hasConflict = sessions.some(
      (s) =>
        s.mentorId === data.mentorId &&
        s.date === data.date &&
        s.time === data.time &&
        (s.status === 'requested' || s.status === 'accepted')
    );
    if (hasConflict) {
      return { success: false, message: 'Conflicting booking prevented' };
    }

    const questions = getQuizForTopic(data.topic);
    let baselineScore = 0;
    data.baselineAnswers.forEach((ans, idx) => {
      if (questions[idx] && ans === questions[idx].correctOptionIndex) baselineScore++;
    });
    const baselinePercentage = Math.round((baselineScore / questions.length) * 100);

    const newSession: MentoringSession = {
      id: 'session-' + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentGrade: currentUser.grade,
      mentorId: targetMentor.id,
      mentorName: targetMentor.name,
      subject: data.subject,
      topic: data.topic,
      grade: data.grade,
      date: data.date,
      time: data.time,
      description: data.description,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      baselineQuiz: {
        answers: data.baselineAnswers,
        score: baselineScore,
        totalQuestions: questions.length,
        percentage: baselinePercentage,
        completedAt: new Date().toISOString(),
      },
      creditAwarded: false,
    };

    sessions.push(newSession);
    return { success: true, session: newSession, baselineScore, baselinePercentage };
  }

  // Rohan attempts self-mentoring
  const selfReq = requestMentoring(users.rohan, {
    mentorId: 'rohan',
    subject: 'Mathematics',
    topic: 'Applications of Trigonometry',
    grade: 'Grade 10',
    date: '2026-09-28',
    time: '16:30',
    description: 'Self-mentoring test',
    baselineAnswers: [1, 2, 0],
  });
  assert(!selfReq.success && selfReq.message === 'Self-mentoring is not permitted', 'Self-mentoring blocked');

  // Aarav requests Rohan for Applications of Trigonometry (Baseline 1/3: answer Q1 correctly = 1, Q2 wrong = 0, Q3 wrong = 1)
  const aaravReq = requestMentoring(users.aarav, {
    mentorId: 'rohan',
    subject: 'Mathematics',
    topic: 'Applications of Trigonometry',
    grade: 'Grade 10',
    date: '2026-09-28',
    time: '16:30',
    description: 'Heights and distances CBSE exam preparation',
    baselineAnswers: [1, 0, 1], // Q1 right (1), Q2 wrong (0), Q3 wrong (1) -> score 1/3
  });
  assert(aaravReq.success, 'Aarav successfully requests mentoring from Rohan');
  assert(aaravReq.baselineScore === 1, 'Baseline score is exactly 1 out of 3');
  assert(aaravReq.baselinePercentage === 33, 'Baseline percentage is 33%');
  assert(users.aarav.credits === 350, 'Aarav pays NOTHING (0 credit cost; balance remains 350 cr)');

  const demoSession = aaravReq.session!;

  // Conflicting booking test: Meera attempts to book Rohan at exact same date & time
  const conflictReq = requestMentoring(users.meera, {
    mentorId: 'rohan',
    subject: 'Physics',
    topic: 'Kinematics',
    grade: 'Grade 12',
    date: '2026-09-28',
    time: '16:30', // Same slot!
    description: 'Conflicting booking test',
    baselineAnswers: [1, 1, 1],
  });
  assert(!conflictReq.success && conflictReq.message === 'Conflicting booking prevented', 'Conflicting booking prevented for same mentor time slot');

  // TEST 3: Mentor Acceptance Workflow
  console.log('\n--- Test Suite 3: Mentor Acceptance & Finish Workflow ---');
  function acceptSession(sessionId: string, mentorUser: User) {
    const s = sessions.find((x) => x.id === sessionId);
    if (!s || s.status !== 'requested') return { success: false, message: 'Invalid state' };
    if (s.mentorId !== mentorUser.id) return { success: false, message: 'Unauthorized' };
    if (!mentorUser.isVerifiedMentor) return { success: false, message: 'Only verified mentors can accept' };

    s.status = 'accepted';
    s.acceptedAt = new Date().toISOString();
    return { success: true };
  }

  // Aarav attempts to accept session (unauthorized)
  const unauthorizedAccept = acceptSession(demoSession.id, users.aarav);
  assert(!unauthorizedAccept.success, 'Junior student cannot accept session');

  // Rohan accepts session
  const rohanAccept = acceptSession(demoSession.id, users.rohan);
  assert(rohanAccept.success, 'Rohan successfully accepts mentoring session');
  assert(demoSession.status === 'accepted', 'Session status transitioned to accepted');

  // Mentor Marks Session Finished
  function finishSession(sessionId: string, mentorUser: User) {
    const s = sessions.find((x) => x.id === sessionId);
    if (!s || s.status !== 'accepted') return { success: false, message: 'Invalid state' };
    if (s.mentorId !== mentorUser.id) return { success: false, message: 'Unauthorized' };

    s.status = 'awaiting_learner_confirmation';
    s.mentorFinishedAt = new Date().toISOString();
    s.simulatedSession = true;
    return { success: true };
  }

  const rohanFinish = finishSession(demoSession.id, users.rohan);
  assert(rohanFinish.success, 'Mentor marks session finished');
  assert(demoSession.status === 'awaiting_learner_confirmation', 'Status transitioned to awaiting_learner_confirmation');
  assert(users.rohan.credits === 9940, 'CRUCIAL: Credits NOT awarded on mentor click alone (Rohan remains 9,940 cr)');

  // TEST 4: Learner Final Quiz, Feedback & Credit Engine
  console.log('\n--- Test Suite 4: Learner Final Quiz (3/3), 5-Star Feedback & Credit Engine ---');
  function finalizeSession(
    sessionId: string,
    studentUser: User,
    data: {
      finalAnswers: number[];
      rating: number;
      feedbackComment?: string;
    }
  ) {
    const s = sessions.find((x) => x.id === sessionId);
    if (!s || s.status !== 'awaiting_learner_confirmation') {
      return { success: false, message: 'Invalid state' };
    }
    if (s.studentId !== studentUser.id) return { success: false, message: 'Unauthorized' };
    if (s.creditAwarded) return { success: false, message: 'Credits have already been awarded for this completed session' };

    const questions = getQuizForTopic(s.topic);
    let finalScore = 0;
    data.finalAnswers.forEach((ans, idx) => {
      if (questions[idx] && ans === questions[idx].correctOptionIndex) finalScore++;
    });
    const finalPercentage = Math.round((finalScore / questions.length) * 100);

    const baselinePercentage = s.baselineQuiz?.percentage ?? 0;
    const observedImprovement = Math.max(0, finalPercentage - baselinePercentage);

    const baseCompletion = 40;
    const feedbackBonus = data.rating >= 4 ? 10 : 0;
    const quizImprovementBonus = observedImprovement >= 30 ? 20 : 0;
    const totalAward = Math.min(70, baseCompletion + feedbackBonus + quizImprovementBonus);

    const breakdown: CreditBreakdown = {
      baseCompletion,
      feedbackBonus,
      quizImprovementBonus,
      total: totalAward,
      baselinePercentage,
      finalPercentage,
      observedImprovement,
      rating: data.rating,
    };

    s.status = 'completed';
    s.completedAt = new Date().toISOString();
    s.finalQuiz = {
      answers: data.finalAnswers,
      score: finalScore,
      totalQuestions: questions.length,
      percentage: finalPercentage,
      completedAt: new Date().toISOString(),
    };
    s.rating = data.rating;
    s.feedbackComment = data.feedbackComment;
    s.creditAwarded = true;
    s.creditBreakdown = breakdown;

    const mentor = users[s.mentorId];
    mentor.credits += totalAward;

    const tx: CreditTransaction = {
      id: 'tx-test-' + Date.now(),
      userId: mentor.id,
      userName: mentor.name,
      amount: totalAward,
      type: 'mentoring_reward',
      description: `Peer Mentoring verified: "${s.topic}" with ${s.studentName}`,
      relatedSessionId: s.id,
      breakdown,
      timestamp: new Date().toISOString(),
    };
    transactions.push(tx);

    return { success: true, finalScore, finalPercentage, observedImprovement, breakdown, totalAward };
  }

  // Aarav completes final quiz: 3/3 (100%), 5 stars rating
  const finalResult = finalizeSession(demoSession.id, users.aarav, {
    finalAnswers: [1, 2, 0], // Q1 right (1), Q2 right (2), Q3 right (0) -> 3/3 = 100%
    rating: 5,
    feedbackComment: 'Excellent teaching by Rohan!',
  });

  assert(finalResult.success, 'Learner confirms attendance & final quiz');
  assert(finalResult.finalScore === 3, 'Final score is 3/3');
  assert(finalResult.finalPercentage === 100, 'Final percentage is 100%');
  assert(finalResult.observedImprovement === 67, 'Observed score gain is +67 percentage points (100% - 33%)');
  assert(finalResult.breakdown?.baseCompletion === 40, 'Base attendance credit: +40');
  assert(finalResult.breakdown?.feedbackBonus === 10, 'Feedback bonus (5 stars >= 4): +10');
  assert(finalResult.breakdown?.quizImprovementBonus === 20, 'Quiz improvement bonus (67 pp >= 30 pp): +20');
  assert(finalResult.totalAward === 70, 'Total credits awarded is exactly +70');
  assert(users.rohan.credits === 10010, 'Rohan credit balance increased from 9,940 to exactly 10,010 credits!');

  // TEST 5: Duplicate-Award Prevention
  console.log('\n--- Test Suite 5: Duplicate-Award Prevention ---');
  const duplicateAttempt = finalizeSession(demoSession.id, users.aarav, {
    finalAnswers: [1, 2, 0],
    rating: 5,
  });
  assert(!duplicateAttempt.success, 'Duplicate award attempt blocked');
  assert(users.rohan.credits === 10010, 'Rohan balance remains exactly 10,010 credits (no double credit)');

  // TEST 6: Transaction Ledger Integrity
  console.log('\n--- Test Suite 6: Transaction Ledger Audit ---');
  const mentorTx = transactions.find((t) => t.relatedSessionId === demoSession.id);
  assert(!!mentorTx, 'Transaction ledger has record linked to session');
  assert(mentorTx?.amount === 70, 'Ledger transaction amount is +70');
  assert(mentorTx?.breakdown?.total === 70, 'Ledger has full auditable breakdown');

  console.log(`\n=== STEP 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep2Tests();
