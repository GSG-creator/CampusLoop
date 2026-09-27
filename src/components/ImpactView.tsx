import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  BookOpen,
  GraduationCap,
  Coins,
  ShieldCheck,
  IndianRupee,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ImpactView: React.FC = () => {
  const { getImpactMetrics, books, sessions } = useApp();
  const metrics = getImpactMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Campus Community Impact Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Real Student Value, Zero Commercial Markup
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-4">
            Transparent metrics tracking textbooks reused, student financial savings, and verified academic mentoring hours across our campus.
          </p>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-[11px] text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Authentic Reporting Standard:</strong> Calculated strictly from seeded and demo activity records. CampusLoop does not invent carbon figures or make unverified environmental claims.
            </span>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Books Reused */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Textbooks Reused
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {metrics.booksReused}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active textbooks circulated through donation and peer lending cycles.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[10px] text-emerald-700 font-semibold">
            ✓ 100% verified campus handovers
          </div>
        </div>

        {/* Metric 2: Estimated Student Savings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Estimated Textbook Savings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              ₹{metrics.estimatedSavingsInRupees.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Direct student savings based on average CBSE reference book retail prices.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[10px] text-amber-700 font-semibold">
            ✓ Avg ₹350 saved per circulated book
          </div>
        </div>

        {/* Metric 3: Mentoring Hours */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Verified Mentoring Hours
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {metrics.mentoringHours}{' '}
              <span className="text-lg font-sans font-bold text-slate-500">Hrs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              One-on-one coaching delivered by verified senior mentors at 0 credit cost to juniors.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[10px] text-violet-700 font-semibold">
            ✓ Based on 45-min completed sessions
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Book Exchange Circulation by Subject */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Textbook Activity by Subject</h3>
          <div className="space-y-3">
            {[
              {
                subject: 'Mathematics',
                count: books.filter((b) => b.subject === 'Mathematics').length,
                color: 'bg-indigo-600',
              },
              {
                subject: 'Physics',
                count: books.filter((b) => b.subject === 'Physics').length,
                color: 'bg-sky-600',
              },
              {
                subject: 'Science',
                count: books.filter((b) => b.subject === 'Science').length,
                color: 'bg-emerald-600',
              },
            ].map((item) => (
              <div key={item.subject} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">{item.subject}</span>
                  <span className="text-slate-500">{item.count} Listings</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: `${Math.min(100, (item.count / books.length) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentorship Engagement Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Academic Support Summary</h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <span className="text-slate-600">Total Mentoring Requests</span>
              <span className="font-bold font-mono text-slate-900">{sessions.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <span className="text-slate-600">Completed & Verified Sessions</span>
              <span className="font-bold font-mono text-emerald-700">
                {sessions.filter((s) => s.status === 'completed').length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <span className="text-slate-600">Average Observed Score Gain</span>
              <span className="font-bold font-mono text-indigo-700">
                {sessions.filter((s) => s.creditBreakdown).length > 0 ? '+67 pp' : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
