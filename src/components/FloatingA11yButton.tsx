import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../context/LanguageContext';
import {
  Eye,
  Hand,
  MessageSquare,
  Mic,
  Languages,
  Sliders,
  X,
  Volume2,
  Contrast,
  Type,
  Bell,
} from 'lucide-react';

export const FloatingA11yButton: React.FC = () => {
  const {
    openSignLanguageModal,
    openMuteHandoverModal,
    startCaptions,
    isCaptionsActive,
    setIsA11yModalOpen,
    setIsTranslatorModalOpen,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    triggerVisualAlert,
  } = useAccessibility();

  const { currentLanguage, setLanguageByCode, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div onKeyDown={event => { if (event.key === 'Escape') setIsOpen(false); }} className="fixed bottom-6 left-6 z-40">
      {/* Floating Popout Menu */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white/95 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                CL
              </div>
              <span className="text-sm font-semibold text-slate-800">
                Accessibility & Language
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility menu"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Tools */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {/* Sign Language */}
            <button
              onClick={() => {
                setIsOpen(false);
                openSignLanguageModal();
              }}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center gap-1.5 transition-all text-center border border-emerald-100 shadow-2xs"
            >
              <Hand className="w-5 h-5 text-emerald-600" />
              <span className="text-[11px] leading-tight">Sign practice</span>
            </button>

            {/* Mute AAC Handover Card */}
            <button
              onClick={() => {
                setIsOpen(false);
                openMuteHandoverModal();
              }}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center gap-1.5 transition-all text-center border border-emerald-100 shadow-2xs"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span className="text-[11px] leading-tight">Communication cards</span>
            </button>

            {/* Live Captions */}
            <button
              onClick={() => {
                setIsOpen(false);
                startCaptions();
              }}
              className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 flex flex-col items-center justify-center gap-1.5 transition-all text-center border border-stone-100 shadow-2xs"
            >
              <Mic className="w-5 h-5 text-stone-600" />
              <span className="text-[11px] leading-tight">
                {isCaptionsActive ? 'Open captions' : 'Captions & notes'}
              </span>
            </button>

            {/* AI Translator */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsTranslatorModalOpen(true);
              }}
              className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 flex flex-col items-center justify-center gap-1.5 transition-all text-center border border-blue-100 shadow-2xs"
            >
              <Languages className="w-5 h-5 text-blue-600" />
              <span className="text-[11px] leading-tight">Translate ({currentLanguage.flag})</span>
            </button>
          </div>

          {/* Quick Toggles: Contrast & Text Scale */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <button
              aria-pressed={highContrast}
              onClick={() => setHighContrast((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                highContrast
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              <span>Contrast</span>
            </button>

            <button
              aria-pressed={largeText}
              onClick={() => setLargeText((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                largeText
                  ? 'bg-stone-700 text-white border-stone-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Large Text</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsA11yModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>All tools</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center justify-center transition-all transform hover:scale-105 ring-4 ring-white/80 group"
        title="Accessibility & Language Suite (Deaf, Mute & Translation)"
        aria-label="Accessibility and language settings" aria-expanded={isOpen}
      >
        <Eye className="w-5 h-5 text-emerald-300 group-hover:text-white transition-colors" />
      </button>
    </div>
  );
};
