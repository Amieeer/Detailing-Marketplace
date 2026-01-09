const { z } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors || [];
            const message = errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation Error';
            if (message === 'Validation Error') console.error('Full Zod Error:', JSON.stringify(error, null, 2));
            console.error('Validation Error:', message);
            return next(new AppError(message, 400));
        }
        next(error);
    }
};

module.exports = validate;
