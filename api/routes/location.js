const express = require('express');
const router = express.Router();
const dataStore = require('../store/dataStore');
const { checkGeofences } = require('../utils/geofence');

// Update user location
router.post('/', (req, res) => {
  try {
    const { userId, latitude, longitude, accuracy, heading, speed } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, latitude, longitude'
      });
    }

    // Update location in store
    const location = dataStore.updateLocation(userId, {
      latitude,
      longitude,
      accuracy,
      heading,
      speed
    });

    // Check geofences
    const userGeofences = dataStore.getGeofences(userId);
    const geofenceResults = checkGeofences(latitude, longitude, userGeofences);

    // Broadcast location to family members via Socket.io
    const io = req.app.get('io');
    const familyId = dataStore.getFamilyId(userId);

    if (familyId) {
      io.to(`family_${familyId}`).emit('location_update', {
        userId,
        location,
        geofenceResults
      });
    }

    res.json({
      success: true,
      location,
      geofenceResults: geofenceResults.map(r => ({
        name: r.geofence.name,
        type: r.geofence.type,
        isInside: r.isInside,
        distance: Math.round(r.distance)
      }))
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current location for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const location = dataStore.getLocation(userId);

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ location });
  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location history
router.get('/:userId/history', (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = dataStore.getLocationHistory(userId, limit);

    res.json({
      userId,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error getting location history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get family locations
router.get('/family/:familyId', (req, res) => {
  try {
    const { familyId } = req.params;
    const locations = dataStore.getFamilyLocations(familyId);

    res.json({
      familyId,
      locations
    });
  } catch (error) {
    console.error('Error getting family locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
