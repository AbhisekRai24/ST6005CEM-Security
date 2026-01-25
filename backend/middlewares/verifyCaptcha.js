const axios = require('axios');
const User = require('../models/User');

const verifyCaptcha = async (req, res, next) => {
    const { captchaToken, email } = req.body;

    try {
        // Check if user exists and has 3+ failed attempts
        const user = await User.findOne({ email });
        
        let requiresCaptcha = false;
        
        if (user && user.failedLoginAttempts >= 3) {
            requiresCaptcha = true;
        }

        // Skip CAPTCHA verification if not required
        if (!requiresCaptcha) {
            return next();
        }

        // CAPTCHA is required but not provided
        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: "CAPTCHA verification required",
                requiresCaptcha: true,
                attemptsRemaining: user ? (5 - user.failedLoginAttempts) : null
            });
        }

        // Verify CAPTCHA with Cloudflare
        const response = await axios.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: captchaToken,
                remoteip: req.ip
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.data.success) {
            return res.status(400).json({
                success: false,
                message: "CAPTCHA verification failed. Please try again.",
                requiresCaptcha: true
            });
        }

        // CAPTCHA verified successfully, proceed to login
        next();

    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        return res.status(500).json({
            success: false,
            message: "CAPTCHA verification error"
        });
    }
};

module.exports = verifyCaptcha;