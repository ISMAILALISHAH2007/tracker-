const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: corsOptions
});

// Import routes
const locationRoutes = require('./routes/location');
const journeyRoutes = require('./routes/journey');
const geofenceRoutes = require('./routes/geofence');

// Import socket handlers
const setupSocketHandlers = require('./sockets/handlers');

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/location', locationRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/geofence', geofenceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Family Tracker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      location: '/api/location',
      journey: '/api/journey',
      geofence: '/api/geofence'
    },
    socket: {
      enabled: true,
      events: ['join_family', 'update_location', 'emergency_alert', 'request_location']
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
