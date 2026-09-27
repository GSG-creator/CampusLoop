import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { MentoringSession } from '../types';
import { useDialogFocus } from './useDialogFocus';

export function SupportedSessionConfirmation({ session, onClose, onSuccess }: {
  session: MentoringSession; onClose: () => void; onSuccess: (message: string) => void;
}) {
  const { confirmAndFinalizeSession } = useApp();
  const dialogRef = useDialogFocus(onClose);
  const [participated, setParticipated] = useState(false);
  const [goalReview, setGoalReview] = useState<NonNullable<MentoringSession['goalReview']> | ''>('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const award = 60 + (rating >= 4 ? 10 : 0);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!participated || !goalReview || rating < 1) {
      setError('Confirm that you took part, choose a reflection and rate your session. You can come back later.');
      return;
    }
    const result = confirmAndFinalizeSession(session.id, {
      finalAnswers: [], rating, feedbackComment: feedback,
      participationConfirmed: true, goalReview,
    });
    if (result.success) { onSuccess(result.message); onClose(); }
    else setError(result.message);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="supported-reflection-title" tabIndex={-1} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 text-base leading-relaxed text-slate-900 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <h2 id="supported-reflection-title" className="text-xl font-bold">How did your learning session go?</h2>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2">Close</button>
      </div>
      <p className="mt-3">{session.topic} with {session.mentorName}</p>
      <p className="mt-3 rounded-xl bg-indigo-50 p-3"><strong>Your goal:</strong> {session.learningPlan?.goal ?? session.learningSupport?.goal}</p>
      <p className="mt-3 text-slate-600">Take your time. You may use your agreed communication method with support to enter your choices. Practising, maintaining a skill or needing more help are equally valid responses.</p>
      {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-rose-800">{error}</p>}
      <form onSubmit={submit} className="mt-5 space-y-5">
        <label className="flex items-start gap-3 rounded-xl border border-slate-300 p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={participated} onChange={e => setParticipated(e.target.checked)} />
          I took part in this session and want to confirm it.
        </label>
        <fieldset className="space-y-2">
          <legend className="mb-2 font-semibold">Choose the reflection that fits today</legend>
          {([
            ['practised', 'I practised my chosen goal.'],
            ['maintained', 'I used or maintained a familiar skill.'],
            ['needs_more_support', 'I would like more support or a different approach.'],
          ] as const).map(([value, label]) => <label key={value} className="flex items-center gap-3 rounded-xl border border-slate-300 p-3">
            <input type="radio" name="supported-goal-reflection" className="h-5 w-5" value={value} checked={goalReview === value} onChange={() => setGoalReview(value)} />{label}
          </label>)}
        </fieldset>
        <label className="block font-semibold">How helpful was the session?
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal">
            <option value={0}>Choose a rating</option>
            <option value={1}>1 — Not helpful</option><option value={2}>2 — A little helpful</option>
            <option value={3}>3 — Somewhat helpful</option><option value={4}>4 — Helpful</option><option value={5}>5 — Very helpful</option>
          </select>
        </label>
        <label className="block font-semibold">What helped, or what should change? (optional)
          <textarea maxLength={2000} rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
        </label>
        <p className="rounded-xl bg-emerald-50 p-3 text-emerald-950">On confirmation: {award} mentor credits (40 for completion, 20 for supported participation{rating >= 4 ? ', 10 for your feedback rating' : ''}). No quiz score is recorded and the reflection you choose does not change this award.</p>
        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-3">Come back later</button>
          <button type="submit" className="rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800">Confirm supported session</button>
        </div>
      </form>
    </div>
  </div>;
}
