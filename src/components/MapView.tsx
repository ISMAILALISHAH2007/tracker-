import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L, { LatLngExpression, Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Location, Geofence, Journey, MapTileTheme } from '../types';
import {
  Layers,
  Crosshair,
  MapPin,
  Compass,
  Navigation,
  Shield,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/audio';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  familyMembers: User[];
  selectedMember: User | null;
  geofences?: Geofence[];
  activeJourneys?: Journey[];
  selectionMode?: boolean;
  selectedLocation?: Location | null;
  onMemberSelect?: (member: User) => void;
  onLocationSelect?: (location: Location) => void;
  replayPoint?: Location | null;
  centerCoordinates?: [number, number];
  zoomLevel?: number;
}

// Controller component to smoothly pan/zoom map
const MapController: React.FC<{
  center: LatLngExpression;
  zoom: number;
  followMode: boolean;
}> = ({ center, zoom, followMode }) => {
  const map = useMap();
  useEffect(() => {
    if (followMode || map.getZoom() !== zoom) {
      map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, followMode, map]);
  return null;
};

// Click handler for placing map pins
const MapClickHandler: React.FC<{
  onLocationSelect?: (location: Location) => void;
  selectionMode?: boolean;
}> = ({ onLocationSelect, selectionMode }) => {
  useMapEvents({
    click: (e) => {
      if (selectionMode && onLocationSelect) {
        sounds.playClick();
        onLocationSelect({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          timestamp: new Date().toISOString(),
        });
      }
    },
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  familyMembers,
  selectedMember,
  geofences = [],
  activeJourneys = [],
  selectionMode = false,
  selectedLocation = null,
  onMemberSelect,
  onLocationSelect,
  replayPoint = null,
  centerCoordinates,
  zoomLevel = 14,
}) => {
  const [mapTheme, setMapTheme] = useState<MapTileTheme>('cyber');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [followSelected, setFollowSelected] = useState(true);

  const defaultCenter: LatLngExpression = centerCoordinates || [37.7749, -122.4194]; // San Francisco Default

  const membersWithLoc = familyMembers.filter((m) => m.location);

  const targetCenter: LatLngExpression = replayPoint
    ? [replayPoint.latitude, replayPoint.longitude]
    : selectedMember?.location
    ? [selectedMember.location.latitude, selectedMember.location.longitude]
    : membersWithLoc.length > 0 && membersWithLoc[0].location
    ? [membersWithLoc[0].location.latitude, membersWithLoc[0].location.longitude]
    : defaultCenter;

  // Custom Member Pin Icon Generator with Radar Pulse & SVG Avatar
  const createMemberMarkerIcon = (member: User, isSelected: boolean) => {
    const isEmergency = member.isEmergency;
    const speed = member.location?.speed ? Math.round(member.location.speed * 3.6) : 0;
    const isMoving = speed > 2;

    const pulseColor = isEmergency
      ? 'rgba(244, 63, 94, 0.6)'
      : isSelected
      ? 'rgba(99, 102, 241, 0.5)'
      : 'rgba(14, 165, 233, 0.4)';

    const dotColor = isEmergency
      ? '#f43f5e'
      : isSelected
      ? '#6366f1'
      : isMoving
      ? '#10b981'
      : '#38bdf8';

    const avatarGlyph = member.avatarIcon === 'Car' ? '🚗' : member.avatarIcon === 'Bike' ? '🚲' : member.avatarIcon === 'Shield' ? '🛡️' : member.avatarIcon === 'Heart' ? '❤️' : '👤';

    return new DivIcon({
      className: 'custom-radar-marker',
      html: `
        <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <!-- Radar Pulse Ring -->
          <div style="position: absolute; width: 56px; height: 56px; border-radius: 50%; background: ${pulseColor}; animation: radarPing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <!-- Inner Glow -->
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${dotColor}33; border: 1.5px solid ${dotColor}88;"></div>
          <!-- Center Pin -->
          <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #0d121d; border: 2.5px solid ${dotColor}; box-shadow: 0 0 15px ${dotColor}; display: flex; align-items: center; justify-content: center; font-size: 13px; z-index: 10;">
            ${avatarGlyph}
          </div>
          <!-- Name Tag -->
          <div style="position: absolute; bottom: -18px; white-space: nowrap; background: rgba(7, 9, 14, 0.85); color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            ${member.name.split(' ')[0]}
          </div>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
      popupAnchor: [0, -28],
    });
  };

  // Replay Pin Marker
  const replayMarkerIcon = new DivIcon({
    className: 'custom-replay-marker',
    html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(168, 85, 247, 0.45); animation: radarPing 1.6s infinite;"></div>
        <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #a855f7; border: 3px solid #ffffff; box-shadow: 0 0 16px #a855f7;"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

  // Selected Pin Marker
  const selectedPinIcon = new DivIcon({
    className: 'custom-selected-pin',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(244, 63, 94, 0.4); animation: radarPing 1.8s infinite;"></div>
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #f43f5e; border: 3px solid #ffffff; box-shadow: 0 0 15px #f43f5e; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
          📍
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });

  // Tile layer URL resolver
  const getTileLayerUrl = () => {
    switch (mapTheme) {
      case 'cyber':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'streets':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#07090e]">
      {/* Floating Mode Status Banner */}
      {selectionMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] glass-panel px-4 py-2 rounded-2xl border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-2 shadow-glow-sky animate-bounce">
          <Crosshair className="w-4 h-4 animate-spin" />
          <span>Click anywhere on the map to set location coordinates</span>
        </div>
      )}

      {/* Floating Map Controls Dock */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title="Change Map Style"
            className="p-2.5 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-lg"
          >
            <Layers className="w-4 h-4 text-sky-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 top-12 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl space-y-1 w-40 animate-fadeIn">
              {(['cyber', 'satellite', 'streets', 'topo'] as MapTileTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    sounds.playClick();
                    setMapTheme(theme);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    mapTheme === theme
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {theme === 'cyber' ? '🌌 Cyber Dark' : theme === 'satellite' ? '🛰️ Satellite' : theme === 'streets' ? '🗺️ Streets' : '⛰️ Topographic'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center / Follow Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            setFollowSelected(!followSelected);
          }}
          title={followSelected ? 'Disable Auto-Follow' : 'Enable Auto-Follow'}
          className={`p-2.5 rounded-xl glass-panel border transition-all cursor-pointer shadow-lg ${
            followSelected
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-glow-indigo'
              : 'hover:bg-slate-800/80 border-white/10 text-slate-400'
          }`}
        >
          <Compass className={`w-4 h-4 ${followSelected ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
        </button>
      </div>

      <MapContainer
        center={targetCenter}
        zoom={zoomLevel}
        className="w-full h-full"
        zoomControl={true}
        style={{ cursor: selectionMode ? 'crosshair' : 'grab' }}
      >
        <MapController center={targetCenter} zoom={zoomLevel} followMode={followSelected} />
        <MapClickHandler onLocationSelect={onLocationSelect} selectionMode={selectionMode} />

        <TileLayer
          url={getTileLayerUrl()}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        {mapTheme === 'cyber' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            maxZoom={19}
            opacity={0.9}
          />
        )}

        {/* Geofence Safe Zones (Circles) */}
        {geofences.map((geo) => (
          <Circle
            key={geo.id}
            center={[geo.latitude, geo.longitude]}
            radius={geo.radius}
            pathOptions={{
              color: geo.color || '#10b981',
              fillColor: geo.color || '#10b981',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 6',
            }}
          >
            <Popup>
              <div className="p-1 text-center font-sans">
                <div className="font-heading font-bold text-sm text-white flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4" style={{ color: geo.color || '#10b981' }} />
                  {geo.name}
                </div>
                <p className="text-xs text-slate-400 mt-1">Safe Zone Radius: {geo.radius}m</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Active Journey Waypoints & Polylines */}
        {activeJourneys.map((journey) => {
          if (!journey.waypoints || journey.waypoints.length < 2) return null;
          return (
            <React.Fragment key={journey.id}>
              {/* Glowing Route Polyline */}
              <Polyline
                positions={journey.waypoints}
                pathOptions={{
                  color: '#6366f1',
                  weight: 4,
                  opacity: 0.85,
                  dashArray: '8, 8',
                }}
              />
              {/* Destination Pin */}
              <Marker
                position={[journey.destination.latitude, journey.destination.longitude]}
                icon={
                  new DivIcon({
                    className: 'custom-dest-marker',
                    html: `
                      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 12px #10b981; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                          🏁
                        </div>
                      </div>
                    `,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  })
                }
              >
                <Popup>
                  <div className="p-1 text-center">
                    <h5 className="font-bold text-sm text-white">Destination: {journey.destinationName}</h5>
                    <p className="text-xs text-slate-400">ETA: {journey.eta}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Selected Map Pin Marker */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            icon={selectedPinIcon}
          >
            <Popup>
              <div className="p-1 text-center">
                <h5 className="font-heading font-bold text-sm text-white">Target Coordinate</h5>
                <p className="text-xs font-mono text-sky-300 mt-1">
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Replay Point Marker */}
        {replayPoint && (
          <Marker
            position={[replayPoint.latitude, replayPoint.longitude]}
            icon={replayMarkerIcon}
          >
            <Popup>
              <div className="p-1 text-center font-mono text-xs">
                <p className="font-bold text-purple-300">Replay Timeline Point</p>
                <p className="text-slate-400 mt-0.5">
                  {new Date(replayPoint.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Family Member Markers */}
        {membersWithLoc.map((member) => {
          if (!member.location) return null;
          const isSelected = selectedMember?.id === member.id;
          return (
            <Marker
              key={member.id}
              position={[member.location.latitude, member.location.longitude]}
              icon={createMemberMarkerIcon(member, isSelected)}
              eventHandlers={{
                click: () => {
                  sounds.playClick();
                  if (onMemberSelect) onMemberSelect(member);
                },
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-center min-w-[160px]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-heading font-bold text-sm text-white">{member.name}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    {member.location.speed ? (
                      <p className="font-mono text-sky-300 font-semibold">
                        Speed: {Math.round(member.location.speed * 3.6)} km/h
                      </p>
                    ) : null}
                    {member.battery ? (
                      <p className="font-mono text-slate-400">Battery: {Math.round(member.battery.level)}%</p>
                    ) : null}
                    {member.currentGeofence && (
                      <p className="text-emerald-400 font-semibold">At {member.currentGeofence}</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
