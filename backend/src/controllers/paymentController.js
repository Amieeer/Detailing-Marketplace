const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    const { bookingId } = req.body;

    try {
        // 1. Get Booking Info
        const bookingResult = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        const booking = bookingResult.rows[0];

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // 2. Get Detailer's Stripe Account ID
        const detailerResult = await db.query(
            'SELECT stripe_account_id FROM profiles WHERE user_id = $1',
            [booking.detailer_id]
        );
        const detailerStripeId = detailerResult.rows[0]?.stripe_account_id;

        // NOTE: For now, if detailer has no Stripe ID, we just collect to platform (fallback)
        // In production, you MUST ensure detailer is onboarded before allowing booking.

        const amountInCents = Math.round(booking.total_price * 100);
        const applicationFee = Math.round(amountInCents * 0.1); // 10% Platform Fee

        const paymentIntentParams = {
            amount: amountInCents,
            currency: 'usd',
            metadata: { booking_id: booking.id },
            automatic_payment_methods: { enabled: true }
        };

        // If detailer is connected, split the payment
        if (detailerStripeId) {
            paymentIntentParams.application_fee_amount = applicationFee;
            paymentIntentParams.transfer_data = {
                destination: detailerStripeId
            };
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

        // 3. Save Payment Record (Pending)
        await db.query(
            'INSERT INTO payments (booking_id, stripe_payment_intent_id, amount, platform_fee, detailer_payout, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [
                booking.id,
                paymentIntent.id,
                booking.total_price,
                booking.total_price * 0.1, // stored as decimal
                booking.total_price * 0.9,
                'pending'
            ]
        );

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payment error', error: error.message });
    }
};

// @desc    Create Stripe Express Account for Detailer
// @route   POST /api/payments/create-account
// @access  Private (Detailer)
const createAccount = async (req, res) => {
    try {
        const user = req.user; // From authMiddleware

        // Check if user already has a stripe account
        const profileResult = await db.query('SELECT stripe_account_id FROM profiles WHERE user_id = $1', [user.id]);
        if (profileResult.rows[0]?.stripe_account_id) {
            return res.json({ accountId: profileResult.rows[0].stripe_account_id });
        }

        const account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        // Save account ID to profile
        await db.query('UPDATE profiles SET stripe_account_id = $1 WHERE user_id = $2', [account.id, user.id]);

        res.json({ accountId: account.id });
    } catch (error) {
        console.error('Error creating Stripe account:', error);
        res.status(500).json({ message: 'Could not create Stripe account', details: error.message });
    }
};

// @desc    Create Account Link for Onboarding
// @route   POST /api/payments/create-account-link
// @access  Private (Detailer)
const createAccountLink = async (req, res) => {
    try {
        const user = req.user;
        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({ message: 'Account ID is required' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: 'midnightplasma://stripe-redirect?status=refresh',
            return_url: 'midnightplasma://stripe-redirect?status=success',
            type: 'account_onboarding',
        });

        res.json({ url: accountLink.url });
    } catch (error) {
        console.error('Error creating account link:', error);
        res.status(500).json({ message: 'Could not create account link' });
    }
};

// @desc    Handle Onboarding Return
// @route   GET /api/payments/onboarding-return
// @access  Public
const handleOnboardingReturn = (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Onboarding Complete</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; color: #fff; text-align: center; }
                    .container { padding: 20px; }
                    h1 { color: #00e5ff; }
                    p { color: #b0bec5; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Setup Complete!</h1>
                    <p>Your payout account has been connected.</p>
                    <p>You can now return to the Midnight Detail app.</p>
                </div>
            </body>
        </html>
    `);
};

// @desc    Handle Onboarding Refresh
// @route   GET /api/payments/onboarding-refresh
// @access  Public
const handleOnboardingRefresh = (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Onboarding Incomplete</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; color: #fff; text-align: center; }
                    .container { padding: 20px; }
                    h1 { color: #ff5252; }
                    p { color: #b0bec5; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Setup Incomplete</h1>
                    <p>It looks like you didn't finish setting up your account.</p>
                    <p>Please return to the app and try again.</p>
                </div>
            </body>
        </html>
    `);
};

module.exports = { createPaymentIntent, createAccount, createAccountLink, handleOnboardingReturn, handleOnboardingRefresh };
