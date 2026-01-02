const pool = require('./backend/db');

async function debug() {
    try {
        console.log('--- Connection Requests ---');
        const res1 = await pool.query('SELECT * FROM connection_requests');
        console.table(res1.rows);

        console.log('\n--- Connections ---');
        const res2 = await pool.query('SELECT * FROM connections');
        console.table(res2.rows);

        console.log('\n--- Chat Rooms ---');
        const res3 = await pool.query('SELECT * FROM chat_rooms');
        console.table(res3.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
