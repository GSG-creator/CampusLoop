import React, { useId, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { LearningPlanDraft, MentoringSession, ResponseMode } from '../types';
import { createLearningPlanDraft, RESPONSE_OPTIONS, SUPPORT_OPTIONS, TEACHING_SOURCES } from '../data/learningSupport';

const controlClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const buttonClass = 'min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

export const SessionMeetingDetails: React.FC<{ session: MentoringSession }> = ({ session }) => {
  let safeMeetingLink: string | undefined;
  if (session.meetingLink) {
    try {
      const url = new URL(session.meetingLink);
      if (url.protocol === 'https:' && !url.username && !url.password) safeMeetingLink = url.href;
    } catch { /* Stored demo links must pass the same check before becoming clickable. */ }
  }
  return session.classMode === 'online' ? (
    <p className="text-sm text-slate-700"><strong>Online class:</strong> {safeMeetingLink ? <a href={safeMeetingLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline underline-offset-2">Join online class</a> : 'Arrange the meeting link with your mentor.'}</p>
  ) : (
    <p className="text-sm text-slate-700"><strong>Offline class:</strong> {session.location?.trim() || 'Arrange a meeting place with your mentor.'}</p>
  );
};

export const TeachingSources: React.FC = () => (
  <div className="text-sm text-slate-600">
    <p className="font-semibold">Teaching references</p>
    <ul className="mt-1 space-y-1">
      {TEACHING_SOURCES.map((source) => (
        <li key={source.url}><a className="text-indigo-700 underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.title} ({source.region})</a></li>
      ))}
    </ul>
  </div>
);

export const LearningPlanPanel: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const { sessions, currentUser, saveLearningPlan, reviewLearningPlan, respondToLearningPlan } = useApp();
  const [draft, setDraft] = useState<LearningPlanDraft | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [teacherNote, setTeacherNote] = useState('');
  const [learnerNote, setLearnerNote] = useState('');
  const formId = useId();
  const session = sessions.find((item) => item.id === sessionId);
  const isAdmin = currentUser.roles.includes('admin');
  const isMentor = session?.mentorId === currentUser.id;
  const isLearner = session?.studentId === currentUser.id;
  if (!session?.learningSupport || (!isAdmin && !isMentor && !isLearner)) return null;

  const support = session.learningSupport;
  const plan = session.learningPlan;
  const visiblePlan = plan && (plan.status !== 'draft' || isMentor || isAdmin) ? plan : undefined;
  const canEdit = isMentor && currentUser.isVerifiedMentor && currentUser.roles.includes('mentor') && ['requested', 'accepted'].includes(session.status);
  const canRespond = isLearner && visiblePlan && ['shared', 'reviewed'].includes(visiblePlan.status) && ['requested', 'accepted'].includes(session.status);
  const responseLabel = (mode: ResponseMode) => RESPONSE_OPTIONS.find((option) => option.id === mode)?.label ?? mode;
  const save = (share: boolean) => {
    if (!draft) return;
    const result = saveLearningPlan(session.id, draft, share);
    setFeedback(result);
    if (result.success) setDraft(null);
  };
  const startEditing = () => {
    setDraft(plan ? { ...plan, strategies: [...plan.strategies], lessons: plan.lessons.map((lesson) => ({ ...lesson })) } : createLearningPlanDraft(session));
    setFeedback(null);
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-4 sm:p-5 text-base space-y-4" aria-label={`Learning plan for ${session.topic}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Personalized learning plan</h3>
          <p className="text-sm text-slate-600">{session.topic} · {session.studentName} with {session.mentorName}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-800">
          {visiblePlan ? visiblePlan.status === 'reviewed' ? 'Teacher reviewed' : visiblePlan.status === 'shared' ? 'Shared for review' : 'Mentor draft' : 'Awaiting mentor plan'}
        </span>
      </div>

      <SessionMeetingDetails session={session} />

      <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-sm text-slate-700">
        <p><strong>Learner goal:</strong> {support.goal}</p>
        {support.strengths && <p><strong>Strengths and interests:</strong> {support.strengths}</p>}
        <p><strong>Helpful support:</strong> {support.needs.map((need) => SUPPORT_OPTIONS.find((option) => option.id === need)?.label ?? need).join(', ') || 'Discuss together'}</p>
        <p><strong>Preferred response:</strong> {responseLabel(support.responseMode)} · <strong>Session:</strong> {session.sessionMinutes ?? support.sessionMinutes} minutes · <strong>Break:</strong> {support.breakEveryMinutes > 0 ? `offer every ${support.breakEveryMinutes} minutes, or whenever needed` : 'whenever needed'}</p>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">A student mentor drafts educational activities with the learner and teacher. Adjust them to current needs and existing teacher guidance. This is a learning plan, not medical treatment or a formal specialist assessment.</p>
      {feedback && <p role={feedback.success ? 'status' : 'alert'} className={`rounded-xl p-3 text-sm ${feedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>{feedback.message}</p>}

      {draft && canEdit ? (
        <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); save(true); }}>
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">This editable starting plan uses the selected support preferences. Check each activity and adapt its curriculum content before sharing. Saving a revision clears earlier teacher review and learner agreement.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-semibold text-slate-800" htmlFor={`${formId}-goal`}>Learning goal
              <textarea id={`${formId}-goal`} autoFocus required maxLength={500} rows={3} className={controlClass} value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} />
            </label>
            <label className="font-semibold text-slate-800" htmlFor={`${formId}-strengths`}>Strengths and interests
              <textarea id={`${formId}-strengths`} maxLength={500} rows={3} className={controlClass} value={draft.strengths} onChange={(event) => setDraft({ ...draft, strengths: event.target.value })} />
            </label>
          </div>
          <label className="block font-semibold text-slate-800" htmlFor={`${formId}-starting`}>Starting point agreed with learner
            <textarea id={`${formId}-starting`} required maxLength={500} rows={2} className={controlClass} value={draft.startingPoint} onChange={(event) => setDraft({ ...draft, startingPoint: event.target.value })} />
          </label>
          <label className="block font-semibold text-slate-800" htmlFor={`${formId}-strategies`}>Teaching approaches (one per line)
            <textarea id={`${formId}-strategies`} required rows={5} className={controlClass} value={draft.strategies.join('\n')} onChange={(event) => setDraft({ ...draft, strategies: event.target.value.split('\n') })} />
          </label>
          {draft.lessons.map((lesson, index) => (
            <fieldset key={index} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <legend className="px-2 font-bold text-indigo-900">Lesson {index + 1}</legend>
              {(['title', 'objective', 'activities', 'evidence'] as const).map((field) => {
                const labels = { title: 'Lesson title', objective: 'What the learner will practise', activities: 'Activities and support, step by step', evidence: 'How the learner can show or share their understanding' };
                const id = `${formId}-lesson-${index}-${field}`;
                return <label key={field} htmlFor={id} className="block text-sm font-semibold text-slate-800">{labels[field]}
                  <textarea id={id} required rows={field === 'activities' ? 4 : 2} maxLength={field === 'title' ? 120 : field === 'objective' ? 500 : 1000} className={controlClass} value={lesson[field]} onChange={(event) => setDraft({ ...draft, lessons: draft.lessons.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: event.target.value } : item) })} />
                </label>;
              })}
            </fieldset>
          ))}
          <label className="block font-semibold text-slate-800" htmlFor={`${formId}-materials`}>Learning materials and reminders
            <textarea id={`${formId}-materials`} maxLength={2000} rows={3} className={controlClass} value={draft.materials} onChange={(event) => setDraft({ ...draft, materials: event.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-semibold text-slate-800" htmlFor={`${formId}-response`}>Preferred way to respond
              <select id={`${formId}-response`} className={controlClass} value={draft.responseMode} onChange={(event) => setDraft({ ...draft, responseMode: event.target.value as ResponseMode })}>{RESPONSE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>
            </label>
            <label className="font-semibold text-slate-800" htmlFor={`${formId}-date`}>Review this plan on
              <input id={`${formId}-date`} required type="date" className={controlClass} value={draft.reviewDate} onChange={(event) => setDraft({ ...draft, reviewDate: event.target.value })} />
            </label>
          </div>
          <label className="block font-semibold text-slate-800" htmlFor={`${formId}-teacher`}>Teacher guidance to follow or discuss
            <textarea id={`${formId}-teacher`} maxLength={2000} rows={3} className={controlClass} value={draft.teacherGuidance} onChange={(event) => setDraft({ ...draft, teacherGuidance: event.target.value })} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}>Share plan with learner and teacher</button>
            <button type="button" onClick={() => save(false)} className={`${buttonClass} border border-slate-300 text-slate-800 hover:bg-slate-50`}>Save draft</button>
            <button type="button" onClick={() => setDraft(null)} className={`${buttonClass} text-slate-600 hover:bg-slate-100`}>Cancel editing</button>
          </div>
        </form>
      ) : (
        <>
          {visiblePlan ? <div className="space-y-4">
            <div className="space-y-2 text-slate-800">
              <p><strong>Goal:</strong> {visiblePlan.goal}</p>
              <p><strong>Starting point:</strong> {visiblePlan.startingPoint}</p>
              {visiblePlan.strengths && <p><strong>Build on:</strong> {visiblePlan.strengths}</p>}
              <p><strong>Response choice:</strong> {responseLabel(visiblePlan.responseMode)}</p>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-slate-700">{visiblePlan.strategies.map((strategy, index) => <li key={index}>{strategy}</li>)}</ul>
            {visiblePlan.lessons.map((lesson, index) => <details key={index} className="rounded-xl border border-slate-200 p-4" open={index === 0}>
              <summary className="cursor-pointer font-bold text-indigo-900">Lesson {index + 1}: {lesson.title}</summary>
              <div className="mt-3 space-y-3 leading-relaxed text-slate-700">
                <p><strong>Practise:</strong> {lesson.objective}</p>
                <p className="whitespace-pre-wrap"><strong>Steps:</strong> {lesson.activities}</p>
                <p><strong>Show understanding:</strong> {lesson.evidence}</p>
              </div>
            </details>)}
            {visiblePlan.materials && <p className="whitespace-pre-wrap text-slate-700"><strong>Materials:</strong> {visiblePlan.materials}</p>}
            {visiblePlan.teacherGuidance && <p className="whitespace-pre-wrap text-slate-700"><strong>Teacher guidance:</strong> {visiblePlan.teacherGuidance}</p>}
            <p className="text-sm text-slate-600">Review date: {visiblePlan.reviewDate}</p>
            {visiblePlan.status === 'reviewed' && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><strong>Teacher review:</strong> {visiblePlan.reviewNote || 'Reviewed with no additional notes.'}</p>}
            {visiblePlan.learnerResponse && <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900"><strong>Learner response:</strong> {visiblePlan.learnerResponse === 'agreed' ? 'This plan works for me.' : 'Changes requested.'}{visiblePlan.learnerNote && ` ${visiblePlan.learnerNote}`}</p>}
          </div> : <p className="text-slate-600">The assigned mentor will create and share a plan. The learner can then review it and ask for changes.</p>}
          {canEdit && <button onClick={startEditing} className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}>{plan ? 'Edit learning plan' : 'Create learning plan'}</button>}
          {canRespond && <div className="rounded-xl border border-sky-200 p-4 space-y-3">
            <label htmlFor={`${formId}-learner-note`} className="block font-semibold text-slate-800">What would help? (Optional)
              <textarea id={`${formId}-learner-note`} rows={2} maxLength={2000} className={controlClass} value={learnerNote} onChange={(event) => setLearnerNote(event.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFeedback(respondToLearningPlan(session.id, 'agreed', learnerNote))} className={`${buttonClass} bg-emerald-700 text-white hover:bg-emerald-800`}>This plan works for me</button>
              <button onClick={() => setFeedback(respondToLearningPlan(session.id, 'changes_requested', learnerNote))} className={`${buttonClass} border border-slate-300 text-slate-800 hover:bg-slate-50`}>Request a change</button>
            </div>
          </div>}
          {isAdmin && visiblePlan?.status === 'shared' && ['requested', 'accepted'].includes(session.status) && <div className="rounded-xl border border-amber-200 p-4 space-y-3">
            <label htmlFor={`${formId}-review-note`} className="block font-semibold text-slate-800">Teacher review notes (Optional)
              <textarea id={`${formId}-review-note`} rows={3} maxLength={2000} className={controlClass} value={teacherNote} onChange={(event) => setTeacherNote(event.target.value)} />
            </label>
            <button onClick={() => setFeedback(reviewLearningPlan(session.id, teacherNote))} className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}>Mark plan reviewed</button>
          </div>}
        </>
      )}
      <details className="border-t border-slate-200 pt-3"><summary className="cursor-pointer text-sm font-semibold text-indigo-800">Teaching sources and demo privacy</summary><div className="mt-3 space-y-3"><TeachingSources /><p className="text-sm text-slate-600">This shared demo stores learning preferences in this browser. Anyone using its persona switcher can view those accounts. Use fictional learning needs; do not enter diagnoses or medical records.</p></div></details>
    </section>
  );
};
