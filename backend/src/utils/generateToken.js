const jwt = require('jsonwebtoken');

const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
};

const generateRefreshToken = (id) => {
    // Ideally use a different secret for refresh tokens
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

module.exports = { generateAccessToken, generateRefreshToken };
