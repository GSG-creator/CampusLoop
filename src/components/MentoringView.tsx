import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MentoringSession } from '../types';
import { RequestMentoringModal } from './RequestMentoringModal';
import { LearnerConfirmationModal } from './LearnerConfirmationModal';
import { LearningPlanPanel, SessionMeetingDetails, TeachingSources } from './LearningPlanPanel';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Star,
  Check,
  X,
  Play,
  RotateCcw,
  Award,
  BookOpen,
} from 'lucide-react';

export const MentoringView: React.FC = () => {
  const {
    users,
    currentUser,
    sessions,
    acceptMentoringSession,
    declineMentoringSession,
    finishMentoringSession,
  } = useApp();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSessionForConfirmation, setSelectedSessionForConfirmation] =
    useState<MentoringSession | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Rohan's current credits & milestone progress
  const rohan = users.rohan;
  const isRohanAtMilestone = (rohan?.credits ?? 0) >= 10000;

  // Filter sessions relevant to the current user or platform
  const isMentor = currentUser.isVerifiedMentor === true;
  const isAdmin = currentUser.roles.includes('admin');

  const incomingRequestsForMe = sessions.filter(
    (s) => s.mentorId === currentUser.id && s.status === 'requested'
  );

  const activeSessionsForMe = sessions.filter(
    (s) =>
      (s.mentorId === currentUser.id || s.studentId === currentUser.id || isAdmin) &&
      s.status === 'accepted'
  );

  const awaitingConfirmationForMe = sessions.filter(
    (s) =>
      (s.studentId === currentUser.id || s.mentorId === currentUser.id || isAdmin) &&
      s.status === 'awaiting_learner_confirmation'
  );

  const isParticipant = (session: MentoringSession) => session.mentorId === currentUser.id || session.studentId === currentUser.id || isAdmin;
  const completedSessions = sessions.filter((s) => s.status === 'completed' && isParticipant(s));
  const supportedSessions = sessions.filter((s) => s.learningSupport && s.status !== 'declined' && isParticipant(s));
  const pendingRequestsForMe = sessions.filter((session) => session.studentId === currentUser.id && session.status === 'requested' && !session.learningSupport);

  const handleAccept = (sessionId: string) => {
    const res = acceptMentoringSession(sessionId);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleDecline = (sessionId: string) => {
    const res = declineMentoringSession(sessionId);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleFinishSession = (sessionId: string) => {
    const res = finishMentoringSession(sessionId, true);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20 text-violet-100 mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-violet-300" />
            <span>Peer Mentoring & Credit Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Learn at your pace. Plan support together.
          </h1>
          <p className="text-violet-100/90 text-sm leading-relaxed mb-4">
            Free peer mentoring with an optional personalized learning plan. Choose support for memory, processing, reading, communication, energy or movement. Share what helps you learn; no diagnosis is needed.
          </p>

          {/* Persona Guidance Banner */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-white mb-1">
              <span>Persona: {currentUser.name}</span>
              <span className="text-violet-200">({currentUser.grade})</span>
              <span className="text-amber-300 font-mono ml-auto">
                {currentUser.credits.toLocaleString()} CR
              </span>
            </div>
            {currentUser.id === 'aarav' && (
              <p className="text-violet-100 text-[11px] leading-relaxed">
                <strong>Learner:</strong> Request help with your chosen topic. Select personalized learning support to share your preferences, then review the plan your mentor prepares. You can ask for changes.
              </p>
            )}
            {currentUser.id === 'rohan' && (
              <p className="text-violet-100 text-[11px] leading-relaxed">
                <strong>Mentor:</strong> Review the learner’s preferences, accept the request and create an editable curriculum plan. Share it with the learner and teacher before the session. Mark the session finished after coaching; the learner confirms attendance.
              </p>
            )}
            {currentUser.id === 'meera' && (
              <p className="text-violet-100 text-[11px] leading-relaxed">
                <strong>Senior learner:</strong> You can request support too. Only verified mentors can create a plan for their assigned learner.
              </p>
            )}
            {currentUser.id === 'ananya' && (
              <p className="text-violet-100 text-[11px] leading-relaxed">
                👉 <strong>Faculty Oversight:</strong> Full audit authority over student sessions, quiz gains, and credit issuance.
              </p>
            )}
          </div>
        </div>

        {/* Milestone Tracker Pill */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-8 sm:top-8 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs max-w-xs">
          <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
            <span>Rohan's Contribution Progress</span>
            <span className="font-mono text-white">{rohan?.credits ?? 0} / 10,000 CR</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, ((rohan?.credits ?? 0) / 10000) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-300">
            {isRohanAtMilestone ? (
              <strong className="text-emerald-400">10,000 CR eligibility milestone reached.</strong>
            ) : (
              <span>Mentoring awards follow learner-confirmed participation. Feedback should reflect the learner’s experience.</span>
            )}
          </p>
        </div>
      </div>

      {/* Action Bar for Juniors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Choose the support that works for you</h3>
          <p className="text-sm text-slate-600">
            Request a subject, a comfortable session length and how you prefer to respond.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="min-h-11 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Request Academic Help (0 Credits)</span>
        </button>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 space-y-3 text-base text-slate-800">
        <h2 className="font-bold text-lg">A curriculum plan shaped around your learning needs</h2>
        <p className="leading-relaxed">Your student mentor can prepare three editable lessons with clear steps, examples, practice, reminders and breaks. Review the plan together and ask for changes. Teachers can review the plan and add guidance.</p>
        <p className="leading-relaxed">Supported sessions use a short learner reflection instead of a compulsory quiz. Practising, maintaining a skill and identifying more support are all valid outcomes. Mentor completion credits do not depend on cognitive improvement.</p>
        <details><summary className="cursor-pointer font-semibold text-indigo-800">About the teaching approaches</summary><div className="mt-3"><TeachingSources /></div></details>
      </div>

      {supportedSessions.length > 0 && <section className="space-y-4" aria-label="Your personalized learning plans">
        <h2 className="text-xl font-bold text-slate-900">Your personalized learning plans</h2>
        {supportedSessions.map((session) => <article key={session.id} className="space-y-2">
          <p className="text-sm text-slate-600">{session.date} at {session.time} · {session.status.replaceAll('_', ' ')}</p>
          <LearningPlanPanel sessionId={session.id} />
        </article>)}
      </section>}

      {pendingRequestsForMe.length > 0 && <section className="space-y-3" aria-label="Your pending mentoring requests">
        <h2 className="text-lg font-bold text-slate-900">Your pending requests</h2>
        {pendingRequestsForMe.map((session) => <article key={session.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <h3 className="font-bold text-slate-900">{session.topic}</h3>
          <p className="text-sm text-slate-600">{session.date} at {session.time} · Awaiting {session.mentorName}’s acceptance</p>
          <SessionMeetingDetails session={session} />
        </article>)}
      </section>}

      {/* Section 1: Incoming Requests (For Mentor) */}
      {isMentor && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Incoming Mentoring Requests ({incomingRequestsForMe.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review requests from juniors. Accepting schedules your session.
                </p>
              </div>
            </div>
          </div>

          {incomingRequestsForMe.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-1">No pending mentoring requests right now.</p>
              {currentUser.id === 'rohan' && (
                <p className="text-[11px] text-indigo-600">
                  Tip: Switch to <strong>Aarav</strong> above to submit the demo request for <em>Applications of Trigonometry</em>!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequestsForMe.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {session.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {session.subject}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {session.grade}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">
                      Student: <strong>{session.studentName}</strong> • Date: <strong>{session.date}</strong> at <strong>{session.time}</strong>
                    </p>
                    <SessionMeetingDetails session={session} />

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        {session.assessmentMode === 'supported' ? 'Supported learning · learner reflection' : <>Diagnostic Baseline: {session.baselineQuiz?.score}/3 ({session.baselineQuiz?.percentage}%)</>}
                      </span>
                      <span className="text-slate-500 italic">
                        Potential reward: Up to <strong>+70 CR</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDecline(session.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(session.id)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Request</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Active & Upcoming Sessions */}
      {activeSessionsForMe.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active / Accepted Sessions ({activeSessionsForMe.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ready for mentoring. Mentor marks session finished after coaching.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {activeSessionsForMe.map((session) => {
              const isAssignedMentor = session.mentorId === currentUser.id;
              const planReady = !session.learningSupport || (!!session.learningPlan && ['shared', 'reviewed'].includes(session.learningPlan.status) && session.learningPlan.learnerResponse === 'agreed');
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {session.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Accepted
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">
                      Student: <strong>{session.studentName}</strong> • Mentor: <strong>{session.mentorName}</strong>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Scheduled for: <strong>{session.date}</strong> at <strong>{session.time}</strong>
                    </p>
                    <SessionMeetingDetails session={session} />

                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] mt-1">
                      <span>
                        {session.assessmentMode === 'supported'
                          ? 'Follow the shared learning plan, offer breaks and use the learner’s chosen way to respond. Completion credits do not depend on score gains.'
                          : <>Baseline: {session.baselineQuiz?.score}/3 ({session.baselineQuiz?.percentage}%). A gain of at least 30 percentage points qualifies for the quiz bonus.</>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isAssignedMentor ? (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => handleFinishSession(session.id)}
                          disabled={!planReady}
                          className="min-h-11 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xs flex items-center gap-1.5"
                          title="Simulate session completion & notify student"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Simulate / Mark Session Finished</span>
                        </button>
                        {!planReady && <p className="max-w-xs text-sm text-amber-900">Share a learning plan and ask the learner to agree before marking this session finished.</p>}
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded">
                          Session-Time Simulation (Demo Mode)
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Session In Progress
                        </span>
                        <span className="text-[10px] text-indigo-600 font-medium">
                          Mentor will mark finished when done
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Awaiting Learner Confirmation (CRITICAL STEP) */}
      {awaitingConfirmationForMe.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400 rounded-3xl p-6 text-amber-950 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                !
              </div>
              <div>
                <h3 className="font-extrabold text-amber-950 text-sm">
                  Action Required: Learner Confirmation
                </h3>
                <p className="text-[11px] text-amber-800">
                  Confirm attendance and share feedback. Supported sessions use a goal reflection; standard sessions use the final quiz.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {awaitingConfirmationForMe.map((session) => {
              const isLearner = session.studentId === currentUser.id;
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-white border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {session.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        Finished by Mentor
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Mentor <strong>{session.mentorName}</strong> has completed the coaching session.
                    </p>
                    <SessionMeetingDetails session={session} />
                    <p className="text-amber-800 text-[11px] font-semibold">
                      Learner: <strong>{session.studentName}</strong> {session.assessmentMode === 'supported' ? '(Supported learning)' : <>(Baseline: {session.baselineQuiz?.score}/3)</>}
                    </p>
                  </div>

                  <div className="self-end sm:self-auto">
                    {isLearner || isAdmin ? (
                      <button
                        onClick={() => setSelectedSessionForConfirmation(session)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{session.assessmentMode === 'supported' ? 'Reflect & Confirm Attendance' : 'Take Final Quiz & Confirm Attendance'}</span>
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Awaiting {session.studentName}'s confirmation
                        </span>
                        <span className="text-[10px] text-amber-700">
                          (Switch to Aarav in top bar to confirm)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Verified Completed Sessions with Auditable Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Your Completed Mentoring Sessions ({completedSessions.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Session outcomes and credit details for your mentoring sessions
              </p>
            </div>
          </div>
        </div>

        {completedSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed mentoring sessions yet. Complete the demo workflow above to see verified records!
          </div>
        ) : (
          <div className="space-y-3">
            {completedSessions.map((session) => {
              const b = session.creditBreakdown;
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 text-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {session.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Verified Complete
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Mentor: <strong>{session.mentorName}</strong> • Learner: <strong>{session.studentName}</strong> • Completed: {new Date(session.completedAt || '').toLocaleString()}
                      </p>
                      <SessionMeetingDetails session={session} />
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-base text-emerald-700 block">
                        +{b?.total ?? 0} CR
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        TX: {session.transactionId?.slice(0, 14)}...
                      </span>
                    </div>
                  </div>

                  {/* Auditable Credit Breakdown Card */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Base Attendance</span>
                      <span className="font-bold text-slate-800">+{b?.baseCompletion ?? 0} CR</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Rating ({session.rating}★)</span>
                      <span className="font-bold text-slate-800">+{b?.feedbackBonus ?? 0} CR</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{session.assessmentMode === 'supported' ? 'Supported Session Completion' : 'Observed Quiz Gain'}</span>
                      <span className="font-bold text-indigo-700">
                        {session.assessmentMode === 'supported' ? `+${b?.supportCompletionBonus ?? 0} CR` : <>+{b?.observedImprovement ?? 0} pp (+{b?.quizImprovementBonus ?? 0} CR)</>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{session.assessmentMode === 'supported' ? 'Learner Goal Reflection' : 'Diagnostic Scores'}</span>
                      <span className="font-semibold text-slate-700">
                        {session.assessmentMode === 'supported'
                          ? session.goalReview === 'practised' ? 'Practised my goal' : session.goalReview === 'maintained' ? 'Maintained a skill' : session.goalReview === 'needs_more_support' ? 'Would like more support' : 'Not recorded'
                          : <>{session.baselineQuiz?.score}/3 → {session.finalQuiz?.score}/3</>}
                      </span>
                    </div>
                  </div>

                  {session.feedbackComment && (
                    <p className="text-[11px] text-slate-600 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                      "{session.feedbackComment}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verified Mentors Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Verified Star Mentors Directory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(users)
            .filter((u) => u.isVerifiedMentor === true)
            .map((mentor) => (
              <div
                key={mentor.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 text-xs"
              >
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-200 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{mentor.name}</span>
                    <span className="font-mono font-bold text-amber-700 text-xs">
                      {mentor.credits.toLocaleString()} CR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {mentor.grade} • {mentor.badge || 'Verified Mentor'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {mentor.bio}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {mentor.mentorSubjects?.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      <RequestMentoringModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {selectedSessionForConfirmation && <LearnerConfirmationModal
        key={selectedSessionForConfirmation.id}
        session={selectedSessionForConfirmation}
        onClose={() => setSelectedSessionForConfirmation(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />}
    </div>
  );
};
