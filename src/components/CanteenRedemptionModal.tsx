import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CanteenRedemption } from '../types';
import {
  X,
  QrCode,
  CheckCircle2,
  Sparkles,
  Utensils,
  ShieldCheck,
  Clock,
  Scan,
} from 'lucide-react';

interface CanteenRedemptionModalProps {
  redemption: CanteenRedemption | null;
  onClose: () => void;
  onScanSuccess: (msg: string) => void;
}

export const CanteenRedemptionModal: React.FC<CanteenRedemptionModalProps> = ({
  redemption,
  onClose,
  onScanSuccess,
}) => {
  const { scanCanteenCode } = useApp();
  const [isScanning, setIsScanning] = useState(false);

  if (!redemption) return null;

  const isCollected = redemption.status === 'scanned_and_collected';

  const handleDemoScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = scanCanteenCode(redemption.id);
      setIsScanning(false);
      if (res.success) {
        onScanSuccess(res.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 uppercase tracking-wide">
            <Utensils className="w-3 h-3 text-amber-600" />
            <span>Campus Canteen Counter Voucher</span>
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 mt-1">
            {redemption.itemTitle}
          </h2>
          <p className="text-xs text-slate-500">
            Claimed by <strong>{redemption.userName}</strong> ({redemption.tierClaimed} Tier)
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative max-w-[260px] mx-auto">
          {isCollected ? (
            <div className="py-8 space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-extrabold text-emerald-800 text-base">Voucher Collected!</h4>
              <p className="text-[11px] text-emerald-700">
                Item picked up at canteen counter. Enjoy your meal!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Stylized QR Code Pattern */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                <div className="w-40 h-40 bg-slate-900 p-2 rounded-xl flex flex-wrap gap-1 items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-2 border-2 border-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-white" />
                  </div>
                  {/* Scanner line animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 shadow-md shadow-amber-400 animate-pulse" />
                </div>
              </div>

              {/* Unique Voucher Code */}
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-extrabold text-sm text-slate-900 tracking-wider">
                {redemption.code}
              </div>
            </div>
          )}
        </div>

        {/* Status info */}
        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Type:</span>
            <span className="font-bold text-emerald-700">
              {redemption.isFreebie ? 'Tier Freebie (0 Credits)' : `${redemption.creditCost} Credits`}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Status:</span>
            <span
              className={`font-bold ${
                isCollected ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {isCollected ? 'Scanned & Collected' : 'Active (Ready for counter scan)'}
            </span>
          </div>
        </div>

        {/* Demo Scanner Trigger Button */}
        <div className="pt-2">
          {!isCollected ? (
            <button
              onClick={handleDemoScan}
              disabled={isScanning}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4 animate-spin-slow" />
              <span>
                {isScanning
                  ? 'Simulating Scanner...'
                  : 'DEMO SCAN (Simulate Canteen Counter Scanner)'}
              </span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close Voucher
            </button>
          )}
          <p className="text-[10px] text-slate-400 mt-2">
            Show this QR screen to the campus canteen attendant or click the demo scan button.
          </p>
        </div>
      </div>
    </div>
  );
};
