import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, Users, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { users, currentUser, switchUser, resetAllData, books, transactions } = useApp();
  const [showInfo, setShowInfo] = useState(false);

  const availableBooks = books.filter((b) => b.status === 'available').length;
  const reservedBooks = books.filter((b) => b.status === 'reserved').length;
  const completedHandovers = books.filter((b) => b.status === 'donated' || b.status === 'lent_out' || b.status === 'sold').length;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Mode Tag & Status */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wide uppercase text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Demo Mode Active
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Local Persistence • Shared State Across Roles
          </span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5"
            title="Demo state architecture details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Switch Persona:</span>
          {Object.values(users).map((user) => {
            const isActive = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Switch to ${user.name} (${user.grade})`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="font-semibold">{user.name.split(' ')[0]}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {user.roles.includes('admin') ? 'Admin' : `${user.credits} cr`}
                </span>
                {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Live Counters & Reset */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Avail: <strong className="text-slate-200">{availableBooks}</strong></span>
            <span>•</span>
            <span>Reserved: <strong className="text-amber-300">{reservedBooks}</strong></span>
            <span>•</span>
            <span>Handed Over: <strong className="text-emerald-300">{completedHandovers}</strong></span>
            <span>•</span>
            <span>Ledger: <strong className="text-indigo-300">{transactions.length}</strong></span>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset demo state back to default seeds? (Aarav 350 cr, Meera 1,250 cr, Rohan 9,940 cr)')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-600/50 transition-colors text-[11px]"
            title="Reset Seed Data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 text-slate-300 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-200">
                  Shared Application State Guarantee
                </p>
                <p className="text-slate-400 text-[11px]">
                  When you switch between <strong>Aarav</strong>, <strong>Meera</strong>, <strong>Rohan</strong>, and <strong>Ananya</strong>, all state (book reservations, handover confirmations, credit awards) is preserved in a shared local data store. No remote sync across separate physical devices.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-white underline text-[11px] self-end md:self-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
