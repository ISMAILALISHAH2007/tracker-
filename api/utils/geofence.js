// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if a point is within a geofence
function isWithinGeofence(latitude, longitude, geofence) {
  const distance = calculateDistance(
    latitude,
    longitude,
    geofence.latitude,
    geofence.longitude
  );

  return distance <= geofence.radius;
}

// Check all geofences for a user location
function checkGeofences(latitude, longitude, geofences) {
  const results = [];

  for (const geofence of geofences) {
    const isInside = isWithinGeofence(latitude, longitude, geofence);
    results.push({
      geofence,
      isInside,
      distance: calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      )
    });
  }

  return results;
}

// Detect if user has arrived at destination
function detectArrival(currentLocation, destination, threshold = 100) {
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    destination.latitude,
    destination.longitude
  );

  return {
    hasArrived: distance <= threshold,
    distance
  };
}

// Calculate estimated time of arrival
function calculateETA(currentLocation, destination, averageSpeed = 10) {
  // averageSpeed in m/s (10 m/s ≈ 36 km/h, reasonable for mixed traffic)
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    destination.latitude,
    destination.longitude
  );

  const timeInSeconds = distance / averageSpeed;
  const eta = new Date(Date.now() + timeInSeconds * 1000);

  return {
    distance,
    estimatedSeconds: Math.round(timeInSeconds),
    eta: eta.toISOString()
  };
}

module.exports = {
  calculateDistance,
  isWithinGeofence,
  checkGeofences,
  detectArrival,
  calculateETA
};
