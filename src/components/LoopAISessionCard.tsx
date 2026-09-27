import React from 'react';
import { MentoringSession } from '../types';

export const LoopAISessionCard: React.FC<{
  session: MentoringSession;
  onOpen: () => void;
}> = ({ session, onOpen }) => (
  <div className="space-y-2 text-xs">
    <span className="text-[10px] font-bold uppercase text-indigo-600">Mentoring Session</span>
    <h4 className="font-bold text-slate-900">{session.topic}</h4>
    <p className="text-slate-600">{session.subject} • {session.grade}</p>
    <p className="text-slate-600">{session.date} at {session.time}</p>
    <p className="text-slate-600">Mentor: {session.mentorName} • Learner: {session.studentName}</p>
    <p className="font-semibold text-indigo-700">Status: {session.status.replaceAll('_', ' ')}</p>
    <button onClick={onOpen} className="w-full py-2 rounded-lg bg-indigo-600 text-white font-bold">
      Open Mentoring
    </button>
  </div>
);
