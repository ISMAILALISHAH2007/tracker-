import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { User } from '../types';
import {
  Radio,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Shield,
  ShieldAlert,
  Compass,
  Eye,
  LogOut,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  currentUser?: User | null;
  onLogout?: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    connected,
    isSimulating,
    setIsSimulating,
    soundEnabled,
    setSoundEnabled,
    familyMembers,
  } = useSocket();

  const isEmergencyActive = familyMembers.some(m => m.isEmergency);

  const toggleSimulation = () => {
    sounds.playClick();
    setIsSimulating(!isSimulating);
  };

  const toggleSound = () => {
    sounds.playClick();
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 backdrop-blur-xl bg-[#07090e]/80 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1.5px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all duration-300">
              <div className="w-full h-full bg-[#0d121d] rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  Family Tracker
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-mono font-semibold text-indigo-300 uppercase tracking-widest hidden sm:inline-block">
                  PRO MAX
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                {title || 'Real-Time Safety Command Center'}
              </p>
            </div>
          </button>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Alert Banner if any member triggered SOS */}
          {isEmergencyActive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse shadow-glow-crimson">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden md:inline">EMERGENCY ACTIVE</span>
            </div>
          )}

          {/* Simulator Toggle Badge */}
          <button
            onClick={toggleSimulation}
            title={isSimulating ? 'Pause Live Movement Simulation' : 'Start Live Movement Simulation'}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isSimulating
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
                : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">{isSimulating ? 'Demo Sim Active' : 'Demo Sim Off'}</span>
            <span className="text-[10px] font-mono opacity-75">{isSimulating ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                : 'bg-slate-900/60 border-white/10 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Network Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium backdrop-blur-md ${
              connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/60 border-white/10 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="hidden md:inline">{connected ? 'Live Sync' : 'Local Sandbox'}</span>
          </div>

          {/* User Profile / Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{currentUser.name}</span>
                <span className="text-[10px] font-mono text-slate-400 capitalize">
                  {currentUser.role} • {currentUser.familyId}
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Switch Role or Logout"
                  className="p-2 rounded-xl bg-slate-900/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
