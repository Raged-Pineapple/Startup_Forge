const express = require('express');
const pool = require('./db');

const router = express.Router();

/**
 * Get Inbox (Accepted Connections)
 * Returns all connections where status = 'ACCEPTED' and user is a participant.
 * Headers: x-user-id, x-user-role (for simulation)
 */
router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ error: 'Missing x-user-id header' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        c.id as connection_id,
        CASE 
          WHEN c.user_a_id = $1 THEN c.user_b_id
          ELSE c.user_a_id
        END as other_user_id,
        CASE 
          WHEN c.user_a_id = $1 THEN c.user_b_role
          ELSE c.user_a_role
        END as other_user_role,
        cr2.room_key
      FROM connections c
      JOIN connection_requests cr ON c.connection_request_id = cr.id
      LEFT JOIN chat_rooms cr2 ON c.id = cr2.connection_id
      WHERE cr.status = 'ACCEPTED'
      AND (
        (c.user_a_id = $1) OR 
        (c.user_b_id = $1)
      )
    `, [userId]);

    res.json({ connections: result.rows });
  } catch (err) {
    console.error('Error fetching inbox:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
