import React from 'react';
import { User } from '../types';
import {
  User as UserIcon,
  Shield,
  Heart,
  Car,
  Bike,
  Smile,
  GraduationCap,
  Briefcase,
  Battery,
  BatteryCharging,
  BatteryWarning,
  MapPin,
  Clock,
  Gauge,
  Navigation,
  ShieldAlert,
  ChevronRight,
  Phone,
  Radio,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface MemberCardProps {
  member: User;
  isSelected?: boolean;
  onSelect: (member: User) => void;
  onFocusOnMap?: (member: User) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isSelected = false,
  onSelect,
  onFocusOnMap,
}) => {
  const getAvatarIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'Bike':
        return <Bike className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Smile':
        return <Smile className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const formatLastSeen = (iso?: string) => {
    if (!iso) return 'Offline';
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 15000) return 'Active Now';
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const speedKmH = member.location?.speed ? Math.round(member.location.speed * 3.6) : 0;
  const isMoving = speedKmH > 2;

  const handleClick = () => {
    sounds.playClick();
    onSelect(member);
    if (onFocusOnMap) onFocusOnMap(member);
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group ${
        member.isEmergency
          ? 'bg-rose-950/40 border-rose-500/60 shadow-glow-crimson animate-pulse'
          : isSelected
          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-glow-indigo'
          : 'bg-slate-900/40 hover:bg-slate-800/50 border-white/[0.08] hover:border-indigo-500/30'
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Avatar Glyph */}
        <div className="relative shrink-0">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
              member.avatarBg || 'from-indigo-500 to-sky-500'
            } flex items-center justify-center text-white shadow-md shadow-black/40 group-hover:scale-105 transition-transform duration-300`}
          >
            {getAvatarIcon(member.avatarIcon)}
          </div>
          {/* Live Status Pulse Dot */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0d121d] flex items-center justify-center ${
              member.isEmergency
                ? 'bg-rose-500 animate-ping'
                : isMoving
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-indigo-400'
            }`}
          />
        </div>

        {/* Member Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <h4 className="font-heading font-bold text-sm text-white truncate group-hover:text-sky-300 transition-colors">
              {member.name}
            </h4>

            {/* Battery Indicator */}
            {member.battery && (
              <div
                className={`flex items-center gap-1 text-[11px] font-mono font-medium ${
                  member.battery.charging
                    ? 'text-emerald-400'
                    : member.battery.level <= 20
                    ? 'text-rose-400 animate-pulse'
                    : 'text-slate-400'
                }`}
              >
                {member.battery.charging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <Battery className="w-3.5 h-3.5" />
                )}
                <span>{Math.round(member.battery.level)}%</span>
              </div>
            )}
          </div>

          {/* Subtitle / Status tags */}
          <div className="flex items-center gap-2 text-xs">
            {member.isEmergency ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> SOS TRIGGERED
              </span>
            ) : member.currentGeofence ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-emerald-400" /> At {member.currentGeofence}
              </span>
            ) : isMoving ? (
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] font-semibold flex items-center gap-1">
                <Navigation className="w-3 h-3 text-sky-400 animate-spin" style={{ animationDuration: '4s' }} />
                Traveling ({speedKmH} km/h)
              </span>
            ) : (
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> {formatLastSeen(member.lastSeen)}
              </span>
            )}
          </div>
        </div>

        {/* Right Arrow indicator */}
        <ChevronRight
          className={`w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 ${
            isSelected ? 'text-indigo-400 translate-x-0.5' : ''
          }`}
        />
      </div>
    </div>
  );
};
