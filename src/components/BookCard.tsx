import React, { useEffect, useRef, useState } from 'react';
import { BookListing, User } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  BookOpen,
  Gift,
  Clock,
  Tag,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User as UserIcon,
  ShieldCheck,
  CornerDownRight,
  RotateCcw,
  Languages,
  Sparkles,
  MessageSquare,
  Hand,
} from 'lucide-react';

interface BookCardProps {
  book: BookListing;
  currentUser: User;
  onReserve: (bookId: string) => void;
  onConfirmHandover: (bookId: string) => void;
  onConfirmReturn: (bookId: string) => void;
  onCancelReservation: (bookId: string) => void;
  onOpenDetails: (book: BookListing) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  currentUser,
  onReserve,
  onConfirmHandover,
  onConfirmReturn,
  onCancelReservation,
  onOpenDetails,
}) => {
  const { currentLanguage, translateTextWithAI, t } = useTranslation();
  const { openMuteHandoverModal, openSignLanguageModal, triggerVisualAlert } = useAccessibility();

  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [isTranslatingCard, setIsTranslatingCard] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState('');
  const translationRequest = useRef(0);
  useEffect(() => {
    translationRequest.current++;
    setTranslatedTitle(null); setTranslatedDesc(null); setTranslationError(''); setIsTranslatingCard(false);
    return () => { translationRequest.current++; };
  }, [book.id, book.title, book.description, currentLanguage.code]);

  const isOwner = book.ownerId === currentUser.id;
  const isReserver = book.reservedByUserId === currentUser.id;
  const isAdmin = currentUser.roles.includes('admin');

  const handleTranslateCard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedTitle) {
      // Toggle back to original
      setTranslatedTitle(null);
      setTranslatedDesc(null);
      return;
    }

    setIsTranslatingCard(true);
    setTranslationError('');
    const request = ++translationRequest.current;
    try {
      const [titleRes, descRes] = await Promise.all([
        translateTextWithAI(book.title, currentLanguage.name),
        translateTextWithAI(book.description, currentLanguage.name),
      ]);
      if (request !== translationRequest.current) return;
      setTranslatedTitle(titleRes);
      setTranslatedDesc(descRes);
      triggerVisualAlert('info', `Translated "${book.title}" into ${currentLanguage.name}`);
    } catch {
      if (request === translationRequest.current) setTranslationError('Translation is unavailable. Showing the original text.');
    } finally {
      if (request === translationRequest.current) setIsTranslatingCard(false);
    }
  };

  // Condition color
  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Like New':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Very Good':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Book Cover Header Banner */}
      <div className={`h-24 bg-gradient-to-r ${book.coverColor || 'from-indigo-600 to-violet-800'} p-4 relative flex flex-col justify-between text-white`}>
        <div className="flex items-center justify-between">
          {/* Listing Type Tag */}
          {book.listingType === 'donate' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Gift className="w-3 h-3 text-emerald-300" />
              <span>{t('common.free_donation', 'Free Donation')}</span>
            </span>
          )}
          {book.listingType === 'rent' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Clock className="w-3 h-3 text-sky-300" />
              <span>{t('common.lend_rent', 'Lend / Rent')}</span>
            </span>
          )}
          {book.listingType === 'sell' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Tag className="w-3 h-3 text-amber-300" />
              <span>{t('common.preloved_sale', 'Pre-Loved Sale')}</span>
            </span>
          )}

          {/* Quick Language / Accessibility icons on cover */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleTranslateCard}
              disabled={isTranslatingCard}
              className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                translatedTitle
                  ? 'bg-amber-400 text-amber-950 font-bold'
                  : 'bg-black/20 hover:bg-black/40 text-white'
              }`}
              title={
                translatedTitle
                  ? 'Revert to original text'
                  : `Translate with Gemini AI into ${currentLanguage.name}`
              }
            >
              <Languages className={`w-3.5 h-3.5 ${isTranslatingCard ? 'animate-spin' : ''}`} />
            </button>

            {/* Status Badge */}
            {book.status === 'available' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                Available
              </span>
            )}
            {book.status === 'reserved' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                Reserved
              </span>
            )}
            {book.status === 'lent_out' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-600 text-white shadow-xs">
                Lent Out
              </span>
            )}
            {book.status === 'donated' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-600 text-white shadow-xs">
                Donated
              </span>
            )}
            {book.status === 'sold' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-600 text-white shadow-xs">
                Sold
              </span>
            )}
          </div>
        </div>

        {/* Grade & Subject Pill on Cover */}
        <div className="flex items-center gap-1.5 text-xs text-white/90">
          <span className="font-semibold">{book.grade}</span>
          <span>•</span>
          <span className="font-medium truncate">{book.subject}</span>
        </div>
      </div>

      {/* Book Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              onClick={() => onOpenDetails(book)}
              className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-2"
            >
              {translatedTitle || book.title}
            </h3>
          </div>
          {translatedTitle && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 mb-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Translated to {currentLanguage.name} via AI</span>
            </span>
          )}
          <p className="text-xs text-slate-500 mb-2 font-medium">By {book.author}</p>
          {translationError && <p role="status" className="mb-2 text-xs text-amber-900">{translationError}</p>}

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getConditionColor(
                book.condition
              )}`}
            >
              {book.condition}
            </span>

            {book.listingType === 'donate' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                +50 cr reward on handover
              </span>
            )}
            {book.listingType === 'rent' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                {book.rentalRateCredits || 30} cr/mo (+20 cr cycle reward)
              </span>
            )}
            {book.listingType === 'sell' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                ₹{book.mockPrice || 180} mock cash
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {translatedDesc || book.description}
          </p>
        </div>

        {/* Owner & Reservation Info Footer */}
        <div className="pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 truncate">
              <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {isOwner ? (
                  <strong className="text-indigo-600">You ({book.ownerName})</strong>
                ) : (
                  <span>{book.ownerName} ({book.ownerGrade})</span>
                )}
              </span>
            </div>
            {book.listingType === 'donate' && (
              <span className="text-emerald-600 font-bold text-[11px]">Free</span>
            )}
            {book.listingType === 'rent' && (
              <span className="text-sky-700 font-bold text-[11px] font-mono">
                {book.rentalRateCredits || 30} cr
              </span>
            )}
            {book.listingType === 'sell' && (
              <span className="text-amber-800 font-bold text-[11px] font-mono">
                ₹{book.mockPrice}
              </span>
            )}
          </div>

          {/* Reserved Status info message if reserved */}
          {book.status === 'reserved' && (
            <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {isReserver
                      ? 'You have reserved this book!'
                      : `Reserved by ${book.reservedByUserName || 'student'}`}
                  </span>
                </div>

                {/* Direct Mute Handover Button for reserved book */}
                <button
                  onClick={() =>
                    openMuteHandoverModal({
                      bookTitle: book.title,
                      bookId: book.id,
                      partnerName: isOwner ? book.reservedByUserName : book.ownerName,
                    })
                  }
                  className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  title="Show Big Screen Handover Card to peer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Mute Card</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {isOwner
                  ? 'Awaiting your handover confirmation to award credits.'
                  : isReserver
                  ? 'Meet up with the senior on campus to receive book.'
                  : 'Double-booking locked. Not available for reservation.'}
              </p>
            </div>
          )}

          {/* Lent Out info message */}
          {book.status === 'lent_out' && (
            <div className="mb-2 p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px]">
              <div className="flex items-center gap-1 font-semibold">
                <RotateCcw className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Currently with {book.reservedByUserName || 'borrower'}</span>
              </div>
              <p className="text-[10px] text-sky-700 mt-0.5">
                {isOwner
                  ? 'Click "Verify Return" once student returns textbook to earn +20 cr.'
                  : 'In active lending cycle.'}
              </p>
            </div>
          )}

          {/* Donated status message */}
          {book.status === 'donated' && (
            <div className="mb-2 p-1.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Donation complete (+50 Campus Credits awarded)</span>
            </div>
          )}

          {/* Contextual Action Buttons */}
          <div className="flex items-center gap-2 mt-2">
            {/* View Details secondary button */}
            <button
              onClick={() => onOpenDetails(book)}
              className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors text-center"
            >
              {t('common.details', 'Details')}
            </button>

            {/* Action 1: Reserve (Available & Not Owner) */}
            {book.status === 'available' && !isOwner && (
              <button
                onClick={() => onReserve(book.id)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1"
              >
                <span>{t('common.reserve', 'Reserve')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {/* Action 2: Owner view of Available book */}
            {book.status === 'available' && isOwner && (
              <span className="flex-1 text-center py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                Your Listing
              </span>
            )}

            {/* Action 3: Confirm Handover (Owner or Admin when Reserved) */}
            {book.status === 'reserved' && (isOwner || isAdmin) && (
              <button
                onClick={() => onConfirmHandover(book.id)}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                title={
                  book.listingType === 'donate'
                    ? 'Confirm physical handover and receive +50 Campus Credits'
                    : 'Confirm handover to borrower'
                }
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm Handover {book.listingType === 'donate' ? '(+50 cr)' : ''}</span>
              </button>
            )}

            {/* Action 4: Reserver view of Reserved Book (Can Cancel) */}
            {book.status === 'reserved' && isReserver && (
              <button
                onClick={() => onCancelReservation(book.id)}
                className="py-1.5 px-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                title="Cancel reservation"
              >
                Cancel
              </button>
            )}

            {/* Action 5: Confirm Return for Lent Book (Owner gets +20 cr) */}
            {book.status === 'lent_out' && (isOwner || isAdmin) && (
              <button
                onClick={() => onConfirmReturn(book.id)}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                title="Verify return received and earn +20 Campus Credits"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verify Return (+20 cr)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
