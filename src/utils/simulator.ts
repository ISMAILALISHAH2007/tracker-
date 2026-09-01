import { User, Geofence, Journey, Location } from '../types';

/**
 * Realistic Simulation Waypoints (Defaulting around San Francisco / Bay Area)
 */
export const DEFAULT_GEOFENCES: Geofence[] = [
  {
    id: 'geo-home',
    familyId: 'DEMO-777',
    name: 'Home Base',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 120,
    type: 'home',
    color: '#10b981',
    notifications: true,
  },
  {
    id: 'geo-school',
    familyId: 'DEMO-777',
    name: 'Lincoln High School',
    latitude: 37.7512,
    longitude: -122.4350,
    radius: 180,
    type: 'school',
    color: '#0ea5e9',
    notifications: true,
  },
  {
    id: 'geo-work',
    familyId: 'DEMO-777',
    name: 'Tech Campus HQ',
    latitude: 37.7890,
    longitude: -122.3980,
    radius: 200,
    type: 'work',
    color: '#6366f1',
    notifications: true,
  },
  {
    id: 'geo-gym',
    familyId: 'DEMO-777',
    name: 'Fitness Center',
    latitude: 37.7680,
    longitude: -122.4480,
    radius: 100,
    type: 'gym',
    color: '#f59e0b',
    notifications: true,
  }
];

export const SIMULATED_MEMBERS: User[] = [
  {
    id: 'sim-sarah',
    name: 'Sarah (Mom)',
    role: 'tracker',
    familyId: 'DEMO-777',
    avatarIcon: 'Car',
    avatarBg: 'from-pink-500 to-rose-600',
    battery: { level: 82, charging: true },
    lastSeen: new Date().toISOString(),
    location: {
      latitude: 37.7830,
      longitude: -122.4080,
      speed: 12.5, // ~45 km/h
      heading: 210,
      altitude: 18,
      accuracy: 4,
      timestamp: new Date().toISOString(),
    },
    locationHistory: [
      { latitude: 37.7890, longitude: -122.3980, timestamp: new Date(Date.now() - 300000).toISOString() },
      { latitude: 37.7870, longitude: -122.4020, timestamp: new Date(Date.now() - 200000).toISOString() },
      { latitude: 37.7850, longitude: -122.4050, timestamp: new Date(Date.now() - 100000).toISOString() },
      { latitude: 37.7830, longitude: -122.4080, timestamp: new Date().toISOString() },
    ]
  },
  {
    id: 'sim-alex',
    name: 'Alex (Son)',
    role: 'tracker',
    familyId: 'DEMO-777',
    avatarIcon: 'Bike',
    avatarBg: 'from-emerald-500 to-teal-600',
    battery: { level: 46, charging: false },
    lastSeen: new Date().toISOString(),
    location: {
      latitude: 37.7590,
      longitude: -122.4280,
      speed: 4.8, // ~17 km/h bike
      heading: 345,
      altitude: 24,
      accuracy: 6,
      timestamp: new Date().toISOString(),
    },
    locationHistory: [
      { latitude: 37.7512, longitude: -122.4350, timestamp: new Date(Date.now() - 240000).toISOString() },
      { latitude: 37.7540, longitude: -122.4320, timestamp: new Date(Date.now() - 160000).toISOString() },
      { latitude: 37.7570, longitude: -122.4300, timestamp: new Date(Date.now() - 80000).toISOString() },
      { latitude: 37.7590, longitude: -122.4280, timestamp: new Date().toISOString() },
    ]
  },
  {
    id: 'sim-david',
    name: 'David (Dad)',
    role: 'tracker',
    familyId: 'DEMO-777',
    avatarIcon: 'Shield',
    avatarBg: 'from-blue-500 to-indigo-600',
    battery: { level: 94, charging: false },
    lastSeen: new Date().toISOString(),
    currentGeofence: 'Tech Campus HQ',
    location: {
      latitude: 37.7890,
      longitude: -122.3980,
      speed: 0,
      heading: 0,
      altitude: 12,
      accuracy: 3,
      timestamp: new Date().toISOString(),
    },
    locationHistory: [
      { latitude: 37.7890, longitude: -122.3980, timestamp: new Date().toISOString() }
    ]
  }
];

export const SIMULATED_JOURNEY: Journey = {
  id: 'journey-sarah-home',
  userId: 'sim-sarah',
  userName: 'Sarah (Mom)',
  userAvatar: 'Car',
  destination: {
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: new Date().toISOString()
  },
  destinationName: 'Home Base',
  origin: {
    latitude: 37.7890,
    longitude: -122.3980,
    timestamp: new Date().toISOString()
  },
  startTime: new Date(Date.now() - 600000).toISOString(),
  distanceRemaining: 1420,
  totalDistance: 2850,
  eta: '4 mins',
  progress: 52,
  status: 'active',
  waypoints: [
    [37.7890, -122.3980],
    [37.7865, -122.4030],
    [37.7830, -122.4080],
    [37.7790, -122.4140],
    [37.7749, -122.4194],
  ]
};

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a coordinate is inside a circular geofence
 */
export function isInsideGeofence(location: { latitude: number; longitude: number }, geofence: Geofence): boolean {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    geofence.latitude,
    geofence.longitude
  );
  return distance <= geofence.radius;
}
