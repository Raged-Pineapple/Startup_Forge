const pool = require('./backend/db');

async function checkDB() {
    try {
        console.log('--- Connection Requests ---');
        const reqs = await pool.query('SELECT * FROM connection_requests');
        console.table(reqs.rows);

        console.log('\n--- Connections ---');
        const conns = await pool.query('SELECT * FROM connections');
        console.table(conns.rows);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkDB();
