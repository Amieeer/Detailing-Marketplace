const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const toggleFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { detailerId } = req.body;

    if (!detailerId) {
        return res.status(400).json({ message: 'Detailer ID is required' });
    }

    try {
        // Check if already favorited
        const checkRes = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND detailer_id = $2',
            [userId, detailerId]
        );

        if (checkRes.rows.length > 0) {
            // Remove favorite
            await pool.query('DELETE FROM favorites WHERE user_id = $1 AND detailer_id = $2', [
                userId,
                detailerId
            ]);
            return res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            // Add favorite
            await pool.query('INSERT INTO favorites (user_id, detailer_id) VALUES ($1, $2)', [
                userId,
                detailerId
            ]);
            return res.json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getFavorites = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `
            SELECT 
                u.id, 
                u.email, 
                p.profile_picture_url as profile_image, 
                p.business_name,
                p.bio, 
                p.rating, 
                p.jobs_completed
            FROM favorites f
            JOIN users u ON f.detailer_id = u.id
            JOIN profiles p ON u.id = p.user_id
            WHERE f.user_id = $1
        `,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { detailerId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND detailer_id = $2',
            [userId, detailerId]
        );
        res.json({ isFavorite: result.rows.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    toggleFavorite,
    getFavorites,
    checkFavorite
};
