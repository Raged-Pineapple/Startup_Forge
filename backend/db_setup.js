const pool = require('./db');

async function setupDatabase(res) {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Investors Table
            await client.query(`
        CREATE TABLE IF NOT EXISTS investors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          firm_name VARCHAR(255),
          short_bio TEXT,
          location VARCHAR(100),
          profile_url TEXT,
          primary_domain VARCHAR(100)
        );
      `);

            // 2. Founders Table
            await client.query(`
        CREATE TABLE IF NOT EXISTS founders (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          description TEXT,
          location VARCHAR(100),
          domain VARCHAR(100),
          valuation NUMERIC,
          round VARCHAR(50),
          year INTEGER,
          past_funding JSONB DEFAULT '[]'
        );
      `);

            // 3. Connections Table
            await client.query(`
        CREATE TABLE IF NOT EXISTS connections (
          id SERIAL PRIMARY KEY,
          user_a_id INTEGER NOT NULL,
          user_b_id INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'connected',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // 4. Investment Reports Table
            await client.query(`
        CREATE TABLE IF NOT EXISTS investment_reports (
            id SERIAL PRIMARY KEY,
            connection_id INTEGER, -- nullable if not strictly enforcing backend FK for demo
            submitted_by VARCHAR(50) NOT NULL,
            role VARCHAR(20) NOT NULL,
            round VARCHAR(50),
            year INTEGER,
            amount NUMERIC,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // --- SEED DATA ---
            // check if Mark Suster exists
            const markCheck = await client.query("SELECT id FROM investors WHERE name = 'Mark Suster'");
            if (markCheck.rows.length === 0) {
                await client.query(`
          INSERT INTO investors (name, firm_name, short_bio, location, profile_url, primary_domain)
          VALUES ('Mark Suster', 'Upfront Ventures', 'Partner at Upfront Ventures.', 'Los Angeles', NULL, 'SaaS')
        `);
            }

            // check if 1upHealth exists
            const healthCheck = await client.query("SELECT id FROM founders WHERE company = '1upHealth'");
            if (healthCheck.rows.length === 0) {
                await client.query(`
          INSERT INTO founders (name, company, description, location, domain, valuation, round, year, past_funding)
          VALUES ('Ricky Sahu', '1upHealth', 'Connecting healthcare data.', 'Boston', 'Healthcare', 50000000, 'Series A', 2024, '[{"round": "Seed", "year": 2023}]')
        `);
            }

            await client.query('COMMIT');
            res.send(`
        <h1>Database Setup Complete ✅</h1>
        <p>Tables created and seed data (Mark Suster, 1upHealth) inserted.</p>
        <p>You can now go back to the frontend and login.</p>
      `);

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Setup DB Failed:", err);
        res.status(500).send("Database Setup Failed: " + err.message);
    }
}

module.exports = setupDatabase;
