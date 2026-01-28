

const User = require("../models/User");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


exports.setup2FA = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA is already enabled for this account"
            });
        }

        const secret = speakeasy.generateSecret({
            name: `RevModz (${user.email})`,
            issuer: 'RevModz'
        });

 
        user.twoFactorTempSecret = secret.base32;
        await user.save();

        console.log('✅ Temp secret saved to database');
        console.log('==================================================');

        qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
            if (err) {
                console.error("QR code generation error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to generate QR code"
                });
            }

            res.json({
                success: true,
                message: "Scan this QR code with Google Authenticator or Authy",
                data: {
                    qrCode: dataUrl,
                    manualEntryKey: secret.base32
                }
            });
        });

    } catch (err) {
        console.error("Setup 2FA error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// ==========================================
// 🔐 VERIFY & ENABLE 2FA
// ==========================================

exports.verifyAndEnable2FA = async (req, res) => {
    try {
        const userId = req.user._id;
        const { token } = req.body;

        console.log('='.repeat(50));
        console.log('🔍 VERIFY-ENABLE 2FA - DETAILED DEBUG');
        console.log('='.repeat(50));
        console.log('User ID:', userId);
        console.log('Token received:', token);
        console.log('Token type:', typeof token);
        console.log('Token length:', token?.length);

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "2FA token is required"
            });
        }

        // Get the TEMP secret
        const user = await User.findById(userId).select('+twoFactorTempSecret');

        console.log('User found:', !!user);
        console.log('User email:', user?.email);
        console.log('Has twoFactorTempSecret:', !!user?.twoFactorTempSecret);
        console.log('Temp secret value:', user?.twoFactorTempSecret);
        console.log('Temp secret length:', user?.twoFactorTempSecret?.length);

        if (!user || !user.twoFactorTempSecret) {
            console.log('❌ ERROR: Missing user or temp secret');
            return res.status(400).json({
                success: false,
                message: "2FA setup not initiated. Please start setup first."
            });
        }

        // Generate what the current valid token SHOULD be
        const currentValidToken = speakeasy.totp({
            secret: user.twoFactorTempSecret,
            encoding: 'base32'
        });

        console.log('Current valid token:', currentValidToken);
        console.log('Token you entered:', token);
        console.log('Do they match?', currentValidToken === token);
        console.log('Current time:', new Date().toISOString());

        // Try verification with window
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorTempSecret,
            encoding: 'base32',
            token: token,
            window: 6
        });

        console.log('Verification result:', verified);
        console.log('='.repeat(50));

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid 2FA code. Please try again."
            });
        }

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push(code);
        }

        const hashedBackupCodes = await Promise.all(
            backupCodes.map(code => bcrypt.hash(code, 10))
        );

        // Move temp secret to permanent, clear temp
        user.twoFactorSecret = user.twoFactorTempSecret;
        user.twoFactorTempSecret = undefined;
        user.twoFactorEnabled = true;
        user.twoFactorEnabledAt = Date.now();
        user.twoFactorBackupCodes = hashedBackupCodes;
        await user.save();

        console.log(`✅ 2FA enabled for user: ${user.email}`);

        res.json({
            success: true,
            message: "2FA enabled successfully! Save your backup codes securely.",
            data: {
                backupCodes: backupCodes
            }
        });

    } catch (err) {
        console.error("❌ Verify 2FA error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==========================================
// 🔐 VERIFY 2FA TOKEN (During Login)
// ==========================================
exports.verify2FAToken = async (req, res) => {
    try {
        const { userId, token, isBackupCode } = req.body;

        if (!userId || !token) {
            return res.status(400).json({
                success: false,
                message: "User ID and token are required"
            });
        }

        const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA not enabled for this account"
            });
        }

        let verified = false;

        // Check if it's a backup code
        if (isBackupCode) {
            if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No backup codes available"
                });
            }

            // Check each hashed backup code
            for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
                const isMatch = await bcrypt.compare(token, user.twoFactorBackupCodes[i]);
                if (isMatch) {
                    // Remove used backup code
                    user.twoFactorBackupCodes.splice(i, 1);
                    await user.save();
                    verified = true;
                    console.log(`✅ Backup code used for user: ${user.email}`);
                    break;
                }
            }

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid backup code"
                });
            }

        } else {
            // Verify TOTP token
            verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token,
                window: 2 // 60 seconds tolerance
            });

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid 2FA code"
                });
            }
        }

        // Reset failed login attempts on successful 2FA
        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            await user.save();
        }

        res.json({
            success: true,
            message: "2FA verification successful",
            data: {
                userId: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Verify 2FA token error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==========================================
// 🔐 DISABLE 2FA
// ==========================================
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password, token } = req.body;

        if (!password || !token) {
            return res.status(400).json({
                success: false,
                message: "Password and current 2FA token are required"
            });
        }

        const user = await User.findById(userId).select('+twoFactorSecret');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA is not enabled"
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Verify 2FA token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid 2FA code"
            });
        }

        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorBackupCodes = undefined;
        user.twoFactorEnabledAt = undefined;
        await user.save();

        console.log(`⚠️ 2FA disabled for user: ${user.email}`);

        res.json({
            success: true,
            message: "2FA has been disabled"
        });

    } catch (err) {
        console.error("Disable 2FA error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==========================================
// 🔐 GET 2FA STATUS
// ==========================================
exports.get2FAStatus = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('+twoFactorBackupCodes');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: {
                twoFactorEnabled: user.twoFactorEnabled || false,
                twoFactorEnabledAt: user.twoFactorEnabledAt || null,
                backupCodesRemaining: user.twoFactorBackupCodes?.length || 0
            }
        });

    } catch (err) {
        console.error("Get 2FA status error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==========================================
// 🔐 REGENERATE BACKUP CODES
// ==========================================
exports.regenerateBackupCodes = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password, token } = req.body;

        if (!password || !token) {
            return res.status(400).json({
                success: false,
                message: "Password and 2FA token are required"
            });
        }

        const user = await User.findById(userId).select('+twoFactorSecret');

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA not enabled"
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Verify 2FA token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid 2FA code"
            });
        }

        // Generate new backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push(code);
        }

        const hashedBackupCodes = await Promise.all(
            backupCodes.map(code => bcrypt.hash(code, 10))
        );

        user.twoFactorBackupCodes = hashedBackupCodes;
        await user.save();

        console.log(`🔄 Backup codes regenerated for user: ${user.email}`);

        res.json({
            success: true,
            message: "New backup codes generated",
            data: {
                backupCodes: backupCodes
            }
        });

    } catch (err) {
        console.error("Regenerate backup codes error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};