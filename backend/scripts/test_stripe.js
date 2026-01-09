require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
    console.log('Testing Stripe Connection...');
    console.log('Key prefix:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'UNDEFINED');

    try {
        const balance = await stripe.balance.retrieve();
        console.log('Start Success! Balance:', balance);
    } catch (error) {
        console.error('Stripe Error:', error.message);
    }
}

testStripe();
