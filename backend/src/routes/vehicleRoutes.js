const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, vehicleController.getMyVehicles);
router.post('/', protect, vehicleController.addVehicle);
router.delete('/:id', protect, vehicleController.deleteVehicle);

module.exports = router;
