import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Location, BatteryInfo, Journey } from '../types';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { TelemetryHUD } from '../components/TelemetryHUD';
import { JourneyProgressBar } from '../components/JourneyProgressBar';
import { EmergencyModal } from '../components/EmergencyModal';
import { NotificationToast } from '../components/NotificationToast';
import { MapView } from '../components/MapView';
import {
  Radio,
  Play,
  Square,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Navigation,
  Share2,
  Copy,
  Check,
  Flag,
  Activity,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { calculateDistance } from '../utils/simulator';

interface TrackerViewProps {
  user: User;
  onLogout: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const {
    connected,
    joinFamily,
    updateLocation,
    sendEmergencyAlert,
    clearEmergencyAlert,
    notifications,
    dismissNotification,
    activeJourneys,
    geofences,
  } = useSocket();

  const [tracking, setTracking] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(
    user.location || {
      latitude: 37.7830,
      longitude: -122.4080,
      speed: 12,
      heading: 210,
      accuracy: 5,
      altitude: 18,
      timestamp: new Date().toISOString(),
    }
  );
  const [battery, setBattery] = useState<BatteryInfo>({ level: 92, charging: false });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Active Journey for this tracker
  const userJourney = activeJourneys.find(
    (j) => j.userId === user.id || j.userName === user.name
  ) || activeJourneys[0];

  useEffect(() => {
    joinFamily(user);

    // Battery status API
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((bm: any) => {
        const updateBat = () => {
          setBattery({
            level: Math.round(bm.level * 100),
            charging: bm.charging,
          });
        };
        updateBat();
        bm.addEventListener('levelchange', updateBat);
        bm.addEventListener('chargingchange', updateBat);
      });
    }

    // Start geolocation watch
    startGeolocation();

    return () => {
      stopGeolocation();
    };
  }, []);

  const startGeolocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setTracking(true);
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const loc: Location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined,
            altitude: pos.coords.altitude || undefined,
            timestamp: new Date().toISOString(),
          };
          setCurrentLocation(loc);
          updateLocation(user.id, loc, battery);
        },
        (err) => {
          console.warn('Geolocation sensor notice:', err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 10000,
        }
      );
      setWatchId(id);
    }
  };

  const stopGeolocation = () => {
    if (watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setTracking(false);
  };

  const toggleTracking = () => {
    sounds.playClick();
    if (tracking) {
      stopGeolocation();
    } else {
      startGeolocation();
    }
  };

  const handleSendEmergency = (msg: string) => {
    if (currentLocation) {
      sendEmergencyAlert(user.id, currentLocation, msg);
    }
  };

  const handleQuickCheckIn = (text: string) => {
    sounds.playArrival();
    if (currentLocation) {
      updateLocation(user.id, currentLocation, battery);
    }
  };

  const handleCopyShareLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}/monitor`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-ambient-cyber text-slate-100 flex flex-col relative overflow-x-hidden">
      <Navbar currentUser={user} onLogout={onLogout} title="Tracker Cockpit" />
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Cockpit Header */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                user.avatarBg || 'from-indigo-500 to-sky-500'
              } flex items-center justify-center text-3xl shadow-glow-indigo shrink-0 relative`}
            >
              <Navigation className="w-8 h-8 text-white" />
              {tracking && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#07090e] animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300">
                  ID: {user.familyId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${tracking ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {tracking ? 'Sharing live coordinates & telemetry' : 'Tracking transmission paused'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* Tracking Toggle Button */}
            <button
              onClick={toggleTracking}
              className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                tracking
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'btn-cyber-emerald'
              }`}
            >
              {tracking ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{tracking ? 'Pause Sharing' : 'Resume Sharing'}</span>
            </button>

            {/* Share Link Button */}
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Monitor Link</span>
                </>
              )}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => {
                sounds.playEmergency();
                setShowEmergencyModal(true);
              }}
              className="btn-cyber-crimson px-5 py-2.5 rounded-xl font-heading font-extrabold text-xs tracking-wider flex items-center gap-2 uppercase shadow-glow-crimson animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Telemetry & Live Map */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Telemetry HUD & Route */}
          <div className="lg:col-span-1 space-y-6">
            <TelemetryHUD
              location={currentLocation}
              battery={battery}
              userName={`${user.name}'s Sensors`}
              isTracking={tracking}
            />

            {userJourney && (
              <JourneyProgressBar journey={userJourney} currentLocation={currentLocation} />
            )}

            {/* Quick Status Check-in Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl space-y-3">
              <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Quick Family Check-In
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "I've Arrived!", desc: "At safe destination" },
                  { label: "In Traffic", desc: "Delayed ~10 mins" },
                  { label: "Heading Home", desc: "Just left current place" },
                  { label: "Need Pick Up", desc: "Waiting at spot" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickCheckIn(item.label)}
                    className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-indigo-600/20 border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-sky-300 block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Map Cockpit */}
          <div className="lg:col-span-2 min-h-[480px] h-[550px] lg:h-auto">
            <MapView
              familyMembers={[
                {
                  ...user,
                  location: currentLocation || user.location,
                  battery,
                },
              ]}
              selectedMember={user}
              geofences={geofences}
              activeJourneys={userJourney ? [userJourney] : []}
              zoomLevel={15}
            />
          </div>
        </div>
      </main>

      {/* Emergency SOS Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          currentLocation={currentLocation}
          onSendEmergency={handleSendEmergency}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
};

export default TrackerView;
