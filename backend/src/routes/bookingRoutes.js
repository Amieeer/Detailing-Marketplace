const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    createBookingSchema,
    bookingIdSchema,
    updateStatusSchema,
    declineBookingSchema,
    completeJobSchema,
    addPhotoSchema
} = require('../schemas/bookingSchemas');

// Customer routes
router.post('/', protect, validate(createBookingSchema), createBooking);
router.get('/', protect, getMyBookings);

// Detailer routes
router.get('/detailer', protect, getDetailerBookings);
router.patch('/:id/accept', protect, validate(bookingIdSchema), acceptBooking);
router.patch('/:id/decline', protect, validate(declineBookingSchema), declineBooking);
router.patch('/:id/start', protect, validate(bookingIdSchema), startJob);
router.patch('/:id/complete', protect, validate(completeJobSchema), completeJob);
router.post('/:id/photos', protect, validate(addPhotoSchema), addBookingPhoto);
router.get('/:id', protect, validate(bookingIdSchema), getBookingById);

// Generic status update (keep for backward compatibility)
router.put('/:id/status', protect, validate(updateStatusSchema), updateBookingStatus);

module.exports = router;
