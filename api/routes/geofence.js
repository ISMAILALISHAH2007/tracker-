const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../store/dataStore');

// Create a geofence (safe zone)
router.post('/', (req, res) => {
  try {
    const { userId, name, latitude, longitude, radius, type } = req.body;

    if (!userId || !name || latitude === undefined || longitude === undefined || !radius) {
      return res.status(400).json({
        error: 'Missing required fields: userId, name, latitude, longitude, radius'
      });
    }

    const id = uuidv4();
    const geofence = dataStore.createGeofence(id, {
      userId,
      name,
      latitude,
      longitude,
      radius,
      type: type || 'safe_zone' // safe_zone, home, college, work, etc.
    });

    res.json({
      success: true,
      geofence
    });
  } catch (error) {
    console.error('Error creating geofence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all geofences for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const geofences = dataStore.getGeofences(userId);

    res.json({
      userId,
      count: geofences.length,
      geofences
    });
  } catch (error) {
    console.error('Error getting geofences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a geofence
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dataStore.deleteGeofence(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Geofence not found' });
    }

    res.json({
      success: true,
      message: 'Geofence deleted'
    });
  } catch (error) {
    console.error('Error deleting geofence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
