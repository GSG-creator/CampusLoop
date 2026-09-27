import React, { useState } from 'react';
import { useDialogFocus } from './useDialogFocus';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Hand,
  Send,
  HelpCircle,
} from 'lucide-react';

interface AacPhrase {
  id: string;
  category: 'handover' | 'mentoring' | 'canteen' | 'social';
  text: string;
  shortLabel: string;
  icon: string;
}

const AAC_PHRASES: AacPhrase[] = [
  // Handover
  { id: 'h1', category: 'handover', text: 'Hi! I am here for our scheduled book exchange.', shortLabel: 'Book Exchange Greeting', icon: '📚' },
  { id: 'h2', category: 'handover', text: 'Here is my verification OTP code. Please confirm.', shortLabel: 'Show OTP Code', icon: '🔢' },
  { id: 'h3', category: 'handover', text: 'Could I please inspect the condition of the textbook pages?', shortLabel: 'Inspect Book Condition', icon: '🔍' },
  { id: 'h4', category: 'handover', text: 'The condition is verified and in great shape. Thank you!', shortLabel: 'Condition Verified', icon: '✅' },
  { id: 'h5', category: 'handover', text: 'I have confirmed the handover in the CampusLoop app.', shortLabel: 'Handover Confirmed', icon: '🤝' },

  // Mentoring
  { id: 'm1', category: 'mentoring', text: 'Could you please write down the formula steps on screen?', shortLabel: 'Write Steps on Screen', icon: '📝' },
  { id: 'm2', category: 'mentoring', text: 'Could you please explain that concept once again more slowly?', shortLabel: 'Explain Once More', icon: '🔄' },
  { id: 'm3', category: 'mentoring', text: 'I understand the logic clearly now. Thank you!', shortLabel: 'I Understand Now', icon: '💡' },
  { id: 'm4', category: 'mentoring', text: 'Let us complete the final verification quiz together.', shortLabel: 'Start Final Quiz', icon: '📊' },

  // Canteen
  { id: 'c1', category: 'canteen', text: 'Hi! I would like to redeem my CampusLoop tier snack voucher.', shortLabel: 'Redeem Free Snack', icon: '🥪' },
  { id: 'c2', category: 'canteen', text: 'Here is my redemption QR voucher code on screen.', shortLabel: 'Show Canteen Voucher', icon: '📱' },
  { id: 'c3', category: 'canteen', text: 'Please ensure it is the vegetarian option. Thank you!', shortLabel: 'Vegetarian Request', icon: '🥗' },

  // Social / Communication
  { id: 's1', category: 'social', text: 'I am non-verbal/mute. I can read your screen or your notes easily.', shortLabel: 'I am Non-Verbal/Mute', icon: '💬' },
  { id: 's2', category: 'social', text: 'Please give me a moment to type my response.', shortLabel: 'Moment to Type', icon: '⏳' },
  { id: 's3', category: 'social', text: 'Thank you very much for your time and assistance!', shortLabel: 'Thank You So Much', icon: '🙏' },
  { id: 's4', category: 'social', text: 'Have a wonderful day ahead on campus!', shortLabel: 'Have a Great Day', icon: '☀️' },
];

export const MuteHandoverAssistantModal: React.FC = () => {
  const { isMuteHandoverModalOpen } = useAccessibility();
  return isMuteHandoverModalOpen ? <CommunicationDialog /> : null;
};

const CommunicationDialog: React.FC = () => {
  const {
    isMuteHandoverModalOpen,
    closeMuteHandoverModal,
    muteHandoverConfig,
    speakText,
    isSpeaking,
    stopSpeaking,
    triggerVisualAlert,
  } = useAccessibility();

  const { currentUser } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'handover' | 'mentoring' | 'canteen' | 'social'>('all');
  const [customSpeakInput, setCustomSpeakInput] = useState<string>('');
  const [isBigDisplayMode, setIsBigDisplayMode] = useState<boolean>(false);
  const [bigDisplayMessage, setBigDisplayMessage] = useState<string>('');

  const dialogRef = useDialogFocus(closeMuteHandoverModal);

  const currentBook = muteHandoverConfig?.bookTitle;
  const currentOtp = muteHandoverConfig?.otp;
  const partnerName = muteHandoverConfig?.partnerName || 'Peer Student';

  const filteredPhrases = activeCategory === 'all'
    ? AAC_PHRASES
    : AAC_PHRASES.filter((p) => p.category === activeCategory);

  const handleSpeakPhrase = (phrase: string) => {
    speakText(phrase);
    setBigDisplayMessage(phrase);
    triggerVisualAlert('info', 'Your message is displayed. Voice output depends on your browser.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Communication cards" tabIndex={-1}
        className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ${
          isBigDisplayMode ? 'max-w-5xl h-[95vh]' : 'max-w-3xl max-h-[92vh] overflow-y-auto'
        }`}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-700 via-emerald-800 to-indigo-900 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <MessageSquare className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Communication cards
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  AAC Mode
                </span>
              </div>
              <p className="text-xs text-white/80">
                Large screen display & tap-to-speak voice output for physical campus interactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBigDisplayMode(!isBigDisplayMode)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
              title={isBigDisplayMode ? 'Exit Big Screen Mode' : 'Enter Big Screen Mode (Show Across Desk)'}
            >
              {isBigDisplayMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isBigDisplayMode ? 'Standard View' : 'Show to Peer'}
              </span>
            </button>

            <button
              onClick={closeMuteHandoverModal}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Screen Display Mode (Ultra-visible across a physical table/counter) */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Big Screen Mode (Hold Phone / Screen up to Peer)</span>
            </span>

            {isSpeaking && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold animate-pulse">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Speaking Aloud...</span>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Meeting with: <strong className="text-white">{partnerName}</strong>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                Student: {currentUser.name}
              </span>
            </div>

            <div className="text-lg sm:text-2xl font-black text-white leading-snug">
              {bigDisplayMessage || muteHandoverConfig?.customNote || (currentBook ? `Hi! I am here to exchange "${currentBook}".` : 'Hello. I would like to communicate using this screen.')}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
              {currentOtp && <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Verification OTP Code</span>
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-widest">
                  #{currentOtp}
                </span>
              </div>}

              <div className="flex-1 text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Communication Notice:</strong>
                "Please use the screen or notes to communicate with me. Check that we both understand."
              </div>
            </div>
          </div>
        </div>

        {/* Custom Text-to-Speech Input */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Type anything custom to speak aloud for hearing peers:
          </label>
          <div className="flex gap-2">
            <input
              aria-label="Your message to display or speak"
              type="text"
              value={customSpeakInput}
              onChange={(e) => setCustomSpeakInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customSpeakInput.trim()) {
                  handleSpeakPhrase(customSpeakInput.trim());
                  setCustomSpeakInput('');
                }
              }}
              placeholder="e.g. Can we meet at Library Table 4? / Is chapter 5 included?"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />

            <button
              onClick={() => {
                if (customSpeakInput.trim()) {
                  handleSpeakPhrase(customSpeakInput.trim());
                  setCustomSpeakInput('');
                }
              }}
              disabled={!customSpeakInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Speak Aloud</span>
            </button>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1"
                title="Stop speaking"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* AAC Soundboard Categories & Tiles */}
        <div className="p-5 flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Instant AAC Tap-to-Communicate Soundboard
            </h3>

            <div className="flex items-center gap-1 text-xs">
              {(['all', 'handover', 'mentoring', 'canteen', 'social'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Soundboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredPhrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleSpeakPhrase(phrase.text)}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{phrase.icon}</span>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    {phrase.shortLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  "{phrase.text}"
                </p>
                <div className="flex items-center justify-end gap-1 mt-2 text-[10px] font-semibold text-emerald-600 opacity-80 group-hover:opacity-100">
                  <Volume2 className="w-3 h-3" />
                  <span>Tap to speak & show</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Designed for non-verbal student autonomy during physical book exchanges & mentoring
          </span>

          <button
            onClick={closeMuteHandoverModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
