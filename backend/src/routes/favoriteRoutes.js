const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/toggle', protect, favoriteController.toggleFavorite);
router.get('/', protect, favoriteController.getFavorites);
router.get('/check/:detailerId', protect, favoriteController.checkFavorite);

module.exports = router;
