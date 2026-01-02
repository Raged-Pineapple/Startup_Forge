const pool = require('./backend/db');

async function checkData() {
    try {
        console.log('Checking Data...');

        const requests = await pool.query('SELECT * FROM connection_requests');
        console.log('Requests:', requests.rows);

        const connections = await pool.query('SELECT * FROM connections');
        console.log('Connections:', connections.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
