import React, { useEffect } from 'react';
import { NotificationItem } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  MapPin,
  X,
} from 'lucide-react';

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  // Show up to 3 most recent notifications
  const activeList = notifications.slice(0, 3);

  if (activeList.length === 0) return null;

  const getConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'emergency':
        return {
          bg: 'bg-rose-950/90 border-rose-500/70 text-rose-100 shadow-glow-crimson',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />,
          bar: 'bg-rose-500',
        };
      case 'geofence':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-glow-emerald',
          icon: <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />,
          bar: 'bg-emerald-400',
        };
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-glow-emerald',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          bar: 'bg-emerald-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-100',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          bar: 'bg-amber-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/90 border-indigo-500/40 text-slate-100 shadow-glow-indigo',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          bar: 'bg-indigo-400',
        };
    }
  };

  return (
    <div className="fixed top-16 sm:top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeList.map((item) => {
        const config = getConfig(item.type);
        return (
          <div
            key={item.id}
            className={`pointer-events-auto backdrop-blur-xl border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${config.bg}`}
          >
            <div className="flex items-start p-3.5 gap-3">
              <div className="pt-0.5">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <h5 className="font-heading font-bold text-xs leading-snug">{item.title}</h5>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{item.message}</p>
                <span className="text-[9px] opacity-60 font-mono mt-1 block">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => onDismiss(item.id)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-0.5 bg-black/40 w-full overflow-hidden">
              <div className={`h-full ${config.bar} animate-progress`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
