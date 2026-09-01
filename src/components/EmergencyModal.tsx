import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import {
  ShieldAlert,
  AlertOctagon,
  Phone,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface EmergencyModalProps {
  currentLocation?: Location | null;
  onSendEmergency: (message: string) => void;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  currentLocation,
  onSendEmergency,
  onClose,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [customMessage, setCustomMessage] = useState(
    'EMERGENCY! I need immediate assistance at my current location!'
  );
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !sent) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !sent) {
      handleBroadcast();
    }
  }, [countdown, sent]);

  const handleBroadcast = () => {
    sounds.playEmergency();
    onSendEmergency(customMessage);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-8 border-2 border-rose-500/70 shadow-glow-crimson space-y-6 text-center relative overflow-hidden">
        {/* Animated Beacon Ring Background */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Emergency Beacon Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-500 p-1 shadow-2xl shadow-rose-600/60 animate-pulse">
            <div className="w-full h-full bg-[#07090e] rounded-[22px] flex items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
            </div>
          </div>
          {!sent && (
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 border-2 border-[#07090e] flex items-center justify-center text-white font-mono font-bold text-sm shadow-lg animate-ping">
              {countdown}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            {sent ? '🚨 Emergency SOS Broadcast Active' : 'Broadcasting SOS Alert'}
          </h2>
          <p className="text-sm text-rose-200/90 mt-1">
            {sent
              ? 'Your live GPS coordinates and distress signal have been transmitted to all family monitors.'
              : `Transmitting distress beacon in ${countdown}s. Press cancel to abort.`}
          </p>
        </div>

        {/* GPS Location Snippet */}
        {currentLocation && (
          <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center justify-between">
            <span>Live Fix:</span>
            <span className="font-bold">
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </span>
          </div>
        )}

        {/* Message Input */}
        <div className="text-left">
          <label className="block text-xs font-semibold text-rose-200 mb-1.5">
            Distress Message
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            disabled={sent}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-rose-500/40 text-white placeholder-rose-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!sent ? (
            <div className="flex gap-3">
              <button
                onClick={handleBroadcast}
                className="flex-1 btn-cyber-crimson py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Now
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <a
                href="tel:911"
                className="w-full btn-cyber-crimson py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 block"
              >
                <Phone className="w-4 h-4" /> Call Emergency Services (911)
              </a>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10 transition-all"
              >
                Close SOS Overlay (Broadcasting Continues)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
