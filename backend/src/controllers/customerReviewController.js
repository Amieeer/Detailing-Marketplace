const db = require('../config/db');

// Helper function to recalculate customer's average rating
const recalculateCustomerRating = async (customerId) => {
    const result = await db.query(
        'SELECT AVG(rating)::numeric(3,2) as avg_rating FROM customer_reviews WHERE customer_id = $1',
        [customerId]
    );
    const avgRating = result.rows[0].avg_rating || 0;

    await db.query('UPDATE users SET customer_rating = $1 WHERE id = $2', [avgRating, customerId]);

    return avgRating;
};

// @desc    Create a customer review
// @route   POST /api/customer-reviews
// @access  Private (Detailer only)
const createCustomerReview = async (req, res) => {
    const { booking_id, rating, comment } = req.body;
    const detailer_id = req.user.id;

    try {
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if booking exists and belongs to detailer
        const bookingResult = await db.query(
            'SELECT * FROM bookings WHERE id = $1 AND detailer_id = $2',
            [booking_id, detailer_id]
        );

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found or does not belong to you' });
        }

        const booking = bookingResult.rows[0];

        // Check if booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if review already exists for this booking
        const existingReview = await db.query(
            'SELECT * FROM customer_reviews WHERE booking_id = $1',
            [booking_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'Review already exists for this booking' });
        }

        // Create review
        const result = await db.query(
            `INSERT INTO customer_reviews (booking_id, detailer_id, customer_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [booking_id, detailer_id, booking.customer_id, rating, comment || null]
        );

        // Recalculate customer's average rating
        await recalculateCustomerRating(booking.customer_id);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a customer
// @route   GET /api/customer-reviews/customer/:customerId
// @access  Private (Detailer only)
const getCustomerReviews = async (req, res) => {
    const { customerId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await db.query(
            `SELECT cr.*, 
                    p.business_name as detailer_name,
                    b.service_name,
                    b.scheduled_time
             FROM customer_reviews cr
             LEFT JOIN profiles p ON cr.detailer_id = p.user_id
             JOIN bookings b ON cr.booking_id = b.id
             WHERE cr.customer_id = $1
             ORDER BY cr.created_at DESC
             LIMIT $2 OFFSET $3`,
            [customerId, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get customer's average rating
// @route   GET /api/customer-reviews/customer/:customerId/rating
// @access  Public
const getCustomerRating = async (req, res) => {
    const { customerId } = req.params;

    try {
        const result = await db.query('SELECT customer_rating FROM users WHERE id = $1', [
            customerId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({
            customer_id: customerId,
            rating: parseFloat(result.rows[0].customer_rating) || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createCustomerReview,
    getCustomerReviews,
    getCustomerRating
};
