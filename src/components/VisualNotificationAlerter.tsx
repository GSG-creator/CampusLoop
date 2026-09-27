import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Bell, CheckCircle2, AlertCircle, Info, X, Eye, VolumeX } from 'lucide-react';

export const VisualNotificationAlerter: React.FC = () => {
  const { activeAlertPulse, dismissAlertPulse, visualAlertFlash, isDeafMode } = useAccessibility();

  if (!activeAlertPulse || !visualAlertFlash) return null;

  const { type, message } = activeAlertPulse;

  const borderClass =
    type === 'success'
      ? 'visual-alert-border-success'
      : type === 'warning'
      ? 'visual-alert-border-warning'
      : 'visual-alert-border-info';

  const badgeBg =
    type === 'success'
      ? 'bg-emerald-600 text-white shadow-emerald-500/30'
      : type === 'warning'
      ? 'bg-amber-600 text-white shadow-amber-500/30'
      : 'bg-indigo-600 text-white shadow-indigo-500/30';

  return (
    <>
      {/* Ambient Edge Glow Border for Deaf / Hard-of-Hearing Visual Cue */}
      <div
        className={`fixed inset-0 pointer-events-none z-50 transition-all duration-300 ${borderClass}`}
        aria-hidden="true"
      />

      {/* High-Visibility Floating Visual Alert Card */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md ${badgeBg}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="p-2 rounded-xl bg-white/20 shrink-0">
            {type === 'success' && <CheckCircle2 className="w-5 h-5 text-white" />}
            {type === 'warning' && <AlertCircle className="w-5 h-5 text-white" />}
            {type === 'info' && <Info className="w-5 h-5 text-white" />}
          </div>

          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase opacity-90">
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Sound Alert (Visual & Auditorily impaired Accessible)</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold leading-snug">{message}</p>
          </div>

          <button
            onClick={dismissAlertPulse}
            className="p-1 rounded-lg bg-black/10 hover:bg-black/20 text-white/90 hover:text-white transition-colors shrink-0"
            title="Dismiss Visual Alert"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
