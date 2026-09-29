import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import bidderRoutes from './routes/bidderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { startCronJobs } from './utils/cronJobs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict to your frontend URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Make io accessible in controllers
app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Users join a specific room for an auction to listen for real-time bids
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`User ${socket.id} joined auction_${auctionId}`);
  });

  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`User ${socket.id} left auction_${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start Background Jobs
startCronJobs(io);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running correctly.' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/bidder', bidderRoutes);
app.use('/api/admin', adminRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
