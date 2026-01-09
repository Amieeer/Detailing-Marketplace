const db = require('../config/db');
const notificationService = require('../services/notificationService');

// Helper to get user push token
const getPushToken = async (userId) => {
    const result = await db.query('SELECT push_token FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.push_token;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const {
        detailer_id,
        service_id,
        scheduled_time,
        location_address,
        location_latitude,
        location_longitude
    } = req.body;

    try {
        // Security: Fetch price from database instead of trusting client
        const serviceResult = await db.query(
            'SELECT price, detailer_id FROM services WHERE id = $1',
            [service_id]
        );

        if (serviceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const service = serviceResult.rows[0];

        // Verify service belongs to detailer
        if (service.detailer_id !== detailer_id) {
            return res
                .status(400)
                .json({ message: 'Service does not belong to the specified detailer' });
        }

        const total_price = service.price;

        const result = await db.query(
            'INSERT INTO bookings (customer_id, detailer_id, service_id, scheduled_time, location_address, total_price, location_latitude, location_longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                req.user.id,
                detailer_id,
                service_id,
                scheduled_time,
                location_address,
                total_price,
                location_latitude,
                location_longitude
            ]
        );

        const booking = result.rows[0];

        // Notify Detailer
        const detailerToken = await getPushToken(detailer_id);
        if (detailerToken) {
            await notificationService.sendNotification(
                detailerToken,
                'New Booking Request',
                `You have a new booking request for $${total_price}`,
                { bookingId: booking.id, type: 'new_booking' }
            );
        }

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get my bookings
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        let query;
        if (req.user.role === 'detailer') {
            query =
                'SELECT b.*, s.name as service_name, u.email as customer_email FROM bookings b JOIN services s ON b.service_id = s.id JOIN users u ON b.customer_id = u.id WHERE b.detailer_id = $1 ORDER BY scheduled_time DESC';
        } else {
            query = `SELECT b.*, s.name as service_name, p.business_name as detailer_name,
                     EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id = b.id) as has_review
                     FROM bookings b 
                     JOIN services s ON b.service_id = s.id 
                     JOIN profiles p ON b.detailer_id = p.user_id 
                     WHERE b.customer_id = $1 
                     ORDER BY scheduled_time DESC`;
        }

        const result = await db.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Detailer only)
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const result = await db.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [
            status,
            id
        ]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get detailer bookings with optional status filter
// @route   GET /api/bookings/detailer
// @access  Private (Detailer only)
const getDetailerBookings = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                b.*,
                s.name as service_name,
                s.price,
                s.duration_minutes,
                u.email as customer_email,
                u.phone_number as customer_phone
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u ON b.customer_id = u.id
            WHERE b.detailer_id = $1
        `;

        const params = [req.user.id];

        if (status) {
            query += ' AND b.status = $2';
            params.push(status);
        }

        query += ' ORDER BY b.scheduled_time DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Accept booking
// @route   PATCH /api/bookings/:id/accept
// @access  Private (Detailer only)
const acceptBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (booking.rows[0].status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be accepted' });
        }

        const result = await db.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [
            'confirmed',
            id
        ]);

        // Notify Customer
        const customerToken = await getPushToken(booking.rows[0].customer_id);
        if (customerToken) {
            await notificationService.sendNotification(
                customerToken,
                'Booking Confirmed',
                'Your detailing appointment has been confirmed!',
                { bookingId: id, type: 'booking_confirmed' }
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Decline booking
// @route   PATCH /api/bookings/:id/decline
// @access  Private (Detailer only)
const declineBooking = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const result = await db.query(
            'UPDATE bookings SET status = $1, declined_reason = $2 WHERE id = $3 RETURNING *',
            ['cancelled', reason || 'Declined by detailer', id]
        );

        // Notify Customer
        const customerToken = await getPushToken(booking.rows[0].customer_id);
        if (customerToken) {
            await notificationService.sendNotification(
                customerToken,
                'Booking Declined',
                `Your booking was declined: ${reason || 'Unavailable'}`,
                { bookingId: id, type: 'booking_declined' }
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Start job
// @route   PATCH /api/bookings/:id/start
// @access  Private (Detailer only)
const startJob = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (booking.rows[0].status !== 'confirmed') {
            return res.status(400).json({ message: 'Only confirmed bookings can be started' });
        }

        const result = await db.query(
            'UPDATE bookings SET status = $1, started_at = NOW() WHERE id = $2 RETURNING *',
            ['in_progress', id]
        );

        // Notify Customer
        const customerToken = await getPushToken(booking.rows[0].customer_id);
        if (customerToken) {
            await notificationService.sendNotification(
                customerToken,
                'Detailer Started',
                'Your detailer has started working on your car!',
                { bookingId: id, type: 'job_started' }
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Complete job
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Detailer only)
const completeJob = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (booking.rows[0].status !== 'in_progress') {
            return res.status(400).json({ message: 'Only in-progress bookings can be completed' });
        }

        const result = await db.query(
            'UPDATE bookings SET status = $1, completed_at = NOW(), notes = $2 WHERE id = $3 RETURNING *',
            ['completed', notes, id]
        );

        // Update detailer's jobs_completed count
        await db.query(
            'UPDATE profiles SET jobs_completed = jobs_completed + 1 WHERE user_id = $1',
            [req.user.id]
        );

        // Notify Customer
        const customerToken = await getPushToken(booking.rows[0].customer_id);
        if (customerToken) {
            await notificationService.sendNotification(
                customerToken,
                'Job Completed',
                'Your car is ready! Please rate your detailer.',
                { bookingId: id, type: 'job_completed' }
            );
        }

        const { status } = req.query;

        let query = `
            SELECT 
                b.*,
                s.name as service_name,
                s.price,
                s.duration_minutes,
                u.email as customer_email,
                u.phone_number as customer_phone
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u ON b.customer_id = u.id
            WHERE b.detailer_id = $1
        `;

        const params = [req.user.id];

        if (status) {
            query += ' AND b.status = $2';
            params.push(status);
        }

        query += ' ORDER BY b.scheduled_time DESC';

        const bookingsResult = await db.query(query, params);
        res.json(bookingsResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add photo to booking
// @route   POST /api/bookings/:id/photos
// @access  Private (Detailer only)
const addBookingPhoto = async (req, res) => {
    const { id } = req.params;
    const { type, url } = req.body; // type: 'before' or 'after'

    if (!['before', 'after'].includes(type)) {
        return res.status(400).json({ message: 'Invalid photo type' });
    }

    try {
        const booking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.rows[0].detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const column = type === 'before' ? 'before_photos' : 'after_photos';

        const result = await db.query(
            `UPDATE bookings SET ${column} = array_append(${column}, $1) WHERE id = $2 RETURNING *`,
            [url, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                b.*,
                s.name as service_name,
                s.price,
                s.duration_minutes,
                u.email as customer_email,
                u.phone_number as customer_phone,
                p.business_name as detailer_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u ON b.customer_id = u.id
            JOIN profiles p ON b.detailer_id = p.user_id
            WHERE b.id = $1
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = result.rows[0];

        // Access check
        if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (req.user.role === 'detailer' && booking.detailer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    getDetailerBookings,
    acceptBooking,
    declineBooking,
    startJob,
    completeJob,
    addBookingPhoto,
    getBookingById
};
