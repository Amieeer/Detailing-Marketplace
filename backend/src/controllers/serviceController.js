const db = require('../config/db');

// @desc    Get all services for a specific detailer
// @route   GET /api/services/detailer/:detailerId
// @access  Public
const getDetailerServices = async (req, res) => {
    try {
        const { detailerId } = req.params;
        const result = await db.query(
            'SELECT * FROM services WHERE detailer_id = $1 AND is_active = TRUE',
            [detailerId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a new service
// @route   POST /api/services
// @access  Private (Detailer only)
const addService = async (req, res) => {
    const { name, description, price, duration_minutes, image_url } = req.body;

    try {
        if (req.user.role !== 'detailer') {
            return res.status(403).json({ message: 'Only detailers can add services' });
        }

        const result = await db.query(
            'INSERT INTO services (detailer_id, name, description, price, duration_minutes, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, name, description, price, duration_minutes, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Detailer only)
const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, duration_minutes, is_active, image_url } = req.body;

    try {
        // ... (ownership checks)

        const result = await db.query(
            'UPDATE services SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), duration_minutes = COALESCE($4, duration_minutes), is_active = COALESCE($5, is_active), image_url = COALESCE($6, image_url) WHERE id = $7 RETURNING *',
            [name, description, price, duration_minutes, is_active, image_url, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all services for logged-in detailer
// @route   GET /api/services/my-services
// @access  Private (Detailer only)
const getMyServices = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM services WHERE detailer_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Detailer only)
const deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        // Check ownership
        const service = await db.query('SELECT * FROM services WHERE id = $1', [id]);
        if (service.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (service.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check for active bookings
        const bookings = await db.query(
            'SELECT COUNT(*) FROM bookings WHERE service_id = $1 AND status IN ($2, $3)',
            [id, 'pending', 'confirmed']
        );

        if (parseInt(bookings.rows[0].count) > 0) {
            return res.status(400).json({
                message: 'Cannot delete service with active bookings'
            });
        }

        await db.query('DELETE FROM services WHERE id = $1', [id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle service active status
// @route   PATCH /api/services/:id/toggle
// @access  Private (Detailer only)
const toggleServiceStatus = async (req, res) => {
    const { id } = req.params;

    try {
        // Check ownership
        const service = await db.query('SELECT * FROM services WHERE id = $1', [id]);
        if (service.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (service.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const result = await db.query(
            'UPDATE services SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDetailerServices,
    getMyServices,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus
};
