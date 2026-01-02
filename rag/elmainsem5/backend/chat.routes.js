const express = require('express');
const crypto = require('crypto');
const pool = require('./db');

const router = express.Router();

/**
 * Get/Create Chat Room Key by Target User ID
 * POST /chat
 * Headers: x-user-id
 * Body: { targetUserId }
 */
router.post('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { targetUserId } = req.body;

  if (!userId || !targetUserId) {
    return res.status(400).json({ error: 'Missing x-user-id or targetUserId' });
  }

  try {
    // 1. Find the connection ID between these two users
    // accepted status only
    const conn = await pool.query(`
            SELECT c.id AS connection_id
            FROM connections c
            JOIN connection_requests cr ON c.connection_request_id = cr.id
            WHERE cr.status = 'ACCEPTED'
            AND (
                (c.user_a_id = $1 AND c.user_b_id = $2) OR
                (c.user_a_id = $2 AND c.user_b_id = $1)
            )
        `, [userId, targetUserId]);

    if (conn.rowCount === 0) {
      return res.status(404).json({ error: 'No accepted connection found' });
    }

    const connectionId = conn.rows[0].connection_id;

    // 2. Reuse existing logic to get/create room
    // Check if chat room already exists
    const existing = await pool.query(
      'SELECT room_key FROM chat_rooms WHERE connection_id = $1',
      [connectionId]
    );

    if (existing.rowCount > 0) {
      return res.json({ roomKey: existing.rows[0].room_key });
    }

    // 3. Create room key
    const roomKey = crypto
      .createHash('sha256')
      .update(`connection:${connectionId}`)
      .digest('hex');

    // 4. Store metadata
    await pool.query(
      'INSERT INTO chat_rooms (connection_id, room_key) VALUES ($1, $2)',
      [connectionId, roomKey]
    );

    res.json({ roomKey });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Create / fetch chat room for a connection
 * Body: { userId, userRole }
 */
router.post('/init/:connectionId', async (req, res) => {
  const { connectionId } = req.params;
  const { userId, userRole } = req.body;

  if (!userId || !userRole) {
    return res.status(400).json({ error: 'Missing userId or userRole' });
  }

  // 1. Check if connection is ACCEPTED AND user is part of it
  const check = await pool.query(`
    SELECT 1
    FROM connections c
    JOIN connection_requests cr ON c.connection_request_id = cr.id
    WHERE c.id = $1 
    AND cr.status = 'ACCEPTED'
    AND (
      (c.user_a_id = $2 AND c.user_a_role = $3) OR
      (c.user_b_id = $2 AND c.user_b_role = $3)
    )
  `, [connectionId, userId, userRole]);

  if (check.rowCount === 0) {
    return res.status(403).json({ error: 'Unauthorized: Connection not accepted or user not a participant' });
  }

  // 2. Check if chat room already exists
  const existing = await pool.query(
    'SELECT room_key FROM chat_rooms WHERE connection_id = $1',
    [connectionId]
  );

  if (existing.rowCount > 0) {
    return res.json({ roomKey: existing.rows[0].room_key });
  }

  // 3. Create room key
  const roomKey = crypto
    .createHash('sha256')
    .update(`connection:${connectionId}`)
    .digest('hex');

  // 4. Store metadata
  await pool.query(
    'INSERT INTO chat_rooms (connection_id, room_key) VALUES ($1, $2)',
    [connectionId, roomKey]
  );

  res.json({ roomKey });
});

module.exports = router;
