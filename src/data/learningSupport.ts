import type { LearningPlanDraft, MentoringSession, ResponseMode, SupportNeed } from '../types';

export const SUPPORT_OPTIONS: { id: SupportNeed; label: string; description: string }[] = [
  { id: 'memory', label: 'Remembering and revisiting', description: 'Keep useful reminders and revisit familiar steps.' },
  { id: 'processing', label: 'Time to process', description: 'Use smaller steps and allow time before responding.' },
  { id: 'reading', label: 'Reading and understanding', description: 'Choose accessible formats and clarify unfamiliar words.' },
  { id: 'communication', label: 'Ways to communicate', description: 'Choose how to respond, ask for help, or take a pause.' },
  { id: 'energy', label: 'Flexible energy and pacing', description: 'Agree shorter activities, rest, or an earlier finish as preferred.' },
  { id: 'motor', label: 'Writing and physical access', description: 'Choose ways to use materials without unnecessary movement or handwriting.' },
];

export const RESPONSE_OPTIONS: { id: ResponseMode; label: string }[] = [
  { id: 'spoken', label: 'Spoken response' },
  { id: 'typed', label: 'Typed response' },
  { id: 'pointing', label: 'Pointing or selecting' },
  { id: 'demonstration', label: 'Demonstration' },
];

export const TEACHING_SOURCES: { title: string; url: string; region: string }[] = [
  {
    title: 'EEF: Five a day — teaching pupils with SEND',
    url: 'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/supporting-high-quality-teaching-for-pupils-with-send',
    region: 'England, UK',
  },
  { title: 'CAST: Universal Design for Learning Guidelines 3.0', url: 'https://udlguidelines.cast.org/', region: 'United States' },
];

const NEED_STRATEGIES: Record<SupportNeed, string> = {
  memory: 'Keep an accessible step list, familiar cue or organiser available. Revisit a useful step at the start and end; allow recognition and cued recall.',
  processing: 'Present one instruction at a time, pause for the learner to process it, and check understanding before adding another step. Avoid speed targets.',
  reading: 'Clarify key words in plain language. Offer text, read-aloud/audio, descriptions or objects according to access preferences; pictures are optional, not assumed accessible.',
  communication: 'Agree how the learner will indicate a choice, uncertainty, help or a pause. Accept their preferred communication, including their usual communication aid, and allow response time.',
  energy: 'Offer shorter activity blocks, rest or stopping early when requested. The chosen timing is a flexible preference, not a medical recommendation; follow existing professional advice.',
  motor: 'Offer accessible controls, usual assistive tools or a partner to handle materials at the learner’s direction. Do not make handwriting speed or fine motor performance the learning target.',
};

const NEED_ACTIVITY: Record<SupportNeed, string> = {
  memory: 'Keep the chosen reminder available.',
  processing: 'Pause between individual steps.',
  reading: 'Use the learner’s accessible reading or listening format.',
  communication: 'Keep the agreed help/pause signal available.',
  energy: 'Check whether to rest or finish earlier.',
  motor: 'Adapt handling and response controls as agreed.',
};

const RESPONSE_ACTIONS: Record<ResponseMode, string> = {
  spoken: 'Invite a spoken explanation or short answer, with a communication aid if preferred.',
  typed: 'Invite a typed answer using the learner’s usual accessible input tools.',
  pointing: 'Offer meaningful choices that the learner can indicate by pointing or their usual selection method; do not assume visual access.',
  demonstration: 'Invite a demonstration, including directing a partner or using accessible materials rather than requiring a particular movement.',
};

// These are authored starter exercises, not an accredited curriculum. Topic
// recognition never selects an ability level or overrides the learner's goal.
function starterTasks(topic: string) {
  const normalized = topic.toLowerCase();
  if (/\btrigonometry\b/.test(normalized)) {
    return {
      model: 'Worked starter: a vertical tower on level ground is viewed from 20 m away at an elevation angle of 60°. tan(60°) = h/20, so h = 20√3 m (about 34.6 m). Identify height as the opposite side and ground distance as adjacent.',
      guided: 'Guided task: use the same tower setup with a ground distance of 10 m and an angle of 60°. Prompt side labels, then h = 10 × tan(60°) = 10√3 m (about 17.3 m). Check the units together.',
      recap: 'Recap choice: repeat either tower task with the same cues, or try a distance of 12 m at 45°: h = 12 × tan(45°) = 12 m. Recognising or indicating the useful sides can meet the agreed goal.',
      materials: 'Tower/ground example with a right-angle triangle in an accessible format; verbal or tactile side labels if useful; tan(45°) = 1 and tan(60°) = √3 reminder; optional calculator.',
    };
  }
  if (/\bkinematics\b|\bfree fall\b|\blaws of motion\b/.test(normalized)) {
    return {
      model: 'Worked starter: a ball falls from rest through 20 m. Ignore air resistance and use g = 10 m/s². v² = u² + 2gh = 0 + 2 × 10 × 20 = 400, so its speed is 20 m/s, moving downward. This is a paper calculation, not a dropping experiment.',
      guided: 'Guided task: change the falling distance to 5 m, keeping u = 0 and g = 10 m/s². Identify the quantities, then v² = 2 × 10 × 5 = 100 and speed = 10 m/s. Explain the square-root step together.',
      recap: 'Recap choice: revisit the 20 m or 5 m calculation with cues, or use 45 m: v² = 900 and speed = 30 m/s downward. Naming a quantity, choosing a unit or following a familiar step can meet the agreed goal.',
      materials: 'Accessible description of a falling ball; quantity and unit list for u, v, g and h; formula v² = u² + 2gh; worked calculations and optional calculator. No practical dropping activity is needed.',
    };
  }
  if (normalized === 'general science' || /\bohm(?:[’']s|s)?\b/.test(normalized)) {
    return {
      model: 'Worked starter: for an ohmic resistor at constant temperature, V = I × R. With current I = 2 A and resistance R = 3 Ω, voltage V = 2 × 3 = 6 V. Explain the meaning and unit of each quantity.',
      guided: 'Guided task: use I = 0.5 A and R = 8 Ω. Match the symbols to their quantities, then V = 0.5 × 8 = 4 V. Use a calculator or supported multiplication if helpful.',
      recap: 'Recap choice: repeat a familiar V = I × R example, or use I = 1.5 A and R = 4 Ω to obtain 6 V. Identifying a symbol or selecting the voltage unit can meet the agreed goal.',
      materials: 'Accessible symbol/meaning/unit list for V, I and R; V = I × R reminder; the worked numeric examples and optional calculator. These are calculations, not instructions to build a circuit.',
    };
  }
  return {
    model: 'Mentor supplies a teacher-aligned worked example for this topic and checks its suitability with the learner. Show one manageable step, its reasoning and a checked answer before asking for a response.',
    guided: 'Mentor supplies a similar teacher-aligned task with a checked solution. Practise its familiar step together, using the amount of prompting agreed with the learner.',
    recap: 'Revisit the same teacher-aligned example or a teacher-checked small variation. Let the learner choose repetition, supported participation or another attempt in line with their goal.',
    materials: 'Mentor must supply a teacher-aligned worked example, correct reasoning and answer, a similar task and an optional recap task. No subject-specific exercise is automatically provided for this topic.',
  };
}

function deliverySuggestion(session: MentoringSession): string {
  if (session.classMode === 'online') {
    return 'Online: agree an accessible meeting platform and shared formats; check captions, descriptions and response tools with the learner. CampusLoop does not provide video calling or captions.';
  }
  if (session.classMode === 'offline') {
    return 'Offline: agree an accessible meeting space, desk and materials, with room for the learner’s preferred communication or input tools. Check access and positioning with the learner.';
  }
  return 'Agree whether delivery is online or offline, then check the meeting arrangements and materials with the learner before use.';
}

function reviewDateFor(sessionDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
    const candidate = new Date(`${sessionDate}T12:00:00Z`);
    if (!Number.isNaN(candidate.getTime()) && candidate.toISOString().slice(0, 10) === sessionDate) return sessionDate;
  }
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Deterministic local planning scaffold. Learner text is retained as plain data;
 * diagnoses are neither requested nor used to infer skills, pacing or outcomes.
 * The mentor and learner edit and agree this draft before use.
 */
export function createLearningPlanDraft(session: MentoringSession): LearningPlanDraft {
  const support = session.learningSupport;
  const topic = session.topic.trim().slice(0, 120) || 'the chosen topic';
  const grade = session.grade.trim().slice(0, 60) || 'the agreed curriculum level';
  const goal = support?.goal.trim() || `Agree a goal for ${topic}: learning, maintaining a skill or participating.`;
  const strengths = support?.strengths.trim() || 'Ask the learner about interests, strengths and what already helps.';
  const responseMode = RESPONSE_OPTIONS.some((option) => option.id === support?.responseMode)
    ? support!.responseMode : 'spoken';
  const needs = SUPPORT_OPTIONS.filter((option) => support?.needs.includes(option.id)).map((option) => option.id);
  const minutes = support?.sessionMinutes ?? 30;
  const breakEvery = support?.breakEveryMinutes ?? 0;
  const pacing = breakEvery > 0
    ? `Preferred session length: ${minutes} minutes, with a rest check about every ${breakEvery} minutes. Agree changes or breaks at any time.`
    : `Preferred session length: ${minutes} minutes. No fixed break interval is selected; agree breaks or an earlier finish at any time.`;
  const responseAction = RESPONSE_ACTIONS[responseMode];
  const adjustments = needs.map((need) => NEED_ACTIVITY[need]).join(' ');
  const tasks = starterTasks(topic);
  const strategies = [
    'Model one step, practise together, then offer an independent attempt if useful to the learner. Keep, adapt or restore support whenever it helps.',
    'Agree what meeting the goal looks like. Maintaining a skill, practising or participating are valid outcomes; a higher quiz score is not required.',
    `${responseAction} The learner may change response mode.`,
    pacing,
    deliverySuggestion(session),
    ...needs.map((need) => NEED_STRATEGIES[need]),
  ];

  return {
    goal,
    strengths,
    startingPoint: `For ${topic} (${grade}), ask the learner to choose a familiar example and describe or show what already works. Agree one manageable next activity without inferring ability from a diagnosis or grade.`,
    strategies,
    lessons: [
      {
        title: '1. Connect and model',
        objective: `Choose one manageable ${topic} task linked to the learner’s goal and notice a useful step.`,
        activities: `Check this starter fits the learner’s goal and interests; adapt it with the teacher as needed. ${tasks.model} The learner can observe or join in. ${responseAction} ${adjustments}`.trim(),
        evidence: 'Record the example chosen, a response or observation the learner wishes to share, and which supports helped. Ask whether the task and pace felt suitable; do not assume a lack of speech means a lack of understanding.',
      },
      {
        title: '2. Practise together',
        objective: `Practise or maintain the chosen ${topic} step with the amount of support the learner wants.`,
        activities: `${tasks.guided} Give one prompt at a time and specific feedback. Offer an independent attempt only by agreement; keep support available. ${responseAction} ${adjustments}`.trim(),
        evidence: 'Note the step attempted, the support used and the learner’s feedback. Compare with the agreed goal, including participation or maintenance; record uncertainty and adapt the next activity without ranking the learner.',
      },
      {
        title: '3. Recap and consolidate',
        objective: `Revisit ${topic} in a familiar or learner-chosen example and agree whether to repeat, pause or try a variation.`,
        activities: `${tasks.recap} ${responseAction} ${adjustments} Agree what to keep or change at the review.`.trim(),
        evidence: 'Record what the learner chooses to show, any useful reminder, and their preferred next step. Repetition, supported participation and maintaining an existing skill can meet the goal. Record observations without promising future improvement.',
      },
    ],
    materials: `Connect the example to the learner’s reported strengths/interests: ${strengths}. ${tasks.materials} Agree text, audio, description, object/tactile or visual formats; provide alternatives to images and audio. Use the learner’s usual accessible tools.`,
    responseMode,
    reviewDate: reviewDateFor(session.date),
    teacherGuidance: 'Editable teaching draft, not an assessment, diagnosis, treatment plan or formal IEP. Agree goals, access, timing and success criteria with the learner and teacher; respect existing school and professional recommendations. These three lessons are a suggested sequence, not a fixed timetable. Revisit supports as needs change. The review date initially matches the session date and can be changed. No diagnosis is required and no learning outcome is guaranteed.',
  };
}
