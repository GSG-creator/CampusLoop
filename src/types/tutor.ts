export type ExplanationMode =
  | 'simple'
  | 'step_by_step'
  | 'visual'
  | 'example_first'
  | 'summary_30s'
  | 'detailed';

export interface EquationItem {
  equation: string;
  variables: Array<{ symbol: string; name: string; meaning: string }>;
  purpose: string;
  exampleProblem: string;
  stepByStepSolution: string[];
}

export interface DiagramItem {
  title: string;
  components: Array<{ name: string; role: string }>;
  interactions: string;
  overallProcess: string;
  diagramType?: 'force_acceleration' | 'optics_reflection' | 'trigonometry_height' | 'photosynthesis' | 'generic';
}

export interface StructuredTextbookPage {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  gradeLevel: string;
  page_summary: string;
  key_concepts: string[];
  definitions: Array<{ term: string; definition: string; simpleExplanation?: string }>;
  equations: EquationItem[];
  examples: Array<{ problem: string; solution: string }>;
  diagram_descriptions: DiagramItem[];
  student_question?: string;
  difficult_sections: string[];
  isUnreadable?: boolean;
  unreadableWarning?: string;
  uploadedImageUrl?: string;
}

export interface DifficultConceptBreakdown {
  concept: string;
  whyItIsTricky: string;
  clarifiedInSimpleWords: string;
  analogy?: string; // Clearly labeled as analogy
}

export interface PersonalizedExplanation {
  mode: ExplanationMode;
  headline: string;
  simpleWordsIntro: string[];
  difficultConceptsBreakdown: DifficultConceptBreakdown[];
  customAnswerToDoubt?: string;
  stepByStepPoints?: string[];
  visualHighlights?: string[];
  keyTakeaways: string[];
  languageNote?: string;
}

export interface VideoScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  narration: string;
  onScreenText: string;
  animationInstruction: string;
  keyEquationOrLabel?: string;
  transition: string;
}

export interface EducationalVideoPrompt {
  title: string;
  audience: string;
  subject: string;
  learningObjective: string;
  style: string;
  scenes: VideoScene[];
  keyEquationOrDiagram?: string;
  endingSummary: string;
  finalCheck: string;
  rawStructuredPromptText: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'application';

export interface QuizQuestionItem {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  conceptTested: string;
  hint?: string;
}

export interface QuizResultSummary {
  score: number;
  total: number;
  percentage: number;
  conceptStrengths: string[];
  conceptsNeedingReview: string[];
  remedialAdvice: string;
  completedAt: string;
}

export interface SavedLessonItem {
  id: string;
  savedAt: string;
  subject: string;
  chapter: string;
  topic: string;
  studentDoubt?: string;
  pageData: StructuredTextbookPage;
  explanation: PersonalizedExplanation;
  videoPrompt: EducationalVideoPrompt;
  quizResult?: QuizResultSummary;
  userNotes?: string;
}

export interface TutorAccessibilityPrefs {
  largeText: boolean;
  highContrast: boolean;
  reducedDistractions: boolean;
  stepByStepExplanations: boolean;
  shortExplanations: boolean;
  textToSpeech: boolean;
  captions: boolean;
  voiceInput: boolean;
  moreExamples: boolean;
  slowerExplanation: boolean;
  simpleLanguage: boolean;
  preferredLanguage: string;
}

export type TutorStep =
  | 'home'
  | 'scan'
  | 'analyzing'
  | 'explain'
  | 'video_prompt'
  | 'video_player'
  | 'quiz'
  | 'master'
  | 'saved_lessons'
  | 'my_quizzes';
