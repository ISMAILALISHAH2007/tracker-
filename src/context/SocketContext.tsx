import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Location, User, Journey, NotificationItem, Geofence, BatteryInfo } from '../types';
import { sounds } from '../utils/audio';
import {
  DEFAULT_GEOFENCES,
  SIMULATED_MEMBERS,
  SIMULATED_JOURNEY,
  isInsideGeofence,
  calculateDistance,
} from '../utils/simulator';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  familyMembers: User[];
  notifications: NotificationItem[];
  activeJourneys: Journey[];
  geofences: Geofence[];
  selectedMember: User | null;
  setSelectedMember: (member: User | null) => void;
  joinFamily: (user: Partial<User>) => void;
  updateLocation: (userId: string, location: Location, battery?: BatteryInfo) => void;
  sendEmergencyAlert: (userId: string, location: Location, message: string) => void;
  clearEmergencyAlert: (userId: string) => void;
  startJourney: (journey: Partial<Journey>) => void;
  endJourney: (journeyId: string) => void;
  addGeofence: (geofence: Omit<Geofence, 'id'>) => void;
  deleteGeofence: (geofenceId: string) => void;
  dismissNotification: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true); // Default to live simulation so demo is immediately stunning
  const [familyMembers, setFamilyMembers] = useState<User[]>(SIMULATED_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([SIMULATED_JOURNEY]);
  const [geofences, setGeofences] = useState<Geofence[]>(DEFAULT_GEOFENCES);
  const [selectedMember, setSelectedMember] = useState<User | null>(SIMULATED_MEMBERS[0]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sounds.setEnabled(val);
  };

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 30));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Socket.IO real-time connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: 5,
      timeout: 3000,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      sounds.playConnect();
      addNotification({
        type: 'success',
        title: 'Network Connected',
        message: 'Real-time telemetry channel established.'
      });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', () => {
      setConnected(false);
    });

    // Real server event listeners
    newSocket.on('location-update', (data: any) => {
      if (isSimulating) return; // Don't overwrite if in sandbox mode
      setFamilyMembers(prev => {
        const id = data.userId || data.trackerId || 'remote-tracker';
        const existing = prev.find(m => m.id === id);
        const updatedLoc: Location = {
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          altitude: data.altitude,
          accuracy: data.accuracy,
          timestamp: new Date().toISOString()
        };

        if (existing) {
          return prev.map(m =>
            m.id === id
              ? {
                  ...m,
                  location: updatedLoc,
                  battery: data.battery || m.battery,
                  lastSeen: new Date().toISOString(),
                  locationHistory: [...(m.locationHistory || []), updatedLoc].slice(-80)
                }
              : m
          );
        } else {
          const newMember: User = {
            id,
            name: data.userName || 'Family Member',
            role: 'tracker',
            familyId: data.familyId || 'FAM-1',
            avatarIcon: 'Car',
            location: updatedLoc,
            battery: data.battery,
            lastSeen: new Date().toISOString(),
            locationHistory: [updatedLoc]
          };
          return [...prev, newMember];
        }
      });
    });

    newSocket.on('emergency-alert', (data: any) => {
      sounds.playEmergency();
      addNotification({
        type: 'emergency',
        title: 'EMERGENCY SOS ALERT',
        message: `${data.userName || 'Family Member'}: ${data.message || 'Needs immediate assistance!'}`
      });
    });

    newSocket.on('arrival-notification', (data: any) => {
      sounds.playArrival();
      addNotification({
        type: 'success',
        title: 'Safe Arrival',
        message: `${data.userName || 'Family Member'} arrived safely at ${data.location}`
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isSimulating]);

  // Demo Simulation Heartbeat: moves simulated members along realistic routes
  useEffect(() => {
    if (!isSimulating) return;

    let step = 0;
    const interval = setInterval(() => {
      step += 1;

      setFamilyMembers(prev => {
        return prev.map(member => {
          if (!member.location) return member;

          let newLat = member.location.latitude;
          let newLng = member.location.longitude;
          let speed = member.location.speed || 0;
          let heading = member.location.heading || 0;

          // Sarah driving towards home
          if (member.id === 'sim-sarah') {
            const destLat = 37.7749;
            const destLng = -122.4194;
            const dLat = (destLat - newLat) * 0.04;
            const dLng = (destLng - newLng) * 0.04;
            newLat += dLat + (Math.random() - 0.5) * 0.00015;
            newLng += dLng + (Math.random() - 0.5) * 0.00015;
            speed = 10 + Math.random() * 4; // 36-50 km/h
            heading = 215;

            // Check arrival
            const dist = calculateDistance(newLat, newLng, destLat, destLng);
            if (dist < 130 && (!member.currentGeofence || member.currentGeofence !== 'Home Base')) {
              sounds.playArrival();
              addNotification({
                type: 'geofence',
                title: 'Safe Zone Arrival',
                message: 'Sarah arrived at Home Base.'
              });
              member.currentGeofence = 'Home Base';
            }
          }

          // Alex biking from school
          if (member.id === 'sim-alex') {
            const destLat = 37.7749;
            const destLng = -122.4194;
            const dLat = (destLat - newLat) * 0.025;
            const dLng = (destLng - newLng) * 0.025;
            newLat += dLat;
            newLng += dLng;
            speed = 4 + Math.random() * 2; // 15-22 km/h
            heading = 340;
          }

          const newLocation: Location = {
            ...member.location,
            latitude: newLat,
            longitude: newLng,
            speed,
            heading,
            timestamp: new Date().toISOString()
          };

          const newHistory = [...(member.locationHistory || []), newLocation].slice(-50);

          return {
            ...member,
            location: newLocation,
            locationHistory: newHistory,
            lastSeen: new Date().toISOString(),
          };
        });
      });

      // Update active journey progress
      setActiveJourneys(prev =>
        prev.map(j => {
          if (j.id === 'journey-sarah-home') {
            const newDist = Math.max(0, (j.distanceRemaining || 1400) - 45);
            const total = j.totalDistance || 2850;
            const prog = Math.min(100, Math.round(((total - newDist) / total) * 100));
            const estMins = Math.max(1, Math.ceil(newDist / (11 * 60)));
            return {
              ...j,
              distanceRemaining: newDist,
              progress: prog,
              eta: `${estMins} mins`
            };
          }
          return j;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const joinFamily = (userData: Partial<User>) => {
    if (socket && connected && userData.id && userData.familyId) {
      socket.emit('join_family', { userId: userData.id, familyId: userData.familyId, user: userData });
    }
  };

  const updateLocation = (userId: string, location: Location, battery?: BatteryInfo) => {
    if (socket && connected) {
      socket.emit('location-update', {
        userId,
        ...location,
        battery
      });
    }

    setFamilyMembers(prev => {
      const idx = prev.findIndex(m => m.id === userId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          location,
          battery: battery || updated[idx].battery,
          lastSeen: new Date().toISOString(),
          locationHistory: [...(updated[idx].locationHistory || []), location].slice(-60)
        };
        return updated;
      }
      return prev;
    });
  };

  const sendEmergencyAlert = (userId: string, location: Location, message: string) => {
    sounds.playEmergency();
    if (socket && connected) {
      socket.emit('emergency-alert', { userId, location, message });
    }
    setFamilyMembers(prev =>
      prev.map(m => (m.id === userId ? { ...m, isEmergency: true, emergencyMessage: message } : m))
    );
    addNotification({
      type: 'emergency',
      title: '🚨 EMERGENCY ALERT BROADCAST',
      message: `Emergency signal sent: "${message}"`
    });
  };

  const clearEmergencyAlert = (userId: string) => {
    setFamilyMembers(prev =>
      prev.map(m => (m.id === userId ? { ...m, isEmergency: false, emergencyMessage: undefined } : m))
    );
    addNotification({
      type: 'info',
      title: 'Emergency Cleared',
      message: 'Emergency state was marked safe.'
    });
  };

  const startJourney = (journeyData: Partial<Journey>) => {
    const newJourney: Journey = {
      id: Math.random().toString(36).substring(2, 9),
      userId: journeyData.userId || 'user-1',
      userName: journeyData.userName || 'Driver',
      userAvatar: journeyData.userAvatar || 'Car',
      destination: journeyData.destination || { latitude: 37.7749, longitude: -122.4194, timestamp: new Date().toISOString() },
      destinationName: journeyData.destinationName || 'Home',
      origin: journeyData.origin,
      startTime: new Date().toISOString(),
      distanceRemaining: journeyData.distanceRemaining || 2500,
      totalDistance: journeyData.totalDistance || 2500,
      eta: journeyData.eta || '8 mins',
      progress: 0,
      status: 'active',
      waypoints: journeyData.waypoints
    };

    setActiveJourneys(prev => [newJourney, ...prev]);
    sounds.playGeofence();
    addNotification({
      type: 'info',
      title: 'Journey Commenced',
      message: `Navigating to ${newJourney.destinationName}`
    });
  };

  const endJourney = (journeyId: string) => {
    setActiveJourneys(prev => prev.filter(j => j.id !== journeyId));
    sounds.playArrival();
  };

  const addGeofence = (geofenceData: Omit<Geofence, 'id'>) => {
    const newGeofence: Geofence = {
      ...geofenceData,
      id: `geo-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    setGeofences(prev => [...prev, newGeofence]);
    sounds.playGeofence();
    addNotification({
      type: 'success',
      title: 'Safe Zone Created',
      message: `"${newGeofence.name}" zone active with ${newGeofence.radius}m radius.`
    });
  };

  const deleteGeofence = (geofenceId: string) => {
    setGeofences(prev => prev.filter(g => g.id !== geofenceId));
    addNotification({
      type: 'info',
      title: 'Safe Zone Removed',
      message: 'Geofence zone was deleted.'
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        isSimulating,
        setIsSimulating,
        familyMembers,
        notifications,
        activeJourneys,
        geofences,
        selectedMember,
        setSelectedMember,
        joinFamily,
        updateLocation,
        sendEmergencyAlert,
        clearEmergencyAlert,
        startJourney,
        endJourney,
        addGeofence,
        deleteGeofence,
        dismissNotification,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
