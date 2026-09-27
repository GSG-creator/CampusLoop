import React from 'react';
import { BookListing, User } from '../types';
import {
  X,
  BookOpen,
  User as UserIcon,
  ShieldCheck,
  Gift,
  Clock,
  Tag,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface BookDetailsModalProps {
  book: BookListing | null;
  currentUser: User;
  onClose: () => void;
  onReserve: (bookId: string) => void;
  onConfirmHandover: (bookId: string) => void;
  onConfirmReturn: (bookId: string) => void;
  onCancelReservation: (bookId: string) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  currentUser,
  onClose,
  onReserve,
  onConfirmHandover,
  onConfirmReturn,
  onCancelReservation,
}) => {
  if (!book) return null;

  const isOwner = book.ownerId === currentUser.id;
  const isReserver = book.reservedByUserId === currentUser.id;
  const isAdmin = currentUser.roles.includes('admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header with gradient banner */}
        <div className={`p-6 bg-gradient-to-r ${book.coverColor || 'from-indigo-600 to-violet-800'} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 uppercase tracking-wide">
              {book.listingType === 'donate' && '🎁 Free Donation'}
              {book.listingType === 'rent' && '🔄 Lend / Rent'}
              {book.listingType === 'sell' && '🏷️ Pre-loved Sale'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-white text-slate-900">
              {book.status}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-white mb-1">
            {book.title}
          </h2>
          <p className="text-white/80 text-sm">Author: {book.author}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Grade Target</span>
              <span className="font-bold text-slate-800 text-sm">{book.grade}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Subject</span>
              <span className="font-bold text-slate-800 text-sm">{book.subject}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Condition</span>
              <span className="font-bold text-emerald-700 text-sm">{book.condition}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Listing Value</span>
              <span className="font-bold text-indigo-700 text-sm">
                {book.listingType === 'donate' && '0 cr (Free)'}
                {book.listingType === 'rent' && `${book.rentalRateCredits || 30} cr / mo`}
                {book.listingType === 'sell' && `₹${book.mockPrice}`}
              </span>
            </div>
          </div>

          {/* Book Synopsis & Notes */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Book Condition & Syllabus Notes
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              {book.description}
            </p>
          </div>

          {/* Credit Engine Rules for this listing */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>CampusLoop Verified Exchange Rules</span>
            </div>
            <ul className="space-y-1 text-slate-600 pl-6 list-disc text-[11px] leading-relaxed">
              {book.listingType === 'donate' && (
                <>
                  <li><strong>+50 Campus Credits</strong> are granted to donor {book.ownerName} upon physical handover confirmation.</li>
                  <li>No credits are awarded simply for creating the listing.</li>
                  <li>Recipient junior receives the textbook permanently free of charge.</li>
                </>
              )}
              {book.listingType === 'rent' && (
                <>
                  <li>Lending cycle duration: <strong>{book.rentalDuration || '1 Month'}</strong>.</li>
                  <li>Lender {book.ownerName} is awarded <strong>+20 Campus Credits</strong> upon verified return completion.</li>
                  <li>Borrower returns the book in good condition to maintain campus credibility.</li>
                </>
              )}
              {book.listingType === 'sell' && (
                <>
                  <li>Simulated student peer price: <strong>₹{book.mockPrice}</strong>.</li>
                  <li>Cash/UPI settled directly at campus handover.</li>
                </>
              )}
              <li>Double-booking is strictly prohibited; once reserved, the book is locked.</li>
            </ul>
          </div>

          {/* Owner & Pickup info */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/70 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {book.ownerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{book.ownerName}</p>
                <p className="text-slate-500 text-[11px]">{book.ownerGrade} • Book Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Campus Central Library</span>
            </div>
          </div>

          {/* Status Specific Notification Banner */}
          {book.status === 'reserved' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Reserved by {book.reservedByUserName || 'student'}.</span>
                <p className="text-[11px] text-amber-700">
                  {isOwner
                    ? 'Please hand over the book on campus and click "Confirm Handover" below.'
                    : isReserver
                    ? 'You have reserved this book. Awaiting handover.'
                    : 'This book is locked and cannot be double-booked.'}
                </p>
              </div>
            </div>
          )}

          {book.status === 'lent_out' && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="font-bold">Currently in Lending Cycle with {book.reservedByUserName}.</span>
                <p className="text-[11px] text-sky-700">
                  {isOwner
                    ? 'When the student returns the textbook, click "Verify Return" to receive +20 credits.'
                    : 'Book is currently in circulation.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* Reserve Button */}
            {book.status === 'available' && !isOwner && (
              <button
                onClick={() => {
                  onReserve(book.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
              >
                <span>Reserve Book Now</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            {/* Handover Confirmation Button */}
            {book.status === 'reserved' && (isOwner || isAdmin) && (
              <button
                onClick={() => {
                  onConfirmHandover(book.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Confirm Handover {book.listingType === 'donate' ? '(Award +50 Credits)' : ''}
                </span>
              </button>
            )}

            {/* Return Confirmation Button */}
            {book.status === 'lent_out' && (isOwner || isAdmin) && (
              <button
                onClick={() => {
                  onConfirmReturn(book.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-200 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Verify Return Received (+20 Credits)</span>
              </button>
            )}

            {/* Cancel Reservation */}
            {book.status === 'reserved' && (isReserver || isOwner) && (
              <button
                onClick={() => {
                  onCancelReservation(book.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs"
              >
                Cancel Reservation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
