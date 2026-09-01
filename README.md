# Family Location Tracker

A real-time family location tracking application built with React, Mapbox, and Socket.io. Perfect for keeping families connected and ensuring loved ones arrive safely at their destinations.

## Features

### Tracker View (Sister's Phone)
- Real-time location sharing with GPS tracking
- Journey start/stop controls
- Emergency alert button
- Battery status monitoring
- Distance to destination display
- Journey progress tracking

### Monitor View (Mom's Phone)
- Live map with real-time location updates
- Route path visualization
- Geofence detection for arrival notifications
- Journey timeline and history
- Emergency alert notifications
- Distance and ETA calculations

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Mapbox GL JS** - Interactive maps
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## Prerequisites

- Node.js 16+ and npm
- Mapbox account (free tier available)
- Backend server with Socket.io (example provided)

## Installation

1. Clone the repository:
```bash
cd family-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `VITE_MAPBOX_TOKEN`: Get from https://account.mapbox.com/
- `VITE_SOCKET_URL`: Your backend Socket.io server URL

4. Update the college location in `src/context/LocationContext.jsx`:
```javascript
const COLLEGE_LOCATION = {
  latitude: YOUR_LATITUDE,
  longitude: YOUR_LONGITUDE,
  name: 'College'
}
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Building for Production

Build the app:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Backend Server

You'll need a Socket.io backend server. Here's a minimal example:

```javascript
// server.js
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('location-update', (data) => {
    socket.broadcast.emit('location-update', data)
  })

  socket.on('emergency-alert', (data) => {
    socket.broadcast.emit('emergency-alert', data)
  })

  socket.on('arrival-notification', (data) => {
    socket.broadcast.emit('arrival-notification', data)
  })

  socket.on('stop-tracking', () => {
    socket.broadcast.emit('stop-tracking')
  })

  socket.on('request-location', () => {
    socket.broadcast.emit('request-location')
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Install backend dependencies:
```bash
npm install express socket.io cors
```

Run the server:
```bash
node server.js
```

## Usage

1. **Start the backend server** (see Backend Server section)

2. **Open the app** on both devices (or tabs for testing)

3. **On Sister's Phone:**
   - Select "I'm Tracking (Share Location)"
   - Allow location permissions when prompted
   - Press "Start Journey" to begin sharing location

4. **On Mom's Phone:**
   - Select "I'm Monitoring (View Location)"
   - Watch the live map update with sister's location
   - Receive notifications when she arrives

## Features in Detail

### Real-time Location Tracking
- Uses browser Geolocation API with high accuracy mode
- Updates location every few seconds
- Tracks movement speed and heading

### Geofencing
- 100-meter radius around destination
- Automatic arrival detection
- Instant notifications to monitors

### Emergency Alerts
- One-tap emergency button
- Broadcasts location to all monitors
- Visual and audio notifications

### Battery Monitoring
- Displays current battery level
- Shows charging status
- Helps ensure tracker's device stays powered

### Journey Timeline
- Records location history
- Shows progress over time
- Displays up to last 100 location points on map

## PWA (Progressive Web App)

The app is PWA-ready with:
- Manifest file configured
- Installable on mobile devices
- Offline-capable (with service worker addition)

To install on mobile:
1. Open the app in a mobile browser
2. Look for "Add to Home Screen" option
3. The app will work like a native app

## Browser Compatibility

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

**Note:** Geolocation requires HTTPS in production (or localhost for development)

## Security Considerations

- Use HTTPS in production for geolocation to work
- Implement authentication on the backend
- Validate and sanitize socket events
- Rate limit location updates
- Consider encrypting sensitive location data

## Customization

### Change Destination Location
Edit `src/context/LocationContext.jsx`:
```javascript
const COLLEGE_LOCATION = {
  latitude: YOUR_LAT,
  longitude: YOUR_LONG,
  name: 'Your Destination'
}
```

### Adjust Geofence Radius
Edit `src/context/LocationContext.jsx`:
```javascript
const GEOFENCE_RADIUS = 100 // meters
```

### Customize Map Style
Edit `src/components/MapView.jsx`:
```javascript
style: 'mapbox://styles/mapbox/streets-v12' // or other Mapbox styles
```

## Troubleshooting

**Location not updating:**
- Check browser location permissions
- Ensure HTTPS (or localhost)
- Check console for errors

**Socket not connecting:**
- Verify backend server is running
- Check VITE_SOCKET_URL in .env
- Check CORS settings on backend

**Map not loading:**
- Verify VITE_MAPBOX_TOKEN is correct
- Check Mapbox account is active
- Check browser console for errors

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
