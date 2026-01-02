const express = require('express');
const pool = require('./db');
const router = express.Router();

/**
 * Send Connection Request
 * POST /connections/request
 * Body: { sender_id, sender_role, receiver_id, receiver_role, message }
 */
router.post('/request', async (req, res) => {
    const { sender_id, sender_role, receiver_id, receiver_role, message } = req.body;

    if (String(sender_id) === String(receiver_id)) {
        return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    try {
        // Check pending
        const existing = await pool.query(`
      SELECT 1 FROM connection_requests 
      WHERE sender_id = $1 AND receiver_id = $2 AND status = 'PENDING'
    `, [sender_id, receiver_id]);

        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Request already pending' });
        }

        // Insert
        await pool.query(`
      INSERT INTO connection_requests 
      (sender_id, sender_role, receiver_id, receiver_role, message, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
    `, [sender_id, sender_role, receiver_id, receiver_role, message]);

        res.status(201).json({ status: 'PENDING' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get Incoming Requests (Notifications)
 * GET /connections/requests/incoming
 * Headers: x-user-id, x-user-role
 */
router.get('/requests/incoming', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ error: 'Missing x-user-id header' });

    try {
        const result = await pool.query(`
      SELECT * FROM connection_requests 
      WHERE receiver_id = $1 AND status = 'PENDING'
      ORDER BY created_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get Outgoing Requests (Sent)
 * GET /connections/requests/outgoing
 * Headers: x-user-id
 */
router.get('/requests/outgoing', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ error: 'Missing x-user-id header' });

    try {
        const result = await pool.query(`
      SELECT receiver_id, status FROM connection_requests 
      WHERE sender_id = $1 AND status = 'PENDING'
    `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get Notifications (Accepted Requests)
 * GET /connections/notifications
 * Headers: x-user-id
 */
router.get('/notifications', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ error: 'Missing x-user-id header' });

    try {
        const result = await pool.query(`
      SELECT * FROM connection_requests 
      WHERE sender_id = $1 AND status = 'ACCEPTED'
      ORDER BY responded_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Accept Request
 * POST /connections/accept/:id
 * Headers: x-user-id
 */
router.post('/accept/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(400).json({ error: 'Missing x-user-id header' });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Request with Lock
        // We verify that the request exists and that the CURRENT USER is the intended receiver.
        const reqRes = await client.query(`
            SELECT * FROM connection_requests 
            WHERE id = $1 AND receiver_id = $2 
            FOR UPDATE
        `, [id, userId]);

        if (reqRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Request not found or you are not authorized' });
        }

        const request = reqRes.rows[0];

        // 2. Idempotency Check
        // If already accepted, just return success (idempotent).
        if (request.status === 'ACCEPTED') {
            await client.query('ROLLBACK');
            return res.json({ status: 'ACCEPTED', message: 'Already connected' });
        }

        // If rejected or something else, we might want to handle it, but for now specific check:
        if (request.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Cannot accept request with status: ${request.status}` });
        }

        // 3. Update Request Status
        await client.query(`
            UPDATE connection_requests 
            SET status = 'ACCEPTED', responded_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [id]);

        // 4. Create Connection (Avoid Duplicates)
        // Check if connection already exists just in case of race condition or previous data error
        const existingConn = await client.query(`
            SELECT 1 FROM connections 
            WHERE (user_a_id = $1 AND user_b_id = $2) OR (user_a_id = $2 AND user_b_id = $1)
        `, [request.sender_id, request.receiver_id]);

        if (existingConn.rowCount === 0) {
            await client.query(`
                INSERT INTO connections 
                (connection_request_id, user_a_id, user_a_role, user_b_id, user_b_role)
                VALUES ($1, $2, $3, $4, $5)
            `, [id, request.sender_id, request.sender_role, request.receiver_id, request.receiver_role]);
        }

        await client.query('COMMIT');
        res.json({ status: 'ACCEPTED' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Accept Error:", err);
        res.status(500).json({ error: 'Server error processing acceptance' });
    } finally {
        client.release();
    }
});

module.exports = router;
