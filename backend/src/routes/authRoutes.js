const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, refreshAccessToken, logoutUser } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../schemas/authSchemas');

// Strict rate limit for refresh token to prevent abuse
const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 refresh requests per 15 minutes
    message: {
        message: 'Too many refresh attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', refreshLimiter, refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;
