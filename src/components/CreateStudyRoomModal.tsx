import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudyRoomMode } from '../types';
import { useDialogFocus } from './useDialogFocus';
import { X, Sparkles, Hand, MessageSquare, BookOpen, Users } from 'lucide-react';

interface CreateStudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const CreateStudyRoomForm: React.FC<Omit<CreateStudyRoomModalProps, 'isOpen'>> = ({
  onClose,
  onSuccess,
}) => {
  const { currentUser, createStudyRoom } = useApp();
  const dialogRef = useDialogFocus(onClose);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState(['Grade 10', 'Grade 11', 'Grade 12'].includes(currentUser.grade) ? currentUser.grade : 'Grade 10');
  const [mode, setMode] = useState<StudyRoomMode>('asl_supported');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = createStudyRoom({
      title: title.trim(),
      subject,
      topic: topic.trim() || 'General Collaborative Study',
      grade,
      mode,
      description: description.trim() || 'A study space for campus peers.',
    });

    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else setError(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Host a study room" tabIndex={-1} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Host a study room
              </h3>
              <p className="text-xs text-slate-500">
                Choose a topic and the tools that help you study.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close study room form"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {error && <p role="alert" className="text-rose-700">{error}</p>}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Room Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              aria-label="Room title" maxLength={120}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 10 Trigonometry Circle (Heights & Distances)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject</label>
              <select
                aria-label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white font-medium"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Grade</label>
              <select
                aria-label="Target grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white font-medium"
              >
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="All Grades">All Grades (Open)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Specific Topic</label>
            <input
              type="text"
              value={topic}
              aria-label="Specific topic" maxLength={160}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Applications of Trigonometry / Free-Body Diagrams"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Collaboration & Accessibility Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('asl_supported')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  mode === 'asl_supported'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Hand className="w-4 h-4 text-indigo-600" />
                  <span>ASL-Supported</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Fingerspelling practice, visual prompts and a high-contrast board.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('text_based')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  mode === 'text_based'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Text-Based Desk</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Type questions, share formulas and leave study notes.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description & Goals</label>
            <textarea
              rows={2}
              aria-label="Description and goals" maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Solving board exam questions together. Everyone welcome!"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Create study room</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CreateStudyRoomModal: React.FC<CreateStudyRoomModalProps> = ({ isOpen, ...props }) =>
  isOpen ? <CreateStudyRoomForm {...props} /> : null;
