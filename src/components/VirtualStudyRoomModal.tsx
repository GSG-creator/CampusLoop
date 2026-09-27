import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { VirtualStudyRoom, StudyRoomMessage, StudyRoomWhiteboardNote, MentoringSession } from '../types';
import { STEM_ASL_GESTURES, AAC_STUDY_PROMPTS } from '../data/studyRoomData';
import { getQuizForTopic } from '../data/quizBank';
import { VirtualHandSign } from './VirtualHandSign';
import { useDialogFocus } from './useDialogFocus';
import {
  X,
  Users,
  Hand,
  MessageSquare,
  Sparkles,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Eraser,
  Trash2,
  Check,
  BookOpen,
  ArrowRight,
  Maximize2,
  Minimize2,
  Smile,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface VirtualStudyRoomModalProps {
  room: VirtualStudyRoom;
  onClose: () => void;
  onOpenFinalQuiz?: (session: MentoringSession) => void;
}

const HAND_SIGN_DESCRIPTIONS: Record<string, { desc: string; tips: string; gestureType: string }> = {
  A: { desc: 'Closed fist with thumb upright against side of index finger.', tips: 'Keep knuckles pointing forward.', gestureType: 'Fist' },
  B: { desc: 'Four fingers straight up pressed together; thumb folded flat across palm.', tips: 'Keep palm facing outward.', gestureType: 'Flat Palm' },
  C: { desc: 'Hand shaped like the letter "C" with fingers and thumb curved.', tips: 'Maintain an open semicircular profile.', gestureType: 'Curve' },
  D: { desc: 'Index finger pointing straight up; middle, ring, pinky curled touching thumb.', tips: 'Looks like lowercase "d".', gestureType: 'Point' },
  E: { desc: 'All fingertips curled tightly downward resting on top of bent thumb.', tips: 'Compact curved hand.', gestureType: 'Claw' },
  F: { desc: 'Tip of index finger touching thumb in circle; other 3 fingers spread upward.', tips: 'Similar to "OK" sign.', gestureType: 'Pinch' },
  G: { desc: 'Index finger and thumb parallel pointing horizontally to the side.', tips: 'Distance of ~1 inch between fingers.', gestureType: 'Horizontal Pinch' },
  H: { desc: 'Index and middle fingers together pointing horizontally; other fingers folded.', tips: 'Two fingers pointing sideways.', gestureType: 'Dual Point' },
  I: { desc: 'Pinky finger straight up; all other fingers closed into a fist with thumb over.', tips: 'Only the smallest finger extended.', gestureType: 'Pinky' },
  J: { desc: 'Start with letter "I" (pinky up) and trace letter "J" hook in the air.', tips: 'Rotate wrist outward in a hook.', gestureType: 'Motion Trace' },
  K: { desc: 'Index finger up, middle finger forward at 90°, thumb nestled between them.', tips: 'Forms a V with thumb support.', gestureType: 'V-Hand' },
  L: { desc: 'Index finger straight up, thumb extended horizontally forming a 90° "L".', tips: 'Right angle shape.', gestureType: 'L-Shape' },
  M: { desc: 'Thumb tucked under first three fingers (index, middle, ring).', tips: 'Three knuckles resting over thumb.', gestureType: 'Fist Tuck' },
  N: { desc: 'Thumb tucked under first two fingers (index, middle).', tips: 'Two knuckles resting over thumb.', gestureType: 'Fist Tuck' },
  O: { desc: 'All fingertips meet thumb tip forming an "O" circular ring.', tips: 'Round silhouette.', gestureType: 'Full Ring' },
  P: { desc: 'Letter "K" inverted pointing downward with index pointing down.', tips: 'Down-turned finger sign.', gestureType: 'Inverted' },
  Q: { desc: 'Letter "G" directed downward toward the ground.', tips: 'Thumb and index pointing down.', gestureType: 'Inverted Pinch' },
  R: { desc: 'Index and middle fingers crossed tightly (like wishing for luck).', tips: 'Crossing fingers gesture.', gestureType: 'Crossed' },
  S: { desc: 'Closed tight fist with thumb wrapped across front of all knuckles.', tips: 'Different from "A" where thumb is beside.', gestureType: 'Front Fist' },
  T: { desc: 'Thumb tucked between index and middle fingers.', tips: 'One knuckle over thumb.', gestureType: 'Fist Tuck' },
  U: { desc: 'Index and middle fingers held together pointing straight up.', tips: 'Two fingers tight together.', gestureType: 'Double Up' },
  V: { desc: 'Index and middle fingers spread apart forming a "V" peace sign.', tips: 'Classic peace/victory sign.', gestureType: 'V-Spread' },
  W: { desc: 'Index, middle, and ring fingers spread upward like letter "W".', tips: 'Three fingers upright.', gestureType: 'Three-Spread' },
  X: { desc: 'Index finger bent into a hook; other fingers folded in fist.', tips: 'Captain Hook shape.', gestureType: 'Hook' },
  Y: { desc: 'Thumb and pinky extended wide; middle three fingers curled in palm.', tips: 'Hang-loose "shaka" shape.', gestureType: 'Shaka' },
  Z: { desc: 'Index finger draws a "Z" in the air with three crisp strokes.', tips: 'Dynamic zigzag trace.', gestureType: 'Motion Trace' },
  '0': { desc: 'O-ring with all fingers touching thumb.', tips: 'Zero oval.', gestureType: 'Ring' },
  '1': { desc: 'Single index finger pointing up.', tips: 'Number one.', gestureType: 'Number' },
  '2': { desc: 'Index and middle finger up.', tips: 'Number two.', gestureType: 'Number' },
  '3': { desc: 'Thumb, index, and middle fingers up.', tips: 'ASL three includes thumb.', gestureType: 'Number' },
  '4': { desc: 'Four fingers up, thumb tucked across palm.', tips: 'Number four.', gestureType: 'Number' },
  '5': { desc: 'All five fingers spread wide open.', tips: 'High-five open hand.', gestureType: 'Number' },
};

export const VirtualStudyRoomModal: React.FC<VirtualStudyRoomModalProps> = ({
  room,
  onClose,
  onOpenFinalQuiz,
}) => {
  const {
    currentUser,
    sessions,
    finishMentoringSession,
    sendStudyRoomMessage,
    addStudyRoomWhiteboardNote,
    clearStudyRoomWhiteboard,
    toggleStudyRoomHandRaise,
  } = useApp();

  const {
    startCaptions,
    isCaptionsActive,
    triggerVisualAlert,
  } = useAccessibility();
  const dialogRef = useDialogFocus(onClose);
  const explanationRequest = useRef<AbortController | null>(null);
  const [actionError, setActionError] = useState('');
  useEffect(() => () => { explanationRequest.current?.abort(); }, []);

  // Active workspace tab
  const [workspaceTab, setWorkspaceTab] = useState<'asl' | 'whiteboard' | 'practice'>('asl');
  
  // Media / accessibility states
  const [isAslModeActive, setIsAslModeActive] = useState(room.mode === 'asl_supported');
  const isHandRaised = room.participants.some(participant => participant.id === currentUser.id && participant.isHandRaised);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Chat input
  const [chatInput, setChatInput] = useState('');
  const [sendWithAsl, setSendWithAsl] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ASL Fingerspelling Engine
  const [spellingWord, setSpellingWord] = useState<string>(room.topic.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32) || 'STUDY');
  const [letterIndex, setLetterIndex] = useState<number>(0);
  const [isSpellingPlaying, setIsSpellingPlaying] = useState<boolean>(false);
  const [activeGesture, setActiveGesture] = useState<any>(STEM_ASL_GESTURES[0]);

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasTool, setCanvasTool] = useState<'pen' | 'eraser'>('pen');
  const [canvasTheme, setCanvasTheme] = useState<'chalkboard' | 'whiteboard'>('chalkboard');
  const [newStickyText, setNewStickyText] = useState('');
  const [stickyType, setStickyType] = useState<'concept' | 'formula' | 'doubt' | 'solution'>('doubt');

  // AI Concept Explainer state
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Diagnostic Quiz practice
  const practiceQuestions = getQuizForTopic(`${room.subject} ${room.topic}`);
  const [selectedPracticeAnswers, setSelectedPracticeAnswers] = useState<Record<number, number>>({});
  const [showPracticeExplanations, setShowPracticeExplanations] = useState<Record<number, boolean>>({});

  // Linked mentoring session
  const linkedSession = sessions.find(
    (s) => s.id === room.sessionId &&
      (s.studentId === currentUser.id || s.mentorId === currentUser.id || currentUser.roles.includes('admin'))
  );

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.messages]);

  // ASL Playback Loop
  useEffect(() => {
    let timer: any = null;
    if (isSpellingPlaying) {
      const sanitized = spellingWord.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      if (sanitized.length > 0) {
        timer = setInterval(() => {
          setLetterIndex((prev) => {
            if (prev >= sanitized.length - 1) {
              setIsSpellingPlaying(false);
              return 0;
            }
            return prev + 1;
          });
        }, 1200);
      }
    }
    return () => clearInterval(timer);
  }, [isSpellingPlaying, spellingWord]);

  // Whiteboard drawing handlers
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;
    canvas.setPointerCapture?.(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;
    ctx.globalCompositeOperation = canvasTool === 'eraser' ? 'destination-out' : 'source-over';

    ctx.lineWidth = canvasTool === 'eraser' ? 24 : 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle =
      canvasTool === 'eraser'
        ? canvasTheme === 'chalkboard'
          ? '#134e4a'
          : '#ffffff'
        : canvasTheme === 'chalkboard'
        ? '#fef08a'
        : '#4338ca';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawTemplate = (templateType: 'triangle' | 'elevation' | 'table') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    ctx.globalCompositeOperation = 'source-over';
    const isDark = canvasTheme === 'chalkboard';
    ctx.strokeStyle = isDark ? '#fef08a' : '#4338ca';
    ctx.fillStyle = isDark ? '#fef08a' : '#312e81';
    ctx.font = '13px monospace';
    ctx.lineWidth = 2.5;

    if (templateType === 'triangle') {
      // Right triangle
      ctx.beginPath();
      ctx.moveTo(80, 220); // Base left
      ctx.lineTo(320, 220); // Base right
      ctx.lineTo(320, 50); // Height top
      ctx.closePath();
      ctx.stroke();

      // Right angle marker
      ctx.strokeRect(300, 200, 20, 20);

      // Labels
      ctx.fillText('A (Observer)', 40, 240);
      ctx.fillText('B (Right Angle)', 320, 240);
      ctx.fillText('C (Tower Top)', 320, 40);
      ctx.fillText('Hypotenuse (Line of Sight)', 130, 110);
      ctx.fillText('Adjacent (Base = 20 m)', 160, 240);
      ctx.fillText('Opposite (Height = h)', 335, 140);
      ctx.fillText('θ = 60°', 110, 210);
    } else if (templateType === 'elevation') {
      // Observer & tower
      ctx.strokeRect(300, 40, 30, 180); // Tower
      ctx.beginPath();
      ctx.arc(80, 200, 12, 0, Math.PI * 2); // Observer
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(80, 200);
      ctx.lineTo(300, 40); // Line of sight
      ctx.moveTo(80, 220);
      ctx.lineTo(300, 220); // Ground
      ctx.stroke();
      ctx.fillText('Angle of Elevation = 60°', 110, 180);
      ctx.fillText('Ground Distance = 20m', 150, 240);
      ctx.fillText('tan(60°) = h / 20', 345, 120);
      ctx.fillText('=> h = 20√3 m', 345, 140);
    } else if (templateType === 'table') {
      ctx.fillText('TRIGONOMETRY RATIOS TABLE', 80, 40);
      ctx.fillText('Ratio   | 0°   | 30°    | 45°   | 60°    | 90°', 80, 80);
      ctx.fillText('--------+------+--------+-------+--------+-----', 80, 95);
      ctx.fillText('sin(θ)  | 0    | 1/2    | 1/√2  | √3/2   | 1', 80, 120);
      ctx.fillText('cos(θ)  | 1    | √3/2   | 1/√2  | 1/2    | 0', 80, 150);
      ctx.fillText('tan(θ)  | 0    | 1/√3   | 1     | √3     | undef', 80, 180);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const result = sendStudyRoomMessage(room.id, chatInput, {
      isAslSigned: sendWithAsl,
      gestureTag: sendWithAsl ? 'Fingerspelling preview' : undefined,
    });
    if (!result.success) { setActionError('Message was not sent. Rejoin an active room and try again.'); return; }
    setActionError('');

    if (sendWithAsl) {
      setSpellingWord(chatInput.toUpperCase().slice(0, 20));
      setLetterIndex(0);
      setIsSpellingPlaying(true);
    }

    setChatInput('');
  };

  const handleQuickAACPrompt = (prompt: (typeof AAC_STUDY_PROMPTS)[0]) => {
    const result = sendStudyRoomMessage(room.id, prompt.text, {
      isAslSigned: true,
      gestureTag: prompt.gesture,
      aacQuickChip: true,
    });
    if (!result.success) { setActionError('Message was not sent. Rejoin an active room and try again.'); return; }
    setActionError('');
    setSpellingWord(prompt.gesture);
    setLetterIndex(0);
    setIsSpellingPlaying(true);
  };

  const handleToggleHandRaise = () => {
    const newState = toggleStudyRoomHandRaise(room.id);
    if (newState) {
      triggerVisualAlert(
        'info',
        `${currentUser.name} raised their hand with a question in the study room.`
      );
    }
  };

  const handleAddStickyNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStickyText.trim()) return;
    addStudyRoomWhiteboardNote(room.id, {
      text: newStickyText.trim(),
      type: stickyType,
    });
    setNewStickyText('');
  };

  const handleExplainConcept = async () => {
    explanationRequest.current?.abort();
    const controller = new AbortController();
    explanationRequest.current = controller;
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/loop-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ message: `Explain the topic ${room.topic} in ${room.subject} for ${room.grade}. Use short steps and a checked worked example.` }),
      });
      const result = await response.json();
      if (!controller.signal.aborted) {
        setAiExplanation(response.ok && result.status === 'live' && typeof result.reply === 'string'
          ? result.reply : 'Live AI explanation is unavailable. Ask your mentor or open LOOP AI for local study suggestions.');
      }
    } catch {
      if (!controller.signal.aborted) setAiExplanation('Could not load an explanation. Please try again later.');
    } finally {
      if (!controller.signal.aborted) setIsAiLoading(false);
    }
  };

  // Text to speech playback
  const speakMessage = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sanitizedLetters = spellingWord.replace(/[^A-Z0-9]/gi, '').toUpperCase().split('');
  const currentLetter = sanitizedLetters[letterIndex] || sanitizedLetters[0] || 'A';
  const letterDetail = HAND_SIGN_DESCRIPTIONS[currentLetter] || {
    desc: `Form sign gesture for ${currentLetter}`,
    tips: 'Keep hand visible to the camera.',
    gestureType: 'Standard Sign',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label={room.title} tabIndex={-1}
        className={`bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-white text-base tracking-tight">
                  {room.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {room.subject} • {room.grade}
                </span>
                {isAslModeActive ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Hand className="w-3 h-3" />
                    <span>ASL-Supported Room</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Text-Based Desk</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Host: <strong className="text-slate-200">{room.hostName}</strong> ({room.hostBadge || 'Mentor'})
              </p>
              <p className="text-xs text-slate-400">Local demo room · text and study tools · no voice/video call</p>
            </div>
          </div>

          {/* Quick Session Context Alert / Action */}
          {linkedSession && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>
                Linked Mentoring: <strong>{linkedSession.topic}</strong>{' '}
                {linkedSession.assessmentMode === 'supported' ? '(Supported participation)' :
                  linkedSession.baselineQuiz ? `(Baseline: ${linkedSession.baselineQuiz.score}/${linkedSession.baselineQuiz.totalQuestions})` : '(Baseline not recorded)'}
              </span>
              {currentUser.id === linkedSession.mentorId && linkedSession.status === 'accepted' && (
                <button
                  onClick={() => {
                    const result = finishMentoringSession(linkedSession.id, true);
                    setActionError(result.success ? '' : result.message);
                    if (result.success) triggerVisualAlert('success', 'Session marked finished. The learner can now confirm participation.');
                  }}
                  className="ml-2 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-all"
                >
                  Mark Session Finished
                </button>
              )}
              {currentUser.id === linkedSession.studentId && linkedSession.status === 'awaiting_learner_confirmation' && onOpenFinalQuiz && (
                <button
                  onClick={() => onOpenFinalQuiz(linkedSession)}
                  className="ml-2 px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition-all"
                >
                  {linkedSession.assessmentMode === 'supported' ? 'Confirm Supported Participation' : 'Take Final Quiz'}
                </button>
              )}
            </div>
          )}

          {/* Top Controls Toolbar */}
          <div className="flex items-center gap-2">
            <button
              disabled title="Voice calling is not available in this text demo"
              aria-label="Voice calling unavailable" className="p-2 rounded-xl bg-slate-800 text-slate-500"
            >
              <MicOff className="w-4 h-4" />
            </button>

            <button
              disabled title="Video calling is not available in this text demo"
              aria-label="Video calling unavailable" className="p-2 rounded-xl bg-slate-800 text-slate-500"
            >
              <VideoOff className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAslModeActive(!isAslModeActive)}
              title="Toggle ASL Visualizer"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAslModeActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ASL Mode</span>
            </button>

            <button
              onClick={startCaptions}
              title="Toggle Live Speech-to-Text Captions"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCaptionsActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Captions</span>
            </button>

            <button
              onClick={handleToggleHandRaise}
              title="Raise hand (Visual & Auditorily impaired flash alert)"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isHandRaised
                  ? 'bg-amber-500 text-slate-950 font-extrabold ring-2 ring-amber-300 animate-bounce'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>✋</span>
              <span className="hidden sm:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-colors ml-1"
              title="Leave Virtual Study Room"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {actionError && <p role="alert" className="px-5 py-2 bg-rose-950 text-rose-200 text-sm">{actionError}</p>}
        {/* Live Active Participants Ribbon */}
        <div className="px-5 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs overflow-x-auto shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>In Room ({room.participants.length}):</span>
            </span>
            <div className="flex items-center gap-2">
              {room.participants.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-medium shrink-0 transition-all ${
                    p.id === currentUser.id
                      ? 'bg-indigo-950/80 border-indigo-700 text-indigo-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  } ${p.isHandRaised ? 'ring-2 ring-amber-400 bg-amber-950/60' : ''}`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                  <span>{p.name.split(' ')[0]}</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-slate-700 text-slate-300 font-bold">
                    {p.role}
                  </span>
                  {p.isSigning && (
                    <span className="text-[10px] text-purple-400" title="Signing ASL">
                      🤟
                    </span>
                  )}
                  {p.isHandRaised && (
                    <span className="text-[10px] text-amber-400 animate-pulse" title="Question / Hand Raised">
                      ✋
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Visual Sound Alert active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Main Split Layout: Left Workspace + Right Live Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* LEFT: Collaborative Workspace (Col 7 or 8) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 min-h-0 overflow-y-auto">
            {/* Workspace Sub-Tabs */}
            <div className="px-5 pt-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-900/40">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWorkspaceTab('asl')}
                  className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    workspaceTab === 'asl'
                      ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Hand className="w-3.5 h-3.5 text-purple-400" />
                  <span>Fingerspelling & Prompts</span>
                </button>

                <button
                  onClick={() => setWorkspaceTab('whiteboard')}
                  className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    workspaceTab === 'whiteboard'
                      ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Shared Whiteboard & Formulas</span>
                </button>

                <button
                  onClick={() => setWorkspaceTab('practice')}
                  className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    workspaceTab === 'practice'
                      ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Optional Practice ({practiceQuestions.length})</span>
                </button>
              </div>

              <button
                onClick={handleExplainConcept}
                disabled={isAiLoading}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3 text-indigo-300" />
                <span>{isAiLoading ? 'Explaining...' : 'AI Concept Explainer'}</span>
              </button>
            </div>

            {/* AI Explanation Banner (Collapsible) */}
            {aiExplanation && (
              <div className="m-4 p-4 rounded-2xl bg-indigo-950/50 border border-indigo-700/60 text-xs text-indigo-100 space-y-2 relative">
                <button
                  onClick={() => setAiExplanation(null)}
                  className="absolute top-3 right-3 text-indigo-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Loop AI Step-by-Step Breakdown</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-[11px] text-indigo-200">
                  {aiExplanation}
                </div>
              </div>
            )}

            {/* TAB CONTENT 1: ASL Sign Interpreter & STEM Gesture Library */}
            {workspaceTab === 'asl' && (
              <div className="p-5 space-y-5">
                {/* Real-time Fingerspelling Player */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Hand className="w-3.5 h-3.5 text-purple-400" />
                        <span>Fingerspelling practice</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Animates typed technical terms, formulas, and incoming chat messages
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setLetterIndex((prev) => Math.max(0, prev - 1));
                          setIsSpellingPlaying(false);
                        }}
                        disabled={letterIndex === 0}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200"
                        title="Previous letter"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsSpellingPlaying(!isSpellingPlaying)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                          isSpellingPlaying
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {isSpellingPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Sign Loop</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setLetterIndex((prev) =>
                            Math.min(sanitizedLetters.length - 1, prev + 1)
                          );
                          setIsSpellingPlaying(false);
                        }}
                        disabled={letterIndex >= sanitizedLetters.length - 1}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200"
                        title="Next letter"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Letter Ribbon */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 min-w-max">
                    {sanitizedLetters.map((char, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLetterIndex(idx);
                          setIsSpellingPlaying(false);
                        }}
                        className={`w-8 h-10 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                          idx === letterIndex
                            ? 'bg-purple-600 text-white shadow-md scale-110 ring-2 ring-purple-300'
                            : char === ' '
                            ? 'bg-slate-700/50 text-slate-500 w-3'
                            : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {char === ' ' ? '·' : char}
                      </button>
                    ))}
                  </div>

                  {/* Virtual Hand visualizer for students with disabilities */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-700/80 items-stretch">
                    <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                      <div className="w-20 h-20 my-1 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-purple-900/40 relative">
                        <span className="text-4xl font-black">{currentLetter}</span>
                        <span className="text-[9px] uppercase tracking-widest text-purple-200 mt-0.5">
                          {currentLetter}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-2">
                        Sign for "{currentLetter}"
                      </p>
                      <span className="text-[10px] text-purple-400 font-mono">
                        Letter {letterIndex + 1} of {sanitizedLetters.length}
                      </span>
                    </div>

                    <div className="md:col-span-8 flex flex-col justify-center">
                      <VirtualHandSign
                        letter={currentLetter}
                        showControls={true}
                        interactive={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* STEM ASL Quick Gesture Library */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span>📐</span>
                        <span>Campus STEM Sign Language Gestures</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Click any gesture to preview motion and broadcast into study room
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STEM_ASL_GESTURES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setActiveGesture(g);
                          setSpellingWord(g.name);
                          setLetterIndex(0);
                          setIsSpellingPlaying(true);
                          sendStudyRoomMessage(room.id, `[ASL Sign: ${g.name}] ${g.description}`, {
                            isAslSigned: true,
                            gestureTag: g.name,
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                          activeGesture?.id === g.id
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-2 ring-purple-500/40'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-[11px]">{g.name}</span>
                          <span className="text-sm">{g.symbol}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {g.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {activeGesture && (
                    <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/60 text-xs flex items-start gap-2.5">
                      <span className="text-xl shrink-0">{activeGesture.symbol}</span>
                      <div className="text-[11px]">
                        <span className="font-bold text-purple-300 block">
                          Active Motion: {activeGesture.name}
                        </span>
                        <p className="text-slate-300 mt-0.5">{activeGesture.motion}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AAC Non-Verbal Rapid Doubt Prompts */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mute / Non-Verbal Rapid Doubt Prompts</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AAC_STUDY_PROMPTS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleQuickAACPrompt(p)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-500 text-slate-200 text-left text-[11px] font-semibold transition-all flex items-center justify-between"
                      >
                        <span>{p.label}</span>
                        <span className="text-[10px] text-indigo-400">Send 💬</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Shared Whiteboard & Formulas */}
            {workspaceTab === 'whiteboard' && (
              <div className="p-5 space-y-4">
                {/* Whiteboard Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCanvasTool('pen')}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                        canvasTool === 'pen'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Draw</span>
                    </button>

                    <button
                      onClick={() => setCanvasTool('eraser')}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                        canvasTool === 'eraser'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Eraser</span>
                    </button>

                    <button
                      onClick={clearCanvas}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-rose-900 text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>

                    <button
                      onClick={() =>
                        setCanvasTheme(canvasTheme === 'chalkboard' ? 'whiteboard' : 'chalkboard')
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
                    >
                      {canvasTheme === 'chalkboard' ? '🟢 Chalkboard' : '⚪ Whiteboard'}
                    </button>
                  </div>

                  {/* Pre-drawn Diagram Stamps */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Insert Blueprint:</span>
                    <button
                      onClick={() => drawTemplate('triangle')}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-200 text-[11px] font-bold"
                    >
                      📐 Right Triangle
                    </button>
                    <button
                      onClick={() => drawTemplate('elevation')}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-200 text-[11px] font-bold"
                    >
                      🏢 60° Elevation
                    </button>
                    <button
                      onClick={() => drawTemplate('table')}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-200 text-[11px] font-bold"
                    >
                      📊 Trig Ratios
                    </button>
                  </div>
                </div>

                {/* Canvas Drawing Surface */}
                <div
                  className={`rounded-2xl border-2 overflow-hidden shadow-inner flex items-center justify-center relative ${
                    canvasTheme === 'chalkboard'
                      ? 'bg-emerald-950 border-emerald-900'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={320}
                    onPointerDown={startDraw}
                    onPointerMove={draw}
                    onPointerUp={stopDraw}
                    onPointerCancel={stopDraw}
                    aria-label="Local drawing board. Use study stickies below for typed notes."
                    className="cursor-crosshair touch-none w-full max-w-full block"
                  />
                  <div className="absolute top-2 right-3 text-[10px] font-mono opacity-60 pointer-events-none text-slate-400">
                    Local drawing · use stickies to save notes
                  </div>
                </div>

                {/* Collaborative Sticky Notes Section */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>📌</span>
                      <span>Shared Study Stickies ({room.whiteboardNotes.length})</span>
                    </h3>
                    <button
                      onClick={() => clearStudyRoomWhiteboard(room.id)}
                      disabled={currentUser.id !== room.hostId && !currentUser.roles.includes('admin')}
                      className="text-[11px] text-slate-400 hover:text-rose-400"
                    >
                      Clear Stickies
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {room.whiteboardNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          note.type === 'concept'
                            ? 'bg-blue-950/60 border-blue-700/60 text-blue-100'
                            : note.type === 'formula'
                            ? 'bg-amber-950/60 border-amber-700/60 text-amber-100'
                            : note.type === 'solution'
                            ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-100'
                            : 'bg-purple-950/60 border-purple-700/60 text-purple-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                          <span>{note.authorName}</span>
                          <span className="uppercase">{note.type}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-mono">{note.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Sticky Form */}
                  <form onSubmit={handleAddStickyNote} className="flex gap-2 pt-2 text-xs">
                    <select
                      value={stickyType}
                      onChange={(e: any) => setStickyType(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="doubt">Doubt</option>
                      <option value="formula">Formula</option>
                      <option value="concept">Concept</option>
                      <option value="solution">Solution</option>
                    </select>
                    <input
                      type="text"
                      value={newStickyText}
                      onChange={(e) => setNewStickyText(e.target.value)}
                      placeholder="Add a formula, theorem note, or quick doubt..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                    >
                      Post Note
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Practice & Diagnostic Quiz Arena */}
            {workspaceTab === 'practice' && (
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      Sample Practice: {room.subject}
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Optional sample questions for discussion. Practice here does not award credits.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {linkedSession?.assessmentMode === 'supported' ? 'Supported participation · no quiz required' : 'Practice only · no credits'}
                  </span>
                </div>

                <div className="space-y-4">
                  {practiceQuestions.map((q, qIndex) => {
                    const selected = selectedPracticeAnswers[qIndex];
                    const isAnswered = selected !== undefined;
                    const isCorrect = isAnswered && selected === q.correctOptionIndex;
                    const showExplanation = showPracticeExplanations[qIndex];

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-white text-xs leading-relaxed">
                            Question {qIndex + 1}: {q.question}
                          </span>
                          {isAnswered && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {isCorrect ? 'Correct!' : 'Check Formula'}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => {
                            const isSelected = selected === optIndex;
                            return (
                              <button
                                key={optIndex}
                                onClick={() => {
                                  setSelectedPracticeAnswers((prev) => ({
                                    ...prev,
                                    [qIndex]: optIndex,
                                  }));
                                  setShowPracticeExplanations((prev) => ({
                                    ...prev,
                                    [qIndex]: true,
                                  }));
                                }}
                                className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                                  isSelected
                                    ? optIndex === q.correctOptionIndex
                                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                                      : 'bg-rose-950/60 border-rose-500 text-rose-200'
                                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-750'
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <span>{optIndex === q.correctOptionIndex ? '✅' : '❌'}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {showExplanation && (
                          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1">
                            <span className="font-bold text-indigo-400 block">
                              Mathematical Explanation:
                            </span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Collaborative Text & ASL Chat Stream (Col 5 or 4) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-950 min-h-0">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="font-extrabold text-white">Collaborative Room Chat</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {room.messages.length} messages
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
              {room.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col text-xs space-y-1 ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">{msg.senderName}</span>
                      <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] uppercase font-bold text-slate-400">
                        {msg.senderRole}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed relative group ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* ASL / Gesture Tag Pill */}
                      {msg.gestureTag && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60">
                          <Hand className="w-3 h-3 text-purple-400" />
                          <span>Practice: {msg.gestureTag}</span>
                        </div>
                      )}

                      {/* Quick Audio Voice-Out button */}
                      <button
                        onClick={() => speakMessage(msg.text)}
                        title="Voice out message"
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Send Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWithAsl}
                    onChange={(e) => setSendWithAsl(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Show fingerspelling on send</span>
                </label>

                <button
                  type="button"
                  onClick={() => setChatInput((prev) => prev + ' θ')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] hover:bg-slate-700"
                >
                  + θ
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput((prev) => prev + ' √3')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] hover:bg-slate-700"
                >
                  + √3
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question or explain a formula..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
