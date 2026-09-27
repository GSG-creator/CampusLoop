import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Brain,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Gift,
  Coins,
  ShieldCheck,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  ChevronRight,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import {
  LoopAiMessage,
  LoopAiActionCard,
  BookListing,
} from '../types';
import { sendLoopAiQuery } from '../services/loopAiService';
import { RequestMentoringModal } from './RequestMentoringModal';
import { LoopAISessionCard } from './LoopAISessionCard';

const PRESET_QUESTIONS = [
  {
    label: '📚 Find Class 10 RD Sharma',
    query: 'Find Class 10 RD Sharma in the book exchange.',
  },
  {
    label: '📐 Trigonometry Tutoring Tomorrow',
    query: 'I need trigonometry help tomorrow at lunch.',
  },
  {
    label: '💻 Credits Until Laptop Reward?',
    query: 'How many credits until the laptop reward?',
  },
  {
    label: '🥪 Canteen Freebie Eligibility',
    query: 'What canteen freebie can I claim?',
  },
  {
    label: '📝 Practice Quiz on Trigonometry',
    query: 'Give me a practice quiz on trigonometry with explanations.',
  },
  {
    label: '💰 How to Earn 70 Credits',
    query: 'How does a peer mentor earn exactly +70 Campus Credits in a single mentoring session on CampusLoop?',
  },
];

export const LoopAIView: React.FC<{
  onNavigateToBooks: () => void;
  onNavigateToMentoring: () => void;
  onNavigateToRewards: () => void;
  onNavigateToWallet?: () => void;
}> = ({ onNavigateToBooks, onNavigateToMentoring, onNavigateToRewards, onNavigateToWallet }) => {
  const {
    currentUser,
    users,
    books,
    sessions,
    redemptions,
    checkFreebieAvailable,
    reserveBook,
  } = useApp();

  const [messages, setMessages] = useState<LoopAiMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      status: 'system_direct',
      text: `Hello **${currentUser.name}**! 👋 I am **LOOP AI**, your role-aware campus academic companion.\n\nI can help you search textbooks, schedule verified peer tutoring, check your canteen perks, track your credits toward the **10,000 CR Tech Vault**, or generate practice quizzes.`,
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

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  // Practice quiz interactive answers
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, number>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Confirmation state for actions
  const [confirmedActions, setConfirmedActions] = useState<Record<string, string>>({});
  const [mentoringDraft, setMentoringDraft] = useState<LoopAiActionCard['draftMentoringData']>();

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: LoopAiMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      status: 'live',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
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
      if (response.thoughtProcess) {
        setExpandedThoughts((prev) => ({ ...prev, [response.id]: true }));
      }
    } catch (err: any) {
      console.error('Error contacting Loop AI:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe book reservation with explicit confirmation
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
      setConfirmedActions((prev) => ({
        ...prev,
        [book.id]: 'Reservation confirmed! Handover pending at Library Desk.',
      }));
      showFeedback(`Successfully reserved "${book.title}"! Collect at Campus Library Desk.`);
    } else {
      showFeedback(res.message);
    }
  };

  // Safe mentoring request with explicit confirmation
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

  const navigateTab = (tab: string) => {
    if (tab === 'books') onNavigateToBooks();
    else if (tab === 'mentoring') onNavigateToMentoring();
    else if (tab === 'rewards') onNavigateToRewards();
    else if (tab === 'wallet' && onNavigateToWallet) onNavigateToWallet();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Role-Aware Assistant • Verified Academic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 flex items-center gap-2">
            <span>LOOP AI — Campus Academic Copilot</span>
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm leading-relaxed mb-4">
            Currently assisting: <strong>{currentUser.name}</strong> ({currentUser.grade || 'Campus'}, {currentUser.credits} CR). Search books, schedule peer mentoring, check your canteen perks, track your credits toward the 10,000 CR Tech Vault, or test your skills with a practice quiz.
          </p>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={onNavigateToBooks}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>Book Exchange</span>
            </button>
            <button
              onClick={onNavigateToMentoring}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-violet-300" />
              <span>Request Mentoring</span>
            </button>
            <button
              onClick={onNavigateToRewards}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              <span>Perks & Canteen</span>
            </button>
          </div>
        </div>

        {actionFeedback && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* Preset Suggestions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Recommended Prompts & Actions:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset.query)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 text-slate-700 text-xs font-medium transition-colors text-left disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isExpanded = expandedThoughts[msg.id] ?? false;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {/* Header for Bot message */}
                    {!isUser && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 text-[10px] text-slate-400">
                        <span className="font-semibold text-purple-700 flex items-center gap-1">
                          <Brain className="w-3 h-3 text-purple-600" />
                          {msg.status === 'offline'
                            ? 'Offline Direct Mode'
                            : msg.status === 'system_direct'
                            ? 'CampusLoop Demo Data'
                            : msg.status === 'rate_limited' ? 'Request Limit Reached'
                            : msg.model || 'AI Response'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Formatted Text */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Action Cards */}
                  {msg.actionCards && msg.actionCards.length > 0 && (
                    <div className="space-y-2.5">
                      {msg.actionCards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs space-y-3"
                        >
                          {/* Book Card */}
                          {card.type === 'book' && card.bookData && (
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-indigo-600">
                                    Textbook Listing
                                  </span>
                                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                                    {card.bookData.title}
                                  </h4>
                                  <p className="text-slate-500 text-[11px]">
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

                              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] flex items-center justify-between text-slate-600">
                                <span>Listed by: <strong>{card.bookData.ownerName}</strong></span>
                                <span className="font-bold text-indigo-700 uppercase">
                                  {card.bookData.listingType === 'donate'
                                    ? 'Free Donation'
                                    : card.bookData.listingType === 'rent'
                                    ? `${card.bookData.rentalRateCredits || 30} CR/mo`
                                    : `₹${card.bookData.mockPrice || 180}`}
                                </span>
                              </div>

                              {confirmedActions[card.bookData.id] ? (
                                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{confirmedActions[card.bookData.id]}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 pt-1">
                                  {card.bookData.status === 'available' &&
                                  card.bookData.ownerId !== currentUser.id ? (
                                    <button
                                      onClick={() => handleConfirmReservation(card.bookData!)}
                                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>Confirm & Reserve Book</span>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">
                                      {card.bookData.ownerId === currentUser.id
                                        ? 'You listed this book'
                                        : 'Not available for reservation'}
                                    </span>
                                  )}
                                  <button
                                    onClick={onNavigateToBooks}
                                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold text-xs transition-colors"
                                  >
                                    View in Exchange
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {card.type === 'session' && card.sessionData && (
                            <LoopAISessionCard session={card.sessionData} onOpen={onNavigateToMentoring} />
                          )}

                          {/* Mentor Card */}
                          {card.type === 'mentor' && card.mentorData && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-purple-600">
                                  Verified Peer Mentor
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <img
                                  src={card.mentorData.avatar}
                                  alt={card.mentorData.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">{card.mentorData.name}</h4>
                                  <p className="text-xs text-slate-500">
                                    {card.mentorData.grade} • {(card.mentorData.subjects || []).join(', ')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                                <span>Student Rating: <strong>{card.mentorData.rating > 0 ? `★ ${card.mentorData.rating}` : 'No ratings yet'}</strong></span>
                                <span>Completed Sessions: <strong>{card.mentorData.completedSessions}</strong></span>
                              </div>
                              <button
                                onClick={onNavigateToMentoring}
                                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                <GraduationCap className="w-4 h-4" />
                                <span>Request Mentoring Session</span>
                              </button>
                            </div>
                          )}

                          {/* Draft Mentoring Request Card */}
                          {card.type === 'draft_mentoring' && card.draftMentoringData && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-amber-600">
                                  Mentoring Draft • Confirmation Required
                                </span>
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                                  0 CR (Free for Juniors)
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">
                                Review Request Details
                              </h4>
                              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                                <div>Mentor: <strong>{card.draftMentoringData.mentorName}</strong></div>
                                <div>Subject: <strong>{card.draftMentoringData.subject}</strong></div>
                                <div>Topic: <strong>{card.draftMentoringData.topic}</strong></div>
                                <div>Proposed Date & Time: <strong>{card.draftMentoringData.date} at {card.draftMentoringData.time}</strong></div>
                                <div>Target Grade: <strong>{card.draftMentoringData.grade}</strong></div>
                              </div>

                              {confirmedActions[`${card.draftMentoringData.mentorId}-${card.draftMentoringData.topic}`] ? (
                                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{confirmedActions[`${card.draftMentoringData.mentorId}-${card.draftMentoringData.topic}`]}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleConfirmMentoringRequest(card.draftMentoringData!)}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Review Details & Take Baseline Quiz</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Wallet & Milestone Card */}
                          {card.type === 'wallet' && card.walletData && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-amber-600">
                                  Campus Credits & Milestone Progress
                                </span>
                                <span className="font-mono font-bold text-slate-900 text-sm">
                                  {card.walletData.credits} CR
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-slate-600 font-medium">
                                  <span>{card.walletData.tier} Tier</span>
                                  <span>{card.walletData.milestoneName}</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full"
                                    style={{ width: `${card.walletData.progressPercentage}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-slate-600">
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
                                {onNavigateToWallet && (
                                  <button
                                    onClick={onNavigateToWallet}
                                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors"
                                  >
                                    Open Wallet
                                  </button>
                                )}
                                <button
                                  onClick={onNavigateToRewards}
                                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                                >
                                  View Rewards
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Canteen Perk Card */}
                          {card.type === 'canteen' && card.canteenData && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-emerald-600">
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
                              <p className="text-xs text-slate-600">{card.canteenData.perkSummary}</p>
                              <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 font-medium">
                                Status: {card.canteenData.reason}
                              </div>
                              <button
                                onClick={onNavigateToRewards}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Utensils className="w-4 h-4" />
                                <span>Open Canteen Counter</span>
                              </button>
                            </div>
                          )}

                          {/* Practice Quiz Card */}
                          {card.type === 'quiz' && card.quizData && (
                            <div className="space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-purple-600">
                                  Practice Quiz • {card.quizData.topic}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  {card.quizData.questions.length} Questions
                                </span>
                              </div>

                              <div className="space-y-3">
                                {card.quizData.questions.map((q, qIdx) => {
                                  const selected = quizAnswers[msg.id]?.[q.id];
                                  const isDone = quizSubmitted[msg.id];
                                  const isCorrect = selected === q.correctIndex;

                                  return (
                                    <div key={q.id} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                                      <p className="font-semibold text-slate-900 text-xs">
                                        {qIdx + 1}. {q.question}
                                      </p>
                                      <div className="space-y-1.5">
                                        {q.options.map((opt, oIdx) => {
                                          let btnClass = 'w-full text-left p-2 rounded-lg border text-xs transition-colors ';
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
                                        <p className={`text-xs pt-1 ${isCorrect ? 'text-emerald-700' : 'text-slate-600'}`}>
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
                                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-colors"
                                >
                                  Submit Quiz Answers
                                </button>
                              ) : (
                                <div className="p-2.5 bg-purple-50 text-purple-900 rounded-xl text-center font-bold text-xs">
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

                          {/* Navigation Shortcuts */}
                          {card.type === 'navigation' && card.navigationData && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                Campus Shortcuts
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {card.navigationData.map((nav, nIdx) => (
                                  <button
                                    key={nIdx}
                                    onClick={() => navigateTab(nav.tab)}
                                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-slate-700 text-left transition-colors flex items-center justify-between"
                                  >
                                    <div>
                                      <span className="font-semibold text-xs block">{nav.label}</span>
                                      {nav.description && (
                                        <span className="text-[10px] text-slate-400">{nav.description}</span>
                                      )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thinking Process Accordion */}
                  {!isUser && msg.thoughtProcess && (
                    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-2 text-xs">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full flex items-center justify-between text-purple-900 font-bold text-[11px] hover:text-purple-700"
                      >
                        <span className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-purple-600" />
                          <span>Gemini Thinking Mode Process</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-purple-200/60 text-[11px] text-purple-950/80 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in">
                          {msg.thoughtProcess}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-700">
                  <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span>Loop AI is thinking...</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
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
              placeholder="Ask Loop AI about trigonometry, textbook reservations, or credit rewards..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Gemini • Role-Aware Intelligence</span>
            <span>Explicit user confirmation required for transactions</span>
          </div>
        </div>
      </div>
      <RequestMentoringModal
        isOpen={!!mentoringDraft}
        initialDraft={mentoringDraft}
        onClose={() => setMentoringDraft(undefined)}
        onSuccess={showFeedback}
      />
    </div>
  );
};
