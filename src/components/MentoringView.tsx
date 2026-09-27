import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MentoringSession } from '../types';
import { RequestMentoringModal } from './RequestMentoringModal';
import { LearnerConfirmationModal } from './LearnerConfirmationModal';
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
  const isRohanAtMilestone = (rohan?.credits || 0) >= 10010;

  // Filter sessions relevant to the current user or platform
  const isMentor = currentUser.isVerifiedMentor || currentUser.roles.includes('mentor');
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

  const completedSessions = sessions.filter((s) => s.status === 'completed');

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
            Free Academic Coaching by Star Seniors
          </h1>
          <p className="text-violet-100/90 text-sm leading-relaxed mb-4">
            Juniors pay <strong className="text-emerald-300">0 Credits</strong> for targeted concept coaching. Verified mentors earn up to <strong className="text-amber-300">+70 Campus Credits</strong> per completed session with verified learner attendance and observed diagnostic quiz improvement!
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
                👉 <strong>Demo Guide (Aarav):</strong> Click <strong>"Request Academic Help"</strong> below. Select <strong>Rohan</strong> for <em>Applications of Trigonometry</em>, establish your baseline quiz (1/3), then switch to Rohan in the top bar to accept!
              </p>
            )}
            {currentUser.id === 'rohan' && (
              <p className="text-violet-100 text-[11px] leading-relaxed">
                👉 <strong>Demo Guide (Rohan):</strong> You have <strong>9,940 CR</strong>. Accept Aarav's incoming request and click <strong>"Simulate & Mark Session Finished"</strong>. Then switch to Aarav to complete the final quiz to unlock your <strong>10,010 CR Milestone</strong>!
              </p>
            )}
            {currentUser.id === 'meera' && (
              <p className="text-violet-100 text-[11px] leading-relaxed">
                👉 <strong>Demo Guide (Meera):</strong> You are a Grade 12 senior. You can monitor platform exchanges or switch to Aarav/Rohan to test the mentoring workflow.
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
            <span>Rohan's Star Milestone</span>
            <span className="font-mono text-white">{rohan?.credits || 9940} / 10,010 CR</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, ((rohan?.credits || 9940) / 10010) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-300">
            {isRohanAtMilestone ? (
              <strong className="text-emerald-400">🎉 10,010 CR Target Achieved!</strong>
            ) : (
              <span>Need exactly <strong>+70 CR</strong> from Aarav's session to reach 10,010.</span>
            )}
          </p>
        </div>
      </div>

      {/* Action Bar for Juniors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Need Help with Math or Science?</h3>
          <p className="text-xs text-slate-500">
            Book 1-on-1 peer sessions with verified Grade 12 academic mentors.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Request Academic Help (0 Credits)</span>
        </button>
      </div>

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

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        Diagnostic Baseline: {session.baselineQuiz?.score}/3 ({session.baselineQuiz?.percentage}%)
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

                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] mt-1">
                      <span>
                        Baseline: {session.baselineQuiz?.score}/3 ({session.baselineQuiz?.percentage}%). Target final score: 3/3 for +20 CR observed gain bonus.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isAssignedMentor ? (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => handleFinishSession(session.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          title="Simulate session completion & notify student"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Simulate / Mark Session Finished</span>
                        </button>
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
                  Action Required: Awaiting Learner Attendance & Final Quiz
                </h3>
                <p className="text-[11px] text-amber-800">
                  Credits are withheld until the junior verifies attendance, completes the final quiz, and submits feedback.
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
                    <p className="text-amber-800 text-[11px] font-semibold">
                      Learner: <strong>{session.studentName}</strong> (Baseline: {session.baselineQuiz?.score}/3)
                    </p>
                  </div>

                  <div className="self-end sm:self-auto">
                    {isLearner || isAdmin ? (
                      <button
                        onClick={() => setSelectedSessionForConfirmation(session)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Take Final Quiz & Confirm Attendance</span>
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
                Completed & Verified Mentoring Ledger ({completedSessions.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Auditable credit engine breakdowns with observed diagnostic scores
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
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-base text-emerald-700 block">
                        +{b?.total || 70} CR
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
                      <span className="font-bold text-slate-800">+{b?.baseCompletion || 40} CR</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Rating ({session.rating}★)</span>
                      <span className="font-bold text-slate-800">+{b?.feedbackBonus || 10} CR</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Observed Quiz Gain</span>
                      <span className="font-bold text-indigo-700">
                        +{b?.observedImprovement || 67} pp (+{b?.quizImprovementBonus || 20} CR)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Diagnostic Scores</span>
                      <span className="font-semibold text-slate-700">
                        {session.baselineQuiz?.score}/3 → {session.finalQuiz?.score}/3
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
            .filter((u) => u.isVerifiedMentor || u.roles.includes('mentor'))
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

      <LearnerConfirmationModal
        session={selectedSessionForConfirmation}
        onClose={() => setSelectedSessionForConfirmation(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};
