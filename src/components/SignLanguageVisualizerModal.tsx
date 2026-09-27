import React, { useState, useEffect, useRef } from 'react';
import { useDialogFocus } from './useDialogFocus';
import { useAccessibility } from '../context/AccessibilityContext';
import { VirtualHandSign } from './VirtualHandSign';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Volume2,
  Hand,
  Search,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// Hand gesture vector diagrams for Letters A-Z
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

// Common Campus Phrases & Core Sign Gestures
interface CampusSign {
  id: string;
  word: string;
  category: 'handover' | 'academic' | 'campus' | 'social';
  meaning: string;
  motionDescription: string;
  iconSymbol: string;
  stepGuide: string[];
}

const CAMPUS_SIGN_LIBRARY: CampusSign[] = [
  {
    id: 'sign-book',
    word: 'BOOK',
    category: 'academic',
    meaning: 'Textbook, study book, or notes',
    motionDescription: 'Place flat palms together facing up, then open them like opening a book hinged at pinkies.',
    iconSymbol: '📖',
    stepGuide: [
      'Bring both flat hands together, palms touching at chest level.',
      'Hinge hands outward keeping pinky fingers touching, opening palms like a book.',
      'Repeat gently twice for emphasis.',
    ],
  },
  {
    id: 'sign-mentor',
    word: 'MENTOR / TEACHER',
    category: 'academic',
    meaning: 'Academic senior tutor or guide',
    motionDescription: 'Both flattened "O" hands near temples move forward into open flat hands, indicating transferring knowledge.',
    iconSymbol: '🎓',
    stepGuide: [
      'Touch flattened O-hands near both sides of your forehead.',
      'Extend both hands forward and outward toward the learner.',
      'Follow with the person-marker: flat hands moving downward along torso.',
    ],
  },
  {
    id: 'sign-handover',
    word: 'HANDOVER / EXCHANGE',
    category: 'handover',
    meaning: 'Physical exchange of book or item between peers',
    motionDescription: 'Both curved hands circle each other and switch positions across the table.',
    iconSymbol: '🤝',
    stepGuide: [
      'Hold both hands in curved cups, right hand slightly in front of left.',
      'Rotate wrists so left hand moves forward and right hand pulls back.',
      'Concludes with an affirmative nod indicating verified trade.',
    ],
  },
  {
    id: 'sign-thankyou',
    word: 'THANK YOU',
    category: 'social',
    meaning: 'Expressing gratitude to student or mentor',
    motionDescription: 'Fingertips of dominant flat hand touch lips/chin, then move forward toward the peer with an open palm.',
    iconSymbol: '🙏',
    stepGuide: [
      'Touch the fingertips of your dominant hand to your lower lip or chin.',
      'Move your hand forward and slightly downward toward the person you are thanking.',
      'Smile and nod gently.',
    ],
  },
  {
    id: 'sign-hello',
    word: 'HELLO',
    category: 'social',
    meaning: 'Campus greeting to peer',
    motionDescription: 'Open flat hand touches temple and moves outward in a friendly salute.',
    iconSymbol: '👋',
    stepGuide: [
      'Place dominant open palm near forehead temple.',
      'Wave outward and away from body in a warm salute.',
    ],
  },
  {
    id: 'sign-help',
    word: 'HELP',
    category: 'academic',
    meaning: 'Asking for tutoring or offering assistance',
    motionDescription: 'Closed fist with thumb up rests on open flat palm, and both hands rise together.',
    iconSymbol: '🆘',
    stepGuide: [
      'Make a thumbs-up fist with dominant hand.',
      'Place it firmly on the open, upward-facing palm of your other hand.',
      'Lift both hands upward together toward the person.',
    ],
  },
  {
    id: 'sign-library',
    word: 'LIBRARY',
    category: 'campus',
    meaning: 'Campus Central Library or quiet study hall',
    motionDescription: 'Make an "L" hand shape and rotate it in small clockwise circles.',
    iconSymbol: '🏛️',
    stepGuide: [
      'Form the letter "L" with thumb and index finger.',
      'Move the hand in small, smooth clockwise circles at chest height.',
    ],
  },
  {
    id: 'sign-credits',
    word: 'CREDITS / COINS',
    category: 'handover',
    meaning: 'Campus Credits balance or reward points',
    motionDescription: 'Make a small circular coin gesture on non-dominant flat palm.',
    iconSymbol: '🪙',
    stepGuide: [
      'Hold non-dominant hand flat, palm facing up.',
      'Use dominant index and thumb to trace a small circle or tap like laying a coin.',
    ],
  },
  {
    id: 'sign-canteen',
    word: 'CANTEEN / EAT',
    category: 'campus',
    meaning: 'Campus food court, snacks, or meal redemption',
    motionDescription: 'Fingertips of dominant hand clustered together tap gently against mouth.',
    iconSymbol: '🥪',
    stepGuide: [
      'Bring all fingertips and thumb together into a cluster.',
      'Tap fingertips lightly to your mouth twice, indicating eating.',
    ],
  },
  {
    id: 'sign-math',
    word: 'MATHEMATICS',
    category: 'academic',
    meaning: 'Maths, formulas, trigonometry, calculus',
    motionDescription: 'Both "M" hands brush past each other across chest level.',
    iconSymbol: '📐',
    stepGuide: [
      'Form "M" or flat knuckles on both hands.',
      'Brush palms past each other inward and outward repeatedly.',
    ],
  },
  {
    id: 'sign-physics',
    word: 'PHYSICS / SCIENCE',
    category: 'academic',
    meaning: 'Physics laws, mechanics, optics',
    motionDescription: 'Both bent "V" fingers tap knuckles together rhythmically.',
    iconSymbol: '⚡',
    stepGuide: [
      'Form curved "V" fingers (like claws) on both hands.',
      'Tap the knuckles together at chest level two times.',
    ],
  },
  {
    id: 'sign-yes',
    word: 'YES / AGREE',
    category: 'social',
    meaning: 'Confirming book condition or handover agreement',
    motionDescription: 'Make an "S" fist and nod it up and down like a head nodding.',
    iconSymbol: '✅',
    stepGuide: [
      'Form a loose fist at chest level.',
      'Flex wrist up and down twice, mimicking a head nodding yes.',
    ],
  },
];

export const SignLanguageVisualizerModal: React.FC = () => {
  const { isSignLanguageModalOpen } = useAccessibility();
  return isSignLanguageModalOpen ? <SignLanguageDialog /> : null;
};

const SignLanguageDialog: React.FC = () => {
  const {
    isSignLanguageModalOpen,
    closeSignLanguageModal,
    signLanguageInitialWord,
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'speller' | 'campus_signs'>('speller');
  const [inputText, setInputText] = useState<string>(signLanguageInitialWord || 'CAMPUS');
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // 1s per letter
  const [selectedCampusSign, setSelectedCampusSign] = useState<CampusSign | null>(CAMPUS_SIGN_LIBRARY[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const timerRef = useRef<any>(null);

  // Sync initial word
  useEffect(() => {
    if (signLanguageInitialWord) {
      setInputText(signLanguageInitialWord.toUpperCase());
      setCurrentLetterIndex(0);
    }
  }, [signLanguageInitialWord]);

  // Clean characters for finger spelling
  const sanitizedLetters = inputText
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .split('');

  // Handle Play/Pause timer for finger spelling
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentLetterIndex((prev) => {
          if (prev >= sanitizedLetters.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, sanitizedLetters.length, playbackSpeed]);

  const dialogRef = useDialogFocus(closeSignLanguageModal);

  const currentLetter = sanitizedLetters[currentLetterIndex] || 'A';
  const letterDetail = HAND_SIGN_DESCRIPTIONS[currentLetter] || {
    desc: 'Hand in neutral position.',
    tips: 'Space / separator.',
    gestureType: 'Rest',
  };

  const filteredCampusSigns = CAMPUS_SIGN_LIBRARY.filter((s) =>
    s.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Illustrative fingerspelling" tabIndex={-1} className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Hand className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Fingerspelling & sign cards
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  Illustrative demo
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                A practice aid, not a validated interpreter. Check signs with a qualified sign-language teacher.
              </p>
            </div>
          </div>

          <button
            onClick={closeSignLanguageModal}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('speller')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'speller'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Dynamic Finger-Speller</span>
          </button>

          <button
            onClick={() => setActiveTab('campus_signs')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'campus_signs'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Campus Gesture Dictionary ({CAMPUS_SIGN_LIBRARY.length})</span>
          </button>
        </div>

        {/* Tab 1: Dynamic Finger Speller */}
        {activeTab === 'speller' && (
          <div className="p-6 space-y-6">
            {/* Input bar */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Type any text, textbook title, or handover code to finger-spell:
              </label>
              <div className="flex gap-2">
                <input
                  aria-label="Text to fingerspell"
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value.toUpperCase());
                    setCurrentLetterIndex(0);
                    setIsPlaying(false);
                  }}
                  placeholder="e.g. RD SHARMA, 4892, MENTORING..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase font-bold tracking-wide"
                  maxLength={40}
                />
                <button
                  onClick={() => {
                    setInputText('HELLO');
                    setCurrentLetterIndex(0);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  "HELLO"
                </button>
                <button
                  onClick={() => {
                    setInputText('MATH');
                    setCurrentLetterIndex(0);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  "MATH"
                </button>
              </div>
            </div>

            {/* Letter Sequence Ribbon */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {sanitizedLetters.map((char, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentLetterIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`w-9 h-11 rounded-xl text-sm font-black flex items-center justify-center transition-all ${
                      idx === currentLetterIndex
                        ? 'bg-indigo-600 text-white shadow-md scale-110 ring-2 ring-indigo-300'
                        : char === ' '
                        ? 'bg-slate-200 text-slate-400 w-4'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'
                    }`}
                  >
                    {char === ' ' ? '·' : char}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Visual Display Card: Virtual Hand showing sign to student with disability */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-3xl bg-slate-900 border border-slate-800 items-stretch">
              {/* Left Column (5 cols): Active Letter Status & Playback Controls */}
              <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-900/60 text-purple-300 border border-purple-700/60">
                      Step {currentLetterIndex + 1} of {sanitizedLetters.length}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      Word: {inputText}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-purple-900/50 shrink-0">
                      <span className="text-4xl font-black">{currentLetter}</span>
                      <span className="text-[8px] uppercase tracking-widest text-purple-200">
                        {currentLetter}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block">
                        Active Finger Sign
                      </span>
                      <h3 className="text-xl font-black text-white">
                        Sign for "{currentLetter}"
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Rendered directly on virtual hand for visual learning
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Player Controls */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentLetterIndex((prev) => (prev > 0 ? prev - 1 : sanitizedLetters.length - 1))
                      }
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      title="Previous letter"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                        isPlaying
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'Pause Playback' : 'Play Fingerspelling'}</span>
                    </button>

                    <button
                      onClick={() =>
                        setCurrentLetterIndex((prev) => (prev < sanitizedLetters.length - 1 ? prev + 1 : 0))
                      }
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      title="Next letter"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentLetterIndex(0);
                        setIsPlaying(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Reset to beginning"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-[11px]">Signing Speed:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPlaybackSpeed(1500)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          playbackSpeed === 1500
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        0.7x (Slow)
                      </button>
                      <button
                        onClick={() => setPlaybackSpeed(1000)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          playbackSpeed === 1000
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        1.0x (Normal)
                      </button>
                      <button
                        onClick={() => setPlaybackSpeed(500)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          playbackSpeed === 500
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        2.0x (Fast)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): The Virtual Hand */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <VirtualHandSign
                  letter={currentLetter}
                  showControls={true}
                  interactive={true}
                  className="w-full h-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Campus Gesture Dictionary */}
        {activeTab === 'campus_signs' && (
          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                aria-label="Search sign cards"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus gesture (e.g. Book, Handover, Thank You, Math, Library)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sign List */}
              <div className="md:col-span-1 space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredCampusSigns.map((sign) => (
                  <button
                    key={sign.id}
                    onClick={() => setSelectedCampusSign(sign)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      selectedCampusSign?.id === sign.id
                        ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sign.iconSymbol}</span>
                      <div>
                        <p className="font-bold text-xs">{sign.word}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{sign.meaning}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Sign Detail Card */}
              {selectedCampusSign && (
                <div className="md:col-span-2 p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{selectedCampusSign.iconSymbol}</span>
                        <h3 className="text-lg font-black text-purple-950">
                          {selectedCampusSign.word}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 uppercase">
                          {selectedCampusSign.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {selectedCampusSign.meaning}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setInputText(selectedCampusSign.word);
                        setActiveTab('speller');
                        setCurrentLetterIndex(0);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Finger-Spell It
                    </button>
                  </div>

                  {/* Motion Overview */}
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-xs">
                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">
                      Gesture Motion Overview:
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                      {selectedCampusSign.motionDescription}
                    </p>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Step-by-step hand movement:
                    </h4>
                    <div className="space-y-2">
                      {selectedCampusSign.stepGuide.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Illustrative fingerspelling. Sign languages differ; this demo does not replace an interpreter.
          </span>
          <button
            onClick={closeSignLanguageModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
