import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Volume2,
  FileText,
  Copy,
  Check,
  Send,
} from 'lucide-react';

export const LiveCaptionsOverlay: React.FC = () => {
  const { isCaptionsActive } = useAccessibility();
  return isCaptionsActive ? <CaptionsPanel /> : null;
};

const CaptionsPanel: React.FC = () => {
  const {
    isCaptionsActive,
    captionStatus,
    captionMessage,
    startCaptions,
    stopCaptions,
    liveTranscripts,
    addTranscriptItem,
    clearTranscripts,
  } = useAccessibility();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [manualNoteInput, setManualNoteInput] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryOutput, setSummaryOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasAiSummary, setHasAiSummary] = useState(false);
  const summaryRequest = useRef<AbortController | null>(null);
  useEffect(() => () => { summaryRequest.current?.abort(); summaryRequest.current = null; }, []);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [liveTranscripts]);

  const handleSummarizeWithAI = async () => {
    if (liveTranscripts.length === 0) return;
    summaryRequest.current?.abort();
    const controller = new AbortController();
    summaryRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25_000);
    setIsSummarizing(true);
    setHasAiSummary(false);
    setSummaryOutput(null);
    try {
      const texts = liveTranscripts.map((t) => `${t.speaker}: ${t.text}`);
      const res = await fetch('/api/accessibility/summarize-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          transcripts: texts,
          topic: 'Campus Peer Mentoring & Academic Sharing',
        }),
      });

      const data = await res.json();
      if (controller.signal.aborted) return;
      if (!res.ok || data.status !== 'success' || typeof data.summary !== 'string' || !data.summary.trim()) throw new Error('Unavailable');
      setHasAiSummary(true);
      setSummaryOutput(data.summary);
    } catch {
      if (summaryRequest.current === controller) setSummaryOutput('AI summary is unavailable. Please review the original transcript above.');
    } finally {
      clearTimeout(timeout);
      if (summaryRequest.current === controller) setIsSummarizing(false);
    }
  };

  const handleCopySummary = async () => {
    if (summaryOutput) {
      try { await navigator.clipboard.writeText(summaryOutput); setCopied(true); }
      catch { setCopied(false); }
    }
  };

  return (
    <div
      role="region"
      aria-label="Captions and typed notes"
      onKeyDown={event => { if (event.key === 'Escape') stopCaptions(); }}
      className={`fixed bottom-4 right-4 z-40 w-[95%] sm:w-96 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'max-h-[500px] flex flex-col'
      }`}
    >
      {/* Header Bar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${captionStatus === 'listening' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span className="text-xs font-black tracking-wide uppercase text-emerald-400">
            Captions & Typed Notes
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={stopCaptions}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Captions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden space-y-3">
          <p role="status" className="text-xs text-slate-200">{captionMessage}</p>
          {(captionStatus === 'error' || captionStatus === 'unavailable') && <button onClick={startCaptions} className="text-sm text-left underline">Retry microphone captions</button>}
          {/* Scrollable Subtitles Area */}
          <div
            ref={transcriptScrollRef}
            className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono"
          >
            {liveTranscripts.length === 0 ? (
              <p className="text-slate-500 text-center py-6 italic text-[11px]">
                {captionStatus === 'listening' ? 'Listening for speech. You can also type notes.' : 'Type a note to begin.'}
              </p>
            ) : (
              liveTranscripts.map((t) => (
                <div key={t.id} className="leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">{t.speaker}</span>
                    <span>•</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <p className="text-slate-100 text-xs mt-0.5 font-sans font-medium">{t.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Manual Peer Input for silent note passing */}
          <div className="flex gap-1.5">
            <input
              aria-label="Add a typed caption note"
              maxLength={1000}
              type="text"
              value={manualNoteInput}
              onChange={(e) => setManualNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualNoteInput.trim()) {
                  addTranscriptItem(manualNoteInput.trim(), 'Typed Note');
                  setManualNoteInput('');
                }
              }}
              placeholder="Type notes or equations directly..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => {
                if (manualNoteInput.trim()) {
                  addTranscriptItem(manualNoteInput.trim(), 'Typed Note');
                  setManualNoteInput('');
                }
              }}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
              title="Add note"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Discussion Summary Box (if generated) */}
          {summaryOutput && (
            <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {hasAiSummary ? 'AI Meeting Summary' : 'AI Summary Status'}
                </span>
                <button
                  onClick={handleCopySummary}
                  className="text-purple-300 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-200 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto font-sans">
                {summaryOutput}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <button
              onClick={handleSummarizeWithAI}
              disabled={isSummarizing || liveTranscripts.length === 0}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSummarizing ? 'Summarizing...' : 'AI Summary'}</span>
            </button>

            <button
              onClick={() => { summaryRequest.current?.abort(); summaryRequest.current = null; setIsSummarizing(false); clearTranscripts(); setSummaryOutput(null); setCopied(false); }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Clear Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
