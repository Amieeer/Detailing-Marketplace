const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Helper to store refresh token
const storeRefreshToken = async (userId, token, userAgent) => {
    const hashedToken = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent) VALUES ($1, $2, $3, $4)',
        [userId, hashedToken, expiresAt, userAgent]
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        // Data is already validated by middleware. Destructure only allowed fields (White-list).
        const { email, password, role, phone_number, location_coordinates } = req.body;

        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        // Security: Use generic message or standard 400. 
        // However, for UX on registration, "User already exists" is often acceptable common practice unless strictly high-security.
        // We will keep it but ensure no extra info leaks.
        return res.status(400).json({ message: 'User already exists' });

        // Hash password with cost factor 12
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, role, phone_number) VALUES ($1, $2, $3, $4) RETURNING id, email, role, is_verified',
            [email, hashedPassword, role, phone_number]
        );

        const user = newUser.rows[0];

        // Create profile entry
        await db.query(
            'INSERT INTO profiles (user_id, rating, jobs_completed, location_coordinates) VALUES ($1, $2, $3, $4)',
            [user.id, 0, 0, location_coordinates ? JSON.stringify(location_coordinates) : null]
        );

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        await storeRefreshToken(user.id, refreshToken, req.headers['user-agent']);

        res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const accessToken = generateAccessToken(user.id, user.role);
            const refreshToken = generateRefreshToken(user.id);

            await storeRefreshToken(user.id, refreshToken, req.headers['user-agent']);

            res.json({
                id: user.id,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        const hashedToken = hashToken(refreshToken);
        const result = await db.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW()',
            [hashedToken]
        );

        const tokenData = result.rows[0];

        if (!tokenData) {
            // Potential reuse of revoked/invalid token? 
            // Check if token exists but is revoked (Token Reuse Detection)
            const revokedCheck = await db.query('SELECT * FROM refresh_tokens WHERE token_hash = $1', [hashedToken]);
            if (revokedCheck.rows.length > 0) {
                // TOKEN REUSE DETECTED: Revoke all tokens for this user
                await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1', [revokedCheck.rows[0].user_id]);
                console.warn({ event: 'refresh_token_reuse_detected', userId: revokedCheck.rows[0].user_id });
            }
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        // Token found and valid. Now rotate it.
        const userResult = await db.query('SELECT id, role FROM users WHERE id = $1', [tokenData.user_id]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        // Revoke the old token
        await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1', [tokenData.id]);

        // Issue new pair
        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = generateRefreshToken(user.id);

        await storeRefreshToken(user.id, newRefreshToken, req.headers['user-agent']);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout & revoke token
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        try {
            const hashedToken = hashToken(refreshToken);
            await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1', [hashedToken]);
        } catch (error) {
            console.error(error);
        }
    }

    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
