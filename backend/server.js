const express = require('express');
const cors = require('cors');
const pool = require('./db');
const chatRoutes = require('./chat.routes');
const inboxRoutes = require('./inbox.routes');
const connectionRoutes = require('./connections.routes');
const investmentRoutes = require('./investments.routes');


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

    // DEBUG: Check for investment_reports table
    const tableCheck = await pool.query("SELECT to_regclass('public.investment_reports')");
    console.log("DEBUG: investment_reports table check:", tableCheck.rows[0]);

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
app.use('/api/investments', investmentRoutes);

const coiRouter = require('./coiService');
app.use('/api/coi', coiRouter);

const foundersRoutes = require('./founders.routes');
app.use('/api/founders', foundersRoutes);

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

  try {
    let user = null;

    if (role.toLowerCase() === 'investor') {
      // Postgres Lookup for Investor
      const result = await pool.query(
        `SELECT id, name FROM investors WHERE name ILIKE $1 LIMIT 1`,
        [`%${name}%`]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      // Postgres Lookup for Founder
      const result = await pool.query(
        `SELECT id, name, company FROM founders WHERE name ILIKE $1 OR company ILIKE $1 LIMIT 1`,
        [`%${name}%`]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    }

    if (user) {
      console.log(`Login successful: ${user.name} (ID: ${user.id})`);
      res.json({
        success: true,
        userId: user.id,
        name: user.name,
        role: role
      });
    } else {
      // Fallback for Demo if not found in DB
      if (name.toLowerCase().includes('mark') || name.toLowerCase().includes('demo')) {
        console.log("⚠️ User not found in Postgres. specific fallback for 'Mark Suster'.");
        // Try to get Mark Suster from DB specifically if fuzzy failed, or mock
        // Assuming ID 1 exists or similar. 
        // For now, return mock if DB fail, but simpler to just say not found
        // actually, let's keep the mock for resilience.
        return res.json({
          success: true,
          userId: 1, // Mock ID 1
          name: 'Mark Suster (Demo)',
          role: 'investor'
        });
      }
      res.status(404).json({ error: 'User not found in database. Please check exact spelling.' });
    }

  } catch (err) {
    console.error("Login Error (Postgres):", err.message);
    res.status(500).json({ error: "Database error during login." });
  }
});

// GET DYNAMIC FOUNDERS BY DOMAIN
app.post('/api/founders/rising', async (req, res) => {
  const { userId, role } = req.body;
  console.log(`Fetching rising founders for user: ${userId} (${role}) (Source: Postgres)`);

  try {
    // Query Postgres for top founders (e.g., highest valuation)
    // We can also filter by domain if we fetch the current user's domain first, but simple top list is a good start.
    const query = `
      SELECT id, name, company, valuation, past_funding, domain 
      FROM founders 
      WHERE name IS NOT NULL AND company IS NOT NULL
      ORDER BY valuation DESC NULLS LAST
      LIMIT 10
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      throw new Error("No founders found in Postgres");
    }

    const founders = result.rows.map(row => {
      // Extract latest funding info
      let round = 'Seed';
      let year = '2024';

      if (Array.isArray(row.past_funding) && row.past_funding.length > 0) {
        // Sort by year descending
        const sorted = row.past_funding.sort((a, b) => (b.year || 0) - (a.year || 0));
        const latest = sorted[0];
        if (latest.round) round = latest.round;
        if (latest.year) year = String(latest.year);
      }

      return {
        id: String(row.id),
        name: row.name,
        company: row.company,
        round: round,
        year: year,
        valuation: parseFloat(row.valuation || 0),
        umbrella: row.domain || 'Tech'
      };
    });

    res.json({ success: true, founders });

  } catch (err) {
    console.error("Error fetching founders from Postgres:", err.message);

    // Fallback Mock Data
    const mockFounders = [
      { id: 'm1', company: "Nebula AI", name: "Alex Rivera", round: "Series A", year: "2024", valuation: 45000000, umbrella: "AI & ML" },
      { id: 'm2', company: "Zephyr Energy", name: "Sarah Chen", round: "Seed", year: "2023", valuation: 12000000, umbrella: "CleanTech" },
      { id: 'm3', company: "Flux Systems", name: "James Wilson", round: "Series B", year: "2022", valuation: 150000000, umbrella: "Robotics" },
      { id: 'm4', company: "Apex Bio", name: "Dr. Emily Zhang", round: "Series A", year: "2024", valuation: 60000000, umbrella: "Biotech" },
      { id: 'm5', company: "Quantum Leap", name: "David Kim", round: "Seed", year: "2024", valuation: 8000000, umbrella: "Quantum" },
      { id: 'm6', company: "Horizon Space", name: "Michael Chang", round: "Series C", year: "2021", valuation: 500000000, umbrella: "Aerospace" }
    ];

    res.json({ success: true, founders: mockFounders });
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


// BATCH GET USERS (for History/Widgets)
app.post('/api/users/batch', async (req, res) => {
  const { items } = req.body; // Expects [{id: '1', role: 'founder'}]
  if (!items || !Array.isArray(items)) return res.json([]);

  try {
    const founderIds = items.filter(i => i.role === 'founder').map(i => parseInt(i.id)).filter(id => !isNaN(id));
    const investorIds = items.filter(i => i.role === 'investor').map(i => parseInt(i.id)).filter(id => !isNaN(id));

    const promises = [];

    if (founderIds.length > 0) {
      promises.push(pool.query(`
                SELECT id, name, company as headline, 'founder' as role 
                FROM founders 
                WHERE id = ANY($1::int[])
            `, [founderIds]));
    }

    if (investorIds.length > 0) {
      promises.push(pool.query(`
                SELECT id, name, firm_name as headline, 'investor' as role 
                FROM investors 
                WHERE id = ANY($1::int[])
            `, [investorIds]));
    }

    const results = await Promise.all(promises);
    const combined = results.flatMap(r => r.rows).map(u => ({
      ...u,
      id: String(u.id),
      avatar: u.role === 'founder'
        ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        : 'https://cdn-icons-png.flaticon.com/512/147/147144.png'
    }));

    res.json(combined);

  } catch (e) {
    console.error("Batch Fetch Error:", e);
    res.status(500).json({ error: "Server error" });
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
      OPTIONAL MATCH (c)-[:COMPETES_WITH]->(comp:Company)
      OPTIONAL MATCH (p:Company)-[:HAS_SUBSIDIARY]->(c)
      RETURN c.founder AS name, c.name AS company, 'Founder' AS role,
             c.description AS about, c.location AS location,
             c.domain AS domain,
             c.valuation AS valuation,
             c.round AS round,
             c.year AS year,
             collect(distinct comp.name) AS competitors,
             collect(distinct p.name) AS umbrella
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
          tags: r.get('domain') ? [r.get('domain')] : [],
          // Expanded Data for Prediction
          primaryDomain: r.get('domain'),
          valuation: typeof r.get('valuation') === 'object' ? r.get('valuation').toNumber() : r.get('valuation'),
          fundingYear: typeof r.get('year') === 'object' ? r.get('year').toNumber() : r.get('year'),
          fundingRound: r.get('round'),
          competitors: r.get('competitors'),
          umbrella: r.get('umbrella')
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

