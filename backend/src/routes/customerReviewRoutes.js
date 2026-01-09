const express = require('express');
const router = express.Router();
const {
    createCustomerReview,
    getCustomerReviews,
    getCustomerRating
} = require('../controllers/customerReviewController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (detailer only)
router.post('/', protect, createCustomerReview);
router.get('/customer/:customerId', protect, getCustomerReviews);

// Public route
router.get('/customer/:customerId/rating', getCustomerRating);

module.exports = router;
