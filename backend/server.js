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

const coiRouter = require('./coiService');
app.use('/api/coi', coiRouter);

// LOGIN ENDPOINT (Name -> ID Resolution)
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'StrongPassword123'),
  { encrypted: false }
);

app.post('/api/login', async (req, res) => {
  const { name, role } = req.body;
  console.log(`Login attempt: ${name} (${role})`);

  if (!name || !role) return res.status(400).json({ error: 'Name and Role required' });

  const session = driver.session();
  try {
    let query = '';
    let params = { name };

    if (role.toLowerCase() === 'investor') {
      // Fuzzy match for investor name
      query = `MATCH (i:Investor) WHERE toLower(i.name) CONTAINS toLower($name) RETURN i.id AS id, i.name AS name LIMIT 1`;
    } else {
      // Founders linked to Companies
      // We look for Company Name OR Founder Name (if we stored founder name property)
      // Based on sync script: Company has 'name'. Founder logic might be simplified to just match Company Name for this prototype
      // or we check 'name' property of Company node if that represents founder/company entity.
      query = `MATCH (c:Company) WHERE toLower(c.name) CONTAINS toLower($name) RETURN c.id AS id, c.name AS name LIMIT 1`;
    }

    const result = await session.run(query, params);

    if (result.records.length > 0) {
      const record = result.records[0];
      res.json({
        success: true,
        userId: record.get('id'),
        name: record.get('name'),
        role: role
      });
    } else {
      res.status(404).json({ error: 'User not found in database. Please check exact spelling.' });
    }
  } catch (err) {
    console.error("Login Error (Neo4j):", err.message);

    // FALLBACK for Demo/Dev stability:
    // If Neo4j is down, allow login as the Demo Investor (Mark Suster)
    if (name.toLowerCase().includes('mark') || name.toLowerCase().includes('demo')) {
      console.log("⚠️ Database offline. Falling back to Mock Login for 'Mark Suster'.");
      return res.json({
        success: true,
        userId: 'inv_demo', // Matches the seed data ID
        name: 'Mark Suster (Demo)',
        role: 'investor'
      });
    }

    res.status(500).json({ error: "Database offline. Try logging in as 'Mark Suster' for a demo fallback." });
  } finally {
    try {
      await session.close();
    } catch (e) { /* ignore close error */ }
  }
});

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

