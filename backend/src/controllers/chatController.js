const db = require('../config/db');

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(`
            SELECT 
                c.id,
                c.updated_at,
                CASE 
                    WHEN c.participant1_id = $1 THEN u2.email
                    ELSE u1.email
                END as other_user_email,
                CASE 
                    WHEN c.participant1_id = $1 THEN u2.id
                    ELSE u1.id
                END as other_user_id,
                CASE 
                    WHEN c.participant1_id = $1 THEN p2.profile_picture_url
                    ELSE p1.profile_picture_url
                END as other_user_profile_picture,
                (
                    SELECT content 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT created_at 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) as last_message_time
            FROM conversations c
            JOIN users u1 ON c.participant1_id = u1.id
            JOIN users u2 ON c.participant2_id = u2.id
            LEFT JOIN profiles p1 ON u1.id = p1.user_id
            LEFT JOIN profiles p2 ON u2.id = p2.user_id
            WHERE c.participant1_id = $1 OR c.participant2_id = $1
            ORDER BY c.updated_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify participation
        const conversation = await db.query(
            'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
            [conversationId, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const result = await db.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [conversationId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Start or get existing conversation
// @route   POST /api/chat/conversations
// @access  Private
const startConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const userId = req.user.id;

        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient ID is required' });
        }

        // Check if conversation exists
        const existing = await db.query(`
            SELECT * FROM conversations 
            WHERE (participant1_id = $1 AND participant2_id = $2) 
            OR (participant1_id = $2 AND participant2_id = $1)
        `, [userId, recipientId]);

        if (existing.rows.length > 0) {
            return res.json(existing.rows[0]);
        }

        // Create new conversation
        // Ensure consistent ordering of IDs to prevent duplicates if logic fails elsewhere
        // But our unique constraint (p1, p2) handles p1 != p2. 
        // We should probably just insert.

        const result = await db.query(
            'INSERT INTO conversations (participant1_id, participant2_id) VALUES ($1, $2) RETURNING *',
            [userId, recipientId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getConversations,
    getMessages,
    startConversation
};
