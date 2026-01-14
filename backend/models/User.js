const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// 🔒 PASSWORD VALIDATION FUNCTION (Feature #1)
const passwordValidator = (password) => {
    // Requires: 8+ chars, uppercase, lowercase, number, special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        password: {
            type: String,
            required: true,
            validate: {
                validator: function (password) {
                    // Skip validation if password is already hashed (starts with $2b$ for bcrypt)
                    if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
                        return true;
                    }
                    return passwordValidator(password);
                },
                message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)"
            }
        },
        role: {
            type: String,
            default: "normal"
        },
        profileImage: {
            type: String
        },
        // 🔒 PASSWORD REUSE PREVENTION (Feature #3)
        passwordHistory: {
            type: [String],
            default: [],
            select: false // Don't return in queries by default
        },
        // 🔒 PASSWORD EXPIRY TRACKING (Feature #4)
        passwordChangedAt: {
            type: Date

        },
        // 🔒 ACCOUNT LOCKOUT (Bonus Security Feature)
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        accountLockedUntil: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// 🔒 AUTO-HASH PASSWORD ON SAVE (Feature #2 - Enhanced)
UserSchema.pre('save', async function (next) {
    // Only hash if password is new or modified
    if (!this.isModified('password')) return next();

    try {
        // Use 12 rounds for stronger security
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

        // ✅ ONLY update passwordChangedAt if NOT a new user
        // (Don't set on registration, only on password changes)
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for safety
        }

        next();
    } catch (error) {
        next(error);
    }
});

// 🔒 METHOD: Check if password was changed after JWT issued
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// 🔒 METHOD: Check if account is locked
UserSchema.methods.isAccountLocked = function () {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

module.exports = mongoose.model("User", UserSchema);