import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Clock,
  Gift,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface MyActivityViewProps {
  onOpenListingModal: () => void;
  onNavigateToBooks: () => void;
}

export const MyActivityView: React.FC<MyActivityViewProps> = ({
  onOpenListingModal,
  onNavigateToBooks,
}) => {
  const {
    currentUser,
    books,
    confirmHandover,
    confirmReturn,
    cancelReservation,
  } = useApp();

  // Books reserved by current user
  const myReservedBooks = books.filter(
    (b) => b.reservedByUserId === currentUser.id
  );

  // Books listed by current user
  const myListedBooks = books.filter(
    (b) => b.ownerId === currentUser.id
  );

  // Books listed by current user that are awaiting handover confirmation
  const pendingHandovers = myListedBooks.filter((b) => b.status === 'reserved');

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              My Activity & Handovers
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              {currentUser.name}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track your reserved textbooks, verify campus handovers, and collect Campus Credits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.roles.includes('senior') || currentUser.roles.includes('mentor') ? (
            <button
              onClick={onOpenListingModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
            >
              List Another Book
            </button>
          ) : (
            <button
              onClick={onNavigateToBooks}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
            >
              Explore Available Books
            </button>
          )}
        </div>
      </div>

      {/* Urgent Action Banner if handovers are pending */}
      {pendingHandovers.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400 rounded-2xl p-4 text-amber-950">
          <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Action Required: {pendingHandovers.length} Handover(s) Awaiting Your Confirmation</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed mb-3">
            A junior has reserved your book on campus. Once you physically meet up and hand over the book, click "Confirm Handover" to award your <strong>+50 Campus Credits</strong>.
          </p>
          <div className="space-y-2">
            {pendingHandovers.map((b) => (
              <div
                key={b.id}
                className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{b.title}</span>
                  <span className="text-slate-500 block text-[11px]">
                    Reserved by: <strong>{b.reservedByUserName}</strong> • Listing Type: {b.listingType.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => confirmHandover(b.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Handover {b.listingType === 'donate' ? '(+50 Credits)' : ''}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Books Reserved by Current User */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Books You Have Reserved</h3>
              <p className="text-[11px] text-slate-500">Pick up from senior student at campus library</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {myReservedBooks.length} Total
          </span>
        </div>

        {myReservedBooks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 mb-2">You haven't reserved any textbooks yet.</p>
            <button
              onClick={onNavigateToBooks}
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Browse book exchange</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myReservedBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{book.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                      {book.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Owner: <strong>{book.ownerName}</strong> ({book.ownerGrade}) • Subject: {book.subject}
                  </p>
                  <p className="text-indigo-600 text-[11px] mt-1 font-medium">
                    {book.status === 'reserved' && '⏳ Awaiting physical handover on campus.'}
                    {book.status === 'lent_out' && '📖 Active lending cycle. Please keep notes clean.'}
                    {book.status === 'donated' && '🎉 Handover completed! Book is permanently yours.'}
                  </p>
                </div>

                {book.status === 'reserved' && (
                  <button
                    onClick={() => cancelReservation(book.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold self-end sm:self-auto"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Books Listed by Current User */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Books You Have Listed</h3>
              <p className="text-[11px] text-slate-500">Your textbook inventory and handover statuses</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {myListedBooks.length} Listings
          </span>
        </div>

        {myListedBooks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 mb-2">You haven't listed any textbooks yet.</p>
            {currentUser.roles.includes('senior') || currentUser.roles.includes('mentor') ? (
              <button
                onClick={onOpenListingModal}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + List your first textbook
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                (Switch to Meera or Rohan to list senior textbooks)
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {myListedBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{book.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        book.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : book.status === 'reserved'
                          ? 'bg-amber-100 text-amber-800'
                          : book.status === 'lent_out'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {book.status}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold uppercase">
                      {book.listingType}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Subject: {book.subject} • Condition: {book.condition}
                  </p>
                  {book.reservedByUserName && (
                    <p className="text-amber-700 text-[11px] mt-1 font-semibold">
                      Student: {book.reservedByUserName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {book.status === 'reserved' && (
                    <button
                      onClick={() => confirmHandover(book.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Handover {book.listingType === 'donate' ? '(+50 cr)' : ''}</span>
                    </button>
                  )}

                  {book.status === 'lent_out' && (
                    <button
                      onClick={() => confirmReturn(book.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Verify Return Received (+20 cr)</span>
                    </button>
                  )}

                  {book.status === 'donated' && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>+50 Credits Awarded</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
