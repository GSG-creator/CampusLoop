import {
  BookListing,
  User,
  MentoringSession,
  LoopAiActionCard,
  LoopAiMessage,
  LoopAiQuizQuestion,
} from '../types';
import { getUserTier } from '../data/rewardData';
import { createId } from '../utils/ids';

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
      question: 'A ray of light travels from glass (n = 1.5) into air at a nonzero angle below the critical angle. It bends:',
      options: ['Towards the normal', 'Away from the normal', 'Does not bend', 'Reflects 100% at all angles'],
      correctIndex: 1,
      explanation: 'Below the critical angle, a ray entering a rarer medium bends away from the normal. At normal incidence it does not bend; above the critical angle, total internal reflection occurs.',
    },
  ],
};

/**
 * Perform exact database searches across active CampusLoop data.
 */
export function searchBooksInStore(query: string, books: BookListing[]): BookListing[] {
  if (!query.trim()) return [];
  const normalize = (value: string) => value.toLowerCase()
    .replace(/\b(?:[a-z]\.\s*){2,}/g, (initials) => initials.replace(/[.\s]/g, '') + ' ')
    .replace(/\./g, '')
    .replace(/\bclass\b/g, 'grade').replace(/\bmaths?\b/g, 'mathematics')
    .replace(/[^a-z0-9]+/g, ' ').trim();
  const ignored = new Set('a an the i me my can could would you please find search show want need looking for in on at of and to any is are do does have has there available book books textbook textbooks exchange campus'.split(' '));
  const words = normalize(query).split(' ').filter((word) => !ignored.has(word));
  const availableOnly = /\bavailable\b/i.test(query);
  return books.filter((book) => {
    if (availableOnly && book.status !== 'available') return false;
    const haystack = normalize(`${book.title} ${book.author} ${book.subject} ${book.grade} ${(book.tags || []).join(' ')}`).split(' ');
    return words.every((word) => haystack.includes(word));
  });
}

/**
 * Find verified mentors in active users.
 */
export function findVerifiedMentors(users: Record<string, User>, subjectQuery?: string): User[] {
  const mentors = Object.values(users).filter((u) => u.isVerifiedMentor === true && u.roles.includes('mentor'));
  if (!subjectQuery) return mentors;
  const sq = subjectQuery.toLowerCase().trim().replace(/^maths?$/, 'mathematics');
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
    const subject = q.includes('physic') ? 'Physics'
      : /math|trig/.test(q) ? 'Mathematics'
      : ['Chemistry', 'Biology', 'English', 'Science'].find((name) => q.includes(name.toLowerCase()));
    const mentors = findVerifiedMentors(users, subject).filter((mentor) => mentor.id !== context.currentUser.id);
    const mentor = mentors[0];
    if (mentor) {
      // Create a draft request card with explicit details
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      const draftSubject = subject || mentor.mentorSubjects?.[0] || 'Mathematics';

      if (/help|request|tutor|trig|book|schedule/.test(q)) cards.push({
        type: 'draft_mentoring',
        title: 'Draft Mentoring Request (Confirmation Required)',
        description: 'Review the details below. Junior peer mentoring sessions are 100% free of charge (0 CR cost).',
        draftMentoringData: {
          mentorId: mentor.id,
          mentorName: mentor.name,
          subject: draftSubject,
          topic: q.includes('trig') ? 'Applications of Trigonometry' : `General ${draftSubject} Help`,
          date: dateStr,
          time: '12:30', // lunch time
          grade: context.currentUser.grade || 'Grade 10',
          description: '1-on-1 problem walkthrough and doubt clearing.',
        },
      });

      // Display ratings and session counts from the local records, not seed claims.
      mentors.slice(0, 3).forEach((verifiedMentor) => {
        const completed = context.sessions.filter((session) => session.mentorId === verifiedMentor.id && session.status === 'completed');
        const ratings = completed.map((session) => session.rating).filter((rating): rating is number => typeof rating === 'number' && rating >= 1 && rating <= 5);
        cards.push({
          type: 'mentor',
          title: `Verified Mentor: ${verifiedMentor.name}`,
          mentorData: {
            id: verifiedMentor.id,
            name: verifiedMentor.name,
            avatar: verifiedMentor.avatar,
            grade: verifiedMentor.grade,
            subjects: verifiedMentor.mentorSubjects || [],
            rating: ratings.length ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length * 10) / 10 : 0,
            completedSessions: completed.length,
          },
        });
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
    const isPhysics = q.includes('physic');
    const questions = isPhysics ? PRACTICE_QUIZZES.physics : PRACTICE_QUIZZES.trigonometry;
    const topic = isPhysics ? 'Physics: Motion & Light' : 'Applications of Trigonometry';
    cards.push({
      type: 'quiz',
      title: `Interactive Practice Quiz: ${topic}`,
      quizData: {
        topic,
        subject: isPhysics ? 'Physics' : 'Mathematics',
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
      (s) => (s.studentId === context.currentUser.id || s.mentorId === context.currentUser.id)
        && (s.status === 'requested' || s.status === 'accepted')
        && new Date(`${s.date}T${s.time}`).getTime() >= Date.now()
    ).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    if (userSessions.length > 0) {
      userSessions.forEach((s) => {
        cards.push({
          type: 'session',
          title: `Upcoming Session: ${s.topic}`,
          sessionData: s,
        });
      });
    } else {
      cards.push({
        type: 'navigation',
        title: 'No upcoming sessions',
        description: 'You have no upcoming requested or accepted mentoring sessions.',
        navigationData: [{ label: 'Open Peer Mentoring', tab: 'mentoring' }],
      });
    }
  }

  return cards;
}

/**
 * Dispatch a query with explicitly untrusted demo context. Action cards remain
 * local and always use application services for any user-confirmed mutations.
 */
export async function sendLoopAiQuery(
  message: string,
  context: LoopAiContext,
  users: Record<string, User>
): Promise<LoopAiMessage> {
  const cards = buildActionCardsForQuery(message, context, users);
  const navigation: LoopAiActionCard[] = [{
    type: 'navigation',
    navigationData: [
      { label: 'Browse Books', tab: 'books' },
      { label: 'Peer Mentoring', tab: 'mentoring' },
      { label: 'My Wallet', tab: 'wallet' },
      { label: 'Canteen Rewards', tab: 'rewards' },
    ],
  }];
  const messageMeta = () => ({
    id: createId('msg'),
    sender: 'assistant' as const,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch('/api/loop-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        demoContext: {
          userName: context.currentUser.name,
          grade: context.currentUser.grade,
          credits: context.currentUser.credits,
          roles: context.currentUser.roles,
          isVerifiedMentor: context.currentUser.isVerifiedMentor,
        },
      }),
    });
    const data = await res.json();
    if (res.status === 429) {
      return {
        ...messageMeta(),
        status: 'rate_limited',
        text: typeof data?.reply === 'string' ? data.reply : 'Request limit reached. Please wait a moment before asking again.',
        actionCards: navigation,
      };
    }
    if (!res.ok || !data || !['live', 'offline', 'system_direct'].includes(data.status)
      || typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Invalid assistant response.');
    }

    const offline = data.status !== 'live';
    return {
      ...messageMeta(),
      status: offline ? (cards.length ? 'system_direct' : 'offline') : 'live',
      text: offline && cards.length
        ? '**Local Demo Results**\n\nThe live AI service is unavailable. Below are results from your current CampusLoop demo data.'
        : data.reply,
      model: typeof data.model === 'string' ? data.model : undefined,
      offlineReason: offline && typeof data.offlineReason === 'string' ? data.offlineReason : undefined,
      // Never turn provider-generated or echoed request data into executable cards.
      actionCards: cards.length ? cards : (offline ? navigation : []),
    };
  } catch {
    return {
      ...messageMeta(),
      status: cards.length > 0 ? 'system_direct' : 'offline',
      text: cards.length > 0
        ? '**Local Demo Results**\n\nThe live AI service is unreachable. Below are results from your current CampusLoop demo data.'
        : '**AI Assistant Offline**\n\nThe live AI service is unavailable. You can continue using CampusLoop with the navigation shortcuts below.',
      offlineReason: 'Backend AI connection unavailable.',
      actionCards: cards.length ? cards : navigation,
    };
  } finally {
    clearTimeout(timeout);
  }
}
