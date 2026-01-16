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
        maxAge: 15 * 60 * 1000,
        path: '/'
    };

    res.cookie('token', token, cookieOptions);
};

// 🔒 Helper: Clear cookie (logout)
const clearTokenCookie = (res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        expires: new Date(0)
    });
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
const LOCK_TIME = 15 * 60 * 1000;
const PASSWORD_HISTORY_LIMIT = 5;

// ==========================================
// SEND RESET LINK
// ==========================================
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

// ==========================================
// RESET PASSWORD
// ==========================================
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

        // ✅ Pass plain password - will be hashed by pre-save hook
        user.password = password;
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

// ==========================================
// REGISTER USER (WITH ENCRYPTION)
// ==========================================
exports.registerUser = async (req, res) => {
    const { username, email, firstName, lastName, password, phoneNumber, address } = req.body;
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

        // ✅ FIXED: Pass plain password - will be hashed by pre-save hook
        // 🔐 Create user with encrypted fields
        const newUser = new User({
            username,
            email,
            firstName,
            lastName,
            password, // ✅ Plain password - pre-save hook will hash it
            profileImage,
            phoneNumber, // 🔐 Will be auto-encrypted by pre-save hook
            address // 🔐 Will be auto-encrypted by pre-save hook
        });

        await newUser.save(); // 🔐 Encryption + hashing happens automatically

        logSuccessfulLogin(email, req.ip);

        // 🔐 Return safe data (no sensitive info)
        const safeUserData = newUser.getSafeData();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: safeUserData
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

// ==========================================
// LOGIN USER
// ==========================================
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

        const token = generateToken(user._id, user.role, user.email);
        setTokenCookie(res, token);

        const { password: _, passwordHistory: __, ...userWithoutPassword } = user._doc;

        logSuccessfulLogin(email, req.ip);

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

// ==========================================
// LOGOUT USER
// ==========================================
exports.logoutUser = (req, res) => {
    clearTokenCookie(res);

    res.json({
        success: true,
        message: 'Logout successful'
    });
};

// ==========================================
// GET USER BY ID (WITH DECRYPTION)
// ==========================================
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -passwordHistory");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 🔐 Check if requester can see sensitive data
        const isOwnProfile = req.user && req.user._id.toString() === user._id.toString();
        const isAdmin = req.user && req.user.role === 'admin';

        let userData;

        if (isOwnProfile || isAdmin) {
            // 🔐 Return decrypted data for own profile or admin
            userData = user.getDecryptedData();
            console.log(`✅ Returning decrypted data to ${isAdmin ? 'admin' : 'user'}`);
        } else {
            // 🔐 Return safe data (no sensitive info) for other users
            userData = user.getSafeData();
            console.log(`⚠️ Returning safe data (no sensitive info)`);
        }

        return res.status(200).json({
            success: true,
            data: userData
        });
    } catch (err) {
        console.error("Get user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==========================================
// UPDATE USER (WITH ENCRYPTION)
// ==========================================
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

        // Handle profile image update
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

        // 🔐 Update encrypted fields (if provided)
        if (updateData.phoneNumber) {
            user.phoneNumber = updateData.phoneNumber;
        }

        if (updateData.address) {
            user.address = {
                street: updateData.address.street || user.address?.street,
                city: updateData.address.city || user.address?.city,
                state: updateData.address.state || user.address?.state,
                postalCode: updateData.address.postalCode || user.address?.postalCode,
                country: updateData.address.country || user.address?.country
            };
        }

        // Update other non-encrypted fields
        if (updateData.firstName) user.firstName = updateData.firstName;
        if (updateData.lastName) user.lastName = updateData.lastName;
        if (updateData.profileImage) user.profileImage = updateData.profileImage;

        await user.save(); // 🔐 Encryption happens automatically

        // 🔐 Return decrypted data
        const decryptedUser = user.getDecryptedData();

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: decryptedUser,
        });
    } catch (err) {
        console.error("Update user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
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

// ==========================================
// GET CURRENT USER PROFILE (DECRYPTED)
// ==========================================
exports.getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -passwordHistory");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 🔐 Return decrypted data
        const decryptedUser = user.getDecryptedData();

        return res.status(200).json({
            success: true,
            data: decryptedUser
        });
    } catch (err) {
        console.error("Get current user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};