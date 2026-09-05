// AYUSH - Server Entry Point
const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);

// Socket.io setup
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join a deal room
  socket.on('join-deal', (dealId) => {
    socket.join(`deal-${dealId}`);
    console.log(`📋 Client ${socket.id} joined deal ${dealId}`);
  });

  // Leave a deal room
  socket.on('leave-deal', (dealId) => {
    socket.leave(`deal-${dealId}`);
    console.log(`📋 Client ${socket.id} left deal ${dealId}`);
  });

  // Handle approval updates
  socket.on('approval-update', (data) => {
    io.to(`deal-${data.dealId}`).emit('status-changed', data);
    console.log(`🔄 Approval update for deal ${data.dealId}: ${data.status}`);
  });

  // Handle negotiation updates
  socket.on('negotiation-update', (data) => {
    io.to(`deal-${data.dealId}`).emit('negotiation-changed', data);
    console.log(`💬 Negotiation update for deal ${data.dealId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});