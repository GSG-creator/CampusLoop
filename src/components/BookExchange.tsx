import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookListing, ListingType } from '../types';
import { BookCard } from './BookCard';
import { BookDetailsModal } from './BookDetailsModal';
import {
  Search,
  Filter,
  Sparkles,
  Gift,
  Clock,
  Tag,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface BookExchangeProps {
  onOpenListingModal: () => void;
}

export const BookExchange: React.FC<BookExchangeProps> = ({ onOpenListingModal }) => {
  const {
    books,
    currentUser,
    reserveBook,
    confirmHandover,
    confirmReturn,
    cancelReservation,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const selectedBookForDetails = books.find((book) => book.id === selectedBookId);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleReserve = (bookId: string) => {
    const res = reserveBook(bookId);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleConfirmHandover = (bookId: string) => {
    const res = confirmHandover(bookId);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleConfirmReturn = (bookId: string) => {
    const res = confirmReturn(bookId);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleCancelReservation = (bookId: string) => {
    const res = cancelReservation(bookId);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  // Distinct subjects in dataset
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.subject));
    return Array.from(set);
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesSubject = book.subject.toLowerCase().includes(q);
        const matchesOwner = book.ownerName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesSubject && !matchesOwner) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && book.listingType !== selectedType) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== 'all') {
        const target = Number(selectedGrade.match(/\d+/)?.[0]);
        const range = book.grade.match(/(\d+)\s*[-–]\s*(\d+)/);
        const matches = range
          ? target >= Number(range[1]) && target <= Number(range[2])
          : book.grade.match(/\d+/g)?.some((grade) => Number(grade) === target);
        if (!matches) return false;
      }

      // Subject filter
      if (selectedSubject !== 'all' && book.subject !== selectedSubject) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && book.status !== 'available') {
        return false;
      }

      return true;
    });
  }, [books, searchQuery, selectedType, selectedGrade, selectedSubject, onlyAvailable]);

  // Aggregate stats
  const totalAvailable = books.filter((b) => b.status === 'available').length;
  const totalDonations = books.filter((b) => b.listingType === 'donate').length;
  const totalLends = books.filter((b) => b.listingType === 'rent').length;
  const totalReserved = books.filter((b) => b.status === 'reserved').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Hero Welcome & Role Guidance Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20 text-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Book Exchange Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Share textbooks. Empower your campus.
          </h1>
          <p className="text-indigo-100/90 text-sm leading-relaxed mb-4">
            Borrow verified reference books from seniors, donate your completed syllabus guides to earn <strong className="text-amber-300">+50 Campus Credits</strong>, or lend books for <strong className="text-sky-300">+20 Credits</strong> per cycle.
          </p>

          {/* Persona-specific actionable prompt */}
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-white mb-1">
              <span>Logged in as {currentUser.name}</span>
              <span className="text-indigo-200">({currentUser.grade})</span>
              <span className="text-amber-300 font-mono ml-auto">
                {currentUser.credits.toLocaleString()} Credits
              </span>
            </div>
            {currentUser.id === 'aarav' && (
              <p className="text-indigo-100 text-[11px] leading-relaxed">
                👉 <strong>Demo Guide:</strong> As Aarav (Junior), try reserving Meera's donated <em>RD Sharma Class 10</em> below. Then switch to <strong>Meera</strong> in the top bar to verify the handover and witness her receive <strong>+50 credits</strong>!
              </p>
            )}
            {currentUser.id === 'meera' && (
              <p className="text-indigo-100 text-[11px] leading-relaxed">
                👉 <strong>Demo Guide:</strong> You own 3 seeded textbooks (RD Sharma, HC Verma, Oswaal Science). If Aarav reserved a book, click <strong>"Confirm Handover"</strong> to collect your <strong>+50 credit reward</strong>!
              </p>
            )}
            {currentUser.id === 'rohan' && (
              <p className="text-indigo-100 text-[11px] leading-relaxed">
                👉 <strong>Demo Guide:</strong> You are at <strong>9,940 credits</strong>. Verified peer mentorship in Step 2 awards <strong>+70 credits</strong> to reach the coveted <strong>10,010 milestone</strong>!
              </p>
            )}
            {currentUser.id === 'ananya' && (
              <p className="text-indigo-100 text-[11px] leading-relaxed">
                👉 <strong>Admin Oversight:</strong> Full audit authority to inspect reservations, verify handovers, or moderate listings.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Available Books
            </span>
            <span className="text-xl font-extrabold text-slate-900">{totalAvailable}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Free Donations
            </span>
            <span className="text-xl font-extrabold text-slate-900">{totalDonations}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Lending Cycles
            </span>
            <span className="text-xl font-extrabold text-slate-900">{totalLends}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Active Reservations
            </span>
            <span className="text-xl font-extrabold text-amber-600">{totalReserved}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title (e.g. RD Sharma), author (HC Verma), subject, or owner..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Listing Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('donate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                selectedType === 'donate'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Gift className="w-3 h-3" />
              <span>Donate</span>
            </button>
            <button
              onClick={() => setSelectedType('rent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                selectedType === 'rent'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Rent</span>
            </button>
            <button
              onClick={() => setSelectedType('sell')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                selectedType === 'sell'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Sell</span>
            </button>
          </div>
        </div>

        {/* Second Row: Grade, Subject, Available Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Filter by:</span>

            {/* Grade select */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            {/* Subject select */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>

            {/* Available only toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none ml-2 text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>Available only</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              Showing <strong>{filteredBooks.length}</strong> of {books.length} listings
            </span>
            {(searchQuery || selectedType !== 'all' || selectedGrade !== 'all' || selectedSubject !== 'all' || onlyAvailable) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedGrade('all');
                  setSelectedSubject('all');
                  setOnlyAvailable(false);
                }}
                className="text-indigo-600 hover:underline text-[11px] font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No matching book listings found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your search keywords, clearing subject filters, or switch to senior Meera to list a new book.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedGrade('all');
              setSelectedSubject('all');
              setOnlyAvailable(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              currentUser={currentUser}
              onReserve={handleReserve}
              onConfirmHandover={handleConfirmHandover}
              onConfirmReturn={handleConfirmReturn}
              onCancelReservation={handleCancelReservation}
              onOpenDetails={(b) => setSelectedBookId(b.id)}
            />
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBookForDetails && (
        <BookDetailsModal
          book={selectedBookForDetails}
          currentUser={currentUser}
          onClose={() => setSelectedBookId(null)}
          onReserve={handleReserve}
          onConfirmHandover={handleConfirmHandover}
          onConfirmReturn={handleConfirmReturn}
          onCancelReservation={handleCancelReservation}
        />
      )}
    </div>
  );
};
