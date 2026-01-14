const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// 🔒 IMPORT SECURITY LOGGER
const {
    logFailedLogin,
    logSuccessfulLogin,
    logAccountLockout,
    logPasswordChange,
    logSuspiciousActivity
} = require("../middlewares/securityLogger");

// 🔒 JWT and Cookie Configuration
const ACCESS_TOKEN_EXPIRY = '15m';

// 🔒 Helper: Generate JWT
const generateToken = (userId, role, email) => {
    return jwt.sign(
        { _id: userId, role, email },
        process.env.SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

// 🔒 Helper: Set HTTP-only cookie
const setTokenCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
        path: '/' // 🔒 CRITICAL: Ensure cookie works for all routes
    };

    console.log('🍪 Setting cookie with options:', cookieOptions);
    console.log('🔑 Token (first 50 chars):', token.substring(0, 50));

    res.cookie('token', token, cookieOptions);
};

// 🔒 Helper: Clear cookie (logout)
const clearTokenCookie = (res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        expires: new Date(0) // Expire immediately
    });
    console.log('🗑️ Cookie cleared');
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 🔒 CONSTANTS FOR SECURITY POLICIES
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const PASSWORD_HISTORY_LIMIT = 5;

// Send Reset Link
exports.sendResetLink = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "15m",
        });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

        const mailOptions = {
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
             <p>This link expires in 15 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Reset email sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        const user = await User.findById(decoded.id).select('+passwordHistory');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.passwordHistory && user.passwordHistory.length > 0) {
            const isReused = await Promise.all(
                user.passwordHistory.map(oldPassword =>
                    bcrypt.compare(password, oldPassword)
                )
            );

            if (isReused.includes(true)) {
                logPasswordChange(user.email, req.ip, false);
                return res.status(400).json({
                    success: false,
                    message: "Cannot reuse previous passwords. Please choose a different password."
                });
            }
        }

        if (!user.passwordHistory) {
            user.passwordHistory = [];
        }
        user.passwordHistory.unshift(user.password);
        user.passwordHistory = user.passwordHistory.slice(0, PASSWORD_HISTORY_LIMIT);

        const hashed = await bcrypt.hash(password, 12);
        user.password = hashed;
        user.passwordChangedAt = Date.now();

        await user.save();

        const newToken = generateToken(user._id, user.role, user.email);
        setTokenCookie(res, newToken);

        logPasswordChange(user.email, req.ip, true);

        res.status(200).json({
            success: true,
            message: "Password updated successfully. Please use your new credentials."
        });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
};

// Register User
exports.registerUser = async (req, res) => {
    const { username, email, firstName, lastName, password } = req.body;
    const profileImage = req.file ? req.file.path : null;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
        });
    }

    try {
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingUser) {
            logSuspiciousActivity(
                'Duplicate Registration Attempt',
                { email, username },
                req.ip
            );

            return res.status(400).json({
                success: false,
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            firstName,
            lastName,
            password: hashedPassword,
            profileImage
        });

        await newUser.save();

        logSuccessfulLogin(email, req.ip);

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {
        console.error("Registration Error:", err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 🔒 Login with HTTP-only Cookie
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 LOGIN ATTEMPT:', email);

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            logFailedLogin(email, req.ip, 'User not found');
            return res.status(403).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        if (user.isAccountLocked()) {
            const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);

            logSuspiciousActivity(
                'Login Attempt on Locked Account',
                { email, lockTimeRemaining },
                req.ip
            );

            return res.status(403).json({
                success: false,
                message: `Account locked due to multiple failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
                accountLocked: true,
                lockTimeRemaining
            });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            user.failedLoginAttempts += 1;

            if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.accountLockedUntil = Date.now() + LOCK_TIME;
                await user.save();

                logAccountLockout(email, req.ip, user.failedLoginAttempts);

                return res.status(403).json({
                    success: false,
                    message: `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed login attempts. Try again in 15 minutes.`,
                    accountLocked: true,
                    requiresCaptcha: true
                });
            }

            await user.save();

            logFailedLogin(email, req.ip, `Wrong password (${user.failedLoginAttempts}/${MAX_LOGIN_ATTEMPTS})`);

            return res.status(403).json({
                success: false,
                message: `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts} attempts remaining.`,
                attemptsRemaining: MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts,
                requiresCaptcha: user.failedLoginAttempts >= 3
            });
        }

        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            await user.save();
        }

        // 🔒 Generate token
        const token = generateToken(user._id, user.role, user.email);
        console.log('✅ Token generated successfully');

        // 🔒 Set HTTP-only cookie
        setTokenCookie(res, token);
        console.log('✅ Cookie set in response');

        const { password: _, passwordHistory: __, ...userWithoutPassword } = user._doc;

        logSuccessfulLogin(email, req.ip);

        console.log('✅ Sending response to client');

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: userWithoutPassword
        });

    } catch (err) {
        console.error("❌ Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Logout
exports.logoutUser = (req, res) => {
    clearTokenCookie(res);

    res.json({
        success: true,
        message: 'Logout successful'
    });
};

// Get user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -passwordHistory");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (req.file) {
            if (user.profileImage) {
                const oldImagePath = path.join(__dirname, "..", user.profileImage);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.warn("Failed to delete old profile image:", err.message);
                    }
                });
            }
            updateData.profileImage = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -passwordHistory");

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current and new password are required"
        });
    }

    try {
        const user = await User.findById(userId).select('+passwordHistory');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            logPasswordChange(user.email, req.ip, false);

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        if (user.passwordHistory && user.passwordHistory.length > 0) {
            const isReused = await Promise.all(
                user.passwordHistory.map(oldPassword =>
                    bcrypt.compare(newPassword, oldPassword)
                )
            );

            if (isReused.includes(true)) {
                logPasswordChange(user.email, req.ip, false);

                return res.status(400).json({
                    success: false,
                    message: `Cannot reuse any of your last ${PASSWORD_HISTORY_LIMIT} passwords`
                });
            }
        }

        if (!user.passwordHistory) {
            user.passwordHistory = [];
        }
        user.passwordHistory.unshift(user.password);
        user.passwordHistory = user.passwordHistory.slice(0, PASSWORD_HISTORY_LIMIT);

        user.password = newPassword;
        user.passwordChangedAt = Date.now();

        await user.save();

        const newToken = generateToken(user._id, user.role, user.email);
        setTokenCookie(res, newToken);

        logPasswordChange(user.email, req.ip, true);

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. All other sessions have been logged out."
        });

    } catch (err) {
        console.error("Change password error:", err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};