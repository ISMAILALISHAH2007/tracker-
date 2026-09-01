# Family Tracker API

Real-time family location tracking backend with Socket.io support.

## Features

- Real-time location tracking with Socket.io
- Journey management (start, track, end)
- Geofence detection (safe zones: home, college, work)
- Arrival notifications
- Emergency alerts
- Family room-based architecture
- In-memory storage (easily replaceable with database)

## API Endpoints

### Location
- `POST /api/location` - Update user location
- `GET /api/location/:userId` - Get current location
- `GET /api/location/:userId/history` - Get location history
- `GET /api/location/family/:familyId` - Get all family member locations

### Journey
- `POST /api/journey/start` - Start a new journey
- `POST /api/journey/end` - End current journey
- `GET /api/journey/active/:userId` - Get active journey
- `GET /api/journey/history/:userId` - Get journey history

### Geofence
- `POST /api/geofence` - Create a geofence (safe zone)
- `GET /api/geofence/:userId` - Get all geofences for user
- `DELETE /api/geofence/:id` - Delete a geofence

### Health
- `GET /api/health` - Health check endpoint

## Socket.io Events

### Client to Server
- `join_family` - Join a family room
- `update_location` - Send real-time location update
- `emergency_alert` - Send emergency alert to family
- `request_location` - Request another member's location

### Server to Client
- `family_locations` - Initial family locations on join
- `location_update` - Real-time location updates
- `member_joined` - Family member connected
- `member_disconnected` - Family member disconnected
- `journey_started` - Journey started notification
- `journey_ended` - Journey ended notification
- `journey_update` - Journey progress with ETA
- `arrived_at_destination` - Arrival notification
- `member_arrived` - Family member arrived
- `geofence_entered` - User entered a geofence
- `emergency_alert` - Emergency alert from family member
- `error` - Error messages

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Environment Variables

Create a `.env` file:

```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
- `NODE_ENV=production`
- `CORS_ORIGIN=your-frontend-url`

## Project Structure

```
api/
├── routes/
│   ├── location.js      # Location endpoints
│   ├── journey.js       # Journey endpoints
│   └── geofence.js      # Geofence endpoints
├── sockets/
│   └── handlers.js      # Socket.io event handlers
├── store/
│   └── dataStore.js     # In-memory data storage
├── utils/
│   └── geofence.js      # Geofence calculations
├── server.js            # Main server file
├── package.json
└── vercel.json          # Vercel configuration
```

## Usage Example

### Start a journey
```javascript
// POST /api/journey/start
{
  "userId": "user123",
  "destination": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "destinationName": "College"
}
```

### Update location
```javascript
// POST /api/location
{
  "userId": "user123",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "accuracy": 10,
  "heading": 90,
  "speed": 5
}
```

### Create geofence
```javascript
// POST /api/geofence
{
  "userId": "user123",
  "name": "Home",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "radius": 100,
  "type": "home"
}
```

### Socket.io connection
```javascript
const socket = io('http://localhost:3001');

// Join family
socket.emit('join_family', {
  userId: 'user123',
  familyId: 'family456'
});

// Send location update
socket.emit('update_location', {
  userId: 'user123',
  latitude: 40.7580,
  longitude: -73.9855
});

// Listen for updates
socket.on('location_update', (data) => {
  console.log('Location update:', data);
});

socket.on('member_arrived', (data) => {
  console.log('Member arrived:', data);
});
```

## Database Integration

To add database support, replace the in-memory `dataStore` with your preferred database:

```javascript
// Example with MongoDB
const mongoose = require('mongoose');

// Replace dataStore.updateLocation() with:
await Location.create({
  userId,
  latitude,
  longitude,
  timestamp: new Date()
});
```

## License

MIT
