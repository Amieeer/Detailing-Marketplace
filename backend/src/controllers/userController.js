const db = require('../config/db');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, email, role, phone_number, is_verified, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        let profile = {};
        // Always fetch profile if it exists
        const profileResult = await db.query('SELECT * FROM profiles WHERE user_id = $1', [
            req.user.id
        ]);
        profile = profileResult.rows[0] || {};

        res.json({ ...user.rows[0], profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all detailers (scalable location-based fetch)
// @route   GET /api/users/detailers?latitude=X&longitude=Y&radius=Z
// @access  Public
const getDetailers = async (req, res) => {
    try {
        const { latitude, longitude, radius = 50 } = req.query;
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        let query;
        let params = [];

        if (lat && lon) {
            // SQL Haversine Formula (Distance in km)
            // We extract lat/lng from the JSONB column 'location_coordinates'
            query = `
                SELECT 
                    u.id, 
                    u.email, 
                    p.business_name, 
                    p.bio, 
                    p.rating, 
                    p.jobs_completed, 
                    p.profile_picture_url,
                    p.cover_image,
                    p.is_verified_pro,
                    (p.location_coordinates->>'lat')::float as latitude,
                    (p.location_coordinates->>'lng')::float as longitude,
                    (
                        6371 * acos(
                            cos(radians($1)) * 
                            cos(radians((p.location_coordinates->>'lat')::float)) * 
                            cos(radians((p.location_coordinates->>'lng')::float) - radians($2)) + 
                            sin(radians($1)) * 
                            sin(radians((p.location_coordinates->>'lat')::float))
                        )
                    ) AS distance
                FROM users u 
                JOIN profiles p ON u.id = p.user_id 
                WHERE u.role = 'detailer'
                AND (p.location_coordinates->>'lat') IS NOT NULL
                AND (
                    6371 * acos(
                        cos(radians($1)) * 
                        cos(radians((p.location_coordinates->>'lat')::float)) * 
                        cos(radians((p.location_coordinates->>'lng')::float) - radians($2)) + 
                        sin(radians($1)) * 
                        sin(radians((p.location_coordinates->>'lat')::float))
                    )
                ) < $3
                ORDER BY distance ASC
            `;
            params = [lat, lon, radius];
        } else {
            // Fallback if no location provided (return all, limited)
            query = `
                SELECT 
                    u.id, 
                    u.email, 
                    p.business_name, 
                    p.bio, 
                    p.rating, 
                    p.jobs_completed, 
                    p.profile_picture_url,
                    p.cover_image,
                    p.is_verified_pro,
                    (p.location_coordinates->>'lat')::float as latitude,
                    (p.location_coordinates->>'lng')::float as longitude
                FROM users u 
                JOIN profiles p ON u.id = p.user_id 
                WHERE u.role = 'detailer'
                LIMIT 50
            `;
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get specific detailer by ID
// @route   GET /api/users/detailers/:id
// @access  Public
const getDetailerById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            SELECT 
                u.id, 
                u.email, 
                u.phone_number,
                u.cover_image,
                p.business_name, 
                p.bio, 
                p.rating, 
                p.jobs_completed, 
                p.service_radius_km,
                p.location_coordinates,
                p.profile_picture_url
            FROM users u 
            JOIN profiles p ON u.id = p.user_id 
            WHERE u.id = $1 AND u.role = 'detailer'
        `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Detailer not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update detailer profile
// @route   PUT /api/users/profile
// @access  Private (Detailer only)
const updateProfile = async (req, res) => {
    // SECURITY: Explicit destructuring for mass assignment protection
    // is_verified_pro and rating are EXCLUDED
    const {
        business_name,
        bio,
        phone_number,
        service_radius_km,
        location_coordinates,
        profile_picture_url,
        cover_image
    } = req.body;

    try {
        // Update user table (phone number only, cover_image moved to profiles)
        if (phone_number) {
            await db.query(
                `UPDATE users 
                 SET phone_number = COALESCE($1, phone_number)
                 WHERE id = $2`,
                [phone_number, req.user.id]
            );
        }

        // Update profiles table
        // Check if profile exists
        const profileCheck = await db.query('SELECT * FROM profiles WHERE user_id = $1', [
            req.user.id
        ]);

        let result;
        if (profileCheck.rows.length === 0) {
            // Create profile if it doesn't exist
            result = await db.query(
                `INSERT INTO profiles (user_id, business_name, bio, service_radius_km, location_coordinates, profile_picture_url, cover_image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [
                    req.user.id,
                    business_name,
                    bio,
                    service_radius_km || 20,
                    location_coordinates,
                    profile_picture_url,
                    cover_image
                ]
            );
        } else {
            // Update existing profile
            result = await db.query(
                `UPDATE profiles 
                 SET business_name = COALESCE($1, business_name),
                     bio = COALESCE($2, bio),
                     service_radius_km = COALESCE($3, service_radius_km),
                     location_coordinates = COALESCE($4, location_coordinates),
                     profile_picture_url = COALESCE($5, profile_picture_url),
                     cover_image = COALESCE($6, cover_image)
                 WHERE user_id = $7 
                 RETURNING *`,
                [
                    business_name,
                    bio,
                    service_radius_km,
                    location_coordinates,
                    profile_picture_url,
                    cover_image,
                    req.user.id
                ]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user push token
// @route   PUT /api/users/push-token
// @access  Private
const updatePushToken = async (req, res) => {
    const { push_token } = req.body;

    try {
        await db.query('UPDATE users SET push_token = $1 WHERE id = $2', [push_token, req.user.id]);
        res.json({ message: 'Push token updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMe, getDetailers, getDetailerById, updateProfile, updatePushToken };
