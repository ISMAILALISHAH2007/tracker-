// In-memory storage (easily replaceable with database later)
class DataStore {
  constructor() {
    // User locations: { userId: { latitude, longitude, timestamp, accuracy } }
    this.locations = new Map();

    // Active journeys: { journeyId: { userId, startTime, startLocation, destination, isActive } }
    this.journeys = new Map();

    // Journey history: array of completed journeys
    this.journeyHistory = [];

    // Location history: { userId: [{ latitude, longitude, timestamp }] }
    this.locationHistory = new Map();

    // Geofences: { id: { name, latitude, longitude, radius, userId, type } }
    this.geofences = new Map();

    // User family groups: { userId: familyId }
    this.userFamilies = new Map();

    // Family members: { familyId: [userId1, userId2, ...] }
    this.familyMembers = new Map();
  }

  // Location methods
  updateLocation(userId, locationData) {
    const location = {
      ...locationData,
      timestamp: new Date().toISOString()
    };

    this.locations.set(userId, location);

    // Add to history
    if (!this.locationHistory.has(userId)) {
      this.locationHistory.set(userId, []);
    }
    const history = this.locationHistory.get(userId);
    history.push(location);

    // Keep only last 100 locations
    if (history.length > 100) {
      history.shift();
    }

    return location;
  }

  getLocation(userId) {
    return this.locations.get(userId);
  }

  getLocationHistory(userId, limit = 50) {
    const history = this.locationHistory.get(userId) || [];
    return history.slice(-limit);
  }

  // Journey methods
  createJourney(journeyId, journeyData) {
    const journey = {
      ...journeyData,
      journeyId,
      startTime: new Date().toISOString(),
      isActive: true
    };

    this.journeys.set(journeyId, journey);
    return journey;
  }

  getJourney(journeyId) {
    return this.journeys.get(journeyId);
  }

  getActiveJourney(userId) {
    for (const [id, journey] of this.journeys) {
      if (journey.userId === userId && journey.isActive) {
        return journey;
      }
    }
    return null;
  }

  endJourney(journeyId, endData) {
    const journey = this.journeys.get(journeyId);
    if (!journey) return null;

    journey.isActive = false;
    journey.endTime = new Date().toISOString();
    journey.endLocation = endData.endLocation;
    journey.distance = endData.distance;

    // Move to history
    this.journeyHistory.push({ ...journey });
    this.journeys.delete(journeyId);

    return journey;
  }

  getJourneyHistory(userId, limit = 20) {
    return this.journeyHistory
      .filter(j => j.userId === userId)
      .slice(-limit)
      .reverse();
  }

  // Geofence methods
  createGeofence(id, geofenceData) {
    const geofence = {
      id,
      ...geofenceData,
      createdAt: new Date().toISOString()
    };

    this.geofences.set(id, geofence);
    return geofence;
  }

  getGeofences(userId) {
    const fences = [];
    for (const fence of this.geofences.values()) {
      if (fence.userId === userId) {
        fences.push(fence);
      }
    }
    return fences;
  }

  getGeofence(id) {
    return this.geofences.get(id);
  }

  deleteGeofence(id) {
    return this.geofences.delete(id);
  }

  // Family methods
  joinFamily(userId, familyId) {
    this.userFamilies.set(userId, familyId);

    if (!this.familyMembers.has(familyId)) {
      this.familyMembers.set(familyId, []);
    }

    const members = this.familyMembers.get(familyId);
    if (!members.includes(userId)) {
      members.push(userId);
    }
  }

  getFamilyId(userId) {
    return this.userFamilies.get(userId);
  }

  getFamilyMembers(familyId) {
    return this.familyMembers.get(familyId) || [];
  }

  getFamilyLocations(familyId) {
    const members = this.getFamilyMembers(familyId);
    const locations = {};

    for (const userId of members) {
      const location = this.getLocation(userId);
      if (location) {
        locations[userId] = location;
      }
    }

    return locations;
  }
}

// Singleton instance
const dataStore = new DataStore();

module.exports = dataStore;
