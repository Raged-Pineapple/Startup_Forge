const pool = require('./backend/db');

async function initDB() {
  try {
    await pool.query(`
      -- 1. Connection Requests
      CREATE TABLE IF NOT EXISTS connection_requests (
        id SERIAL PRIMARY KEY,
        sender_id INT NOT NULL,
        sender_role VARCHAR(20) NOT NULL,
        receiver_id INT NOT NULL,
        receiver_role VARCHAR(20) NOT NULL,
        message TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP
      );

      -- 2. Connections
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        connection_request_id INT UNIQUE NOT NULL,
        user_a_id INT NOT NULL,
        user_a_role VARCHAR(20) NOT NULL,
        user_b_id INT NOT NULL,
        user_b_role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_request
            FOREIGN KEY (connection_request_id)
            REFERENCES connection_requests(id)
            ON DELETE CASCADE
      );

      -- 3. Chat Rooms
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        connection_id INT NOT NULL UNIQUE,
        room_key TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_connection
            FOREIGN KEY (connection_id)
            REFERENCES connections(id)
            ON DELETE CASCADE
      );
    `);
    console.log('Created chat_rooms table');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  initDB();
}

module.exports = initDB;
