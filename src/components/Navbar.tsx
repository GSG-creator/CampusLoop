import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Coins,
  GraduationCap,
  Sparkles,
  Bell,
  PlusCircle,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Gift,
  TrendingUp,
  Bot,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenListingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenListingModal,
}) => {
  const {
    currentUser,
    books,
    sessions,
    notifications,
    checkFreebieAvailable,
    markNotificationAsRead,
    clearNotifications,
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  // Check pending handovers for current user
  const pendingHandoversForMe = books.filter(
    (b) => b.ownerId === currentUser.id && b.status === 'reserved'
  ).length;

  const myReservationsPending = books.filter(
    (b) => b.reservedByUserId === currentUser.id && b.status === 'reserved'
  ).length;

  // Mentoring actions
  const incomingRequestsCount = sessions.filter(
    (s) => s.mentorId === currentUser.id && s.status === 'requested'
  ).length;

  const awaitingLearnerConfirmCount = sessions.filter(
    (s) => s.studentId === currentUser.id && s.status === 'awaiting_learner_confirmation'
  ).length;

  const snackCheck = checkFreebieAvailable(currentUser.id, 'snack');
  const hasFreebieReady = snackCheck.available;

  const unreadCount = notifications.filter((n) => !n.read && n.userId === currentUser.id).length;
  const userNotifications = notifications.filter((n) => n.userId === currentUser.id);

  const canListBooks =
    currentUser.roles.includes('senior') ||
    currentUser.roles.includes('mentor') ||
    currentUser.roles.includes('admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('books')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                    CAMPUSLOOP
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                  Learn. Share. Earn. Grow.
                </p>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              <button
                onClick={() => setActiveTab('books')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'books'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Book Exchange
              </button>

              <button
                onClick={() => setActiveTab('mentoring')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                  activeTab === 'mentoring'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-violet-500" />
                <span>Peer Mentoring</span>
                {(incomingRequestsCount > 0 || awaitingLearnerConfirmCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
                {incomingRequestsCount > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                    {incomingRequestsCount} new
                  </span>
                )}
                {awaitingLearnerConfirmCount > 0 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                    Action req
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                  activeTab === 'rewards'
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Rewards & Canteen</span>
                {hasFreebieReady && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                    Freebie
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('impact')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'impact'
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Campus Impact</span>
              </button>

              <button
                onClick={() => setActiveTab('loop_ai')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'loop_ai'
                    ? 'bg-purple-50 text-purple-900 font-bold shadow-xs'
                    : 'text-purple-700 hover:text-purple-950 hover:bg-purple-50/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>Loop AI</span>
                <span className="text-[9px] bg-purple-100 text-purple-800 font-mono px-1 rounded uppercase">
                  Thinking
                </span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                  activeTab === 'activity'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>My Activity</span>
                {(pendingHandoversForMe > 0 || myReservationsPending > 0) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'wallet'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Wallet & Ledger</span>
              </button>

              {currentUser.roles.includes('admin') && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>Admin Audit</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* List Book CTA Button */}
            <button
              onClick={onOpenListingModal}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                canListBooks
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer'
              }`}
              title={
                canListBooks
                  ? 'List a textbook for donation, rent, or sale'
                  : 'Junior accounts browse and reserve; seniors list textbooks'
              }
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List a Book</span>
            </button>

            {/* Campus Credits Pill */}
            <div
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-200/80 text-amber-900 font-bold text-xs shadow-xs cursor-pointer hover:bg-amber-100 transition-colors"
              title="Click to view transaction ledger"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 shadow-inner">
                <Coins className="w-3 h-3 text-amber-950" />
              </div>
              <span className="font-mono text-sm tracking-tight text-amber-900">
                {currentUser.credits.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                Credits
              </span>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Notifications ({userNotifications.length})
                    </span>
                    {userNotifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] text-indigo-600 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              {new Date(n.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active User Avatar & Role */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <span className="text-indigo-600 font-semibold">{currentUser.grade}</span>
                  {currentUser.isVerifiedMentor && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-medium">
                      Verified Mentor
                    </span>
                  )}
                  {currentUser.roles.includes('admin') && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-[11px] font-medium overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('books')}
            className={`py-1 px-2 rounded shrink-0 ${
              activeTab === 'books' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab('mentoring')}
            className={`py-1 px-2 rounded shrink-0 ${
              activeTab === 'mentoring' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            Mentoring
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-1 px-2 rounded shrink-0 ${
              activeTab === 'rewards' ? 'text-amber-800 font-bold bg-amber-50' : 'text-slate-600'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`py-1 px-2 rounded shrink-0 ${
              activeTab === 'impact' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            Impact
          </button>
          <button
            onClick={() => setActiveTab('loop_ai')}
            className={`py-1 px-2 rounded shrink-0 ${
              activeTab === 'loop_ai' ? 'text-purple-800 font-bold bg-purple-50' : 'text-purple-600'
            }`}
          >
            AI
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-1 px-2 rounded shrink-0 ${
              activeTab === 'wallet' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            Wallet
          </button>
        </div>
      </div>
    </header>
  );
};
