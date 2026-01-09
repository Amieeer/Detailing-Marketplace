const db = require('../config/db');

const getMyVehicles = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addVehicle = async (req, res) => {
    try {
        const userId = req.user.id;
        const { make, model, year, color, license_plate, type, photo_url } = req.body;

        if (!make || !model) {
            return res.status(400).json({ message: 'Make and Model are required' });
        }

        const result = await db.query(
            `INSERT INTO vehicles (user_id, make, model, year, color, license_plate, type, photo_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, make, model, year, color, license_plate, type, photo_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
        }

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyVehicles,
    addVehicle,
    deleteVehicle
};
