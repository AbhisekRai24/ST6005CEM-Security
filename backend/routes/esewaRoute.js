const express = require('express');
const router = express.Router();

// POST /api/esewa/create-payment
router.post('/create-payment', (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    // Use your personal eSewa wallet ID as payment ID (pid)
    const pid = '9702027256'; // <-- Replace with your actual eSewa wallet ID

    // eSewa payment parameters
    const psc = 0;   // product service charge (optional)
    const pdc = 0;   // product delivery charge (optional)
    const txAmt = 0; // tax amount (optional)
    const tAmt = amount; // total amount to pay

    // URLs where eSewa redirects after payment success or failure
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5050';

    const su = `${BASE_URL}/api/esewa/success?pid=${pid}&amt=${tAmt}`;
    const fu = `${BASE_URL}/api/esewa/failure?pid=${pid}`;

    // Construct eSewa payment URL
    const esewaUrl = `https://esewa.com.np/mobileApp/?amt=${tAmt}&psc=${psc}&pdc=${pdc}&txAmt=${txAmt}&tAmt=${tAmt}&pid=${pid}&su=${encodeURIComponent(su)}&fu=${encodeURIComponent(fu)}`;

    // Send back the payment URL to frontend
    res.json({ url: esewaUrl });
});

// GET /api/esewa/success
router.get('/success', (req, res) => {
    // Since this is demo with personal wallet, skip actual verification
    res.send('Payment successful (demo mode). Thank you for your payment!');
});

// GET /api/esewa/failure
router.get('/failure', (req, res) => {
    res.send('Payment failed or cancelled (demo mode). Please try again.');
});

module.exports = router;
