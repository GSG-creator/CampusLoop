import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getQuizForTopic } from '../data/quizBank';
import { LoopAiActionCard } from '../types';
import {
  X,
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface RequestMentoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  initialDraft?: NonNullable<LoopAiActionCard['draftMentoringData']>;
}

export const RequestMentoringModal: React.FC<RequestMentoringModalProps> = (props) =>
  props.isOpen ? <RequestMentoringForm {...props} /> : null;

const RequestMentoringForm: React.FC<RequestMentoringModalProps> = ({
  onClose,
  onSuccess,
  initialDraft,
}) => {
  const { users, currentUser, requestMentoringSession } = useApp();

  // Form State
  const [subject, setSubject] = useState(initialDraft?.subject ?? 'Mathematics');
  const [topic, setTopic] = useState(initialDraft?.topic ?? 'Applications of Trigonometry');
  const [grade, setGrade] = useState(initialDraft?.grade ?? currentUser.grade);
  const [date, setDate] = useState(() => {
    if (initialDraft) return initialDraft.date;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [time, setTime] = useState(initialDraft?.time ?? '16:30');
  const [description, setDescription] = useState(
    initialDraft?.description ?? 'Need help understanding angles of elevation and heights & distances problems for board preparation.'
  );
  const [selectedMentorId, setSelectedMentorId] = useState(initialDraft?.mentorId ?? 'rohan');

  // Step in modal: 1 = Details, 2 = Baseline Quiz
  const [step, setStep] = useState<1 | 2>(1);
  const [baselineAnswers, setBaselineAnswers] = useState<number[]>([-1, -1, -1]);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter verified mentors
  const verifiedMentors = Object.values(users).filter(
    (u) =>
      u.id !== currentUser.id &&
      u.isVerifiedMentor === true
  );

  const quizQuestions = getQuizForTopic(topic);

  // Demo Case Quick Fill
  const handleDemoFill = () => {
    setSubject('Mathematics');
    setTopic('Applications of Trigonometry');
    setGrade('Grade 10');
    setSelectedMentorId('rohan');
    setTime('16:30');
    setDescription(
      'Aarav needs targeted coaching on Heights and Distances (Trigonometry) from Rohan.'
    );
    // Baseline Demo Case: 1/3 (Q1 correct = 1, Q2 incorrect = 0, Q3 incorrect = 1)
    setBaselineAnswers([1, 0, 1]);
    setErrorMsg('');
  };

  const handleSeedBaseline1of3 = () => {
    setBaselineAnswers(quizQuestions.map((question, index) => index === 0
      ? question.correctOptionIndex
      : (question.correctOptionIndex + 1) % question.options.length));
  };

  const handleNextToQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verifiedMentors.some((mentor) => mentor.id === selectedMentorId)) {
      setErrorMsg('Please select a verified mentor.');
      return;
    }

    if (!topic.trim()) {
      setErrorMsg('Please specify the topic.');
      return;
    }

    setStep(2);
  };

  const handleSubmitRequest = () => {
    setErrorMsg('');

    // Check all questions answered
    if (baselineAnswers.some((ans) => ans === -1)) {
      setErrorMsg('Please answer all 3 baseline questions to establish starting proficiency.');
      return;
    }

    const res = requestMentoringSession({
      mentorId: selectedMentorId,
      subject,
      topic,
      grade,
      date,
      time,
      description,
      baselineAnswers,
    });

    if (res.success) {
      onSuccess(res.message);
      onClose();
      // Reset
      setStep(1);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-violet-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">Request Academic Help</h2>
              <p className="text-xs text-violet-200">
                {step === 1 ? 'Step 1: Session Details & Mentor' : 'Step 2: Pre-Session Baseline Quiz'}
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
              Aarav requests Rohan (Applications of Trigonometry)
            </span>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-2.5 py-1 rounded-md bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors"
          >
            Auto-Fill Demo Values
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Form Details */}
        {step === 1 && (
          <form onSubmit={handleNextToQuiz} className="p-6 space-y-4">
            {/* Free Guarantee Notice */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">100% Free Peer Learning:</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  The junior pays <strong>0 Credits</strong> for mentoring. Verified mentors earn Campus Credits from the institution pool upon confirmed completion.
                </p>
              </div>
            </div>

            {/* Mentor Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Verified Mentor *
              </label>
              <div className="space-y-2">
                {verifiedMentors.length === 0 && (
                  <p className="text-xs text-slate-500">No verified mentors are available for this account.</p>
                )}
                {verifiedMentors.map((mentor) => {
                  const isSelected = selectedMentorId === mentor.id;
                  return (
                    <div
                      key={mentor.id}
                      onClick={() => setSelectedMentorId(mentor.id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{mentor.name}</span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
                              Verified Mentor
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {mentor.grade} • Subjects: {mentor.mentorSubjects?.join(', ') || 'Maths, Physics'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-amber-700 block">
                          {mentor.credits.toLocaleString()} CR
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Free for you</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject & Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Science">General Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setBaselineAnswers([-1, -1, -1]);
                  }}
                  placeholder="e.g. Applications of Trigonometry"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Grade, Date & Time */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Learning Goals & Difficulties
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific chapters or practice question types you need help with..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Next Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Next: Quick 3-question baseline quiz
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
              >
                <span>Continue to Baseline Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Baseline Quiz */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-950 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold">Pre-Session Baseline Assessment</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Topic: <strong>{topic}</strong>. These 3 diagnostic questions determine your baseline understanding. An observed improvement of ≥30 percentage points on the final quiz awards a bonus to your mentor!
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeedBaseline1of3}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] shrink-0 hover:bg-indigo-700 shadow-xs"
                title="Select Q1 correct, Q2 and Q3 incorrect (Baseline score 1/3 = 33.3%)"
              >
                Seed Baseline 1/3
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
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
                      const isChecked = baselineAnswers[qIndex] === optIndex;
                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-950'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`baseline-q-${qIndex}`}
                            checked={isChecked}
                            onChange={() => {
                              const next = [...baselineAnswers];
                              next[qIndex] = optIndex;
                              setBaselineAnswers(next);
                            }}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Mentoring Request</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
