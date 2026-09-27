import React from 'react';
import type { LearningSupport, ResponseMode } from '../types';
import { SUPPORT_OPTIONS, RESPONSE_OPTIONS } from '../data/learningSupport';

export const initialLearningSupport = (): LearningSupport => ({
  needs: [], strengths: '', goal: '', responseMode: 'spoken', sessionMinutes: 20, breakEveryMinutes: 5,
});

export function LearningSupportFields({ value, onChange }: {
  value: LearningSupport;
  onChange: (value: LearningSupport) => void;
}) {
  const field = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:ring-2 focus:ring-indigo-600';
  return <section aria-label="Learning preferences" className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 text-sm leading-relaxed">
    <p>Choose what helps you learn. These options support different needs, including changing needs with neurodegenerative conditions and intellectual or developmental disabilities. No diagnosis is needed.</p>
    <p className="text-slate-600">This is a shared browser demo. Use example learning preferences; do not enter medical records or private health details.</p>
    <fieldset>
      <legend className="font-semibold">What would help? Choose any, or leave these blank.</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {SUPPORT_OPTIONS.map(option => <label key={option.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={value.needs.includes(option.id)} onChange={e => onChange({ ...value, needs: e.target.checked ? [...value.needs, option.id] : value.needs.filter(need => need !== option.id) })} />
          <span><strong className="block">{option.label}</strong><span className="text-slate-600">{option.description}</span></span>
        </label>)}
      </div>
    </fieldset>
    <label className="block font-semibold">My learning goal
      <textarea required rows={2} maxLength={500} value={value.goal} onChange={e => onChange({ ...value, goal: e.target.value })} placeholder="For example: use my step card to practise one heights-and-distances problem." className={field} />
      <span className="mt-1 block font-normal text-slate-600">Practising, maintaining a skill and participating are all valid goals.</span>
    </label>
    <label className="block font-semibold">My strengths and interests (optional)
      <input maxLength={500} value={value.strengths} onChange={e => onChange({ ...value, strengths: e.target.value })} placeholder="For example: I enjoy building models and explaining aloud." className={field} />
    </label>
    <label className="block font-semibold">How I would like to respond during the session
      <select value={value.responseMode} onChange={e => onChange({ ...value, responseMode: e.target.value as ResponseMode })} className={field}>
        {RESPONSE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
      <span className="mt-1 block font-normal text-slate-600">Agree this with your mentor; this setting does not record audio or connect an assistive device.</span>
    </label>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block font-semibold">Planned session length
        <select value={value.sessionMinutes} onChange={e => { const minutes = Number(e.target.value); onChange({ ...value, sessionMinutes: minutes, breakEveryMinutes: Math.min(value.breakEveryMinutes, minutes) }); }} className={field}>
          {[10, 15, 20, 30, 45].map(minutes => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
        </select>
      </label>
      <label className="block font-semibold">Offer a break
        <select value={value.breakEveryMinutes} onChange={e => onChange({ ...value, breakEveryMinutes: Number(e.target.value) })} className={field}>
          <option value={0}>Whenever I ask</option>
          {[5, 10, 15].filter(minutes => minutes <= value.sessionMinutes).map(minutes => <option key={minutes} value={minutes}>Every {minutes} minutes</option>)}
        </select>
      </label>
    </div>
    <p className="text-slate-700">These are flexible preferences, not a timer. Pause or stop at any point. Follow the learner’s existing school and professional support recommendations.</p>
  </section>;
}
