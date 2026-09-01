import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Film,
  Clock,
  Gauge,
  X,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ReplayScrubberProps {
  locationHistory: Location[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export const ReplayScrubber: React.FC<ReplayScrubberProps> = ({
  locationHistory,
  currentIndex,
  onIndexChange,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  const totalPoints = locationHistory.length;
  const currentPoint = locationHistory[currentIndex] || locationHistory[0];

  useEffect(() => {
    if (!isPlaying || totalPoints <= 1) return;

    const interval = setInterval(() => {
      onIndexChange((prev) => {
        if (prev >= totalPoints - 1) {
          setIsPlaying(false);
          sounds.playArrival();
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalPoints]);

  const togglePlay = () => {
    sounds.playClick();
    if (currentIndex >= totalPoints - 1) {
      onIndexChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    sounds.playClick();
    setIsPlaying(false);
    onIndexChange(0);
  };

  const toggleSpeed = () => {
    sounds.playClick();
    setPlaybackSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1));
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '--:--:--';
    return new Date(iso).toLocaleTimeString();
  };

  const speedKmH = currentPoint?.speed ? Math.round(currentPoint.speed * 3.6) : 0;

  return (
    <div className="glass-panel rounded-2xl p-4 border border-indigo-500/30 shadow-glow-indigo space-y-3">
      {/* Header & Waypoint Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs text-white">Trip History Playback</h4>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" /> {formatTime(currentPoint?.timestamp)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Gauge className="w-3 h-3" /> {speedKmH} km/h
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={Math.max(0, totalPoints - 1)}
          value={currentIndex}
          onChange={(e) => onIndexChange(Number(e.target.value))}
          className="w-full accent-indigo-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Point {currentIndex + 1} of {totalPoints}</span>
          <span>{Math.round(((currentIndex + 1) / totalPoints) * 100)}%</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="btn-cyber-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Reset Timeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={toggleSpeed}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-xs font-mono font-bold text-indigo-300 transition-all cursor-pointer flex items-center gap-1"
        >
          <FastForward className="w-3.5 h-3.5" /> {playbackSpeed}x
        </button>
      </div>
    </div>
  );
};
