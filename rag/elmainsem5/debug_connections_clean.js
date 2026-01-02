const pool = require('./backend/db');

async function debug() {
    try {
        const res = await pool.query('SELECT * FROM connections');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
