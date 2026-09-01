export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number; // in m/s
  altitude?: number;
  timestamp: string;
  address?: string;
}

export interface BatteryInfo {
  level: number; // 0 to 100
  charging: boolean;
}

export interface Geofence {
  id: string;
  familyId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'home' | 'school' | 'work' | 'gym' | 'custom';
  color?: string;
  notifications: boolean;
  createdAt?: string;
}

export interface Journey {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  destination: Location;
  destinationName: string;
  origin?: Location;
  startTime: string;
  endTime?: string;
  distanceRemaining?: number; // in meters
  totalDistance?: number; // in meters
  eta?: string;
  progress?: number; // 0 - 100%
  status: 'active' | 'completed' | 'paused';
  waypoints?: [number, number][];
}

export interface User {
  id: string;
  name: string;
  role: 'tracker' | 'monitor';
  familyId: string;
  avatarIcon?: string; // Lucide icon identifier e.g., 'User', 'Heart', 'Shield', 'Car', 'Bike', 'GraduationCap', 'Smile'
  avatarBg?: string;
  battery?: BatteryInfo;
  location?: Location;
  locationHistory?: Location[];
  lastSeen?: string;
  currentGeofence?: string | null;
  isEmergency?: boolean;
  emergencyMessage?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'emergency' | 'geofence';
  title: string;
  message: string;
  timestamp: string;
  userId?: string;
  location?: Location;
}

export interface SocketEvents {
  join_family: (data: { userId: string; familyId: string; user?: Partial<User> }) => void;
  update_location: (data: Location & { userId: string; battery?: BatteryInfo }) => void;
  emergency_alert: (data: { userId: string; location: Location; message: string }) => void;
  request_location: (data: { userId: string; requesterId: string }) => void;
  start_journey: (journey: Partial<Journey>) => void;
  end_journey: (journeyId: string) => void;
  create_geofence: (geofence: Geofence) => void;
  delete_geofence: (geofenceId: string) => void;
}

export type MapTileTheme = 'cyber' | 'satellite' | 'streets' | 'topo';
