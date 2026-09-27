import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ListingType, BookCondition } from '../types';
import { X, BookPlus, AlertCircle, Info, Check, ShieldCheck } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createBookListing, switchUser } = useApp();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [grade, setGrade] = useState('Grade 10');
  const [subject, setSubject] = useState('Mathematics');
  const [condition, setCondition] = useState<BookCondition>('Like New');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType>('donate');
  const [rentalDuration, setRentalDuration] = useState('1 Month');
  const [mockPrice, setMockPrice] = useState(0);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const canList =
    currentUser.roles.includes('senior') ||
    currentUser.roles.includes('mentor') ||
    currentUser.roles.includes('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !author.trim() || !subject.trim()) {
      setFormError('Please fill in title, author, and subject.');
      return;
    }

    const res = createBookListing({
      title,
      author,
      grade,
      subject,
      condition,
      description,
      listingType,
      rentalDuration: listingType === 'rent' ? rentalDuration : undefined,
      mockPrice: listingType === 'rent' ? 30 : listingType === 'sell' ? Number(mockPrice) || 150 : 0,
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        setTitle('');
        setAuthor('');
        setDescription('');
        onClose();
      }, 1200);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">List a Textbook</h2>
              <p className="text-xs text-slate-500">Share or lend to campus peers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Junior attempts to list */}
        {!canList ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Senior & Mentor Feature</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                You are currently logged in as <strong>{currentUser.name}</strong> (Junior, {currentUser.grade}). Juniors can browse and reserve books. Senior students (Grade 12) have textbooks to share!
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 text-left">
              <p className="font-semibold mb-1">Want to test listing a book right now?</p>
              <p className="text-slate-600 text-[11px] mb-2">
                Switch to <strong>Meera Sharma</strong> (Senior, Grade 12) or <strong>Rohan Verma</strong>:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => switchUser('meera')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                >
                  Switch to Meera (Senior)
                </button>
                <button
                  onClick={() => switchUser('rohan')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                >
                  Switch to Rohan (Mentor)
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
            >
              Cancel and Return
            </button>
          </div>
        ) : (
          /* Form for Seniors / Mentors */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Strict Notice regarding Credit Allocation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Credit Engine Policy:</strong> Credits are never awarded simply for creating a listing. You earn <strong>+50 Campus Credits</strong> when a donation handover is confirmed, or <strong>+20 Credits</strong> when a lending cycle finishes.
              </span>
            </div>

            {/* Listing Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Listing Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setListingType('donate');
                    setMockPrice(0);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    listingType === 'donate'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">🎁 Donate</span>
                  <span className="text-[10px] text-slate-500 font-normal">Free (+50 cr)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setListingType('rent');
                    setMockPrice(30);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    listingType === 'rent'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">🔄 Lend / Rent</span>
                  <span className="text-[10px] text-slate-500 font-normal">Cycle (+20 cr)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setListingType('sell');
                    setMockPrice(180);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    listingType === 'sell'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">🏷️ Sell</span>
                  <span className="text-[10px] text-slate-500 font-normal">Mock Cash ₹</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Comprehensive Physics for Class 11"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Author / Publisher *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. S.L. Arora / NCERT"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Grade & Subject Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Grade 11-12">Grade 11-12 (JEE/NEET)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics, Mathematics, Science"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Condition & Price/Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as BookCondition)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Like New">Like New (Unmarked)</option>
                  <option value="Very Good">Very Good (Light wear)</option>
                  <option value="Good">Good (Notes/Stickies)</option>
                  <option value="Fair">Fair (Readable)</option>
                </select>
              </div>

              {listingType === 'rent' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rental Duration
                  </label>
                  <select
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="1 Month">1 Month</option>
                    <option value="1 Semester">1 Semester (3 Months)</option>
                  </select>
                </div>
              ) : listingType === 'sell' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mock Price (₹)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={mockPrice}
                    onChange={(e) => setMockPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Free Donation"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention any pencil notes, syllabus editions, or helpful tips for juniors..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all"
              >
                Publish Listing
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
