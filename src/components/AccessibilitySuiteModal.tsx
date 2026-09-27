import React from 'react';
import { useDialogFocus } from './useDialogFocus';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../context/LanguageContext';
import {
  X,
  Eye,
  Volume2,
  VolumeX,
  Hand,
  MessageSquare,
  Mic,
  Languages,
  Sparkles,
  Contrast,
  Type,
  Bell,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const AccessibilitySuiteModal: React.FC = () => {
  const { isA11yModalOpen } = useAccessibility();
  return isA11yModalOpen ? <AccessibilityDialog /> : null;
};

const AccessibilityDialog: React.FC = () => {
  const {
    isA11yModalOpen,
    setIsA11yModalOpen,
    isDeafMode,
    setIsDeafMode,
    isMuteMode,
    setIsMuteMode,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    visualAlertFlash,
    setVisualAlertFlash,
    triggerVisualAlert,
    openSignLanguageModal,
    openMuteHandoverModal,
    startCaptions,
    isCaptionsActive,
    setIsTranslatorModalOpen,
  } = useAccessibility();

  const { currentLanguage, setLanguageByCode, supportedLanguages } = useTranslation();

  const dialogRef = useDialogFocus(() => setIsA11yModalOpen(false));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Accessibility tools and preferences" tabIndex={-1} className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
              <Eye className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Accessibility tools & preferences
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  Demo tools
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Choose what helps you read, communicate and study comfortably.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsA11yModalOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Launch Action Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Tools to try
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sign Language Visualizer */}
              <div
                role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                onClick={() => {
                  setIsA11yModalOpen(false);
                  openSignLanguageModal();
                }}
                className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all group flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Hand className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                    Fingerspelling practice
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Explore illustrative fingerspelling and campus sign cards. Check signs with a qualified teacher.
                  </p>
                </div>
              </div>

              {/* Mute Handover Assistant */}
              <div
                role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                onClick={() => {
                  setIsA11yModalOpen(false);
                  openMuteHandoverModal();
                }}
                className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all group flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                    Communication cards
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Show a message in large text, or have your browser read it aloud when supported.
                  </p>
                </div>
              </div>

              {/* Live Captions */}
              <div
                role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                onClick={() => {
                  setIsA11yModalOpen(false);
                  startCaptions();
                }}
                className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all group flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700">
                      Captions & typed notes
                    </h4>
                    {isCaptionsActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Type notes, or try microphone captions when your browser and permissions allow. AI summaries need the live service.
                  </p>
                </div>
              </div>

              {/* AI Polyglot Translator */}
              <div
                role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                onClick={() => {
                  setIsA11yModalOpen(false);
                  setIsTranslatorModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700">
                    Translate text
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Translate English text when the AI service is available. Choose from {supportedLanguages.length} interface languages below.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configurable Accessibility Toggles */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Reading & display preferences
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/60 overflow-hidden text-xs">
              {/* Visual Alert Pulse */}
              <div className="p-3.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                      Visual notifications
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Show a visual cue for app alerts, with vibration on supported devices.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerVisualAlert('success', 'Visual Alert Test: Notification sound substitute active!')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Try alert
                  </button>

                  <button
                    role="switch" aria-label="Visual notification alerts" aria-checked={visualAlertFlash}
                    onClick={() => setVisualAlertFlash((prev) => !prev)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      visualAlertFlash ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        visualAlertFlash ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* High Contrast Mode */}
              <div className="p-3.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <Contrast className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                      High Contrast Mode
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Make text and card boundaries easier to distinguish.
                    </span>
                  </div>
                </div>

                <button
                  role="switch" aria-label="High contrast" aria-checked={highContrast}
                  onClick={() => setHighContrast((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    highContrast ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      highContrast ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Large Text Mode */}
              <div className="p-3.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                      Larger text
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Increase text size for easier reading.
                    </span>
                  </div>
                </div>

                <button
                  role="switch" aria-label="Large text" aria-checked={largeText}
                  onClick={() => setLargeText((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    largeText ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      largeText ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Default Language Selector */}
              <div className="p-3.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                      Interface language
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Active: {currentLanguage.flag} {currentLanguage.name} ({currentLanguage.nativeName})
                    </span>
                  </div>
                </div>

                <select
                  aria-label="App interface language"
                  value={currentLanguage.code}
                  onChange={(e) => setLanguageByCode(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Your preferences stay on this browser.
          </span>
          <button
            onClick={() => setIsA11yModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
