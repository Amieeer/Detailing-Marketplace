const express = require('express');
const router = express.Router();
const {
    createReview,
    getDetailerReviews,
    getMyReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Customer routes (protected)
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Public routes
router.get('/detailer/:detailerId', getDetailerReviews);

module.exports = router;
