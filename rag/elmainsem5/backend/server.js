const express = require('express');
const cors = require('cors');
const pool = require('./db');
const chatRoutes = require('./chat.routes');
const inboxRoutes = require('./inbox.routes');
const connectionRoutes = require('./connections.routes');


const app = express();
const PORT = 3000;

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
/**
 * Use this to verify:
 * 1. Server is running
 * 2. Database is reachable
 */
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('DB health check failed:', err.message);
    res.status(500).json({
      status: 'error',
      db: 'disconnected'
    });
  }
});

/* ---------------- ROUTES ---------------- */
app.use('/chat', chatRoutes);
app.use('/inbox', inboxRoutes);
app.use('/connections', connectionRoutes);

/* ---------------- SERVER START ---------------- */
app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

