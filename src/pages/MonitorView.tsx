import React, { useState, useEffect } from 'react';
import { User, Location, Geofence, Journey } from '../types';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { MapView } from '../components/MapView';
import { MemberCard } from '../components/MemberCard';
import { TelemetryHUD } from '../components/TelemetryHUD';
import { JourneyProgressBar } from '../components/JourneyProgressBar';
import { GeofenceManager } from '../components/GeofenceManager';
import { ReplayScrubber } from '../components/ReplayScrubber';
import { NotificationToast } from '../components/NotificationToast';
import {
  Shield,
  MapPin,
  Navigation,
  Film,
  Bell,
  Plus,
  Crosshair,
  Sliders,
  Sparkles,
  Users,
  Clock,
  Radio,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface MonitorViewProps {
  user: User;
  onLogout: () => void;
}

export const MonitorView: React.FC<MonitorViewProps> = ({ user, onLogout }) => {
  const {
    connected,
    familyMembers,
    notifications,
    activeJourneys,
    geofences,
    selectedMember,
    setSelectedMember,
    joinFamily,
    addGeofence,
    deleteGeofence,
    startJourney,
    dismissNotification,
    clearEmergencyAlert,
  } = useSocket();

  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [mapSelectionMode, setMapSelectionMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // History Replay State
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    joinFamily(user);
    if (familyMembers.length > 0 && !selectedMember) {
      setSelectedMember(familyMembers[0]);
    }
  }, []);

  const handleLocationSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setShowLocationMenu(true);
    setMapSelectionMode(false);
  };

  const handleCreateGeofenceFromPin = () => {
    setShowLocationMenu(false);
    setShowGeofenceModal(true);
  };

  const handleSetDestinationForMember = () => {
    if (!selectedLocation || !selectedMember) return;
    sounds.playArrival();

    startJourney({
      userId: selectedMember.id,
      userName: selectedMember.name,
      userAvatar: selectedMember.avatarIcon || 'Car',
      destination: selectedLocation,
      destinationName: 'Target Location',
      distanceRemaining: 2400,
      totalDistance: 2400,
      eta: '5 mins',
      waypoints: [
        [selectedMember.location?.latitude || 37.7749, selectedMember.location?.longitude || -122.4194],
        [
          ((selectedMember.location?.latitude || 37.7749) + selectedLocation.latitude) / 2,
          ((selectedMember.location?.longitude || -122.4194) + selectedLocation.longitude) / 2,
        ],
        [selectedLocation.latitude, selectedLocation.longitude],
      ],
    });

    setShowLocationMenu(false);
    setSelectedLocation(null);
  };

  const handleCopyFamilyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(user.familyId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const historyPoints = selectedMember?.locationHistory || [];
  const activeReplayPoint = isReplaying && historyPoints.length > 0 ? historyPoints[replayIndex] : null;

  return (
    <div className="min-h-screen bg-ambient-cyber text-slate-100 flex flex-col relative overflow-x-hidden">
      <Navbar currentUser={user} onLogout={onLogout} title="Mission Command Center" />
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Top Mission Control Action Bar */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-glow-indigo shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                  Family Command Center
                </h2>
                <button
                  onClick={handleCopyFamilyCode}
                  title="Click to copy Family Code"
                  className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300 hover:bg-indigo-500/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{user.familyId}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring {familyMembers.length} family member{familyMembers.length === 1 ? '' : 's'} • {geofences.length} active safe zone{geofences.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
            {/* Geofences Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowGeofenceModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe Zones ({geofences.length})</span>
            </button>

            {/* Pin Target on Map */}
            <button
              onClick={() => {
                sounds.playClick();
                setMapSelectionMode(!mapSelectionMode);
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapSelectionMode
                  ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-glow-sky'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${mapSelectionMode ? 'animate-spin' : ''}`} />
              <span>{mapSelectionMode ? 'Click Map...' : 'Pin Location'}</span>
            </button>

            {/* Trip Replay Button */}
            {historyPoints.length > 1 && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsReplaying(!isReplaying);
                  setReplayIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isReplaying
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-slate-900/70 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>{isReplaying ? 'Exit Replay' : 'Replay Trip'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Dashboard: Split View */}
        <div className="grid lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Family Members & Live Status (4 Columns on large screen) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-heading font-bold text-sm text-white">Family Fleet</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                  {familyMembers.length} CONNECTED
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-2.5">
                {familyMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isSelected={selectedMember?.id === member.id}
                    onSelect={(m) => {
                      setSelectedMember(m);
                      setIsReplaying(false);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Selected Member Telemetry HUD & Active Journey */}
            {selectedMember && (
              <TelemetryHUD
                location={selectedMember.location}
                battery={selectedMember.battery}
                userName={`${selectedMember.name}'s Telemetry`}
                isTracking={Boolean(selectedMember.location)}
              />
            )}

            {/* Active Journeys Widget */}
            {activeJourneys.length > 0 && (
              <div className="space-y-3">
                {activeJourneys.map((journey) => (
                  <JourneyProgressBar
                    key={journey.id}
                    journey={journey}
                    currentLocation={selectedMember?.location}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: High-Tech Map Cockpit & Scrubber (8 Columns on large screen) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="h-[560px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl relative border border-white/[0.08]">
              <MapView
                familyMembers={familyMembers}
                selectedMember={selectedMember}
                geofences={geofences}
                activeJourneys={activeJourneys}
                selectionMode={mapSelectionMode}
                selectedLocation={selectedLocation}
                onMemberSelect={(m) => setSelectedMember(m)}
                onLocationSelect={handleLocationSelect}
                replayPoint={activeReplayPoint}
                zoomLevel={14}
              />
            </div>

            {/* Trip Replay Scrubber Bar */}
            {isReplaying && historyPoints.length > 1 && (
              <ReplayScrubber
                locationHistory={historyPoints}
                currentIndex={replayIndex}
                onIndexChange={(idx) => setReplayIndex(idx)}
                onClose={() => setIsReplaying(false)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Geofence Safe Zones Manager Modal */}
      {showGeofenceModal && (
        <GeofenceManager
          geofences={geofences}
          selectedLocation={selectedLocation}
          onAddGeofence={addGeofence}
          onDeleteGeofence={deleteGeofence}
          onClose={() => setShowGeofenceModal(false)}
        />
      )}

      {/* Location Pin Action Modal */}
      {showLocationMenu && selectedLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowLocationMenu(false)}
        >
          <div
            className="glass-panel max-w-sm w-full rounded-3xl p-6 border border-white/[0.12] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Target Location Selected</h3>
              <p className="text-xs font-mono text-sky-300">
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleCreateGeofenceFromPin}
                className="w-full btn-cyber-emerald py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Create Safe Zone Here</span>
              </button>

              {selectedMember && (
                <button
                  onClick={handleSetDestinationForMember}
                  className="w-full btn-cyber-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate {selectedMember.name} Here</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowLocationMenu(false);
                  setSelectedLocation(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorView;
