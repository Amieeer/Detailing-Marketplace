const express = require('express');
const router = express.Router();
const {
    getDetailerServices,
    getMyServices,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    createServiceSchema,
    updateServiceSchema,
    serviceIdSchema,
    detailerIdSchema
} = require('../schemas/serviceSchemas');

// Public routes
router.get('/detailer/:detailerId', validate(detailerIdSchema), getDetailerServices);

// Protected routes (detailer only)
router.get('/my-services', protect, getMyServices);
router.post('/', protect, validate(createServiceSchema), addService);
router.put('/:id', protect, validate(updateServiceSchema), updateService);
router.delete('/:id', protect, validate(serviceIdSchema), deleteService);
router.patch('/:id/toggle', protect, validate(serviceIdSchema), toggleServiceStatus);

module.exports = router;
