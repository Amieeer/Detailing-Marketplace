const db = require('../config/db');

// Helper function to recalculate detailer's average rating
const recalculateDetailerRating = async (detailerId) => {
    const result = await db.query(
        'SELECT AVG(rating)::numeric(3,2) as avg_rating FROM reviews WHERE detailer_id = $1',
        [detailerId]
    );
    const avgRating = result.rows[0].avg_rating || 0;

    await db.query('UPDATE profiles SET rating = $1 WHERE user_id = $2', [avgRating, detailerId]);

    return avgRating;
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Customer only)
const createReview = async (req, res) => {
    const { booking_id, rating, comment, is_anonymous } = req.body;
    const customer_id = req.user.id;

    try {
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if booking exists and belongs to customer
        const bookingResult = await db.query(
            'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2',
            [booking_id, customer_id]
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
        const existingReview = await db.query('SELECT * FROM reviews WHERE booking_id = $1', [
            booking_id
        ]);

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'Review already exists for this booking' });
        }

        // Create review
        const result = await db.query(
            `INSERT INTO reviews (booking_id, customer_id, detailer_id, rating, comment, is_anonymous)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                booking_id,
                customer_id,
                booking.detailer_id,
                rating,
                comment || null,
                is_anonymous || false
            ]
        );

        // Recalculate detailer's average rating
        await recalculateDetailerRating(booking.detailer_id);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a detailer
// @route   GET /api/reviews/detailer/:detailerId
// @access  Public
const getDetailerReviews = async (req, res) => {
    const { detailerId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await db.query(
            `SELECT r.*, 
                    u.email as customer_email,
                    s.name as service_name,
                    b.scheduled_time
             FROM reviews r
             JOIN users u ON r.customer_id = u.id
             LEFT JOIN services s ON r.booking_id IN (SELECT id FROM bookings WHERE service_id = s.id)
             JOIN bookings b ON r.booking_id = b.id
             WHERE r.detailer_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [detailerId, limit, offset]
        );

        // Format customer names (first name + last initial or "Anonymous")
        const reviews = result.rows.map((review) => ({
            ...review,
            customer_name: review.is_anonymous
                ? 'Anonymous'
                : formatCustomerName(review.customer_email)
        }));

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to format customer name
const formatCustomerName = (email) => {
    if (!email) return 'Customer';
    // Extract name from email (before @)
    const namePart = email.split('@')[0];
    // If it looks like a name with numbers, just use first part
    const cleanName = namePart.replace(/[0-9]/g, '');
    if (cleanName.length > 1) {
        const firstName =
            cleanName.charAt(0).toUpperCase() + cleanName.slice(1, Math.min(cleanName.length, 8));
        return `${firstName} C.`;
    }
    return 'Customer';
};

// @desc    Get reviews written by logged-in customer
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT r.*, 
                    b.service_name,
                    p.business_name as detailer_name
             FROM reviews r
             JOIN bookings b ON r.booking_id = b.id
             JOIN profiles p ON r.detailer_id = p.user_id
             WHERE r.customer_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment, is_anonymous } = req.body;

    try {
        // Check if review exists and belongs to user
        const reviewResult = await db.query(
            'SELECT * FROM reviews WHERE id = $1 AND customer_id = $2',
            [id, req.user.id]
        );

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found or does not belong to you' });
        }

        const review = reviewResult.rows[0];

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Update review
        const result = await db.query(
            `UPDATE reviews 
             SET rating = COALESCE($1, rating),
                 comment = COALESCE($2, comment),
                 is_anonymous = COALESCE($3, is_anonymous),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [rating, comment, is_anonymous, id]
        );

        // Recalculate detailer's average rating
        await recalculateDetailerRating(review.detailer_id);

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if review exists and belongs to user
        const reviewResult = await db.query(
            'SELECT * FROM reviews WHERE id = $1 AND customer_id = $2',
            [id, req.user.id]
        );

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found or does not belong to you' });
        }

        const review = reviewResult.rows[0];

        // Delete review
        await db.query('DELETE FROM reviews WHERE id = $1', [id]);

        // Recalculate detailer's average rating
        await recalculateDetailerRating(review.detailer_id);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createReview,
    getDetailerReviews,
    getMyReviews,
    updateReview,
    deleteReview
};
