const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // PostgreSQL specific error handling
        if (err.code === '23505') {
            // Unique constraint violation
            const message = `Duplicate field value: ${err.detail}. Please use another value!`;
            error = new AppError(message, 400);
        }
        if (err.code === '23503') {
            // Foreign key violation
            const message = `Invalid reference ID. Resource not found.`;
            error = new AppError(message, 400);
        }
        if (err.code === '22P02') {
            // Invalid input syntax (e.g. UUID)
            const message = `Invalid input data type.`;
            error = new AppError(message, 400);
        }

        sendErrorProd(error, res);
    }
};

const sendErrorDev = (err, res) => {
    console.error('ERROR 💥', err);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = errorHandler;
