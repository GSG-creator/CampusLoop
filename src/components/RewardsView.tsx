import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TIER_DEFINITIONS, getUserTier, REWARD_CATALOGUE } from '../data/rewardData';
import { RewardItem, CanteenRedemption } from '../types';
import { CanteenRedemptionModal } from './CanteenRedemptionModal';
import {
  Gift,
  Coins,
  Utensils,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Laptop,
  Tablet,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

export const RewardsView: React.FC = () => {
  const {
    currentUser,
    redemptions,
    majorRewardRequests,
    checkFreebieAvailable,
    redeemCanteenItem,
    requestMajorReward,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRedemptionId, setActiveRedemptionId] = useState<string | null>(null);
  const activeRedemptionForModal = redemptions.find((item) => item.id === activeRedemptionId) ?? null;
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const userTier = getUserTier(currentUser.credits);
  const nextThreshold = userTier.nextThreshold || 10000;
  const prevThreshold = userTier.threshold;
  const progressToNext = userTier.nextThreshold
    ? Math.min(
        100,
        Math.max(
          0,
          ((currentUser.credits - prevThreshold) / (nextThreshold - prevThreshold)) * 100
        )
      )
    : 100;

  // Freebies availability checks
  const snackCheck = checkFreebieAvailable(currentUser.id, 'snack');
  const legendComboCheck = checkFreebieAvailable(currentUser.id, 'legend_combo');

  // Filter catalogue
  const filteredItems = REWARD_CATALOGUE.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // User's redemptions
  const myRedemptions = redemptions.filter((r) => r.userId === currentUser.id);

  // Claim Tier Freebie
  const handleClaimFreebie = (item: RewardItem) => {
    const res = redeemCanteenItem(item, true);
    if (res.success && res.redemption) {
      showToast(res.message, 'success');
      setActiveRedemptionId(res.redemption.id);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Standard Credit Redemption
  const handleRedeemWithCredits = (item: RewardItem) => {
    if (currentUser.credits < item.creditCost) {
      showToast(`Insufficient credits. You need ${item.creditCost} CR, but have ${currentUser.credits} CR.`, 'error');
      return;
    }
    const res = redeemCanteenItem(item, false);
    if (res.success && res.redemption) {
      showToast(res.message, 'success');
      setActiveRedemptionId(res.redemption.id);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Request Major Tech Vault Allocation
  const handleRequestMajorVault = (item: RewardItem) => {
    const res = requestMajorReward(item);
    showToast(res.message, res.success ? 'success' : 'error');
  };

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

      {/* Hero Tier & Progress Card */}
      <div className={`bg-gradient-to-r ${userTier.color} rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden`}>
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/25 text-white mb-3">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Rewards & Canteen Perks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            {userTier.badge}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4">
            Current Balance: <strong className="font-mono font-bold text-amber-300 text-base">{currentUser.credits.toLocaleString()} CR</strong>. Your verified campus contributions unlock free canteen treats and academic equipment.
          </p>

          {/* Progress to Next Tier */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs max-w-xl space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>Tier Progression</span>
              <span className="font-mono text-amber-300">
                {userTier.tier === 'Legend'
                  ? 'MAX TIER (Legendary Contributor)'
                  : `${currentUser.credits} / ${nextThreshold} CR`}
              </span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressToNext}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/80">
              <span>Active Tier Perk: {userTier.canteenPerk}</span>
              {userTier.nextThreshold && (
                <span className="font-semibold text-amber-200">
                  {nextThreshold - currentUser.credits} CR to next tier
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reward Tier Milestones Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Campus Contributor Tiers & Freebies</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(TIER_DEFINITIONS).map((t) => {
            const isCurrent = t.tier === userTier.tier;
            const isUnlocked = currentUser.credits >= t.threshold;
            return (
              <div
                key={t.tier}
                className={`p-3.5 rounded-2xl border text-xs text-center transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-400 shadow-xs'
                    : isUnlocked
                    ? 'border-emerald-200 bg-emerald-50/30 text-slate-800'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="text-xl mb-1">{t.badge.split(' ')[0]}</div>
                <div className="font-extrabold text-slate-900">{t.tier}</div>
                <div className="font-mono text-[10px] text-slate-500 font-semibold mb-1">
                  {t.threshold.toLocaleString()}+ CR
                </div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  {t.tier === 'Starter' && 'Standard Exchange'}
                  {t.tier === 'Bronze' && '1 snack / month'}
                  {t.tier === 'Silver' && '2 snacks / month'}
                  {t.tier === 'Gold' && '1 snack / week'}
                  {t.tier === 'Diamond' && '1 snack / week + Express'}
                  {t.tier === 'Legend' && 'Feast + Tech Vault'}
                </div>
                {isCurrent && (
                  <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white">
                    You Are Here
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Freebie Claims Card (Free snacks for Bronze+, Welcome Combo for Legend) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Your Available Canteen Tier Freebies
              </h3>
              <p className="text-[11px] text-slate-600">
                Tier perks never deduct credits. Present QR code at the counter to redeem.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950">
            0 Credits Cost (Institutional Perk)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Perk 1: Tier Snack Freebie */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  Monthly / Weekly Free Canteen Snack
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  FREE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Choose any snack: Samosa & Chai, Choco-Chip Muffin, or Veg Puff.
              </p>
              <div className="mt-2 text-[11px] text-slate-600">
                Status:{' '}
                <strong
                  className={snackCheck.available ? 'text-emerald-700' : 'text-amber-800'}
                >
                  {snackCheck.reason}
                </strong>
              </div>
            </div>

            <button
              onClick={() => handleClaimFreebie(REWARD_CATALOGUE[0])}
              disabled={!snackCheck.available}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>{snackCheck.available ? 'Claim Free Snack QR Code' : 'Quota Claimed for Current Period'}</span>
            </button>
          </div>

          {/* Perk 2: Legend Welcome Feast Combo */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  Welcome Sandwich & Juice Combo (Legend)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  LEGEND UNLOCK
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gourmet grilled paneer sandwich with cold-pressed orange juice. Unlocked upon crossing 10,000 CR.
              </p>
              <div className="mt-2 text-[11px] text-slate-600">
                Status:{' '}
                <strong
                  className={legendComboCheck.available ? 'text-emerald-700' : 'text-slate-500'}
                >
                  {legendComboCheck.reason}
                </strong>
              </div>
            </div>

            <button
              onClick={() => handleClaimFreebie(REWARD_CATALOGUE[3])} // meal-legend-combo
              disabled={!legendComboCheck.available}
              className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {legendComboCheck.available
                  ? 'Claim Legend Welcome Feast (0 CR)'
                  : currentUser.credits >= 10000
                  ? 'Already Claimed'
                  : 'Locked (Requires 10,000 CR)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Catalogue Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Campus Reward Catalogue</h3>
            <p className="text-xs text-slate-500">
              Redeem snacks, meals, stationery, books, and apply for sponsor-backed tech
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'snacks', label: 'Snacks' },
              { id: 'meals', label: 'Meals' },
              { id: 'stationery', label: 'Printing & Notes' },
              { id: 'vouchers', label: 'Book Vouchers' },
              { id: 'accessories', label: 'Accessories' },
              { id: 'tech_vault', label: '👑 Tech Vault' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalogue Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isMajor = item.isMajorVault;
            const canAfford = currentUser.credits >= item.creditCost;
            const meetsTier = currentUser.credits >= TIER_DEFINITIONS[item.minTier].threshold;
            const isWelcomeCombo = item.creditCost === 0 && item.category === 'meals';
            const isEligible = meetsTier && (isMajor || (canAfford && (!isWelcomeCombo || legendComboCheck.available)));
            const hasPendingRequest = majorRewardRequests.some(
              (r) => r.userId === currentUser.id && r.rewardId === item.id && r.status === 'pending_review'
            );

            return (
              <div
                key={item.id}
                className={`rounded-2xl border flex flex-col justify-between overflow-hidden transition-all ${
                  isMajor
                    ? 'border-purple-200 bg-gradient-to-b from-purple-50/50 to-white shadow-sm'
                    : 'border-slate-200 bg-white shadow-xs hover:shadow-md'
                }`}
              >
                {/* Item Image */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-900 shadow-xs">
                      Min: {item.minTier}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.sponsorNote && (
                      <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 leading-tight">
                        ⚠️ {item.sponsorNote}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Cost
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {item.creditCost === 0 ? 'Freebie (0 CR)' : `${item.creditCost} CR`}
                      </span>
                    </div>

                    {isMajor ? (
                      <button
                        onClick={() => handleRequestMajorVault(item)}
                        disabled={!isEligible || hasPendingRequest}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>
                          {hasPendingRequest
                            ? 'Application Pending'
                            : isEligible
                            ? 'Apply for Eligibility'
                            : 'Locked (10k CR)'}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => isWelcomeCombo ? handleClaimFreebie(item) : handleRedeemWithCredits(item)}
                        disabled={!isEligible}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>{!meetsTier ? `Requires ${item.minTier} Tier` : isWelcomeCombo && !legendComboCheck.available ? 'Welcome Combo Claimed' : canAfford ? 'Redeem Voucher' : 'Need More Credits'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User's Active QR Codes & Redemption History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                My Canteen Vouchers & QR Codes ({myRedemptions.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any active voucher to show the QR code or test the demo scan counter
              </p>
            </div>
          </div>
        </div>

        {myRedemptions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            You haven't claimed any canteen treats yet. Claim your tier freebie above!
          </div>
        ) : (
          <div className="space-y-2.5">
            {myRedemptions.map((r) => (
              <div
                key={r.id}
                onClick={() => setActiveRedemptionId(r.id)}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/40 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-900">
                    <QrCode className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.itemTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'scanned_and_collected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status === 'scanned_and_collected' ? 'Collected' : 'Active'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Code: <strong className="font-mono">{r.code}</strong> • {r.isFreebie ? 'Tier Freebie' : `${r.creditCost} CR`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                    <span>Show QR Screen</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Voucher Modal */}
      <CanteenRedemptionModal
        redemption={activeRedemptionForModal}
        onClose={() => setActiveRedemptionId(null)}
        onScanSuccess={(msg) => {
          showToast(msg, 'success');
        }}
      />
    </div>
  );
};
