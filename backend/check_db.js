const pool = require('./db');

async function checkAndCreateTable() {
    try {
        console.log('Checking database connection...');
        const res = await pool.query('SELECT NOW()');
        console.log('Connected at:', res.rows[0].now);

        console.log('Checking for investment_reports table...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'investment_reports'
            );
        `);

        const exists = tableCheck.rows[0].exists;
        console.log('Table exists:', exists);

        if (!exists) {
            console.log('Creating table...');
            await pool.query(`
                CREATE TABLE investment_reports (
                    id SERIAL PRIMARY KEY,
                    connection_id INTEGER NOT NULL,
                    submitted_by VARCHAR(255) NOT NULL,
                    role VARCHAR(50),
                    round VARCHAR(50),
                    year INTEGER,
                    amount NUMERIC,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Table created.');
        } else {
            console.log('Table already exists. verifying schema...');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkAndCreateTable();
