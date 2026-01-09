const express = require('express');
const router = express.Router();
const { createPaymentIntent, createAccount, createAccountLink, handleOnboardingReturn, handleOnboardingRefresh } = require('../controllers/paymentController');
const { handleWebhook } = require('../controllers/webhookController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/create-account', protect, createAccount);
router.post('/create-account-link', protect, createAccountLink);
router.get('/onboarding-return', handleOnboardingReturn);
router.get('/onboarding-refresh', handleOnboardingRefresh);
router.post('/webhook', handleWebhook);

module.exports = router;
