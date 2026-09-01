import React, { useState } from 'react';
import { Location, BatteryInfo } from '../types';
import {
  Gauge,
  Compass,
  Zap,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Navigation,
  MapPin,
  Check,
  Copy,
  Activity,
  Mountain,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface TelemetryHUDProps {
  location?: Location | null;
  battery?: BatteryInfo | null;
  userName?: string;
  isTracking?: boolean;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  location,
  battery,
  userName = 'Telemetry Data',
  isTracking = true,
}) => {
  const [copied, setCopied] = useState(false);

  const speedMs = location?.speed || 0;
  const speedKmH = Math.round(speedMs * 3.6);
  const speedMpH = Math.round(speedKmH * 0.621371);
  const heading = Math.round(location?.heading || 0);
  const accuracy = Math.round(location?.accuracy || 5);
  const altitude = Math.round(location?.altitude || 0);

  const copyCoordinates = () => {
    if (!location) return;
    sounds.playClick();
    const str = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSpeedColor = () => {
    if (speedKmH === 0) return 'text-slate-400 border-slate-700 bg-slate-900/40';
    if (speedKmH < 25) return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    if (speedKmH < 70) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (speedKmH < 100) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse';
  };

  const getHeadingLabel = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">{userName}</h4>
            <p className="text-[11px] text-slate-400 font-mono">
              {isTracking ? 'Live Telemetry Active' : 'Sensor Standby'}
            </p>
          </div>
        </div>

        {/* Battery Widget */}
        {battery ? (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-md ${
              battery.charging
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : battery.level <= 20
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-slate-900/60 border-white/10 text-slate-300'
            }`}
          >
            {battery.charging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : battery.level <= 20 ? (
              <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="font-mono">{Math.round(battery.level)}%</span>
            {battery.charging && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-200 font-bold uppercase">
                CHG
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">Battery: 100%</div>
        )}
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Speedometer */}
        <div className={`p-3 rounded-xl border flex flex-col justify-between ${getSpeedColor()}`}>
          <div className="flex items-center justify-between text-xs font-medium opacity-80">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              Speed
            </span>
            <span className="text-[10px] font-mono opacity-70">{speedMpH} mph</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
              {speedKmH}
            </span>
            <span className="text-xs font-mono font-bold opacity-80">km/h</span>
          </div>
        </div>

        {/* Heading / Compass */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.08] text-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Heading
            </span>
            <span className="text-[10px] font-mono text-sky-400 font-bold">
              {getHeadingLabel(heading)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                {heading}
              </span>
              <span className="text-xs font-mono text-slate-400">°</span>
            </div>
            <div
              className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center transition-transform duration-500"
              style={{ transform: `rotate(${heading}deg)` }}
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            </div>
          </div>
        </div>

        {/* GPS Accuracy */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.08] text-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Accuracy
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {accuracy < 10 ? 'PRECISE' : 'FAIR'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              ±{accuracy}
            </span>
            <span className="text-xs font-mono text-slate-400">m</span>
          </div>
        </div>

        {/* Altitude */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.08] text-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-indigo-400" />
              Altitude
            </span>
            <span className="text-[10px] font-mono text-slate-500">ASL</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {altitude}
            </span>
            <span className="text-xs font-mono text-slate-400">m</span>
          </div>
        </div>
      </div>

      {/* Lat / Lng Coordinates Bar */}
      {location && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-slate-500">GPS:</span>
            <span className="text-sky-300 font-semibold">{location.latitude.toFixed(6)}° N</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-300 font-semibold">{location.longitude.toFixed(6)}° W</span>
          </div>
          <button
            onClick={copyCoordinates}
            title="Copy Latitude & Longitude"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-sans">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="font-sans">Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
