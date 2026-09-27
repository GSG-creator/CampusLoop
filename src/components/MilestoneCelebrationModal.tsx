import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Trophy,
  Laptop,
  Tablet,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Utensils,
  AlertCircle,
} from 'lucide-react';

interface MilestoneCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreVault: () => void;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  isOpen,
  onClose,
  onExploreVault,
}) => {
  const { currentUser } = useApp();
  const [animatedCredits, setAnimatedCredits] = useState(9940);
  const targetCredits = Math.max(10010, currentUser.credits);

  useEffect(() => {
    if (!isOpen) return;

    // Animate from 9,940 to 10,010 over 1.2 seconds
    const start = 9940;
    const end = targetCredits;
    const duration = 1200;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * eased);
      setAnimatedCredits(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isOpen, targetCredits]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-500/40 relative overflow-hidden text-center space-y-5">
        {/* Background glow effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 text-slate-950 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-pulse" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest mb-2">
            Legendary Milestone Reached
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            10,000 CREDIT MILESTONE!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Congratulations, <strong className="text-amber-300">{currentUser.name}</strong>! Your verified peer contributions have earned you the highest campus tier.
          </p>
        </div>

        {/* Animated Counter Display */}
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Campus Credits Balance
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400">
            {animatedCredits.toLocaleString()}{' '}
            <span className="text-xl text-amber-300 font-sans font-bold">CR</span>
          </div>

          {/* Progress bar at 100% */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mt-3 p-0.5 border border-amber-500/30">
            <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 h-full rounded-full transition-all duration-1000 w-full animate-pulse" />
          </div>
          <div className="flex justify-between text-[10px] text-amber-200/90 font-mono mt-1.5">
            <span>9,940 CR (Opening)</span>
            <span className="font-bold text-emerald-300">10,010 CR (100% Complete!)</span>
          </div>
        </div>

        {/* Milestone Unlocks */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Laptop className="w-4 h-4" />
            <span>Laptop / iPad / Tablet Reward Vault eligibility unlocked</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You are now eligible to submit mock allocation requests for sponsor-backed study tablets and laptops, plus claim your complimentary <strong>Welcome Sandwich-and-Juice Combo</strong> at the campus canteen!
          </p>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/20 text-[10px] text-amber-200/80 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Transparency Note:</strong> Simulated sponsor-funded reward; subject to approval and availability. Crossing the threshold is eligibility, not a guaranteed free device. No cash withdrawal or real payment integration.
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onExploreVault();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Explore Tech Vault & Canteen Perks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
