const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../store/dataStore');
const { detectArrival, calculateETA, calculateDistance } = require('../utils/geofence');

// Start a new journey
router.post('/start', (req, res) => {
  try {
    const { userId, destination, destinationName } = req.body;

    if (!userId || !destination || !destination.latitude || !destination.longitude) {
      return res.status(400).json({
        error: 'Missing required fields: userId, destination (latitude, longitude)'
      });
    }

    // Check if user already has an active journey
    const activeJourney = dataStore.getActiveJourney(userId);
    if (activeJourney) {
      return res.status(400).json({
        error: 'User already has an active journey',
        journey: activeJourney
      });
    }

    // Get current location
    const currentLocation = dataStore.getLocation(userId);
    if (!currentLocation) {
      return res.status(400).json({
        error: 'Cannot start journey without current location'
      });
    }

    // Create journey
    const journeyId = uuidv4();
    const journey = dataStore.createJourney(journeyId, {
      userId,
      startLocation: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      },
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
        name: destinationName || 'Destination'
      }
    });

    // Calculate initial ETA
    const etaInfo = calculateETA(currentLocation, destination);

    // Broadcast journey start to family
    const io = req.app.get('io');
    const familyId = dataStore.getFamilyId(userId);

    if (familyId) {
      io.to(`family_${familyId}`).emit('journey_started', {
        userId,
        journey,
        eta: etaInfo
      });
    }

    res.json({
      success: true,
      journey,
      eta: etaInfo
    });
  } catch (error) {
    console.error('Error starting journey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End a journey
router.post('/end', (req, res) => {
  try {
    const { userId, journeyId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Get journey (either by ID or find active journey for user)
    let journey;
    if (journeyId) {
      journey = dataStore.getJourney(journeyId);
    } else {
      journey = dataStore.getActiveJourney(userId);
    }

    if (!journey) {
      return res.status(404).json({ error: 'No active journey found' });
    }

    // Get current location
    const currentLocation = dataStore.getLocation(userId);
    const distance = calculateDistance(
      journey.startLocation.latitude,
      journey.startLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );

    // End the journey
    const endedJourney = dataStore.endJourney(journey.journeyId, {
      endLocation: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      },
      distance: Math.round(distance)
    });

    // Broadcast journey end to family
    const io = req.app.get('io');
    const familyId = dataStore.getFamilyId(userId);

    if (familyId) {
      io.to(`family_${familyId}`).emit('journey_ended', {
        userId,
        journey: endedJourney
      });
    }

    res.json({
      success: true,
      journey: endedJourney
    });
  } catch (error) {
    console.error('Error ending journey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active journey
router.get('/active/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const journey = dataStore.getActiveJourney(userId);

    if (!journey) {
      return res.status(404).json({ error: 'No active journey found' });
    }

    // Calculate current ETA
    const currentLocation = dataStore.getLocation(userId);
    let eta = null;

    if (currentLocation) {
      eta = calculateETA(currentLocation, journey.destination);

      // Check arrival
      const arrival = detectArrival(currentLocation, journey.destination);
      if (arrival.hasArrived) {
        journey.nearDestination = true;
      }
    }

    res.json({
      journey,
      eta
    });
  } catch (error) {
    console.error('Error getting active journey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get journey history
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const history = dataStore.getJourneyHistory(userId, limit);

    res.json({
      userId,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error getting journey history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
