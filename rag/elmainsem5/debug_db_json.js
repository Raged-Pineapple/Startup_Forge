const pool = require('./backend/db');

async function checkDB() {
    try {
        const reqs = await pool.query('SELECT id, sender_id, receiver_id, status FROM connection_requests');
        console.log('REQUESTS:', JSON.stringify(reqs.rows));

        const conns = await pool.query('SELECT * FROM connections');
        console.log('CONNECTIONS:', JSON.stringify(conns.rows));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkDB();
