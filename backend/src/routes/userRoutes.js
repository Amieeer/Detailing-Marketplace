const express = require('express');
const router = express.Router();
const {
    getMe,
    getDetailers,
    getDetailerById,
    updateProfile,
    updatePushToken
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    updateProfileSchema,
    detailerIdSchema,
    updatePushTokenSchema
} = require('../schemas/userSchemas');

router.get('/me', protect, getMe);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/push-token', protect, validate(updatePushTokenSchema), updatePushToken);
router.get('/detailers/:id', validate(detailerIdSchema), getDetailerById); // Specific route first
router.get('/detailers', getDetailers); // General route second

module.exports = router;
