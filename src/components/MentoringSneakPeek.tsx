import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  ShieldCheck,
  Utensils,
  BookOpen,
} from 'lucide-react';

export const MentoringSneakPeek: React.FC = () => {
  const { users, currentUser } = useApp();
  const rohan = users.rohan;

  const roadmapSteps = [
    {
      title: 'Step 1: Demo Login & Book Exchange',
      status: 'completed',
      desc: 'Role switching, seed books (RD Sharma, HC Verma, Oswaal), reservations, handover confirmations (+50 / +20 cr).',
    },
    {
      title: 'Step 2: Peer Mentoring Module',
      status: 'next',
      desc: 'Aarav requests Maths/Physics session with Rohan -> Rohan accepts -> verified session completion -> +70 credits.',
    },
    {
      title: 'Step 3: Milestone & Canteen Perks',
      status: 'upcoming',
      desc: 'Rohan crosses 9,940 to 10,010 credits -> Unlocks 10,000 cr campus milestone -> Redeems Canteen voucher.',
    },
    {
      title: 'Step 4: Loop AI & Admin Oversight',
      status: 'upcoming',
      desc: 'Gemini-powered peer study assistant & full administrative governance dashboard.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sneak peek header */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/25 text-violet-100 mb-3">
          <GraduationCap className="w-3.5 h-3.5 text-violet-300" />
          <span>Peer Mentoring Workflow</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Free Peer Mentoring by Star Seniors
        </h2>
        <p className="text-violet-200 text-xs sm:text-sm max-w-xl leading-relaxed">
          Seniors with subject mastery guide juniors through tough exam concepts. Every completed, verified 45-minute session awards <strong className="text-amber-300">+70 Campus Credits</strong> to the mentor!
        </p>
      </div>

      {/* Featured Star Mentor Card: Rohan Verma */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={rohan.avatar}
              alt={rohan.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">{rohan.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Verified Mentor</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {rohan.grade} • Specialized in <strong>Mathematics & Physics</strong>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
                  {rohan.credits.toLocaleString()} Campus Credits
                </span>
                <span className="text-[11px] text-slate-500">
                  (Just <strong>70 credits</strong> to reach 10,010 milestone!)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs w-full md:w-72">
            <div className="flex items-center gap-1 font-bold text-slate-800 mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Next Core Workflow Demo:</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In the next stage, Aarav will book a Physics session with Rohan, Rohan will accept, and completing the session will boost Rohan from <strong>9,940 to 10,010 credits</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Complete Project Implementation Pipeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Complete Project Architecture Roadmap</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmapSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-xs transition-all ${
                step.status === 'completed'
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                  : step.status === 'next'
                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm">{step.title}</span>
                {step.status === 'completed' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active & Complete
                  </span>
                )}
                {step.status === 'next' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white animate-pulse">
                    Up Next
                  </span>
                )}
                {step.status === 'upcoming' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                    Planned
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
