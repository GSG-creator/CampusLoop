import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { MentoringSession } from '../types';
import { RequestMentoringModal } from './RequestMentoringModal';
import { LearnerConfirmationModal } from './LearnerConfirmationModal';
import { VirtualStudyRoomModal } from './VirtualStudyRoomModal';
import { CreateStudyRoomModal } from './CreateStudyRoomModal';
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
  Mic,
  Hand,
  MessageSquare,
  Languages,
  Users,
  Video,
  PenTool,
} from 'lucide-react';

export const MentoringView: React.FC = () => {
  const {
    users,
    currentUser,
    sessions,
    acceptMentoringSession,
    declineMentoringSession,
    finishMentoringSession,
    studyRooms,
    activeStudyRoomId,
    setActiveStudyRoomId,
    joinStudyRoom,
    getOrCreateSessionStudyRoom,
  } = useApp();

  const { t, currentLanguage } = useTranslation();
  const {
    startCaptions,
    isCaptionsActive,
    openSignLanguageModal,
    openMuteHandoverModal,
    setIsTranslatorModalOpen,
  } = useAccessibility();

  const [mentoringSubTab, setMentoringSubTab] = useState<'sessions' | 'study_rooms'>('sessions');
  const [studyRoomFilter, setStudyRoomFilter] = useState<'all' | 'asl_supported' | 'text_based'>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
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

  const activeStudyRoom = studyRooms.find((r) => r.id === activeStudyRoomId);
  const filteredStudyRooms = studyRooms.filter(
    (r) => (studyRoomFilter === 'all' || r.mode === studyRoomFilter)
      && (!r.sessionId || sessions.some((session) => session.id === r.sessionId && isParticipant(session)))
  );

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

      <section className="grid md:grid-cols-[1fr_260px] gap-8 items-center py-6 border-b border-slate-200">
        <div className="max-w-2xl">
          <p className="text-sm text-slate-600 mb-3">A little help from your peers</p>
          <h1 className="campus-heading text-4xl sm:text-5xl leading-[1.1] mb-4">You don’t have to<br className="hidden sm:block" /> figure it out alone.</h1>
          <p className="text-base text-slate-600 leading-relaxed">Meet a student mentor, work through a tricky topic, or make a learning plan together. It’s free, and you can choose online or in person.</p>
          <p className="text-sm text-slate-500 mt-3">Share what helps you learn. You can ask for shorter sessions, different materials or more time.</p>
        </div>
        <aside className="campus-note p-5 rounded-lg space-y-3 text-sm">
          <p className="font-semibold">Start with what you need</p>
          <p className="text-slate-600">Choose a topic and tell your mentor what would help. Review the plan together, then learn at your pace.</p>
          <p className="border-t border-[#dfd9c7] pt-3 text-xs text-slate-600">Your preferences are enough. No diagnosis needed.</p>
        </aside>
      </section>

      {/* Primary Sub-Navigation: Sessions vs Virtual Study Rooms */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setMentoringSubTab('sessions')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              mentoringSubTab === 'sessions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>1-on-1 Peer Mentoring</span>
            {activeSessionsForMe.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500 text-white font-extrabold">
                {activeSessionsForMe.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setMentoringSubTab('study_rooms')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 relative ${
              mentoringSubTab === 'study_rooms'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Hand className="w-4 h-4 text-purple-300" />
            <span>Virtual Study Rooms</span>
            <span className="flex h-2 w-2 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsCreateRoomModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Host Study Room</span>
          </button>
        </div>
      </div>

      {/* VIRTUAL STUDY ROOMS SUB-TAB */}
      {mentoringSubTab === 'study_rooms' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Virtual Study Rooms Hero Card */}
          <div className="bg-slate-800 rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20 text-purple-200">
                <Hand className="w-3.5 h-3.5 text-purple-300" />
                <span>Study room demo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                A place to work things out together.
              </h2>
              <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed">
                Try text chat, fingerspelling, a drawing board and shared notes. Room activity is saved in this browser; this demo does not connect devices or provide video calls.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setIsCreateRoomModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-900/50 flex items-center gap-1.5 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Host New Study Room</span>
              </button>
            </div>
          </div>

          {/* Filters & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setStudyRoomFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  studyRoomFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Rooms ({studyRooms.length})
              </button>

              <button
                onClick={() => setStudyRoomFilter('asl_supported')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  studyRoomFilter === 'asl_supported'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span>Sign practice ({studyRooms.filter((r) => r.mode === 'asl_supported').length})</span>
              </button>

              <button
                onClick={() => setStudyRoomFilter('text_based')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  studyRoomFilter === 'text_based'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Text rooms ({studyRooms.filter((r) => r.mode === 'text_based').length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-2 w-2 relative">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-700">Saved in this browser</span>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudyRooms.map((room) => {
              const isJoined = room.participants.some((p) => p.id === currentUser.id);
              return (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-3">
                    {/* Room Meta Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Demo room
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {room.subject}
                        </span>
                      </div>

                      {room.mode === 'asl_supported' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <Hand className="w-3 h-3 text-purple-600" />
                          <span>Sign practice</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>Text room</span>
                        </span>
                      )}
                    </div>

                    {/* Room Title & Topic */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                        {room.title}
                      </h3>
                      <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                        Topic: {room.topic} • {room.grade}
                      </p>
                    </div>

                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Host & Participant Presence */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={room.hostAvatar}
                          alt={room.hostName}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
                        />
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-800 block leading-tight">
                            {room.hostName}
                          </span>
                          <span className="text-slate-400 text-[10px]">{room.hostBadge || 'Host'}</span>
                        </div>
                      </div>

                      {/* Participant Avatars */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {room.participants.slice(0, 3).map((p) => (
                          <img
                            key={p.id}
                            src={p.avatar}
                            alt={p.name}
                            title={`${p.name} (${p.role})`}
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                        {room.participants.length > 3 && (
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 ring-2 ring-white">
                            +{room.participants.length - 3}
                          </span>
                        )}
                        <span className="ml-2 text-[10px] font-semibold text-slate-500">
                          {room.participants.length} in room
                        </span>
                      </div>
                    </div>

                    {/* Whiteboard Snippet Preview */}
                    {room.whiteboardNotes.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 line-clamp-1 font-mono">
                        <span className="font-bold text-indigo-700 uppercase mr-1 text-[10px]">
                          Board:
                        </span>
                        <span>{room.whiteboardNotes[0].text}</span>
                      </div>
                    )}
                  </div>

                  {/* Join Room CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const result = joinStudyRoom(room.id);
                        if (!result.success) showToast(result.message, 'error');
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isJoined ? 'Enter Study Room' : 'Join Collaborative Session'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual & Auditorily impaired Accessibility Feature Highlight */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 border border-purple-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  Find a comfortable way to take part
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                  Practice tools
                </span>
              </div>
              <p className="text-slate-600 text-xs max-w-2xl leading-relaxed">
                Use typed notes, a drawing board or illustrative fingerspelling at your own pace. Microphone captions depend on browser support and permission. Check signs with a qualified teacher; these practice tools do not provide an interpreter or connect people across devices.
              </p>
            </div>

            <button
              onClick={() => openSignLanguageModal('STUDY')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs shadow-xs shrink-0 flex items-center gap-1.5 transition-all"
            >
              <Hand className="w-3.5 h-3.5 text-purple-600" />
              <span>Explore Sign Gestures</span>
            </button>
          </div>
        </div>
      )}

      {/* SESSIONS SUB-TAB (1-ON-1 PEER MENTORING WORKFLOW) */}
      {mentoringSubTab === 'sessions' && (
        <div className="space-y-6">

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

      {/* Accessible Mentoring Tools for Visual & Auditorily impaired Peers */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/60 to-emerald-50/80 border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900">
                Communication tools
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Captions, text and signs
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Follow captions, practise fingerspelling or show a message in large text.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={startCaptions}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
              isCaptionsActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isCaptionsActive ? 'Open captions' : 'Captions & notes'}</span>
          </button>

          <button
            onClick={() => openSignLanguageModal('TRIGONOMETRY')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 transition-all text-xs shadow-2xs"
          >
            <Hand className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fingerspelling practice</span>
          </button>

          <button
            onClick={() =>
              openMuteHandoverModal({
                mode: 'mentoring',
                bookTitle: 'Applications of Trigonometry',
                partnerName: 'Rohan Verma',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 transition-all text-xs shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
            <span>Communication cards</span>
          </button>

          <button
            onClick={() => setIsTranslatorModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 transition-all text-xs shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>Translate text ({currentLanguage.flag})</span>
          </button>
        </div>
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

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        const room = getOrCreateSessionStudyRoom(session);
                        if (!room) {
                          showToast('This mentoring session is no longer available to open.', 'error');
                          return;
                        }
                        const result = joinStudyRoom(room.id);
                        if (!result.success) showToast(result.message, 'error');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                      title="Open the local study room with notes and practice tools"
                    >
                      <Hand className="w-3.5 h-3.5" />
                      <span>Enter Virtual Study Room</span>
                    </button>

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
            Your finished sessions will appear here.
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
        <h3 className="font-bold text-slate-900 text-sm">Student mentors</h3>
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
    </div>
    )}

      {/* Virtual Study Room Modal */}
      {activeStudyRoom && (
        <VirtualStudyRoomModal
          room={activeStudyRoom}
          onClose={() => setActiveStudyRoomId(null)}
          onOpenFinalQuiz={(session) => {
            setActiveStudyRoomId(null);
            setSelectedSessionForConfirmation(session);
          }}
        />
      )}

      {/* Create Study Room Modal */}
      <CreateStudyRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Mentoring Modals */}
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
