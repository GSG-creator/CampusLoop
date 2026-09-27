import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LearningPlanPanel, SessionMeetingDetails } from './LearningPlanPanel';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Coins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Utensils,
  Award,
  Laptop,
  GraduationCap,
  Clock,
  QrCode,
  Tag,
  Search,
} from 'lucide-react';

export const AdminAuditView: React.FC = () => {
  const {
    users,
    books,
    sessions,
    transactions,
    redemptions,
    majorRewardRequests,
    confirmHandover,
    confirmReturn,
    toggleMentorVerification,
    approveMajorReward,
    scanCanteenCode,
  } = useApp();

  const [auditTab, setAuditTab] = useState<'overview' | 'mentors' | 'major_rewards' | 'canteen' | 'books' | 'sessions'>('overview');
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const totalCreditsInCirculation = Object.values(users).reduce(
    (acc, u) => acc + u.credits,
    0
  );

  const pendingMajorRewards = majorRewardRequests.filter((r) => r.status === 'pending_review');

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Faculty & Administrator Oversight</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Campus Governance & Audit Panel
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Logged in as <strong>Dr. Ananya Roy</strong> (Faculty Lead). Verify or suspend peer mentors, review academic sessions & ledger entries, supervise canteen redemptions, and approve mock sponsor device grants.
        </p>

        {actionFeedback && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* Global Campus Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Credits Supply</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {totalCreditsInCirculation.toLocaleString()} <span className="text-xs text-amber-600 font-bold">CR</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across 4 demo accounts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Books Catalog</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {books.length} <span className="text-xs text-slate-500 font-normal">Books</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {books.filter((b) => b.status === 'available').length} available now
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Major Tech Reviews</span>
            <Laptop className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {pendingMajorRewards.length} <span className="text-xs text-rose-600 font-bold">Pending</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Mock sponsor grants
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Canteen Claims</span>
            <Utensils className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {redemptions.length} <span className="text-xs text-slate-500 font-normal">Vouchers</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {redemptions.filter((r) => r.status === 'active').length} uncollected
          </span>
        </div>
      </div>

      {/* Admin Tab Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setAuditTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            auditTab === 'overview' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Accounts & Mentor Control</span>
        </button>
        <button
          onClick={() => setAuditTab('major_rewards')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 relative ${
            auditTab === 'major_rewards' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-amber-600" />
          <span>Tech Vault Review</span>
          {pendingMajorRewards.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setAuditTab('canteen')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            auditTab === 'canteen' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
          <span>Canteen Redemptions ({redemptions.length})</span>
        </button>
        <button
          onClick={() => setAuditTab('sessions')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            auditTab === 'sessions' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-violet-600" />
          <span>Mentoring Sessions ({sessions.length})</span>
        </button>
        <button
          onClick={() => setAuditTab('books')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            auditTab === 'books' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Book Inventory ({books.length})</span>
        </button>
      </div>

      {/* SECTION 1: Registered Accounts & Mentor Verification */}
      {auditTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Campus Accounts & Mentor Verification Oversight
              </h3>
              <p className="text-xs text-slate-500">
                Grant or suspend peer mentor status. Only verified mentors can accept junior academic requests.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              4 Seeded Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student / Faculty</th>
                  <th className="py-2.5 px-3">Roles</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-3">Mentor Status</th>
                  <th className="py-2.5 px-3 text-right">Faculty Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(users).map((u) => {
                  const isEligibleForMentor = u.roles.includes('senior') || u.roles.includes('mentor');
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                            <span className="text-slate-400 text-[11px] block">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                r === 'mentor'
                                  ? 'bg-violet-100 text-violet-800'
                                  : r === 'admin'
                                  ? 'bg-rose-100 text-rose-800'
                                  : r === 'senior'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{u.grade}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {u.credits.toLocaleString()} CR
                      </td>
                      <td className="py-3 px-3">
                        {u.isVerifiedMentor ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Mentor
                          </span>
                        ) : u.roles.includes('senior') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Senior Student
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEligibleForMentor && !u.roles.includes('admin') && (
                          <button
                            onClick={() => {
                              const res = toggleMentorVerification(u.id);
                              showFeedback(res.message);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                              u.isVerifiedMentor
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {u.isVerifiedMentor ? 'Suspend Mentor' : 'Verify as Mentor'}
                          </button>
                        )}
                        {u.roles.includes('admin') && (
                          <span className="text-[11px] text-slate-400 font-medium">Faculty Lead</span>
                        )}
                        {!isEligibleForMentor && (
                          <span className="text-[11px] text-slate-400">Junior Learner</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: Major Tech Vault Review */}
      {auditTab === 'major_rewards' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-600" />
              <span>Simulated Sponsor Tech Vault Allocation Requests</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Top contributors with 10,000+ Campus Credits can submit eligibility requests for sponsor-backed laptops, iPads, and tablets. Review and grant mock allocations.
            </p>
          </div>

          {majorRewardRequests.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No Tech Vault requests submitted yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When a student crosses 10,000 CR (like Rohan after completing the trigonometry mentoring session), they can apply in the Rewards tab.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {majorRewardRequests.map((req) => {
                const note = adminNote[req.id] || '';
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{req.rewardTitle}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Applicant: <strong>{req.userName}</strong> ({req.userEmail}) • Credits: <strong>{req.creditsAtRequest.toLocaleString()} CR</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Requested: {new Date(req.requestedAt).toLocaleString()}
                        {req.adminNote && (
                          <span className="block text-indigo-700 font-medium mt-0.5">
                            Faculty Note: {req.adminNote}
                          </span>
                        )}
                      </p>
                    </div>

                    {req.status === 'pending_review' ? (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Optional reviewer note..."
                          value={note}
                          onChange={(e) =>
                            setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white w-48 focus:outline-indigo-500"
                        />
                        <button
                          onClick={() => {
                            const res = approveMajorReward(req.id, true, note);
                            showFeedback(res.message);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Approve Grant
                        </button>
                        <button
                          onClick={() => {
                            const res = approveMajorReward(req.id, false, note);
                            showFeedback(res.message);
                          }}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        Reviewed at {new Date(req.reviewedAt || '').toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Canteen Redemptions Audit */}
      {auditTab === 'canteen' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Campus Canteen Counter Redemption Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">
                Audit claimed snack vouchers, freebie quotas, and simulated QR counter scans.
              </p>
            </div>
          </div>

          {redemptions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No canteen vouchers claimed yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Students can claim free tier snacks or redeem meals with credits in the Rewards tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Voucher Code</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Counter Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {redemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {r.code}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{r.userName}</span>
                        <span className="block text-[10px] text-slate-400">{r.tierClaimed} Tier</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{r.itemTitle}</td>
                      <td className="py-3 px-3">
                        {r.isFreebie ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            Tier Freebie
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {r.creditCost} CR
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            r.status === 'scanned_and_collected'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {r.status === 'active' ? (
                          <button
                            onClick={() => {
                              const res = scanCanteenCode(r.id);
                              showFeedback(res.message);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] inline-flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3 text-amber-400" />
                            <span>Simulate Scan</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Collected at {new Date(r.scannedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: Mentoring Sessions Audit */}
      {auditTab === 'sessions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Academic Peer Mentoring Sessions Audit</h3>
          {sessions.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">No peer mentoring sessions created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Topic / Subject</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Mentor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Learning Review</th>
                    <th className="py-2.5 px-3 text-right">Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {s.topic}
                        <span className="block text-[10px] text-slate-400 font-normal">{s.subject} ({s.grade})</span>
                        <SessionMeetingDetails session={s} />
                      </td>
                      <td className="py-3 px-3 text-slate-700">{s.studentName}</td>
                      <td className="py-3 px-3 text-slate-700">{s.mentorName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {s.assessmentMode === 'supported' ? (
                          <span>{s.goalReview === 'practised' ? 'Practised the goal' : s.goalReview === 'maintained' ? 'Maintained a skill' : s.goalReview === 'needs_more_support' ? 'More support requested' : 'Supported learning · reflection pending'}</span>
                        ) : <>{s.baselineQuiz ? `${s.baselineQuiz.score}/${s.baselineQuiz.totalQuestions}` : '—'}{' → '}{s.finalQuiz ? `${s.finalQuiz.score}/${s.finalQuiz.totalQuestions}` : '—'}</>}
                        {s.creditBreakdown && s.assessmentMode !== 'supported' && (
                          <span className="text-indigo-600 font-semibold ml-1">
                            (+{s.creditBreakdown.observedImprovement} pp)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {s.creditBreakdown ? `+${s.creditBreakdown.total} CR` : '0 CR'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {auditTab === 'sessions' && sessions.some((session) => session.learningSupport) && (
        <section className="space-y-4" aria-label="Teacher learning plan review">
          <h3 className="text-lg font-bold text-slate-900">Teacher learning plan review</h3>
          <p className="text-base text-slate-600">Review shared plans against the learner’s preferences and existing teacher guidance. New mentor revisions need a fresh review.</p>
          {sessions.filter((session) => session.learningSupport && session.status !== 'declined').map((session) => <LearningPlanPanel key={session.id} sessionId={session.id} />)}
        </section>
      )}

      {/* SECTION 5: Book Inventory Audit */}
      {auditTab === 'books' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">All Campus Book Listings Audit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Reserved By</th>
                  <th className="py-2.5 px-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">
                      {b.title}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{b.ownerName}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold">{b.listingType}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'reserved'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'lent_out'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {b.reservedByUserName || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {b.status === 'reserved' && (
                        <button
                          onClick={() => {
                            const res = confirmHandover(b.id);
                            showFeedback(res.message);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                          title="Faculty override: Confirm Handover"
                        >
                          Override Handover
                        </button>
                      )}
                      {b.status === 'lent_out' && (
                        <button
                          onClick={() => {
                            const res = confirmReturn(b.id);
                            showFeedback(res.message);
                          }}
                          className="px-2.5 py-1 rounded bg-sky-600 text-white font-bold text-[11px] hover:bg-sky-700"
                          title="Faculty override: Verify Return"
                        >
                          Verify Return
                        </button>
                      )}
                      {b.status === 'available' && (
                        <span className="text-slate-400 text-[11px]">Normal</span>
                      )}
                      {(b.status === 'donated' || b.status === 'sold') && (
                        <span className="text-emerald-600 font-semibold text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
