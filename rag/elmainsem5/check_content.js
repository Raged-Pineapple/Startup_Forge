const pool = require('./backend/db');

async function checkContent() {
    try {
        const res = await pool.query(`
      SELECT c.id, c.connection_request_id, cr.status 
      FROM connections c
      JOIN connection_requests cr ON c.connection_request_id = cr.id
    `);
        console.log('Connections:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkContent();
