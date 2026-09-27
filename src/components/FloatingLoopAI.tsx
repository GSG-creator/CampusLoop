import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  BookOpen,
  GraduationCap,
  Coins,
  Utensils,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Brain,
  HelpCircle,
  Calendar,
  Clock,
  User as UserIcon,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  LoopAiMessage,
  LoopAiActionCard,
  LoopAiQuizQuestion,
  BookListing,
  MentoringSession,
} from '../types';
import { sendLoopAiQuery, PRACTICE_QUIZZES } from '../services/loopAiService';
import { RequestMentoringModal } from './RequestMentoringModal';
import { LoopAISessionCard } from './LoopAISessionCard';

interface FloatingLoopAIProps {
  onNavigateTab: (tab: string) => void;
}

export const FloatingLoopAI: React.FC<FloatingLoopAIProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    users,
    books,
    sessions,
    redemptions,
    checkFreebieAvailable,
    reserveBook,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Practice quiz interactive answers state: messageId -> { questionId -> selectedIndex }
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, number>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Confirmation modal/action state: cardId -> { status: 'pending' | 'confirmed' | 'rejected', message?: string }
  const [confirmedActions, setConfirmedActions] = useState<Record<string, string>>({});
  const [mentoringDraft, setMentoringDraft] = useState<LoopAiActionCard['draftMentoringData']>();

  // Chat message history
  const [messages, setMessages] = useState<LoopAiMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      status: 'system_direct',
      text: `Hello **${currentUser.name}**! 👋 I am **LOOP AI**, your role-aware campus copilot.\n\nI can help you search textbooks, schedule verified peer tutoring, check your canteen perks, track your credits toward the **10,000 CR Tech Vault**, or generate practice quizzes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCards: [
        {
          type: 'navigation',
          title: 'Quick Campus Shortcuts',
          navigationData: [
            { label: '📚 Book Exchange', tab: 'books', description: 'Reserve or donate textbooks' },
            { label: '🎓 Peer Mentoring', tab: 'mentoring', description: 'Book verified 1-on-1 tutoring' },
            { label: '🥪 Canteen Perks', tab: 'rewards', description: 'Claim tier snacks & food' },
            { label: '💰 Credit Wallet', tab: 'wallet', description: 'Track progress to Tech Vault' },
          ],
        },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: LoopAiMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      status: 'live',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customQuery) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await sendLoopAiQuery(
        textToSend,
        {
          currentUser,
          books,
          sessions,
          redemptions,
          checkFreebieAvailable,
        },
        users
      );
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      console.error('Error with Loop AI query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe execution of book reservation with explicit confirmation
  const handleConfirmReservation = (book: BookListing) => {
    if (book.ownerId === currentUser.id) {
      showFeedback('Cannot reserve your own book.');
      return;
    }
    if (book.status !== 'available') {
      showFeedback(`Book is already ${book.status}.`);
      return;
    }

    const res = reserveBook(book.id);
    if (res.success) {
      setConfirmedActions((prev) => ({ ...prev, [book.id]: 'Reservation confirmed! Handover pending at Library Desk.' }));
      showFeedback(`Successfully reserved "${book.title}"! Collect at Campus Library Desk.`);
    } else {
      showFeedback(res.message);
    }
  };

  // Safe execution of draft mentoring request with explicit confirmation
  const handleConfirmMentoringRequest = (draft: {
    mentorId: string;
    mentorName: string;
    subject: string;
    topic: string;
    date: string;
    time: string;
    grade: string;
    description: string;
  }) => {
    if (draft.mentorId === currentUser.id) {
      showFeedback('Cannot request mentoring from yourself.');
      return;
    }

    setMentoringDraft(draft);
  };

  // Interactive Quiz handler
  const handleSelectQuizOption = (messageId: string, questionId: string, optionIdx: number) => {
    if (quizSubmitted[messageId]) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [messageId]: {
        ...(prev[messageId] || {}),
        [questionId]: optionIdx,
      },
    }));
  };

  const handleSubmitQuiz = (messageId: string) => {
    setQuizSubmitted((prev) => ({ ...prev, [messageId]: true }));
  };

  // Role-aware suggestion chips
  const getSuggestions = () => {
    if (currentUser.roles.includes('junior')) {
      return [
        { label: 'Find Class 10 RD Sharma', query: 'Find Class 10 RD Sharma' },
        { label: 'Trigonometry help tomorrow at lunch', query: 'I need trigonometry help tomorrow at lunch.' },
        { label: 'What canteen freebie can I claim?', query: 'What canteen freebie can I claim?' },
        { label: 'Practice quiz on trigonometry', query: 'Give me a practice quiz on trigonometry' },
        { label: 'Credits until laptop reward?', query: 'How many credits until the laptop reward?' },
      ];
    }
    if (currentUser.roles.includes('mentor')) {
      return [
        { label: 'Credits until laptop reward?', query: 'How many credits until the laptop reward?' },
        { label: 'Show my upcoming sessions', query: 'Show my upcoming sessions' },
        { label: 'What canteen freebie can I claim?', query: 'What canteen freebie can I claim?' },
        { label: 'How to earn 70 credits?', query: 'How does a mentor earn 70 credits in a session?' },
      ];
    }
    return [
      { label: 'What canteen freebie can I claim?', query: 'What canteen freebie can I claim?' },
      { label: 'Credits until laptop reward?', query: 'How many credits until the laptop reward?' },
      { label: 'Find Class 10 RD Sharma', query: 'Find Class 10 RD Sharma' },
      { label: 'Show verified mentors', query: 'Show verified mentors' },
    ];
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {actionFeedback && (
          <div className="mb-2 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
            title="Open LOOP AI Campus Copilot"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-700" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-wide block">LOOP AI</span>
              <span className="text-[10px] text-purple-200 block font-medium leading-none">
                {currentUser.name.split(' ')[0]} • {currentUser.grade || 'Campus'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Assistant Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'w-80 h-16' : 'w-[94vw] sm:w-[440px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-3.5 text-white flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-amber-300">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wide">LOOP AI</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/20">
                    Role-Aware
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 block">
                  Logged in: {currentUser.name} ({currentUser.credits} CR)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isOffline = msg.status === 'offline';
                  const isDirect = msg.status === 'system_direct';
                  const isRateLimited = msg.status === 'rate_limited';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      {/* Status pill for Assistant message */}
                      {!isUser && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                          {isOffline ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              Offline Direct Mode
                            </span>
                          ) : isRateLimited ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-semibold border border-rose-200">
                              <Clock className="w-3 h-3" />
                              Rate Limit Notice
                            </span>
                          ) : isDirect ? (
                            <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-200">
                              <CheckCircle2 className="w-3 h-3" />
                              System Database Match
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
                              <Brain className="w-3 h-3" />
                              {msg.model || 'Gemini'}
                            </span>
                          )}
                          <span>• {msg.timestamp}</span>
                        </div>
                      )}

                      {/* Main Message Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap space-y-1.5">
                          {msg.text.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </div>

                      {/* Attached Action Cards */}
                      {msg.actionCards && msg.actionCards.length > 0 && (
                        <div className="w-full space-y-2 mt-1 max-w-[96%]">
                          {msg.actionCards.map((card, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-xs space-y-2"
                            >
                              {/* Book Card */}
                              {card.type === 'book' && card.bookData && (
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                        Textbook Listing
                                      </span>
                                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">
                                        {card.bookData.title}
                                      </h4>
                                      <p className="text-[11px] text-slate-500">
                                        By {card.bookData.author} • {card.bookData.grade} ({card.bookData.subject})
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        card.bookData.status === 'available'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {card.bookData.status}
                                    </span>
                                  </div>

                                  <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] flex items-center justify-between text-slate-600">
                                    <span>
                                      Listed by: <strong>{card.bookData.ownerName}</strong>
                                    </span>
                                    <span className="font-bold text-indigo-700 uppercase">
                                      {card.bookData.listingType === 'donate'
                                        ? 'Free Donation'
                                        : card.bookData.listingType === 'rent'
                                        ? `${card.bookData.rentalRateCredits || 30} CR/mo`
                                        : `₹${card.bookData.mockPrice || 180}`}
                                    </span>
                                  </div>

                                  {confirmedActions[card.bookData.id] ? (
                                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] flex items-center gap-1.5 font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{confirmedActions[card.bookData.id]}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 pt-1">
                                      {card.bookData.status === 'available' &&
                                      card.bookData.ownerId !== currentUser.id ? (
                                        <button
                                          onClick={() => handleConfirmReservation(card.bookData!)}
                                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Confirm & Reserve Book</span>
                                        </button>
                                      ) : (
                                        <span className="text-[11px] text-slate-400 italic">
                                          {card.bookData.ownerId === currentUser.id
                                            ? 'You listed this book'
                                            : 'Not available for reservation'}
                                        </span>
                                      )}
                                      <button
                                        onClick={() => onNavigateTab('books')}
                                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold text-xs transition-colors"
                                      >
                                        View in Exchange
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {card.type === 'session' && card.sessionData && (
                                <LoopAISessionCard session={card.sessionData} onOpen={() => onNavigateTab('mentoring')} />
                              )}

                              {/* Mentor Card */}
                              {card.type === 'mentor' && card.mentorData && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                      Verified Peer Mentor
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      Verified
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={card.mentorData.avatar}
                                      alt={card.mentorData.name}
                                      className="w-9 h-9 rounded-full object-cover"
                                    />
                                    <div>
                                      <h4 className="font-bold text-slate-900 text-xs">{card.mentorData.name}</h4>
                                      <p className="text-[11px] text-slate-500">
                                        {card.mentorData.grade} • {(card.mentorData.subjects || []).join(', ')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <span>Rating: <strong>{card.mentorData.rating > 0 ? `★ ${card.mentorData.rating}` : 'No ratings yet'}</strong></span>
                                    <span>Completed Sessions: <strong>{card.mentorData.completedSessions}</strong></span>
                                  </div>
                                  <button
                                    onClick={() => onNavigateTab('mentoring')}
                                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>Request Mentoring Session</span>
                                  </button>
                                </div>
                              )}

                              {/* Draft Mentoring Request Card (Explicit Confirmation) */}
                              {card.type === 'draft_mentoring' && card.draftMentoringData && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                      Confirmation Required
                                    </span>
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                                      0 CR (Free for Juniors)
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-900 text-xs">
                                    Mentoring Request Draft
                                  </h4>
                                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-700 border border-slate-100">
                                    <div>Mentor: <strong>{card.draftMentoringData.mentorName}</strong></div>
                                    <div>Subject: <strong>{card.draftMentoringData.subject}</strong></div>
                                    <div>Topic: <strong>{card.draftMentoringData.topic}</strong></div>
                                    <div>Proposed Time: <strong>{card.draftMentoringData.date} at {card.draftMentoringData.time}</strong></div>
                                    <div>Target: <strong>{card.draftMentoringData.grade}</strong></div>
                                  </div>

                                  {confirmedActions[`${card.draftMentoringData.mentorId}-${card.draftMentoringData.topic}`] ? (
                                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] flex items-center gap-1.5 font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{confirmedActions[`${card.draftMentoringData.mentorId}-${card.draftMentoringData.topic}`]}</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleConfirmMentoringRequest(card.draftMentoringData!)}
                                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Review Details & Take Baseline Quiz</span>
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Wallet & Milestone Card */}
                              {card.type === 'wallet' && card.walletData && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                      Campus Credits & Milestone
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 text-xs">
                                      {card.walletData.credits} CR
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                                      <span>{card.walletData.tier} Tier</span>
                                      <span>{card.walletData.milestoneName}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full"
                                        style={{ width: `${card.walletData.progressPercentage}%` }}
                                      />
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-slate-600">
                                    {card.walletData.creditsNeededForTechVault > 0 ? (
                                      <>
                                        Need <strong>{card.walletData.creditsNeededForTechVault} more credits</strong> to reach 10,000 CR Legend Tier (Sponsor Tech Vault eligibility).
                                      </>
                                    ) : (
                                      <>
                                        🎉 <strong>10,000 CR Milestone reached!</strong> Eligible to apply for sponsor study laptops in Rewards.
                                      </>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={() => onNavigateTab('wallet')}
                                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-colors"
                                    >
                                      Open Wallet
                                    </button>
                                    <button
                                      onClick={() => onNavigateTab('rewards')}
                                      className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                                    >
                                      View Rewards
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Canteen Perk Card */}
                              {card.type === 'canteen' && card.canteenData && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                      Canteen Benefits ({card.canteenData.tier} Tier)
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        card.canteenData.eligible
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {card.canteenData.eligible ? 'Ready to Claim' : 'Quota Exhausted'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">{card.canteenData.perkSummary}</p>
                                  <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-medium">
                                    Status: {card.canteenData.reason}
                                  </div>
                                  <button
                                    onClick={() => onNavigateTab('rewards')}
                                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Utensils className="w-3.5 h-3.5" />
                                    <span>Open Canteen Counter</span>
                                  </button>
                                </div>
                              )}

                              {/* Interactive Practice Quiz Card */}
                              {card.type === 'quiz' && card.quizData && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                      Practice Quiz • {card.quizData.topic}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {card.quizData.questions.length} Questions
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    {card.quizData.questions.map((q, qIdx) => {
                                      const selected = quizAnswers[msg.id]?.[q.id];
                                      const isDone = quizSubmitted[msg.id];
                                      const isCorrect = selected === q.correctIndex;

                                      return (
                                        <div key={q.id} className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                                          <p className="font-semibold text-slate-900 text-xs">
                                            {qIdx + 1}. {q.question}
                                          </p>
                                          <div className="space-y-1">
                                            {q.options.map((opt, oIdx) => {
                                              let btnClass = 'w-full text-left p-1.5 rounded-lg border text-xs transition-colors ';
                                              if (isDone) {
                                                if (oIdx === q.correctIndex) {
                                                  btnClass += 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                                                } else if (selected === oIdx) {
                                                  btnClass += 'bg-rose-100 border-rose-300 text-rose-900';
                                                } else {
                                                  btnClass += 'bg-white border-slate-200 text-slate-500';
                                                }
                                              } else {
                                                if (selected === oIdx) {
                                                  btnClass += 'bg-purple-100 border-purple-400 text-purple-900 font-bold';
                                                } else {
                                                  btnClass += 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700';
                                                }
                                              }

                                              return (
                                                <button
                                                  key={oIdx}
                                                  disabled={isDone}
                                                  onClick={() => handleSelectQuizOption(msg.id, q.id, oIdx)}
                                                  className={btnClass}
                                                >
                                                  {opt}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          {isDone && (
                                            <p className={`text-[11px] pt-1 ${isCorrect ? 'text-emerald-700' : 'text-slate-600'}`}>
                                              💡 {q.explanation}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {!quizSubmitted[msg.id] ? (
                                    <button
                                      onClick={() => handleSubmitQuiz(msg.id)}
                                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-colors"
                                    >
                                      Submit Quiz Answers
                                    </button>
                                  ) : (
                                    <div className="p-2 bg-purple-50 text-purple-900 rounded-lg text-center font-bold text-xs">
                                      Score:{' '}
                                      {
                                        card.quizData.questions.filter(
                                          (q) => quizAnswers[msg.id]?.[q.id] === q.correctIndex
                                        ).length
                                      }{' '}
                                      /{' '}{card.quizData.questions.length} Correct
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Navigation Shortcuts Card */}
                              {card.type === 'navigation' && card.navigationData && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Direct App Navigation
                                  </span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {card.navigationData.map((nav, nIdx) => (
                                      <button
                                        key={nIdx}
                                        onClick={() => onNavigateTab(nav.tab)}
                                        className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-slate-700 text-left transition-colors flex items-center justify-between"
                                      >
                                        <span className="font-semibold text-[11px]">{nav.label}</span>
                                        <ChevronRight className="w-3 h-3 text-slate-400" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-100 animate-pulse">
                    <Brain className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Analyzing campus records...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions chips */}
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                <span className="text-slate-400 font-semibold shrink-0">Suggestions:</span>
                {getSuggestions().map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSend(sug.query)}
                    disabled={isLoading}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 whitespace-nowrap font-medium transition-colors shrink-0 disabled:opacity-50"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Search books, request tutoring, or check credits..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isLoading}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-xs"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
      <RequestMentoringModal
        isOpen={!!mentoringDraft}
        initialDraft={mentoringDraft}
        onClose={() => setMentoringDraft(undefined)}
        onSuccess={showFeedback}
      />
    </>
  );
};
