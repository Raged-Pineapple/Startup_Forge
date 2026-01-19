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
  process.env.NEO4J_URI || 'bolt://localhost:7687',
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

// GET DYNAMIC FOUNDERS BY DOMAIN
app.post('/api/founders/rising', async (req, res) => {
  const { userId, role } = req.body;
  console.log(`Fetching rising founders for user: ${userId} (${role})`);

  const session = driver.session();
  try {
    // 1. Get Logged-in User's Domain
    const userQuery = `MATCH (u:Investor {id: $userId}) RETURN u.domain AS domain LIMIT 1`;
    const userRes = await session.run(userQuery, { userId });

    let domain = null;
    if (userRes.records.length > 0) {
      domain = userRes.records[0].get('domain');
      console.log(`User Domain found: ${domain}`);
    } else {
      console.log("No specific domain found for user, using default.");
    }

    // 2. Recommendation Query
    // Logic: Find companies operated in the same domain OR just top companies if no domain
    let recQuery = '';
    let params = {};

    if (domain) {
      // Find companies via INVESTORS in the same domain
      // heuristic: "If an investor focuses on 'Advertising', their portfolio companies are likely relevant."
      recQuery = `
        MATCH (i:Investor {domain: $domain})-[:INVESTED_IN]->(c:Company)
        WHERE c.founder IS NOT NULL
        RETURN c.name AS company, c.founder AS name, c.round AS round, c.year AS year, c.valuation AS valuation, i.domain AS umbrella 
        ORDER BY rand() 
        LIMIT 6
      `;
      params = { domain };
    } else {
      // Fallback: Random top companies
      recQuery = `
        MATCH (c:Company)
        WHERE c.founder IS NOT NULL
        RETURN c.name AS company, c.founder AS name, c.round AS round, c.year AS year, c.valuation AS valuation
        ORDER BY rand() 
        LIMIT 6
      `;
    }

    const result = await session.run(recQuery, params);

    let founders = result.records.map(r => ({
      company: r.get('company'),
      name: r.get('name'),
      round: r.get('round'),
      year: r.get('year').toString(),
      valuation: r.get('valuation'),
      umbrella: r.has('umbrella') ? r.get('umbrella') : 'Tech'
    }));

    if (founders.length === 0) {
      throw new Error("No founders found in DB");
    }

    res.json({ success: true, founders });

  } catch (err) {
    console.error("Error fetching founders (using fallback):", err.message);

    // Fallback Mock Data
    const mockFounders = [
      { company: "Nebula AI", name: "Alex Rivera", round: "Series A", year: "2024", valuation: 45000000, umbrella: "AI & ML" },
      { company: "Zephyr Energy", name: "Sarah Chen", round: "Seed", year: "2023", valuation: 12000000, umbrella: "CleanTech" },
      { company: "Flux Systems", name: "James Wilson", round: "Series B", year: "2022", valuation: 150000000, umbrella: "Robotics" },
      { company: "Apex Bio", name: "Dr. Emily Zhang", round: "Series A", year: "2024", valuation: 60000000, umbrella: "Biotech" },
      { company: "Quantum Leap", name: "David Kim", round: "Seed", year: "2024", valuation: 8000000, umbrella: "Quantum" },
      { company: "Horizon Space", name: "Michael Chang", round: "Series C", year: "2021", valuation: 500000000, umbrella: "Aerospace" }
    ];

    res.json({ success: true, founders: mockFounders });
  } finally {
    session.close();
  }
});


// --- NETWORK PAGE ENDPOINTS ---

/**
 * Get All Founders
 * Includes connection status relative to the requester
 */
app.get('/api/users/founders', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    const query = `
            SELECT 
                f.id, 
                f.name, 
                f.company AS headline, 
                'founder' as role,
                'https://cdn-icons-png.flaticon.com/512/149/149071.png' as avatar,
                (SELECT COUNT(*) FROM connections WHERE user_a_id = f.id OR user_b_id = f.id) as connections,
                CASE 
                    WHEN $1::int IS NOT NULL THEN (
                        SELECT 1 FROM connections 
                        WHERE (user_a_id = $1::int AND user_b_id = f.id) 
                           OR (user_a_id = f.id AND user_b_id = $1::int)
                    )
                    ELSE NULL
                END as is_connected
            FROM founders f
            ORDER BY f.id DESC
            LIMIT 100
        `;
    // ensure userId is int or null
    const uid = userId ? parseInt(userId) : null;
    const result = await pool.query(query, [uid]);

    const mapped = result.rows.map(r => ({
      ...r,
      id: String(r.id),
      isConnected: !!r.is_connected
    }));

    res.json(mapped);
  } catch (e) {
    console.error("Founders Fetch Error:", e);
    res.status(500).json({ error: "Failed to fetch founders", details: e.toString() });
  }
});

/**
 * Get All Investors
 * Includes connection status relative to the requester
 */
app.get('/api/users/investors', async (req, res) => {
  const userId = req.headers['x-user-id'];
  try {
    const query = `
            SELECT 
                i.id, 
                i.name, 
                i.firm_name AS headline, 
                'investor' as role,
                'https://cdn-icons-png.flaticon.com/512/147/147144.png' as avatar,
                (SELECT COUNT(*) FROM connections WHERE user_a_id = i.id OR user_b_id = i.id) as connections,
                CASE 
                    WHEN $1::int IS NOT NULL THEN (
                        SELECT 1 FROM connections 
                        WHERE (user_a_id = $1::int AND user_b_id = i.id) 
                           OR (user_a_id = i.id AND user_b_id = $1::int)
                    )
                    ELSE NULL
                END as is_connected
            FROM investors i
            ORDER BY i.id DESC
            LIMIT 100
        `;
    const uid = userId ? parseInt(userId) : null;
    const result = await pool.query(query, [uid]);

    const mapped = result.rows.map(r => ({
      ...r,
      id: String(r.id),
      isConnected: !!r.is_connected
    }));

    res.json(mapped);
  } catch (e) {
    console.error("Investors Fetch Error:", e);
    res.status(500).json({ error: "Failed to fetch investors", details: e.toString() });
  }
});


// GET USER BY ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching user details for ID: ${id}`);

  const session = driver.session();
  try {
    // Check Investor
    const invResult = await session.run(`
      MATCH (u:Investor {id: $id})
      RETURN u.name AS name, u.firm_name AS firm, 'Investor' AS role, 
             u.short_bio AS about, u.location AS location, u.profile_url AS avatar,
             u.primary_domain AS domain
    `, { id });

    if (invResult.records.length > 0) {
      const r = invResult.records[0];
      return res.json({
        success: true,
        user: {
          id: id,
          name: r.get('name'),
          role: 'investor',
          company: r.get('firm') || 'Independent',
          title: 'Investor',
          headline: `Investor at ${r.get('firm') || 'Venture Capital'}`,
          location: r.get('location') || 'Global',
          about: r.get('about') || 'No bio available',
          avatar: r.get('avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.get('name'))}&background=random`,
          tags: r.get('domain') ? [r.get('domain')] : []
        }
      });
    }

    // Check Founder (Company)
    const founderResult = await session.run(`
      MATCH (c:Company {id: $id})
      RETURN c.founder AS name, c.name AS company, 'Founder' AS role,
             c.description AS about, c.location AS location,
             c.domain AS domain
    `, { id });

    if (founderResult.records.length > 0) {
      const r = founderResult.records[0];
      return res.json({
        success: true,
        user: {
          id: id,
          name: r.get('name') || 'Founder',
          role: 'founder',
          company: r.get('company'),
          title: 'Founder',
          headline: `Founder of ${r.get('company')}`,
          location: r.get('location') || 'Global',
          about: r.get('about') || `Building ${r.get('company')}`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.get('name') || 'Founder')}&background=random`,
          tags: r.get('domain') ? [r.get('domain')] : []
        }
      });
    }

    res.status(404).json({ error: 'User not found' });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    session.close();
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

