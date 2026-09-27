import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MentoringSession } from '../types';
import { getQuizForTopic } from '../data/quizBank';
import {
  X,
  CheckCircle2,
  Star,
  Award,
  AlertCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface LearnerConfirmationModalProps {
  session: MentoringSession | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const LearnerConfirmationModal: React.FC<LearnerConfirmationModalProps> = ({
  session,
  onClose,
  onSuccess,
}) => {
  const { confirmAndFinalizeSession } = useApp();

  const [finalAnswers, setFinalAnswers] = useState<number[]>([-1, -1, -1]);
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState(
    'Rohan was an exceptional mentor! He explained trigonometry heights and distances with clear step-by-step diagrams.'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const quizQuestions = getQuizForTopic(session.topic);
  const baselineScore = session.baselineQuiz?.score ?? 0;
  const baselinePct = session.baselineQuiz?.percentage ?? 0;

  // Demo shortcut: Seed 3/3
  const handleSeedFinal3of3 = () => {
    // Correct answers for Trig: Q1 = 1 (20√3m), Q2 = 2 (1:1), Q3 = 0 (40√3m)
    const correctIndices = quizQuestions.map((q) => q.correctOptionIndex);
    setFinalAnswers(correctIndices);
    setRating(5);
  };

  // Calculate live preview of final score & improvement
  let currentFinalScore = 0;
  let allAnswered = true;
  finalAnswers.forEach((ans, idx) => {
    if (ans === -1) allAnswered = false;
    else if (quizQuestions[idx] && ans === quizQuestions[idx].correctOptionIndex) {
      currentFinalScore++;
    }
  });

  const currentFinalPct = Math.round((currentFinalScore / quizQuestions.length) * 100);
  const observedGain = Math.max(0, currentFinalPct - baselinePct);
  const willGetImprovementBonus = observedGain >= 30;

  const previewBase = 40;
  const previewFeedback = rating >= 4 ? 10 : 0;
  const previewQuiz = willGetImprovementBonus ? 20 : 0;
  const previewTotal = Math.min(70, previewBase + previewFeedback + previewQuiz);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (finalAnswers.some((a) => a === -1)) {
      setErrorMsg('Please answer all 3 final questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    const res = confirmAndFinalizeSession(session.id, {
      finalAnswers,
      rating,
      feedbackComment,
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Confirm Attendance & Post-Session Quiz</h2>
              <p className="text-xs text-emerald-200">
                Finalizing session with mentor {session.mentorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Track Pill */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Target Demo Case:</span>
            <span className="font-normal text-amber-800">
              Score 3/3 + 5 Stars → +70 CR (Rohan: 9,940 to 10,010 CR)
            </span>
          </div>
          <button
            type="button"
            onClick={handleSeedFinal3of3}
            className="px-2.5 py-1 rounded-md bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors"
          >
            Demo Seed: Final 3/3 + 5★
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Baseline vs Current Observed Performance */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">
                Baseline Quiz
              </span>
              <span className="font-mono font-bold text-slate-800 text-base">
                {baselineScore} / {quizQuestions.length}
              </span>
              <span className="text-[10px] text-slate-500 block">({baselinePct}%)</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">
                Final Quiz
              </span>
              <span className="font-mono font-bold text-emerald-700 text-base">
                {allAnswered ? `${currentFinalScore} / ${quizQuestions.length}` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {allAnswered ? `(${currentFinalPct}%)` : 'In progress'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">
                Observed Gain
              </span>
              <span
                className={`font-mono font-bold text-base ${
                  observedGain >= 30 ? 'text-indigo-600' : 'text-slate-700'
                }`}
              >
                {allAnswered ? `+${observedGain} pp` : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold block">
                {observedGain >= 30 ? '✓ +20 cr bonus' : 'Requires ≥30 pp'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic text-center">
            * Quiz changes represent an <strong>observed score improvement</strong> on predefined diagnostic problems, not proof of long-term learning.
          </p>

          {/* Final Quiz Questions */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Post-Session Knowledge Check ({session.topic})
            </h4>

            {quizQuestions.map((q, qIndex) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs space-y-2"
              >
                <p className="font-bold text-slate-900 leading-snug">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((option, optIndex) => {
                    const isChecked = finalAnswers[qIndex] === optIndex;
                    return (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-50/80 font-semibold text-emerald-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`final-q-${qIndex}`}
                          checked={isChecked}
                          onChange={() => {
                            const next = [...finalAnswers];
                            next[qIndex] = optIndex;
                            setFinalAnswers(next);
                          }}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback & Star Rating */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Mentor Rating * (≥4 Stars awards +10 Credit Quality Bonus)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {rating} / 5 Stars {rating >= 4 ? '(+10 CR Quality Bonus Qualified)' : ''}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                Student Feedback & Comments
              </label>
              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share how helpful this session was..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Calculated Credit Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
            <div className="flex items-center justify-between font-bold border-b border-indigo-200/60 pb-1.5">
              <span>Institution Credit Engine Allocation</span>
              <span className="font-mono text-base text-indigo-700 font-extrabold">
                +{previewTotal} CR Awarded
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>• Confirmed completed session attendance</span>
              <span className="font-mono font-semibold text-slate-800">+{previewBase} cr</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>• Feedback bonus (≥4 Stars): {rating}★</span>
              <span className="font-mono font-semibold text-slate-800">+{previewFeedback} cr</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>
                • Observed quiz gain (≥30 pp): {allAnswered ? `+${observedGain} pp` : 'pending'}
              </span>
              <span className="font-mono font-semibold text-slate-800">+{previewQuiz} cr</span>
            </div>
            <p className="text-[10px] text-indigo-800 font-semibold pt-1 border-t border-indigo-200/40">
              🛡️ Awarded exactly once via atomic transaction ledger. Duplicate awards prevented.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Award +{previewTotal} Credits</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
