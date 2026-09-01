import React from 'react';
import { Journey, Location } from '../types';
import {
  Navigation,
  Clock,
  Flag,
  CheckCircle2,
  MapPin,
  Car,
  Bike,
  Footprints,
  Compass,
} from 'lucide-react';

interface JourneyProgressBarProps {
  journey: Journey;
  currentLocation?: Location | null;
  onEndJourney?: () => void;
}

export const JourneyProgressBar: React.FC<JourneyProgressBarProps> = ({
  journey,
  currentLocation,
  onEndJourney,
}) => {
  const formatDistance = (meters?: number) => {
    if (meters === undefined || meters === null) return 'Calculating...';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const progress = Math.min(100, Math.max(0, journey.progress || 0));

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl space-y-3.5">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-white">
                En Route to {journey.destinationName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Driver: <strong className="text-slate-200">{journey.userName}</strong>
            </p>
          </div>
        </div>

        {/* ETA badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>ETA: {journey.eta || '3 mins'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {formatDistance(journey.distanceRemaining)} left
          </span>
        </div>
      </div>

      {/* Progress Bar with Shimmer */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-950/80 rounded-full h-3 p-0.5 border border-white/[0.08] overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" /> Start
          </span>
          <span className="font-bold text-slate-200">{progress}% Completed</span>
          <span className="flex items-center gap-1">
            <Flag className="w-3 h-3 text-emerald-400" /> {journey.destinationName}
          </span>
        </div>
      </div>
    </div>
  );
};
