import {
  BookListing,
  User,
  MentoringSession,
  RewardTier,
  LoopAiActionCard,
  LoopAiMessage,
  LoopAiQuizQuestion,
} from '../types';
import { getUserTier } from '../data/rewardData';

export interface LoopAiContext {
  currentUser: User;
  books: BookListing[];
  sessions: MentoringSession[];
  redemptions: any[];
  checkFreebieAvailable: (userId: string, category: 'snack' | 'legend_combo') => { available: boolean; reason: string };
}

// Pre-defined high-quality practice quizzes for STEM subjects
export const PRACTICE_QUIZZES: Record<string, LoopAiQuizQuestion[]> = {
  trigonometry: [
    {
      id: 'quiz-trig-1',
      question: 'A vertical tower stands on a horizontal plane. From a point on the ground 20 m away from the foot of the tower, the angle of elevation of the top is 60°. What is the height of the tower?',
      options: ['10 m', '20 m', '20√3 m (~34.6 m)', '40 m'],
      correctIndex: 2,
      explanation: 'Using right triangle trigonometry: tan(60°) = Height / Distance. Since tan(60°) = √3, Height = 20 × √3 = 20√3 m.',
    },
    {
      id: 'quiz-trig-2',
      question: 'A 6 m high pole casts a shadow of 2√3 m on the ground. What is the angle of elevation of the sun at that moment?',
      options: ['30°', '45°', '60°', '90°'],
      correctIndex: 2,
      explanation: 'tan(θ) = Opposite / Adjacent = 6 / (2√3) = 3 / √3 = √3. Since tan(60°) = √3, the sun\'s elevation is 60°.',
    },
    {
      id: 'quiz-trig-3',
      question: 'An observer 1.5 m tall stands 28.5 m away from a chimney. The angle of elevation of the top of the chimney from her eye is 45°. What is the total height of the chimney?',
      options: ['27 m', '28.5 m', '30 m', '31.5 m'],
      correctIndex: 2,
      explanation: 'Let h be height above eye level: tan(45°) = h / 28.5 => h = 28.5 m. Total chimney height = 28.5 m + 1.5 m = 30 m.',
    },
  ],
  physics: [
    {
      id: 'quiz-phys-1',
      question: 'According to Newton\'s Second Law of Motion, force is proportional to:',
      options: ['Rate of change of velocity', 'Rate of change of momentum', 'Rate of change of kinetic energy', 'Mass times velocity squared'],
      correctIndex: 1,
      explanation: 'Newton\'s Second Law states that the rate of change of momentum of a body is directly proportional to the applied force.',
    },
    {
      id: 'quiz-phys-2',
      question: 'A ray of light traveling from glass (n = 1.5) into air bends:',
      options: ['Towards the normal', 'Away from the normal', 'Does not bend', 'Reflects 100% at all angles'],
      correctIndex: 1,
      explanation: 'When light travels from an optically denser medium to a rarer medium, it speeds up and bends away from the normal.',
    },
  ],
};

/**
 * Perform exact database searches across active CampusLoop data.
 */
export function searchBooksInStore(query: string, books: BookListing[]): BookListing[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return books.filter((b) => {
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.grade.toLowerCase().includes(q) ||
      (q.includes('sharma') && b.title.toLowerCase().includes('sharma')) ||
      (q.includes('verma') && b.title.toLowerCase().includes('verma')) ||
      (q.includes('oswaal') && b.title.toLowerCase().includes('oswaal')) ||
      (q.includes('math') && b.subject.toLowerCase().includes('math')) ||
      (q.includes('physic') && b.subject.toLowerCase().includes('physic'))
    );
  });
}

/**
 * Find verified mentors in active users.
 */
export function findVerifiedMentors(users: Record<string, User>, subjectQuery?: string): User[] {
  const mentors = Object.values(users).filter((u) => u.isVerifiedMentor);
  if (!subjectQuery) return mentors;
  const sq = subjectQuery.toLowerCase();
  return mentors.filter((m) =>
    (m.mentorSubjects || []).some((s) => s.toLowerCase().includes(sq))
  );
}

/**
 * Calculate user wallet status and exact distance to milestones (e.g., 10,000 CR Tech Vault).
 */
export function calculateWalletMilestone(credits: number) {
  const tierInfo = getUserTier(credits);
  const targetThreshold = 10000;
  const creditsNeededForTechVault = Math.max(0, targetThreshold - credits);
  const progressToVault = Math.min(100, Math.round((credits / targetThreshold) * 100));

  let creditsToNextTier = 0;
  let nextTierName = 'Legend';
  if (tierInfo.nextThreshold) {
    creditsToNextTier = Math.max(0, tierInfo.nextThreshold - credits);
  }

  return {
    credits,
    tier: tierInfo.tier,
    nextThreshold: tierInfo.nextThreshold || 10000,
    creditsNeeded: creditsToNextTier,
    creditsNeededForTechVault,
    milestoneName: credits >= 10000 ? '10,000 CR Tech Vault Unlocked' : '10,000 CR Tech Vault (Laptop & iPad Eligibility)',
    progressPercentage: progressToVault,
  };
}

/**
 * Determine canteen freebie eligibility and quota description.
 */
export function evaluateCanteenBenefits(
  user: User,
  checkFreebieAvailable: (userId: string, category: 'snack' | 'legend_combo') => { available: boolean; reason: string }
) {
  const tierInfo = getUserTier(user.credits);
  const snackCheck = checkFreebieAvailable(user.id, 'snack');
  const comboCheck = checkFreebieAvailable(user.id, 'legend_combo');

  let perkSummary = '';
  switch (tierInfo.tier) {
    case 'Starter':
      perkSummary = 'No free snacks in Starter tier. Reach 500 CR (Bronze) to unlock 1 free snack/month.';
      break;
    case 'Bronze':
      perkSummary = 'Bronze Tier: 1 complimentary canteen snack per month.';
      break;
    case 'Silver':
      perkSummary = 'Silver Tier: 2 complimentary canteen snacks per month.';
      break;
    case 'Gold':
      perkSummary = 'Gold Tier: 1 complimentary canteen snack per week.';
      break;
    case 'Diamond':
      perkSummary = 'Diamond Tier: 1 complimentary canteen snack per week + express counter priority.';
      break;
    case 'Legend':
      perkSummary = 'Legend Tier: 1 complimentary snack/week + 1 Welcome Feast Sandwich-and-Juice Combo!';
      break;
  }

  return {
    tier: tierInfo.tier,
    eligible: snackCheck.available || comboCheck.available,
    reason: snackCheck.available
      ? '1 complimentary snack is available to claim now!'
      : comboCheck.available
      ? 'Welcome Sandwich & Juice combo is available to claim!'
      : snackCheck.reason,
    perkSummary,
    freebieTitle: snackCheck.available
      ? 'Crispy Veg Samosas or Canteen Snack'
      : comboCheck.available
      ? 'Legend Welcome Sandwich & Juice Combo'
      : undefined,
  };
}

/**
 * Detect client-side intent and construct rich action cards based on authentic data.
 */
export function buildActionCardsForQuery(
  query: string,
  context: LoopAiContext,
  users: Record<string, User>
): LoopAiActionCard[] {
  const q = query.toLowerCase();
  const cards: LoopAiActionCard[] = [];

  // 1. Books Search Intent
  if (
    q.includes('book') ||
    q.includes('sharma') ||
    q.includes('verma') ||
    q.includes('oswaal') ||
    q.includes('read') ||
    q.includes('textbook') ||
    q.includes('find') && (q.includes('class 10') || q.includes('grade 10'))
  ) {
    const matches = searchBooksInStore(query, context.books);
    if (matches.length > 0) {
      matches.slice(0, 2).forEach((book) => {
        cards.push({
          type: 'book',
          title: `Book Match: ${book.title}`,
          description: `Listed by ${book.ownerName} • Condition: ${book.condition} • Status: ${book.status}`,
          bookData: book,
        });
      });
    }
  }

  // 2. Mentoring Request / Help Intent
  if (
    q.includes('trigonometry') ||
    q.includes('mentor') ||
    q.includes('tutoring') ||
    q.includes('help') && (q.includes('math') || q.includes('physics') || q.includes('tomorrow') || q.includes('lunch'))
  ) {
    const rohan = users['rohan'];
    if (rohan && rohan.isVerifiedMentor) {
      // Create a draft request card with explicit details
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      cards.push({
        type: 'draft_mentoring',
        title: 'Draft Mentoring Request (Confirmation Required)',
        description: 'Review the details below. Junior peer mentoring sessions are 100% free of charge (0 CR cost).',
        draftMentoringData: {
          mentorId: rohan.id,
          mentorName: rohan.name,
          subject: 'Mathematics',
          topic: q.includes('trig') ? 'Applications of Trigonometry' : 'General Mathematics & Physics Help',
          date: dateStr,
          time: '12:30', // lunch time
          grade: context.currentUser.grade || 'Grade 10',
          description: '1-on-1 problem walkthrough and doubt clearing.',
        },
      });

      // Also attach mentor profile card
      cards.push({
        type: 'mentor',
        title: `Verified Mentor: ${rohan.name}`,
        mentorData: {
          id: rohan.id,
          name: rohan.name,
          avatar: rohan.avatar,
          grade: rohan.grade,
          subjects: rohan.mentorSubjects || ['Mathematics', 'Physics'],
          rating: 4.9,
          completedSessions: 18,
        },
      });
    }
  }

  // 3. Wallet / Milestone / Laptop Reward Intent
  if (
    q.includes('credit') ||
    q.includes('wallet') ||
    q.includes('laptop') ||
    q.includes('reward') ||
    q.includes('milestone') ||
    q.includes('vault') ||
    q.includes('10000') ||
    q.includes('10,000')
  ) {
    const wallet = calculateWalletMilestone(context.currentUser.credits);
    cards.push({
      type: 'wallet',
      title: 'Current Wallet & Reward Progress',
      walletData: wallet,
    });
  }

  // 4. Canteen Freebies & Perks Intent
  if (
    q.includes('canteen') ||
    q.includes('snack') ||
    q.includes('freebie') ||
    q.includes('food') ||
    q.includes('lunch') && q.includes('canteen')
  ) {
    const canteen = evaluateCanteenBenefits(context.currentUser, context.checkFreebieAvailable);
    cards.push({
      type: 'canteen',
      title: 'Campus Canteen Benefits',
      canteenData: canteen,
    });
  }

  // 5. Practice Quiz Intent
  if (
    q.includes('quiz') ||
    q.includes('practice') ||
    q.includes('test') ||
    q.includes('questions')
  ) {
    const questions = q.includes('physic') ? PRACTICE_QUIZZES.physics : PRACTICE_QUIZZES.trigonometry;
    cards.push({
      type: 'quiz',
      title: 'Interactive Practice Quiz: Applications of Trigonometry',
      quizData: {
        topic: 'Applications of Trigonometry',
        subject: 'Mathematics',
        questions,
      },
    });
  }

  // 6. Upcoming Sessions Intent
  if (
    q.includes('upcoming') ||
    q.includes('my session') ||
    q.includes('schedule')
  ) {
    const userSessions = context.sessions.filter(
      (s) => (s.studentId === context.currentUser.id || s.mentorId === context.currentUser.id) && s.status !== 'completed'
    );
    if (userSessions.length > 0) {
      userSessions.forEach((s) => {
        cards.push({
          type: 'session',
          title: `Upcoming Session: ${s.topic}`,
          sessionData: s,
        });
      });
    }
  }

  return cards;
}

/**
 * Dispatch query to server endpoint `/api/loop-ai` with robust session auth and fallback.
 */
export async function sendLoopAiQuery(
  message: string,
  context: LoopAiContext,
  users: Record<string, User>
): Promise<LoopAiMessage> {
  const cards = buildActionCardsForQuery(message, context, users);

  try {
    const res = await fetch('/api/loop-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        auth: {
          userId: context.currentUser.id,
          userName: context.currentUser.name,
          grade: context.currentUser.grade,
          credits: context.currentUser.credits,
          roles: context.currentUser.roles,
          isVerifiedMentor: context.currentUser.isVerifiedMentor,
        },
        clientIntentCards: cards,
      }),
    });

    if (res.status === 429) {
      const data = await res.json();
      return {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        status: 'rate_limited',
        text: data.reply || 'You have exceeded the request limit for this minute. Please wait a moment before asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCards: [
          {
            type: 'navigation',
            navigationData: [
              { label: 'Browse Book Exchange', tab: 'books', description: 'Find textbooks shared by campus peers.' },
              { label: 'Find Verified Mentors', tab: 'mentoring', description: 'Schedule 1-on-1 tutoring sessions.' },
              { label: 'View Credit Ledger', tab: 'wallet', description: 'Check your balance and transaction history.' },
            ],
          },
        ],
      };
    }

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();

    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      status: data.status || 'live',
      text: data.reply,
      thoughtProcess: data.thoughtProcess,
      model: data.model,
      offlineReason: data.offlineReason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCards: data.actionCards && data.actionCards.length > 0 ? data.actionCards : cards,
    };
  } catch (err: any) {
    console.warn('Loop AI server request failed, handling offline mode:', err);
    // Offline mode: do NOT present fake canned AI responses as live AI!
    // Instead, clearly state offline status and present accurate system database results and navigation shortcuts.
    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      status: cards.length > 0 ? 'system_direct' : 'offline',
      text:
        cards.length > 0
          ? `**System Database Result**\n\nThe live Gemini AI service is currently unreachable. Below are the verified CampusLoop database results matching your query:`
          : `**AI Assistant Offline**\n\nThe live Gemini AI service is currently unavailable. You can continue using CampusLoop with the navigation shortcuts below:`,
      offlineReason: 'Backend Gemini connection unavailable.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCards:
        cards.length > 0
          ? cards
          : [
              {
                type: 'navigation',
                navigationData: [
                  { label: 'Browse Books', tab: 'books' },
                  { label: 'Peer Mentoring', tab: 'mentoring' },
                  { label: 'My Wallet', tab: 'wallet' },
                  { label: 'Canteen Rewards', tab: 'rewards' },
                ],
              },
            ],
    };
  }
}
