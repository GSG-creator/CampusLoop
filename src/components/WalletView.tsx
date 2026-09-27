import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  TrendingUp,
  Award,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Utensils,
  BookCheck,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const WalletView: React.FC = () => {
  const { currentUser, transactions } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Filter transactions for this user
  const userTransactions = transactions.filter(
    (tx) => tx.userId === currentUser.id
  );

  const filteredTransactions = userTransactions.filter((tx) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'mentoring') return tx.type === 'mentoring_reward';
    if (selectedType === 'books') return tx.type === 'donation_reward' || tx.type === 'lending_reward';
    return true;
  });

  // Milestone target (10,010 credits for Canteen Feast & Pro Contributor badge)
  const MILESTONE_TARGET = 10010;
  const creditsToMilestone = Math.max(0, MILESTONE_TARGET - currentUser.credits);
  const progressPercent = Math.min(100, (currentUser.credits / MILESTONE_TARGET) * 100);
  const isMilestoneReached = currentUser.credits >= MILESTONE_TARGET;

  return (
    <div className="space-y-6">
      {/* Wallet Card Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
              <Coins className="w-3.5 h-3.5" />
              <span>Campus Credits Wallet</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
              {currentUser.credits.toLocaleString()}{' '}
              <span className="text-amber-400 text-2xl font-bold font-mono">CR</span>
            </h1>
            <p className="text-slate-400 text-xs">
              Account Holder: <strong className="text-slate-200">{currentUser.name}</strong> • {currentUser.grade}
            </p>
          </div>

          {/* Reward Milestone Card */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
            <div className="flex items-center justify-between font-bold mb-1.5">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Utensils className="w-4 h-4" />
                <span>Next Milestone: Canteen Feast</span>
              </div>
              <span className="font-mono text-white">10,010 CR</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>{Math.round(progressPercent)}% reached</span>
              {creditsToMilestone > 0 ? (
                <span className="font-semibold text-amber-300">
                  {creditsToMilestone.toLocaleString()} cr to unlock
                </span>
              ) : (
                <span className="font-bold text-emerald-400">Milestone Unlocked! 🎉</span>
              )}
            </div>

            {currentUser.id === 'rohan' && (
              <div className="mt-2 text-[10px] leading-tight p-2 rounded-lg border bg-amber-500/20 border-amber-400/30 text-amber-200">
                {isMilestoneReached ? (
                  <p className="font-bold text-emerald-300">
                    🎉 Outstanding! You earned +70 credits from peer mentoring and crossed 10,010 CR! Eligible for Canteen Feast.
                  </p>
                ) : (
                  <p>
                    🌟 <strong>Rohan's Quest:</strong> Currently at <strong>9,940 cr</strong>. A verified peer mentoring session in Step 2 will grant <strong>+70 cr</strong> to reach exactly <strong>10,010 cr</strong>!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Rules Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Peer Mentoring (+70 CR Max)</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              +40 base completion and +10 for ≥4★ feedback. Supported learning adds +20 for confirmed participation and reflection, regardless of improvement. Standard sessions add +20 for a quiz gain of at least 30 percentage points.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Book Donation (+50 CR)</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Awarded immediately upon verified campus handover of a donated textbook to a junior.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Lending Return (+20 CR)</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Awarded upon verified completion and return of a textbook lending cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Verified Transaction Ledger</h3>
            <p className="text-[11px] text-slate-500">
              Immutable records with full audit trail and duplicate-award prevention
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('mentoring')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedType === 'mentoring'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mentoring
              </button>
              <button
                onClick={() => setSelectedType('books')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedType === 'books'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Books
              </button>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredTransactions.length} entries
            </span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No transactions match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const hasBreakdown = !!tx.breakdown;

                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        onClick={() => hasBreakdown && setExpandedTxId(isExpanded ? null : tx.id)}
                        className={`transition-colors ${
                          hasBreakdown ? 'cursor-pointer hover:bg-indigo-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === 'mentoring_reward'
                                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                : tx.amount > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {tx.amount > 0 ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                            )}
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium max-w-md">
                          <div className="flex items-center justify-between">
                            <span>{tx.description}</span>
                            {hasBreakdown && (
                              <span className="text-[10px] text-indigo-600 font-semibold inline-flex items-center gap-0.5 ml-2">
                                Breakdown {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </span>
                            )}
                          </div>
                          {tx.relatedBookTitle && (
                            <span className="block text-[11px] text-indigo-600 font-semibold">
                              Book: {tx.relatedBookTitle}
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap ${
                            tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} CR
                        </td>
                      </tr>

                      {/* Expandable Breakdown Drawer */}
                      {hasBreakdown && isExpanded && tx.breakdown && (
                        <tr className="bg-indigo-50/30">
                          <td colSpan={4} className="p-3 text-[11px] text-slate-700">
                            <div className="p-3 bg-white rounded-xl border border-indigo-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Session Attendance</span>
                                <span className="font-bold text-slate-800">+{tx.breakdown.baseCompletion} CR</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Quality Feedback</span>
                                <span className="font-bold text-slate-800">+{tx.breakdown.feedbackBonus} CR ({tx.breakdown.rating}★)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">{tx.breakdown.assessmentMode === 'supported' ? 'Supported Session Completion' : 'Observed Quiz Gain'}</span>
                                <span className="font-bold text-indigo-600">
                                  {tx.breakdown.assessmentMode === 'supported' ? `+${tx.breakdown.supportCompletionBonus ?? 0} CR` : <>+{tx.breakdown.observedImprovement} pp (+{tx.breakdown.quizImprovementBonus} CR)</>}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">{tx.breakdown.assessmentMode === 'supported' ? 'Completion Basis' : 'Diagnostic Progress'}</span>
                                <span className="font-semibold text-slate-800">
                                  {tx.breakdown.assessmentMode === 'supported' ? 'Learner-confirmed participation and reflection' : <>{tx.breakdown.baselinePercentage}% → {tx.breakdown.finalPercentage}%</>}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
