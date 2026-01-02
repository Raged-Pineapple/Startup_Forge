const pool = require('./backend/db');

async function debug() {
    try {
        const res1 = await pool.query('SELECT * FROM connection_requests');
        console.log('REQUESTS:', JSON.stringify(res1.rows, null, 2));

        const res2 = await pool.query('SELECT * FROM connections');
        console.log('CONNECTIONS:', JSON.stringify(res2.rows, null, 2));

        const res3 = await pool.query('SELECT * FROM chat_rooms');
        console.log('CHAT_ROOMS:', JSON.stringify(res3.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
