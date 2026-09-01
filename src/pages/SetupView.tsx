import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Location } from '../types';
import {
  User as UserIcon,
  Shield,
  Heart,
  Car,
  Bike,
  Smile,
  GraduationCap,
  Briefcase,
  Home,
  MapPin,
  Search,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  LocateFixed,
  Shuffle,
  Radio,
  Layers,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SetupViewProps {
  onComplete: (user: User) => void;
}

const AVATAR_OPTIONS = [
  { icon: 'Car', label: 'Car Driver', bg: 'from-pink-500 to-rose-600', comp: Car },
  { icon: 'Bike', label: 'Cyclist', bg: 'from-emerald-500 to-teal-600', comp: Bike },
  { icon: 'Shield', label: 'Guardian', bg: 'from-blue-500 to-indigo-600', comp: Shield },
  { icon: 'Heart', label: 'Family', bg: 'from-rose-500 to-pink-600', comp: Heart },
  { icon: 'GraduationCap', label: 'Student', bg: 'from-amber-500 to-orange-600', comp: GraduationCap },
  { icon: 'Briefcase', label: 'Work', bg: 'from-purple-500 to-indigo-600', comp: Briefcase },
  { icon: 'Smile', label: 'Kid / Junior', bg: 'from-teal-500 to-cyan-600', comp: Smile },
  { icon: 'User', label: 'Individual', bg: 'from-slate-600 to-slate-800', comp: UserIcon },
];

export const SetupView: React.FC<SetupViewProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = (location.state?.role as 'tracker' | 'monitor') || 'tracker';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'tracker' | 'monitor'>(initialRole);
  const [name, setName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // Home base / Destination Setup
  const [homeName, setHomeName] = useState('Home Base');
  const [homeLocation, setHomeLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Generate an initial random family ID if empty
    if (!familyId) {
      generateRandomCode();
    }
  }, []);

  const generateRandomCode = () => {
    sounds.playClick();
    const code = 'FAM-' + Math.floor(1000 + Math.random() * 9000);
    setFamilyId(code);
  };

  const handleGetCurrentLocation = () => {
    sounds.playClick();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        sounds.playGeofence();
        setHomeLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        });
      },
      (err) => {
        setIsLocating(false);
        alert('Could not retrieve current location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    sounds.playClick();
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=4`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
    setIsSearching(false);
  };

  const handleSelectSearchResult = (result: any) => {
    sounds.playClick();
    setHomeLocation({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      timestamp: new Date().toISOString(),
    });
    setHomeName(result.display_name.split(',')[0]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleFinish = () => {
    sounds.playArrival();
    const newUser: User = {
      id: `user-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim() || 'Family Member',
      role,
      familyId: familyId.trim().toUpperCase(),
      avatarIcon: selectedAvatar.icon,
      avatarBg: selectedAvatar.bg,
      lastSeen: new Date().toISOString(),
      location: homeLocation || {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: new Date().toISOString(),
      },
    };

    onComplete(newUser);
    navigate(role === 'tracker' ? '/tracker' : '/monitor');
  };

  return (
    <div className="min-h-screen bg-ambient-cyber flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-xl w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative z-10 space-y-6">
        {/* Navigation & Step Progress */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <button
            onClick={() => (step > 1 ? setStep((step - 1) as any) : navigate('/'))}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? 'Choose Role' : 'Back'}
          </button>

          {/* Step Pill */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-2 rounded-full transition-all ${
                  step === s
                    ? 'bg-indigo-400 w-10 shadow-glow-indigo'
                    : step > s
                    ? 'bg-emerald-400'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">Step {step} of 3</span>
        </div>

        {/* STEP 1: Profile & Avatar */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-white">Create Your Profile</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Choose an identity avatar and how you'll appear on your family's map.
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor, Alex, Dad"
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-white placeholder-slate-500 text-sm"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Your Icon Avatar
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_OPTIONS.map((opt) => {
                  const IconComp = opt.comp;
                  const isSelected = selectedAvatar.icon === opt.icon;
                  return (
                    <button
                      key={opt.icon}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedAvatar(opt);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-500 shadow-glow-indigo scale-105'
                          : 'bg-slate-900/50 border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.bg} flex items-center justify-center text-white shadow-md`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                if (!name.trim()) {
                  alert('Please enter your name');
                  return;
                }
                sounds.playClick();
                setStep(2);
              }}
              className="w-full btn-cyber-primary py-3.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to Family Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Family ID / Connect Code */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-white">Family Connection Code</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your shared Family Code or generate a new one to link all family devices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-center space-y-3">
              <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                Your Shared Family Group ID
              </span>

              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
                  placeholder="e.g. FAM-8899"
                  className="px-4 py-2.5 rounded-xl glass-input text-center text-xl sm:text-2xl font-mono font-extrabold text-sky-300 tracking-wider w-48 uppercase"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  title="Generate New Code"
                  className="p-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Share this exact code with your other family members so everyone appears on the same map.
              </p>
            </div>

            <button
              onClick={() => {
                if (!familyId.trim()) {
                  alert('Please enter or generate a Family ID');
                  return;
                }
                sounds.playClick();
                setStep(3);
              }}
              className="w-full btn-cyber-primary py-3.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to Safe Zone Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: Home Safe Zone & Finish */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-white">Set Your Home Base</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Configure your home coordinates to receive automatic arrival alerts and live ETA calculations.
              </p>
            </div>

            {/* Current Geolocation Fix Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">Use Current Device GPS</h4>
                  <p className="text-xs text-slate-400">Instantly grab your home's current latitude & longitude</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Address Search Option */}
            <form onSubmit={handleSearchAddress} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Or Search Address / City</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Market St, San Francisco or City Name"
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-white placeholder-slate-500 text-xs"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="btn-cyber-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="p-2 rounded-2xl bg-slate-900 border border-white/10 space-y-1 mt-2">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(r)}
                      className="w-full text-left p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors truncate block"
                    >
                      📍 {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Selected Coordinates Preview */}
            {homeLocation && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Location Set: {homeLocation.latitude.toFixed(5)}, {homeLocation.longitude.toFixed(5)}</span>
                </div>
              </div>
            )}

            {/* Launch Button */}
            <button
              onClick={handleFinish}
              className="w-full btn-cyber-emerald py-3.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-glow-emerald"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch {role === 'tracker' ? 'Tracker Cockpit' : 'Command Center'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupView;
