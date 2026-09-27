export type UserRole = 'junior' | 'senior' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  grade: string;
  roles: UserRole[];
  credits: number;
  avatar: string;
  bio: string;
  badge?: string;
  mentorSubjects?: string[];
  isVerifiedMentor?: boolean;
}

export type ListingType = 'donate' | 'rent' | 'sell';
export type BookCondition = 'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
export type BookStatus = 'available' | 'reserved' | 'lent_out' | 'donated' | 'sold';

export interface BookListing {
  id: string;
  title: string;
  author: string;
  grade: string;
  subject: string;
  condition: BookCondition;
  description: string;
  listingType: ListingType;
  rentalDuration?: string;
  rentalRateCredits?: number;
  mockPrice?: number;
  ownerId: string;
  ownerName: string;
  ownerGrade: string;
  status: BookStatus;
  reservedByUserId?: string;
  reservedByUserName?: string;
  reservedAt?: string;
  handedOverAt?: string;
  returnedAt?: string;
  createdAt: string;
  tags?: string[];
  coverColor?: string;
}

export type TransactionType =
  | 'donation_reward'
  | 'lending_reward'
  | 'lending_fee'
  | 'mock_purchase'
  | 'mentoring_reward'
  | 'canteen_redemption'
  | 'initial_balance';

export interface CreditBreakdown {
  baseCompletion: number; // 40
  feedbackBonus: number; // 10 if rating >= 4
  quizImprovementBonus: number; // 20 if improvement >= 30 percentage points
  assessmentMode?: 'quiz' | 'supported';
  supportCompletionBonus?: number; // 20 for confirmed supported participation, independent of score gain
  total: number; // max 70
  baselinePercentage: number;
  finalPercentage: number;
  observedImprovement: number; // percentage points
  rating: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: TransactionType;
  description: string;
  relatedBookId?: string;
  relatedBookTitle?: string;
  relatedSessionId?: string;
  breakdown?: CreditBreakdown;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export type MentoringSessionStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'awaiting_learner_confirmation'
  | 'completed';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizSubmission {
  answers: number[];
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export type SupportNeed = 'memory' | 'processing' | 'reading' | 'communication' | 'energy' | 'motor';
export type ResponseMode = 'spoken' | 'typed' | 'pointing' | 'demonstration';

export interface LearningSupport {
  needs: SupportNeed[];
  strengths: string;
  goal: string;
  responseMode: ResponseMode;
  sessionMinutes: number;
  breakEveryMinutes: number;
}

export interface LearningPlanLesson {
  title: string;
  objective: string;
  activities: string;
  evidence: string;
}

export interface LearningPlanDraft {
  goal: string;
  strengths: string;
  startingPoint: string;
  strategies: string[];
  lessons: LearningPlanLesson[];
  materials: string;
  responseMode: ResponseMode;
  reviewDate: string;
  teacherGuidance: string;
}

export interface LearningPlan extends LearningPlanDraft {
  status: 'draft' | 'shared' | 'reviewed';
  authorId: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  learnerResponse?: 'agreed' | 'changes_requested';
  learnerNote?: string;
}

export interface MentoringSession {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  topic: string;
  grade: string;
  date: string;
  time: string;
  description: string;
  status: MentoringSessionStatus;
  declineReason?: string;
  requestedAt: string;
  acceptedAt?: string;
  mentorFinishedAt?: string;
  completedAt?: string;
  baselineQuiz?: QuizSubmission;
  finalQuiz?: QuizSubmission;
  rating?: number;
  feedbackComment?: string;
  creditAwarded: boolean;
  creditBreakdown?: CreditBreakdown;
  transactionId?: string;
  simulatedSession?: boolean;
  learningSupport?: LearningSupport;
  learningPlan?: LearningPlan;
  assessmentMode?: 'quiz' | 'supported';
  sessionMinutes?: number;
  goalReview?: 'practised' | 'maintained' | 'needs_more_support';
  classMode?: 'online' | 'offline';
  meetingLink?: string;
  location?: string;
}

// --- REWARD TIERS & CANTEEN PERKS ---

export type RewardTier = 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legend';

export interface TierInfo {
  tier: RewardTier;
  threshold: number;
  nextThreshold?: number;
  badge: string;
  color: string;
  canteenPerk: string;
}

export interface RewardItem {
  id: string;
  title: string;
  category: 'snacks' | 'meals' | 'stationery' | 'vouchers' | 'accessories' | 'tech_vault';
  creditCost: number; // 0 for tier freebies
  minTier: RewardTier;
  image: string;
  description: string;
  sponsorNote?: string;
  isMajorVault?: boolean;
}

export interface CanteenRedemption {
  id: string;
  userId: string;
  userName: string;
  itemId: string;
  itemTitle: string;
  category: string;
  code: string; // e.g. "CL-CANTEEN-9021"
  status: 'active' | 'scanned_and_collected';
  isFreebie: boolean;
  creditCost: number;
  redeemedAt: string;
  scannedAt?: string;
  periodKey: string; // e.g. "month-2026-09" or "legend-welcome"
  tierClaimed: RewardTier;
}

export interface MajorRewardRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rewardId: string;
  rewardTitle: string;
  creditsAtRequest: number;
  status: 'pending_review' | 'approved' | 'waitlisted' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

// --- LOOP AI ASSISTANT TYPES ---

export type LoopAiCardType =
  | 'book'
  | 'mentor'
  | 'session'
  | 'wallet'
  | 'canteen'
  | 'draft_mentoring'
  | 'quiz'
  | 'navigation';

export interface LoopAiQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LoopAiActionCard {
  type: LoopAiCardType;
  title?: string;
  description?: string;
  bookData?: BookListing;
  mentorData?: {
    id: string;
    name: string;
    avatar: string;
    grade: string;
    subjects: string[];
    rating: number;
    completedSessions: number;
  };
  sessionData?: MentoringSession;
  walletData?: {
    credits: number;
    tier: RewardTier;
    nextThreshold: number;
    creditsNeeded: number;
    creditsNeededForTechVault: number;
    milestoneName: string;
    progressPercentage: number;
  };
  canteenData?: {
    tier: RewardTier;
    eligible: boolean;
    reason: string;
    perkSummary: string;
    freebieTitle?: string;
  };
  draftMentoringData?: {
    mentorId: string;
    mentorName: string;
    subject: string;
    topic: string;
    date: string;
    time: string;
    grade: string;
    description: string;
  };
  quizData?: {
    topic: string;
    subject: string;
    questions: LoopAiQuizQuestion[];
  };
  navigationData?: Array<{
    label: string;
    tab: string;
    description?: string;
  }>;
}

export interface LoopAiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  status: 'live' | 'offline' | 'rate_limited' | 'system_direct';
  model?: string;
  thoughtProcess?: string;
  actionCards?: LoopAiActionCard[];
  offlineReason?: string;
  confirmedActionId?: string;
}

// --- VIRTUAL STUDY ROOM TYPES ---

export type StudyRoomMode = 'asl_supported' | 'text_based' | 'hybrid';

export interface StudyRoomParticipant {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  role: 'learner' | 'mentor' | 'senior' | 'admin';
  isAudioOn: boolean;
  isVideoOn: boolean;
  isAslMode: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  isSigning: boolean;
  lastActive: string;
}

export interface StudyRoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isAslSigned?: boolean;
  signedLetters?: string[];
  gestureTag?: string; // e.g. "TRIANGLE", "FORMULA", "HELP", "GREAT JOB"
  aacQuickChip?: boolean;
}

export interface StudyRoomWhiteboardNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  type: 'concept' | 'formula' | 'solution' | 'doubt';
  timestamp: string;
}

export interface VirtualStudyRoom {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  mode: StudyRoomMode;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostBadge?: string;
  description: string;
  isLive: boolean;
  participantCount: number;
  participants: StudyRoomParticipant[];
  sessionId?: string; // linked mentoring session if applicable
  createdAt: string;
  whiteboardNotes: StudyRoomWhiteboardNote[];
  messages: StudyRoomMessage[];
  tags: string[];
}
