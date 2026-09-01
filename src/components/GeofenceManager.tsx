import React, { useState } from 'react';
import { Geofence, Location } from '../types';
import {
  Shield,
  Home,
  GraduationCap,
  Briefcase,
  Dumbbell,
  MapPin,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Check,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface GeofenceManagerProps {
  geofences: Geofence[];
  selectedLocation?: Location | null;
  onAddGeofence: (geofence: Omit<Geofence, 'id'>) => void;
  onDeleteGeofence: (id: string) => void;
  onClose: () => void;
}

const GEOFENCE_PRESETS = [
  { type: 'home' as const, label: 'Home', icon: Home, color: '#10b981', defaultRadius: 100 },
  { type: 'school' as const, label: 'School', icon: GraduationCap, color: '#0ea5e9', defaultRadius: 150 },
  { type: 'work' as const, label: 'Work', icon: Briefcase, color: '#6366f1', defaultRadius: 200 },
  { type: 'gym' as const, label: 'Gym / Sports', icon: Dumbbell, color: '#f59e0b', defaultRadius: 120 },
  { type: 'custom' as const, label: 'Custom Zone', icon: MapPin, color: '#ec4899', defaultRadius: 100 },
];

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  geofences,
  selectedLocation,
  onAddGeofence,
  onDeleteGeofence,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(GEOFENCE_PRESETS[0]);
  const [radius, setRadius] = useState(100);
  const [notifications, setNotifications] = useState(true);

  // Lat / Lng defaults to selected map pin or SF center
  const [lat, setLat] = useState(selectedLocation?.latitude || 37.7749);
  const [lng, setLng] = useState(selectedLocation?.longitude || -122.4194);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sounds.playClick();
    onAddGeofence({
      familyId: 'FAM-1',
      name: name.trim(),
      latitude: Number(lat),
      longitude: Number(lng),
      radius: Number(radius),
      type: selectedPreset.type,
      color: selectedPreset.color,
      notifications,
    });

    setName('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    sounds.playClick();
    onDeleteGeofence(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-white/[0.12] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Safe Zones (Geofencing)</h3>
              <p className="text-xs text-slate-400">Automated entry & exit arrival notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Geofences List */}
        {!isAdding ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Active Safe Zones ({geofences.length})
              </span>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsAdding(true);
                  if (selectedLocation) {
                    setLat(selectedLocation.latitude);
                    setLng(selectedLocation.longitude);
                  }
                }}
                className="btn-cyber-emerald px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Safe Zone
              </button>
            </div>

            {geofences.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-white/[0.06] text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium">No safe zones configured yet</p>
                <p className="text-xs text-slate-500">
                  Create safe zones like Home or School to automatically notify family when someone arrives.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {geofences.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/[0.06] flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: `${zone.color || '#10b981'}25`, border: `1px solid ${zone.color || '#10b981'}40` }}
                      >
                        <Shield className="w-5 h-5" style={{ color: zone.color || '#10b981' }} />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-white">{zone.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <span>Radius: {zone.radius}m</span>
                          <span>•</span>
                          <span className="text-slate-500 truncate">
                            {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {zone.notifications ? (
                        <span title="Arrival Notifications Enabled" className="text-emerald-400 p-1.5">
                          <Bell className="w-4 h-4" />
                        </span>
                      ) : (
                        <span title="Notifications Muted" className="text-slate-500 p-1.5">
                          <BellOff className="w-4 h-4" />
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Delete Safe Zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Add Safe Zone Form */
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> New Safe Zone
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to List
              </button>
            </div>

            {/* Zone Presets Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Zone Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {GEOFENCE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset.type === preset.type;
                  return (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedPreset(preset);
                        setRadius(preset.defaultRadius);
                        if (!name) setName(preset.label);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-glow-emerald'
                          : 'bg-slate-900/50 border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: isSelected ? preset.color : undefined }} />
                      <span className="text-[10px] font-medium leading-tight">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Zone Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home, Lincoln High School, Grandparents"
                required
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white placeholder-slate-500 text-sm"
              />
            </div>

            {/* Radius Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" /> Safe Zone Radius
                </span>
                <span className="font-mono font-bold text-emerald-400">{radius} meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50m (House)</span>
                <span>200m (Block)</span>
                <span>500m (Campus)</span>
                <span>1000m (Neighborhood)</span>
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex gap-3">
              <button
                type="submit"
                className="flex-1 btn-cyber-emerald py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Safe Zone
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
