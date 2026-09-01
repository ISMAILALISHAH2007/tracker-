const dataStore = require('../store/dataStore');
const { detectArrival, calculateETA, checkGeofences } = require('../utils/geofence');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join family room
    socket.on('join_family', (data) => {
      const { userId, familyId } = data;

      if (!userId || !familyId) {
        socket.emit('error', { message: 'Missing userId or familyId' });
        return;
      }

      // Store user info in socket
      socket.userId = userId;
      socket.familyId = familyId;

      // Join family to data store
      dataStore.joinFamily(userId, familyId);

      // Join Socket.io room
      const roomName = `family_${familyId}`;
      socket.join(roomName);

      console.log(`User ${userId} joined family ${familyId}`);

      // Send current family locations
      const locations = dataStore.getFamilyLocations(familyId);
      socket.emit('family_locations', locations);

      // Notify family members
      socket.to(roomName).emit('member_joined', {
        userId,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time location update
    socket.on('update_location', (data) => {
      const { userId, latitude, longitude, accuracy, heading, speed } = data;

      if (!userId || latitude === undefined || longitude === undefined) {
        socket.emit('error', { message: 'Invalid location data' });
        return;
      }

      // Update location
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

      // Check for geofence entries/exits
      geofenceResults.forEach(result => {
        if (result.isInside) {
          socket.emit('geofence_entered', {
            geofence: result.geofence,
            distance: Math.round(result.distance)
          });
        }
      });

      // Check active journey
      const activeJourney = dataStore.getActiveJourney(userId);
      if (activeJourney) {
        // Check arrival
        const arrival = detectArrival(location, activeJourney.destination);

        if (arrival.hasArrived) {
          const familyId = dataStore.getFamilyId(userId);

          // Notify user
          socket.emit('arrived_at_destination', {
            journey: activeJourney,
            distance: Math.round(arrival.distance)
          });

          // Notify family
          if (familyId) {
            io.to(`family_${familyId}`).emit('member_arrived', {
              userId,
              destination: activeJourney.destination,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // Send updated ETA
          const eta = calculateETA(location, activeJourney.destination);
          socket.emit('journey_update', {
            journey: activeJourney,
            eta,
            distance: Math.round(arrival.distance)
          });
        }
      }

      // Broadcast to family
      const familyId = dataStore.getFamilyId(userId);
      if (familyId) {
        socket.to(`family_${familyId}`).emit('location_update', {
          userId,
          location,
          geofenceResults: geofenceResults.map(r => ({
            name: r.geofence.name,
            type: r.geofence.type,
            isInside: r.isInside
          }))
        });
      }
    });

    // Emergency alert
    socket.on('emergency_alert', (data) => {
      const { userId, message, location } = data;
      const familyId = dataStore.getFamilyId(userId);

      if (!familyId) {
        socket.emit('error', { message: 'User not in a family' });
        return;
      }

      console.log(`Emergency alert from user ${userId}`);

      // Broadcast to entire family
      io.to(`family_${familyId}`).emit('emergency_alert', {
        userId,
        message: message || 'Emergency alert triggered',
        location: location || dataStore.getLocation(userId),
        timestamp: new Date().toISOString(),
        priority: 'high'
      });

      // Acknowledge to sender
      socket.emit('alert_sent', {
        message: 'Emergency alert sent to family members'
      });
    });

    // Request location from family member
    socket.on('request_location', (data) => {
      const { targetUserId } = data;
      const location = dataStore.getLocation(targetUserId);

      if (location) {
        socket.emit('location_response', {
          userId: targetUserId,
          location
        });
      } else {
        socket.emit('error', { message: 'Location not available' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (socket.userId && socket.familyId) {
        socket.to(`family_${socket.familyId}`).emit('member_disconnected', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  return io;
}

module.exports = setupSocketHandlers;
