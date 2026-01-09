const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Handle Stripe Webhooks
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify the event came from Stripe
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);
            await handlePaymentSuccess(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const paymentFailed = event.data.object;
            console.log('PaymentIntent failed!', paymentFailed.id);
            await handlePaymentFailure(paymentFailed);
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
};

const handlePaymentSuccess = async (paymentIntent) => {
    try {
        // Update payment record
        await db.query(
            `UPDATE payments 
             SET status = 'succeeded', updated_at = NOW() 
             WHERE stripe_payment_intent_id = $1`,
            [paymentIntent.id]
        );

        // Get booking ID from metadata
        const bookingId = paymentIntent.metadata.booking_id;

        if (bookingId) {
            // Update booking status to confirmed
            await db.query(
                `UPDATE bookings 
                 SET status = 'confirmed', updated_at = NOW() 
                 WHERE id = $1`,
                [bookingId]
            );
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
};

const handlePaymentFailure = async (paymentIntent) => {
    try {
        await db.query(
            `UPDATE payments 
             SET status = 'failed', updated_at = NOW() 
             WHERE stripe_payment_intent_id = $1`,
            [paymentIntent.id]
        );
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
};

module.exports = { handleWebhook };
