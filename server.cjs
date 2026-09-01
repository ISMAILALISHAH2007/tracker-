const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Store active trackers and their data
const activeTrackers = new Map()

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`)

  // Handle location updates from tracker
  socket.on('location-update', (data) => {
    console.log(`[${new Date().toISOString()}] Location update from ${socket.id}`)
    
    // Store tracker data
    activeTrackers.set(socket.id, {
      ...data,
      lastUpdate: Date.now()
    })

    // Broadcast to all other clients (monitors)
    socket.broadcast.emit('location-update', {
      ...data,
      trackerId: socket.id
    })
  })

  // Handle emergency alerts
  socket.on('emergency-alert', (data) => {
    console.log(`[${new Date().toISOString()}] EMERGENCY ALERT from ${socket.id}`)
    
    // Broadcast emergency to all clients with high priority
    io.emit('emergency-alert', {
      ...data,
      trackerId: socket.id,
      timestamp: Date.now()
    })
  })

  // Handle arrival notifications
  socket.on('arrival-notification', (data) => {
    console.log(`[${new Date().toISOString()}] Arrival notification from ${socket.id}`)
    
    socket.broadcast.emit('arrival-notification', {
      ...data,
      trackerId: socket.id
    })
  })

  // Handle stop tracking
  socket.on('stop-tracking', () => {
    console.log(`[${new Date().toISOString()}] Tracking stopped by ${socket.id}`)
    
    activeTrackers.delete(socket.id)
    socket.broadcast.emit('stop-tracking', {
      trackerId: socket.id
    })
  })

  // Handle location request from monitor
  socket.on('request-location', () => {
    console.log(`[${new Date().toISOString()}] Location requested by ${socket.id}`)
    
    // Send current tracker data if available
    activeTrackers.forEach((data, trackerId) => {
      socket.emit('location-update', {
        ...data,
        trackerId
      })
    })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`)
    activeTrackers.delete(socket.id)
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeTrackers: activeTrackers.size,
    timestamp: new Date().toISOString()
  })
})

// Get active trackers info
app.get('/trackers', (req, res) => {
  const trackers = Array.from(activeTrackers.entries()).map(([id, data]) => ({
    id,
    lastUpdate: data.lastUpdate,
    battery: data.battery
  }))
  res.json({ trackers })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   Family Tracker Server                   ║
║   Running on port ${PORT}                    ║
║   Health check: http://localhost:${PORT}/health ║
╚═══════════════════════════════════════════╝
  `)
})
