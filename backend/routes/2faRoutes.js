

const express = require("express");
const router = express.Router();


const {
    twoFASetupLimiter,
    twoFAVerificationLimiter,
    createStrictRateLimiter
} = require("../middlewares/rateLimiter");
const { authenticateUser } = require("../middlewares/authorizedUsers");
const {
    setup2FA,
    verify2FAToken,
    verifyAndEnable2FA,
    disable2FA,
    get2FAStatus } = require("../controllers/2faController");


// Use specific limiters
router.post("/setup", authenticateUser, twoFASetupLimiter, setup2FA);
router.post("/verify-login", twoFAVerificationLimiter, verify2FAToken);

// Or use the flexible one
const twoFALimiter = createStrictRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many 2FA attempts"
});

router.post("/verify-enable", authenticateUser, twoFALimiter, verifyAndEnable2FA);
router.post("/disable", authenticateUser, twoFALimiter, disable2FA);
router.get("/status", authenticateUser, get2FAStatus);
module.exports = router;