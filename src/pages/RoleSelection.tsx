import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Navigation,
  Eye,
  ShieldCheck,
  Sparkles,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { useSocket } from '../context/SocketContext';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { isSimulating, setIsSimulating } = useSocket();
  const [savedUser, setSavedUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('familyTrackerUser');
    if (saved) {
      try {
        setSavedUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectRole = (role: 'tracker' | 'monitor') => {
    sounds.playClick();
    if (savedUser && savedUser.role === role) {
      navigate(role === 'tracker' ? '/tracker' : '/monitor');
    } else {
      navigate('/setup', { state: { role } });
    }
  };

  const handleInstantDemo = () => {
    sounds.playArrival();
    setIsSimulating(true);
    const demoUser = {
      id: 'demo-monitor-1',
      name: 'Family Dispatch',
      role: 'monitor',
      familyId: 'DEMO-777',
      avatarIcon: 'Shield',
      avatarBg: 'from-indigo-600 to-sky-500',
    };
    localStorage.setItem('familyTrackerUser', JSON.stringify(demoUser));
    navigate('/monitor');
  };

  return (
    <div className="min-h-screen bg-ambient-cyber flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8 my-auto">
        {/* Hero Branding Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[2px] shadow-glow-indigo animate-float-slow mx-auto">
            <div className="w-full h-full bg-[#0d121d] rounded-[22px] flex items-center justify-center">
              <Radio className="w-10 h-10 text-sky-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              NEXT-GEN GEOLOCATION SYSTEM
            </div>
            <h1 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white">
              Family <span className="gradient-text-indigo">Tracker</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-normal">
              Precision real-time location telemetry, safe zones, emergency SOS broadcasts, and instant arrival alerts for loved ones.
            </p>
          </div>
        </div>

        {/* Action Grid: Tracker vs Monitor */}
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {/* Tracker Card */}
          <div
            onClick={() => handleSelectRole('tracker')}
            className="group glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] hover:border-indigo-500/50 hover:shadow-glow-indigo transition-all duration-500 flex flex-col justify-between text-left cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600/30 transition-all duration-300 shadow-md">
                <Navigation className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  TRAVELER MODE
                </span>
                <h3 className="text-2xl font-heading font-extrabold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                  I'm Being Tracked
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Broadcast your live GPS telemetry, speed, route progress, and one-touch emergency SOS beacon to your family.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/[0.06] text-[11px] font-mono text-slate-300">
                  Live GPS Speedometer
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/[0.06] text-[11px] font-mono text-slate-300">
                  Instant SOS Beacon
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-indigo-400 font-heading font-bold text-sm">
              <span>Enter Tracker Cockpit</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>

          {/* Monitor Card */}
          <div
            onClick={() => handleSelectRole('monitor')}
            className="group glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] hover:border-sky-500/50 hover:shadow-glow-sky transition-all duration-500 flex flex-col justify-between text-left cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-600/30 transition-all duration-300 shadow-md">
                <Eye className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                  MISSION CONTROL
                </span>
                <h3 className="text-2xl font-heading font-extrabold text-white mt-1 group-hover:text-sky-300 transition-colors">
                  I'm Monitoring
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  View live radar map with multiple family members, smart geofences, ETA trip tracking, and trip history replays.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/[0.06] text-[11px] font-mono text-slate-300">
                  Safe Zone Geofences
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/[0.06] text-[11px] font-mono text-slate-300">
                  Trip History Replay
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-sky-400 font-heading font-bold text-sm">
              <span>Open Command Center</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Demo Simulator Quick Access Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow-emerald">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">
                Interactive Demo Simulator
              </h4>
              <p className="text-xs text-slate-400">
                Explore the full command center with simulated family members, live routes, and geofence alerts.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstantDemo}
            className="btn-cyber-emerald px-5 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 shrink-0"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust Badges Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-End Encrypted Sync
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> Low Battery Power Optimization
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-400" /> Sub-Second Telemetry Latency
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
