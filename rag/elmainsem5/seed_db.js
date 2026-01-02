const pool = require('./backend/db');
const initDB = require('./init_db');

async function seed() {
  try {
    console.log('Dropping old tables...');
    await pool.query('DROP TABLE IF EXISTS chat_rooms CASCADE');
    await pool.query('DROP TABLE IF EXISTS connections CASCADE');
    await pool.query('DROP TABLE IF EXISTS connection_requests CASCADE');

    console.log('Re-initializing Database...');
    await initDB();

    console.log('Inserting connection request...');
    const reqRes = await pool.query(`
      INSERT INTO connection_requests 
      (sender_id, sender_role, receiver_id, receiver_role, message, status) 
      VALUES (1, 'founder', 2, 'investor', 'Let us connect!', 'ACCEPTED') 
      RETURNING id
    `);
    const reqId = reqRes.rows[0].id;

    console.log('Inserting connection...');
    // User 1 (Founder) <-> User 2 (Investor)
    await pool.query(`
      INSERT INTO connections 
      (connection_request_id, user_a_id, user_a_role, user_b_id, user_b_role)
      VALUES ($1, 1, 'founder', 2, 'investor')
    `, [reqId]);

    console.log('✅ Database seeded!');
    console.log('Test Users:');
    console.log('  User A: ID 1 (founder)');
    console.log('  User B: ID 2 (investor)');
    process.exit(0);
  } catch (err) {
    console.error('SEED ERROR:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  }
}

seed();
