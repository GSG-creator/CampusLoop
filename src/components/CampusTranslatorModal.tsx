import React, { useEffect, useRef, useState } from 'react';
import { useDialogFocus } from './useDialogFocus';
import { useTranslation } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  X,
  Languages,
  Sparkles,
  ArrowRightLeft,
  Copy,
  Check,
  Hand,
  Volume2,
  BookOpen,
  Send,
  RotateCcw,
} from 'lucide-react';

export const CampusTranslatorModal: React.FC = () => {
  const { isTranslatorModalOpen } = useAccessibility();
  return isTranslatorModalOpen ? <TranslatorDialog /> : null;
};

const TranslatorDialog: React.FC = () => {
  const {
    isTranslatorModalOpen,
    setIsTranslatorModalOpen,
    openSignLanguageModal,
    speakText,
    isSpeaking,
    triggerVisualAlert,
  } = useAccessibility();

  const {
    currentLanguage,
    supportedLanguages,
    setLanguageByCode,
    translateTextWithAI,
    isTranslating,
  } = useTranslation();

  const [inputText, setInputText] = useState<string>('What is Newton\'s Second Law of Motion? Force is equal to mass multiplied by acceleration.');
  const [targetLangCode, setTargetLangCode] = useState<string>(
    currentLanguage.code !== 'en' ? currentLanguage.code : 'hi'
  );
  const [translatedResult, setTranslatedResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState('');
  const activeRequest = useRef(0);
  useEffect(() => () => { activeRequest.current++; }, []);
  const dialogRef = useDialogFocus(() => setIsTranslatorModalOpen(false));
  const clearResult = () => { activeRequest.current++; setTranslatedResult(''); setTranslationError(''); setCopied(false); };

  const targetLang = supportedLanguages.find((l) => l.code === targetLangCode) || supportedLanguages[1];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    const request = ++activeRequest.current;
    setTranslationError('');
    setTranslatedResult('');
    try {
      const res = await translateTextWithAI(inputText, targetLang.name);
      if (request !== activeRequest.current) return;
      setTranslatedResult(res);
      triggerVisualAlert('info', `AI Translation generated in ${targetLang.name}`);
    } catch {
      if (request === activeRequest.current) setTranslationError('AI translation is unavailable. Your original text has been kept.');
    }
  };

  const handleCopy = async () => {
    if (translatedResult) {
      try { await navigator.clipboard.writeText(translatedResult); setCopied(true); }
      catch { setTranslationError('Copy is unavailable. Select the text to copy it manually.'); }
    }
  };

  const presetTexts = [
    { label: 'Newton\'s Law (Physics)', text: 'According to Newton\'s Second Law, the rate of change of momentum of a body is directly proportional to the applied force.' },
    { label: 'Trigonometry (Maths)', text: 'The angle of elevation of the top of a tower from a point on the ground 20m away is 60 degrees. Find height.' },
    { label: 'Book Handover', text: 'Hello! I am at the Central Library table 3 to complete the physical book handover for RD Sharma Class 10.' },
    { label: 'Canteen Freebie', text: 'I am claiming my complimentary campus canteen snack as part of the student rewards program.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Campus translator" tabIndex={-1} className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Languages className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  AI Campus Polyglot Translator
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-300 text-indigo-950">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-white/80">
                Academic translation across 11 languages with sign language & accessibility support
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTranslatorModalOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Row */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">
              🇬🇧 English (Original)
            </span>
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
            <select
              aria-label="Translation language"
              value={targetLangCode}
              onChange={(e) => { clearResult(); setTargetLangCode(e.target.value); }}
              className="px-3 py-1.5 rounded-lg bg-white border border-indigo-300 font-bold text-indigo-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setLanguageByCode(targetLangCode)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
            title="Set this as the whole app's interface language"
          >
            Make App Default
          </button>
        </div>

        {/* Translation Body */}
        <div className="p-6 space-y-4">
          {/* Preset Buttons */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Academic Campus Samples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetTexts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(preset.text);
                    clearResult();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-semibold transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input text */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Text to Translate:
            </label>
            <textarea
              aria-label="Text to translate"
              maxLength={8000}
              rows={3}
              value={inputText}
              onChange={(e) => { clearResult(); setInputText(e.target.value); }}
              placeholder="Paste any textbook excerpt, problem statement, or campus message..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTranslating ? 'Translating with AI...' : `Translate into ${targetLang.name}`}</span>
            </button>
          </div>

          {/* Translation Result Card */}
          {translationError && <p role="status" className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">{translationError}</p>}
          {translatedResult && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <span className="text-base">{targetLang.flag}</span>
                  <span>{targetLang.name} AI Translation:</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(translatedResult)}
                    className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Speak translated text aloud (AAC / Hearing Peer)"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>

                  <button
                    onClick={() => { setIsTranslatorModalOpen(false); openSignLanguageModal(inputText.split(' ')[0] || 'CAMPUS'); }}
                    className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="View Sign Language finger-spelling for this text"
                  >
                    <Hand className="w-3.5 h-3.5" />
                    <span>Sign It</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div
                dir={targetLang.direction || 'ltr'}
                className="text-base font-semibold text-slate-900 bg-white p-4 rounded-xl border border-indigo-100 shadow-xs leading-relaxed"
              >
                {translatedResult}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>AI translations require the live service. Check important meaning with your partner.</span>
          <button
            onClick={() => setIsTranslatorModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
