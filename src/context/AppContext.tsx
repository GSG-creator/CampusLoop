import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  BookListing,
  CreditTransaction,
  AppNotification,
  ListingType,
  BookCondition,
  MentoringSession,
  QuizSubmission,
  CreditBreakdown,
  RewardTier,
  RewardItem,
  CanteenRedemption,
  MajorRewardRequest,
} from '../types';
import { SEED_USERS, SEED_BOOKS, SEED_TRANSACTIONS } from '../data/seedData';
import { getQuizForTopic } from '../data/quizBank';
import { getUserTier, REWARD_CATALOGUE, TIER_DEFINITIONS } from '../data/rewardData';
import { createId as newId } from '../utils/ids';

const STORAGE_KEY = 'CAMPUSLOOP_STATE_V3';

// Actions return synchronously, so subsequent actions in the same React batch
// must see a committed value before React renders. Never run action side effects
// inside a React state updater (StrictMode may invoke those more than once).
function useLiveState<T>(initialValue: T | (() => T)) {
  const [value, setValue] = useState(initialValue);
  const current = useRef(value);
  const update = useCallback((next: React.SetStateAction<T>) => {
    current.current = typeof next === 'function'
      ? (next as (previous: T) => T)(current.current)
      : next;
    setValue(current.current);
  }, []);
  return [value, update, current] as const;
}

interface ImpactMetrics {
  booksReused: number;
  estimatedSavingsInRupees: number;
  mentoringHours: number;
  totalTransactions: number;
  activeLearners: number;
}

interface AppContextType {
  users: Record<string, User>;
  currentUser: User;
  books: BookListing[];
  sessions: MentoringSession[];
  transactions: CreditTransaction[];
  notifications: AppNotification[];
  redemptions: CanteenRedemption[];
  majorRewardRequests: MajorRewardRequest[];
  resetGeneration: number;
  showMilestoneModal: boolean;
  setShowMilestoneModal: (show: boolean) => void;
  switchUser: (userId: string) => void;
  resetAllData: () => void;
  // Book Exchange
  reserveBook: (bookId: string) => { success: boolean; message: string };
  cancelReservation: (bookId: string) => { success: boolean; message: string };
  confirmHandover: (bookId: string) => { success: boolean; message: string };
  confirmReturn: (bookId: string) => { success: boolean; message: string };
  createBookListing: (data: {
    title: string;
    author: string;
    grade: string;
    subject: string;
    condition: BookCondition;
    description: string;
    listingType: ListingType;
    rentalDuration?: string;
    mockPrice?: number;
  }) => { success: boolean; message: string };
  deleteBookListing: (bookId: string) => { success: boolean; message: string };
  // Mentoring & Credit Engine
  requestMentoringSession: (data: {
    mentorId: string;
    subject: string;
    topic: string;
    grade: string;
    date: string;
    time: string;
    description: string;
    baselineAnswers: number[];
  }) => { success: boolean; message: string; sessionId?: string };
  acceptMentoringSession: (sessionId: string) => { success: boolean; message: string };
  declineMentoringSession: (sessionId: string, reason?: string) => { success: boolean; message: string };
  finishMentoringSession: (sessionId: string, isSimulated?: boolean) => { success: boolean; message: string };
  confirmAndFinalizeSession: (
    sessionId: string,
    data: {
      finalAnswers: number[];
      rating: number;
      feedbackComment?: string;
    }
  ) => { success: boolean; message: string; breakdown?: CreditBreakdown };
  // Rewards & Canteen Redemption
  checkFreebieAvailable: (userId: string, category: 'snack' | 'legend_combo') => {
    available: boolean;
    reason: string;
    periodKey: string;
    remainingQuota?: number;
  };
  redeemCanteenItem: (
    rewardItem: RewardItem,
    isFreebieClaim: boolean
  ) => { success: boolean; message: string; redemption?: CanteenRedemption };
  scanCanteenCode: (redemptionId: string) => { success: boolean; message: string };
  requestMajorReward: (rewardItem: RewardItem) => { success: boolean; message: string };
  // Admin Controls
  approveMajorReward: (
    requestId: string,
    approve: boolean,
    adminNote?: string
  ) => { success: boolean; message: string };
  toggleMentorVerification: (userId: string) => { success: boolean; message: string };
  // Impact Metrics
  getImpactMetrics: () => ImpactMetrics;
  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or seeds
  const [users, setUsers, usersRef] = useLiveState<Record<string, User>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_USERS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_USERS;
  });

  const [currentUserId, setCurrentUserId, currentUserIdRef] = useLiveState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_CURRENT_USER_ID`);
      if (saved && SEED_USERS[saved]) return saved;
    } catch {}
    return 'aarav';
  });

  const [books, setBooks, booksRef] = useLiveState<BookListing[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_BOOKS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_BOOKS;
  });

  const [sessions, setSessions, sessionsRef] = useLiveState<MentoringSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_SESSIONS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [transactions, setTransactions, transactionsRef] = useLiveState<CreditTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_TXS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_TRANSACTIONS;
  });

  const [redemptions, setRedemptions, redemptionsRef] = useLiveState<CanteenRedemption[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_REDEMPTIONS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [majorRewardRequests, setMajorRewardRequests, majorRewardRequestsRef] = useLiveState<MajorRewardRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_MAJOR_REWARDS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [resetGeneration, setResetGeneration] = useState(0);

  const [notifications, setNotifications] = useLiveState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_NOTIFS`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'notif-welcome',
        userId: 'aarav',
        title: 'Welcome to CampusLoop!',
        message: 'Browse books shared by seniors, earn credits, or redeem perks at the campus canteen.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
      },
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_USERS`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_CURRENT_USER_ID`, currentUserId);
      localStorage.setItem(`${STORAGE_KEY}_BOOKS`, JSON.stringify(books));
      localStorage.setItem(`${STORAGE_KEY}_SESSIONS`, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY}_TXS`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_REDEMPTIONS`, JSON.stringify(redemptions));
      localStorage.setItem(`${STORAGE_KEY}_MAJOR_REWARDS`, JSON.stringify(majorRewardRequests));
      localStorage.setItem(`${STORAGE_KEY}_NOTIFS`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [users, currentUserId, books, sessions, transactions, redemptions, majorRewardRequests, notifications]);

  const currentUser = users[currentUserId] || SEED_USERS.aarav;
  const getCurrentUser = () => usersRef.current[currentUserIdRef.current] || SEED_USERS.aarav;

  // Account switching
  const switchUser = (userId: string) => {
    if (usersRef.current[userId]) {
      setCurrentUserId(userId);
    }
  };

  // Repeatable Reset Demo Action
  const resetAllData = () => {
    // Reset transient UI even when the active persona is already Aarav.
    setResetGeneration((generation) => generation + 1);
    setUsers(SEED_USERS);
    setCurrentUserId('aarav');
    setBooks(SEED_BOOKS);
    setSessions([]);
    setTransactions(SEED_TRANSACTIONS);
    setRedemptions([]);
    setMajorRewardRequests([]);
    setShowMilestoneModal(false);
    setNotifications([
      {
        id: 'notif-reset',
        userId: 'aarav',
        title: 'Demo State Reset Complete',
        message: 'Restored exact opening state: Rohan at 9,940 CR, unredeemed rewards, zero active sessions.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
      },
    ]);
  };

  // --- BOOK EXCHANGE ENGINE ---
  const reserveBook = (bookId: string) => {
    const books = booksRef.current;
    const currentUser = getCurrentUser();
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book listing not found.' };
    if (book.status !== 'available') return { success: false, message: 'Book unavailable (double-booking prevented).' };
    if (book.ownerId === currentUser.id) return { success: false, message: 'You cannot reserve your own book listing.' };

    if (book.listingType === 'rent' && (book.rentalRateCredits || 0) > 0) {
      const requiredCredits = book.rentalRateCredits || 0;
      if (currentUser.credits < requiredCredits) {
        return {
          success: false,
          message: `Insufficient Campus Credits. You need ${requiredCredits} cr, but have ${currentUser.credits} cr.`,
        };
      }
    }

    const now = new Date().toISOString();
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status: 'reserved',
              reservedByUserId: currentUser.id,
              reservedByUserName: currentUser.name,
              reservedAt: now,
            }
          : b
      )
    );

    const newNotif: AppNotification = {
      id: newId('notif'),
      userId: book.ownerId,
      title: 'New Book Reservation',
      message: `${currentUser.name} reserved your book "${book.title}". Please arrange the campus handover.`,
      timestamp: now,
      read: false,
      type: 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Successfully reserved "${book.title}". Owner ${book.ownerName} has been notified to complete handover.`,
    };
  };

  const cancelReservation = (bookId: string) => {
    const books = booksRef.current;
    const currentUser = getCurrentUser();
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book listing not found.' };
    if (book.status !== 'reserved') return { success: false, message: 'Only reserved books can be cancelled.' };

    const isReserver = book.reservedByUserId === currentUser.id;
    const isOwner = book.ownerId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isReserver && !isOwner && !isAdmin) return { success: false, message: 'Permission denied.' };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status: 'available',
              reservedByUserId: undefined,
              reservedByUserName: undefined,
              reservedAt: undefined,
            }
          : b
      )
    );

    return {
      success: true,
      message: `Reservation for "${book.title}" was cancelled and returned to available stock.`,
    };
  };

  const confirmHandover = (bookId: string) => {
    const books = booksRef.current;
    const users = usersRef.current;
    const currentUser = getCurrentUser();
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found.' };
    if (book.status !== 'reserved') return { success: false, message: 'Book must be reserved to confirm handover.' };

    const isOwner = book.ownerId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isOwner && !isAdmin) return { success: false, message: 'Only owner or admin can confirm physical handover.' };

    const now = new Date().toISOString();
    const owner = users[book.ownerId];
    const reserver = users[book.reservedByUserId || 'unknown'];

    let newStatus: BookListing['status'] = 'lent_out';
    let creditAward = 0;
    let awardReason = '';

    if (book.listingType === 'donate') {
      newStatus = 'donated';
      creditAward = 50;
      awardReason = `Awarded +50 Campus Credits for confirmed donation handover: "${book.title}" to ${book.reservedByUserName || 'student'}.`;
    } else if (book.listingType === 'rent') {
      newStatus = 'lent_out';
    } else if (book.listingType === 'sell') {
      newStatus = 'sold';
    }

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status: newStatus,
              handedOverAt: now,
            }
          : b
      )
    );

    if (creditAward > 0 && owner) {
      const newOwnerCredits = owner.credits + creditAward;
      setUsers((prev) => ({
        ...prev,
        [owner.id]: {
          ...prev[owner.id],
          credits: newOwnerCredits,
        },
      }));

      const newTx: CreditTransaction = {
        id: newId('tx'),
        userId: owner.id,
        userName: owner.name,
        amount: creditAward,
        type: 'donation_reward',
        description: awardReason,
        relatedBookId: book.id,
        relatedBookTitle: book.title,
        timestamp: now,
      };
      setTransactions((prev) => [newTx, ...prev]);

      const ownerNotif: AppNotification = {
        id: newId('notif'),
        userId: owner.id,
        title: 'Donation Handover Verified (+50 Credits)',
        message: `You earned +50 Campus Credits for donating "${book.title}"! Balance: ${newOwnerCredits} cr.`,
        timestamp: now,
        read: false,
        type: 'success',
      };
      setNotifications((prev) => [ownerNotif, ...prev]);
    }

    if (reserver) {
      const reserverNotif: AppNotification = {
        id: newId('notif-reserver'),
        userId: reserver.id,
        title: 'Handover Completed',
        message: `You received "${book.title}" from ${book.ownerName}. Happy studying!`,
        timestamp: now,
        read: false,
        type: 'success',
      };
      setNotifications((prev) => [reserverNotif, ...prev]);
    }

    return {
      success: true,
      message:
        book.listingType === 'donate'
          ? `Handover confirmed! +50 Campus Credits awarded to ${book.ownerName}.`
          : `Handover confirmed! Book "${book.title}" is now marked as active lending.`,
    };
  };

  const confirmReturn = (bookId: string) => {
    const books = booksRef.current;
    const users = usersRef.current;
    const currentUser = getCurrentUser();
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found.' };
    if (book.status !== 'lent_out' || book.listingType !== 'rent') {
      return { success: false, message: 'Only currently lent books can be marked as returned.' };
    }

    const isOwner = book.ownerId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isOwner && !isAdmin) return { success: false, message: 'Only owner or admin can verify book return.' };

    const now = new Date().toISOString();
    const owner = users[book.ownerId];
    const awardAmount = 20;

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status: 'available',
              reservedByUserId: undefined,
              reservedByUserName: undefined,
              reservedAt: undefined,
              handedOverAt: undefined,
              returnedAt: now,
            }
          : b
      )
    );

    if (owner) {
      const updatedCredits = owner.credits + awardAmount;
      setUsers((prev) => ({
        ...prev,
        [owner.id]: {
          ...prev[owner.id],
          credits: updatedCredits,
        },
      }));

      const newTx: CreditTransaction = {
        id: newId('tx-return'),
        userId: owner.id,
        userName: owner.name,
        amount: awardAmount,
        type: 'lending_reward',
        description: `Awarded +20 Campus Credits for completed lending cycle of "${book.title}".`,
        relatedBookId: book.id,
        relatedBookTitle: book.title,
        timestamp: now,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    return {
      success: true,
      message: `Return verified! Book is available again, and +20 Campus Credits were awarded to ${book.ownerName}.`,
    };
  };

  const createBookListing = (data: {
    title: string;
    author: string;
    grade: string;
    subject: string;
    condition: BookCondition;
    description: string;
    listingType: ListingType;
    rentalDuration?: string;
    mockPrice?: number;
  }) => {
    const currentUser = getCurrentUser();
    const canList =
      currentUser.roles.includes('senior') ||
      currentUser.roles.includes('mentor') ||
      currentUser.roles.includes('admin');

    if (!canList) {
      return {
        success: false,
        message: 'Permission denied. Only Senior students and Admins can create book listings.',
      };
    }

    const newBook: BookListing = {
      id: newId('book'),
      title: data.title.trim(),
      author: data.author.trim(),
      grade: data.grade,
      subject: data.subject.trim(),
      condition: data.condition,
      description: data.description.trim() || 'No description provided.',
      listingType: data.listingType,
      rentalDuration: data.listingType === 'rent' ? data.rentalDuration || '1 Month' : undefined,
      rentalRateCredits: data.listingType === 'rent' ? data.mockPrice || 30 : undefined,
      mockPrice: data.mockPrice || (data.listingType === 'sell' ? 150 : 0),
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerGrade: currentUser.grade,
      status: 'available',
      createdAt: new Date().toISOString(),
      tags: [data.subject, data.grade, data.listingType.toUpperCase()],
      coverColor: 'from-indigo-600 to-violet-800',
    };

    setBooks((prev) => [newBook, ...prev]);
    return {
      success: true,
      message: `Your book "${newBook.title}" has been listed on the CampusLoop book exchange!`,
    };
  };

  const deleteBookListing = (bookId: string) => {
    const books = booksRef.current;
    const currentUser = getCurrentUser();
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found.' };
    const isOwner = book.ownerId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isOwner && !isAdmin) return { success: false, message: 'Permission denied.' };
    if (book.status !== 'available') return { success: false, message: 'Cannot delete reserved/active book.' };

    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    return { success: true, message: `Listing for "${book.title}" was removed.` };
  };

  // --- PEER MENTORING WORKFLOW ---
  const requestMentoringSession = (data: {
    mentorId: string;
    subject: string;
    topic: string;
    grade: string;
    date: string;
    time: string;
    description: string;
    baselineAnswers: number[];
  }) => {
    const users = usersRef.current;
    const sessions = sessionsRef.current;
    const currentUser = getCurrentUser();
    if (data.mentorId === currentUser.id) {
      return { success: false, message: 'Self-mentoring is not permitted.' };
    }

    const targetMentor = users[data.mentorId];
    if (!targetMentor || !targetMentor.isVerifiedMentor) {
      return { success: false, message: 'Only verified academic mentors can be requested.' };
    }

    const hasConflict = sessions.some(
      (s) =>
        s.mentorId === data.mentorId &&
        s.date === data.date &&
        s.time === data.time &&
        (s.status === 'requested' || s.status === 'accepted')
    );
    if (hasConflict) {
      return {
        success: false,
        message: `Mentor ${targetMentor.name} already has a session on ${data.date} at ${data.time}. Conflicting booking prevented.`,
      };
    }

    const questions = getQuizForTopic(data.topic);
    let baselineScore = 0;
    data.baselineAnswers.forEach((ans, idx) => {
      if (questions[idx] && ans === questions[idx].correctOptionIndex) baselineScore++;
    });

    const baselinePercentage = Math.round((baselineScore / questions.length) * 100);
    const newSessionId = newId('session');
    const newSession: MentoringSession = {
      id: newSessionId,
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

    setSessions((prev) => [newSession, ...prev]);

    const mentorNotif: AppNotification = {
      id: newId('notif'),
      userId: targetMentor.id,
      title: 'New Peer Mentoring Request',
      message: `${currentUser.name} requested "${data.topic}" for ${data.date} at ${data.time}. Diagnostic baseline: ${baselineScore}/${questions.length}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info',
    };
    setNotifications((prev) => [mentorNotif, ...prev]);

    return {
      success: true,
      message: `Mentoring request submitted to ${targetMentor.name}! (Baseline: ${baselineScore}/${questions.length}).`,
      sessionId: newSessionId,
    };
  };

  const acceptMentoringSession = (sessionId: string) => {
    const sessions = sessionsRef.current;
    const currentUser = getCurrentUser();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== 'requested') return { success: false, message: 'Invalid session.' };

    const isAssignedMentor = session.mentorId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isAssignedMentor && !isAdmin) return { success: false, message: 'Permission denied.' };
    if (!currentUser.isVerifiedMentor && !isAdmin) return { success: false, message: 'Only verified mentors can accept.' };

    const now = new Date().toISOString();
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'accepted', acceptedAt: now } : s))
    );

    return { success: true, message: `Session accepted! Student ${session.studentName} has been notified.` };
  };

  const declineMentoringSession = (sessionId: string, reason?: string) => {
    const sessions = sessionsRef.current;
    const currentUser = getCurrentUser();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, message: 'Session not found.' };
    if (session.mentorId !== currentUser.id && !currentUser.roles.includes('admin')) {
      return { success: false, message: 'Only the assigned mentor or admin can decline a request.' };
    }
    if (session.status !== 'requested') {
      return { success: false, message: 'Only pending requests can be declined.' };
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'declined', declineReason: reason } : s))
    );
    return { success: true, message: 'Session request declined.' };
  };

  const finishMentoringSession = (sessionId: string, isSimulated: boolean = true) => {
    const sessions = sessionsRef.current;
    const currentUser = getCurrentUser();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== 'accepted') return { success: false, message: 'Invalid session state.' };

    const isMentor = session.mentorId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isMentor && !isAdmin) return { success: false, message: 'Permission denied.' };
    if (!isAdmin && !currentUser.isVerifiedMentor) {
      return { success: false, message: 'Only verified mentors can finish sessions.' };
    }

    const now = new Date().toISOString();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'awaiting_learner_confirmation',
              mentorFinishedAt: now,
              simulatedSession: isSimulated,
            }
          : s
      )
    );

    return {
      success: true,
      message: `Session marked finished. Awaiting learner confirmation & final quiz. Credits held until learner verifies.`,
    };
  };

  const confirmAndFinalizeSession = (
    sessionId: string,
    data: {
      finalAnswers: number[];
      rating: number;
      feedbackComment?: string;
    }
  ) => {
    const users = usersRef.current;
    const sessions = sessionsRef.current;
    const currentUser = getCurrentUser();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== 'awaiting_learner_confirmation') {
      return { success: false, message: 'Session is not awaiting learner confirmation.' };
    }

    const isStudent = session.studentId === currentUser.id;
    const isAdmin = currentUser.roles.includes('admin');
    if (!isStudent && !isAdmin) return { success: false, message: 'Permission denied.' };
    if (session.creditAwarded) return { success: false, message: 'Credits already awarded for this session.' };

    const questions = getQuizForTopic(session.topic);
    let finalScore = 0;
    data.finalAnswers.forEach((ans, idx) => {
      if (questions[idx] && ans === questions[idx].correctOptionIndex) finalScore++;
    });

    const finalPercentage = Math.round((finalScore / questions.length) * 100);
    const baselinePercentage = session.baselineQuiz?.percentage ?? 0;
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

    const now = new Date().toISOString();
    const txId = newId('tx-mentor');

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'completed',
              completedAt: now,
              finalQuiz: {
                answers: data.finalAnswers,
                score: finalScore,
                totalQuestions: questions.length,
                percentage: finalPercentage,
                completedAt: now,
              },
              rating: data.rating,
              feedbackComment: data.feedbackComment,
              creditAwarded: true,
              creditBreakdown: breakdown,
              transactionId: txId,
            }
          : s
      )
    );

    const mentor = users[session.mentorId];
    if (mentor) {
      const prevCredits = mentor.credits;
      const updatedCredits = prevCredits + totalAward;

      setUsers((prev) => ({
        ...prev,
        [mentor.id]: {
          ...prev[mentor.id],
          credits: updatedCredits,
        },
      }));

      const newTx: CreditTransaction = {
        id: txId,
        userId: mentor.id,
        userName: mentor.name,
        amount: totalAward,
        type: 'mentoring_reward',
        description: `Peer Mentoring verified: "${session.topic}" (${session.subject}) with ${session.studentName}. (Base +${baseCompletion}, Feedback +${feedbackBonus}, Quiz Gain +${quizImprovementBonus})`,
        relatedSessionId: session.id,
        breakdown,
        timestamp: now,
      };
      setTransactions((prev) => [newTx, ...prev]);

      // TRIGGER MAIN WOW MOMENT IF ROHAN CROSSES 10,000 CR!
      if (mentor.id === 'rohan' && prevCredits < 10000 && updatedCredits >= 10000) {
        setShowMilestoneModal(true);
      }
    }

    return {
      success: true,
      message: `Session verified & completed! Observed diagnostic score gain: ${baselinePercentage}% → ${finalPercentage}% (+${observedImprovement} pp). Awarded +${totalAward} Campus Credits to ${session.mentorName}.`,
      breakdown,
    };
  };

  // --- CANTEEN PERKS & REWARD REDEMPTION ENGINE ---

  // Check if current user has freebie available for the given category
  const checkFreebieAvailable = (
    userId: string,
    category: 'snack' | 'legend_combo'
  ) => {
    const users = usersRef.current;
    const redemptions = redemptionsRef.current;
    const user = users[userId];
    if (!user) return { available: false, reason: 'User not found', periodKey: '' };

    const tierInfo = getUserTier(user.credits);
    const currentDate = new Date();
    const monthKey = `month-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    // ISO week key (e.g. "week-2026-W39")
    const weekNumber = Math.ceil(currentDate.getDate() / 7);
    const weekKey = `week-${currentDate.getFullYear()}-M${currentDate.getMonth() + 1}-W${weekNumber}`;

    if (category === 'legend_combo') {
      if (tierInfo.tier !== 'Legend') {
        return {
          available: false,
          reason: 'Requires Legend Tier (10,000+ Credits).',
          periodKey: 'legend-welcome',
        };
      }
      // Check if already claimed
      const alreadyClaimed = redemptions.some(
        (r) => r.userId === userId && r.periodKey === 'legend-welcome'
      );
      if (alreadyClaimed) {
        return {
          available: false,
          reason: 'Welcome Feast Combo has already been claimed (1 per account).',
          periodKey: 'legend-welcome',
        };
      }
      return { available: true, reason: 'Ready to claim welcome combo!', periodKey: 'legend-welcome' };
    }

    // Category === 'snack'
    if (tierInfo.tier === 'Starter') {
      return {
        available: false,
        reason: 'Free snacks unlock at Bronze tier (500 Credits). Current: Starter.',
        periodKey: monthKey,
      };
    }

    // Bronze: 1 snack/month
    if (tierInfo.tier === 'Bronze') {
      const monthlyCount = redemptions.filter(
        (r) => r.userId === userId && r.periodKey === monthKey && r.isFreebie && r.category === 'snacks'
      ).length;
      if (monthlyCount >= 1) {
        return {
          available: false,
          reason: 'Bronze tier quota reached (1 free snack per month). Refreshes next month!',
          periodKey: monthKey,
          remainingQuota: 0,
        };
      }
      return {
        available: true,
        reason: '1 Free Snack available this month (Bronze perk).',
        periodKey: monthKey,
        remainingQuota: 1 - monthlyCount,
      };
    }

    // Silver: 2 snacks/month
    if (tierInfo.tier === 'Silver') {
      const monthlyCount = redemptions.filter(
        (r) => r.userId === userId && r.periodKey === monthKey && r.isFreebie && r.category === 'snacks'
      ).length;
      if (monthlyCount >= 2) {
        return {
          available: false,
          reason: 'Silver tier quota reached (2 free snacks per month). Refreshes next month!',
          periodKey: monthKey,
          remainingQuota: 0,
        };
      }
      return {
        available: true,
        reason: `${2 - monthlyCount} Free Snack(s) remaining this month (Silver perk).`,
        periodKey: monthKey,
        remainingQuota: 2 - monthlyCount,
      };
    }

    // Gold / Diamond / Legend: 1 snack/week
    const weeklyCount = redemptions.filter(
      (r) => r.userId === userId && r.periodKey === weekKey && r.isFreebie && r.category === 'snacks'
    ).length;
    if (weeklyCount >= 1) {
      return {
        available: false,
        reason: `${tierInfo.tier} tier weekly quota reached (1 free snack/week). Refreshes next week!`,
        periodKey: weekKey,
        remainingQuota: 0,
      };
    }
    return {
      available: true,
      reason: `1 Free Snack available this week (${tierInfo.tier} perk).`,
      periodKey: weekKey,
      remainingQuota: 1,
    };
  };

  // Redeem Canteen Item (Freebie or Credit Purchase)
  const redeemCanteenItem = (rewardItem: RewardItem, isFreebieClaim: boolean) => {
    const user = getCurrentUser();
    const tierInfo = getUserTier(user.credits);
    const catalogueItem = REWARD_CATALOGUE.find((item) => item.id === rewardItem.id);
    if (!catalogueItem || catalogueItem.isMajorVault || catalogueItem.category === 'tech_vault') {
      return { success: false, message: 'Choose a canteen or marketplace reward from the catalogue.' };
    }
    // Prices, tiers, and categories come from the catalogue, never a stale UI card.
    rewardItem = catalogueItem;
    if (user.credits < TIER_DEFINITIONS[rewardItem.minTier].threshold) {
      return { success: false, message: `This reward requires ${rewardItem.minTier} tier.` };
    }
    if (rewardItem.id === 'meal-legend-combo') isFreebieClaim = true;
    if (isFreebieClaim && rewardItem.category !== 'snacks' && rewardItem.id !== 'meal-legend-combo') {
      return { success: false, message: 'Only snacks and the Legend welcome combo qualify as tier freebies.' };
    }

    let periodKey = 'standard-purchase';
    let cost = rewardItem.creditCost;

    if (isFreebieClaim) {
      const freebieCheck = checkFreebieAvailable(
        user.id,
        rewardItem.id === 'meal-legend-combo' ? 'legend_combo' : 'snack'
      );
      if (!freebieCheck.available) {
        return { success: false, message: freebieCheck.reason };
      }
      periodKey = freebieCheck.periodKey;
      cost = 0; // Freebies never deduct credits!
    } else {
      // Standard credit redemption
      if (user.credits < cost) {
        return {
          success: false,
          message: `Insufficient credits. You need ${cost} cr, but have ${user.credits} cr.`,
        };
      }
    }

    const now = new Date().toISOString();
    const redemptionId = newId('redemption');
    const code = `CL-${rewardItem.category.toUpperCase().slice(0, 4)}-${redemptionId.slice('redemption-'.length).toUpperCase()}`;

    const newRedemption: CanteenRedemption = {
      id: redemptionId,
      userId: user.id,
      userName: user.name,
      itemId: rewardItem.id,
      itemTitle: rewardItem.title,
      category: rewardItem.category,
      code,
      status: 'active',
      isFreebie: isFreebieClaim,
      creditCost: cost,
      redeemedAt: now,
      periodKey,
      tierClaimed: tierInfo.tier,
    };

    setRedemptions((prev) => [newRedemption, ...prev]);

    // If cost > 0, deduct credits atomically
    if (cost > 0) {
      const newCredits = user.credits - cost;
      setUsers((prev) => ({
        ...prev,
        [user.id]: {
          ...prev[user.id],
          credits: newCredits,
        },
      }));

      const newTx: CreditTransaction = {
        id: newId('tx-redeem'),
        userId: user.id,
        userName: user.name,
        amount: -cost,
        type: 'canteen_redemption',
        description: `Redeemed ${rewardItem.title} at campus canteen. (Voucher code: ${code})`,
        timestamp: now,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    return {
      success: true,
      message: isFreebieClaim
        ? `🎉 Tier freebie claimed! Show the QR code at the canteen counter.`
        : `Redeemed for ${cost} credits! Show your QR code at the counter.`,
      redemption: newRedemption,
    };
  };

  // Demo Scan action (Simulate Canteen Counter Scanner)
  const scanCanteenCode = (redemptionId: string) => {
    const redemptions = redemptionsRef.current;
    const item = redemptions.find((r) => r.id === redemptionId);
    if (!item) return { success: false, message: 'Redemption record not found.' };
    const user = getCurrentUser();
    if (item.userId !== user.id && !user.roles.includes('admin')) {
      return { success: false, message: 'Only the voucher owner or admin can simulate collection.' };
    }
    if (item.status === 'scanned_and_collected') {
      return { success: false, message: 'This QR code was already scanned & collected.' };
    }

    const now = new Date().toISOString();
    setRedemptions((prev) =>
      prev.map((r) =>
        r.id === redemptionId
          ? {
              ...r,
              status: 'scanned_and_collected',
              scannedAt: now,
            }
          : r
      )
    );

    return {
      success: true,
      message: `✓ DEMO SCAN VERIFIED: "${item.itemTitle}" collected by ${item.userName} at campus canteen!`,
    };
  };

  // Request Major Tech Vault Reward (Legend Tier 10,000 CR)
  const requestMajorReward = (rewardItem: RewardItem) => {
    const majorRewardRequests = majorRewardRequestsRef.current;
    const user = getCurrentUser();
    const catalogueItem = REWARD_CATALOGUE.find((item) => item.id === rewardItem.id && item.isMajorVault);
    if (!catalogueItem) return { success: false, message: 'Choose a Tech Vault reward from the catalogue.' };
    rewardItem = catalogueItem;
    if (user.credits < 10000) {
      return {
        success: false,
        message: 'Major Tech Vault eligibility requires Legend Tier (10,000+ Credits).',
      };
    }

    // Check duplicate pending request
    const existing = majorRewardRequests.find(
      (m) => m.userId === user.id && m.rewardId === rewardItem.id && m.status === 'pending_review'
    );
    if (existing) {
      return {
        success: false,
        message: 'You already have a pending eligibility application for this device.',
      };
    }

    const newReq: MajorRewardRequest = {
      id: newId('req'),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      rewardId: rewardItem.id,
      rewardTitle: rewardItem.title,
      creditsAtRequest: user.credits,
      status: 'pending_review',
      requestedAt: new Date().toISOString(),
    };

    setMajorRewardRequests((prev) => [newReq, ...prev]);

    return {
      success: true,
      message: `Eligibility application submitted for ${rewardItem.title}! Awaiting faculty/administrator review.`,
    };
  };

  // Admin Controls
  const approveMajorReward = (requestId: string, approve: boolean, adminNote?: string) => {
    if (!getCurrentUser().roles.includes('admin')) {
      return { success: false, message: 'Only admins can review reward requests.' };
    }
    const majorRewardRequests = majorRewardRequestsRef.current;
    const req = majorRewardRequests.find((m) => m.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };
    if (req.status !== 'pending_review') {
      return { success: false, message: 'This reward request has already been reviewed.' };
    }

    const now = new Date().toISOString();
    setMajorRewardRequests((prev) =>
      prev.map((m) =>
        m.id === requestId
          ? {
              ...m,
              status: approve ? 'approved' : 'rejected',
              reviewedAt: now,
              adminNote: adminNote || (approve ? 'Verified top academic contributor' : 'Waitlisted for next grant cycle'),
            }
          : m
      )
    );

    return {
      success: true,
      message: approve ? `Approved mock allocation for ${req.userName}.` : `Rejected mock allocation for ${req.userName}.`,
    };
  };

  const toggleMentorVerification = (userId: string) => {
    if (!getCurrentUser().roles.includes('admin')) {
      return { success: false, message: 'Only admins can change mentor verification.' };
    }
    const users = usersRef.current;
    const target = users[userId];
    if (!target) return { success: false, message: 'User not found.' };

    const newVerified = !target.isVerifiedMentor;
    setUsers((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        isVerifiedMentor: newVerified,
        roles: newVerified
          ? Array.from(new Set([...prev[userId].roles, 'mentor']))
          : prev[userId].roles.filter((r) => r !== 'mentor'),
      },
    }));

    return {
      success: true,
      message: newVerified
        ? `Verified mentor status granted to ${target.name}.`
        : `Mentor status suspended for ${target.name}.`,
    };
  };

  // Calculate Impact Metrics strictly from seeded and demo activity records
  const getImpactMetrics = (): ImpactMetrics => {
    const books = booksRef.current;
    const sessions = sessionsRef.current;
    const transactions = transactionsRef.current;
    const users = usersRef.current;
    const reusedBooksCount = books.filter(
      (b) => b.status === 'donated' || b.status === 'lent_out' || b.status === 'sold'
    ).length;

    // Approximate ₹350 average textbook cost saved per reused or lent book
    const estimatedSavings = reusedBooksCount * 350;

    // Completed mentoring sessions (each 45 minutes = 0.75 hours)
    const completedSessionsCount = sessions.filter((s) => s.status === 'completed').length;
    const mentoringHours = Math.round(completedSessionsCount * 0.75 * 10) / 10;

    return {
      booksReused: reusedBooksCount,
      estimatedSavingsInRupees: estimatedSavings,
      mentoringHours,
      totalTransactions: transactions.length,
      activeLearners: Object.keys(users).length,
    };
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    const currentUser = getCurrentUser();
    setNotifications((prev) => prev.filter((n) => n.userId !== currentUser.id));
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        books,
        sessions,
        transactions,
        notifications,
        redemptions,
        majorRewardRequests,
        resetGeneration,
        showMilestoneModal,
        setShowMilestoneModal,
        switchUser,
        resetAllData,
        reserveBook,
        cancelReservation,
        confirmHandover,
        confirmReturn,
        createBookListing,
        deleteBookListing,
        requestMentoringSession,
        acceptMentoringSession,
        declineMentoringSession,
        finishMentoringSession,
        confirmAndFinalizeSession,
        checkFreebieAvailable,
        redeemCanteenItem,
        scanCanteenCode,
        requestMajorReward,
        approveMajorReward,
        toggleMentorVerification,
        getImpactMetrics,
        markNotificationAsRead,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
