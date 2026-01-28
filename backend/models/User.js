// 🔐 USER MODEL WITH 2FA SUPPORT
// Location: backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { encrypt, decrypt, isEncrypted } = require("../utils/encryption");

// 🔒 PASSWORD VALIDATION FUNCTION
const passwordValidator = (password) => {
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

        // ==========================================
        // 🔐 TWO-FACTOR AUTHENTICATION FIELDS
        // ==========================================
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorTempSecret: {
            type: String,
            select: false // ✅ NEW: Temporary secret during setup
        },
        twoFactorSecret: {
            type: String,
            select: false // Permanent secret after verification
        },
        twoFactorBackupCodes: {
            type: [String],
            select: false
        },
        twoFactorEnabledAt: {
            type: Date
        },

        // ==========================================
        // 🔐 ENCRYPTED FIELDS
        // ==========================================
        phoneNumber: {
            type: String
        },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            postalCode: { type: String },
            country: { type: String }
        },

        // ==========================================
        // 🔒 SECURITY FIELDS
        // ==========================================
        passwordHistory: {
            type: [String],
            default: [],
            select: false
        },
        passwordChangedAt: {
            type: Date
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        accountLockedUntil: {
            type: Date
        },
        devices: [
            {
                ip: String,
                userAgent: String,
                firstSeen: Date,
                lastSeen: Date
            }
        ]
    },
    {
        timestamps: true
    }
);


UserSchema.pre('save', async function (next) {
    try {
        // Encrypt phone number
        if (this.phoneNumber && this.isModified('phoneNumber')) {
            if (!isEncrypted(this.phoneNumber)) {
                this.phoneNumber = encrypt(this.phoneNumber);
            }
        }

        // Encrypt address fields
        if (this.address) {
            if (this.address.street && this.isModified('address.street')) {
                if (!isEncrypted(this.address.street)) {
                    this.address.street = encrypt(this.address.street);
                }
            }
            if (this.address.city && this.isModified('address.city')) {
                if (!isEncrypted(this.address.city)) {
                    this.address.city = encrypt(this.address.city);
                }
            }
            if (this.address.state && this.isModified('address.state')) {
                if (!isEncrypted(this.address.state)) {
                    this.address.state = encrypt(this.address.state);
                }
            }
            if (this.address.postalCode && this.isModified('address.postalCode')) {
                if (!isEncrypted(this.address.postalCode)) {
                    this.address.postalCode = encrypt(this.address.postalCode);
                }
            }
        }

        next();
    } catch (error) {
        console.error('❌ Encryption error:', error.message);
        next(error);
    }
});

// ==========================================
// 🔒 PRE-SAVE HOOK: HASH PASSWORD
// ==========================================
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }

        next();
    } catch (error) {
        next(error);
    }
});



UserSchema.methods.getDecryptedData = function () {
    const user = this.toObject();

    try {
        if (user.phoneNumber && isEncrypted(user.phoneNumber)) {
            user.phoneNumber = decrypt(user.phoneNumber);
        }

        if (user.address) {
            if (user.address.street && isEncrypted(user.address.street)) {
                user.address.street = decrypt(user.address.street);
            }
            if (user.address.city && isEncrypted(user.address.city)) {
                user.address.city = decrypt(user.address.city);
            }
            if (user.address.state && isEncrypted(user.address.state)) {
                user.address.state = decrypt(user.address.state);
            }
            if (user.address.postalCode && isEncrypted(user.address.postalCode)) {
                user.address.postalCode = decrypt(user.address.postalCode);
            }
        }

        delete user.password;
        delete user.passwordHistory;
        delete user.twoFactorSecret; // 🔐 Don't expose 2FA secret
        delete user.twoFactorTempSecret; // 🔐 Don't expose temp secret
        delete user.twoFactorBackupCodes; // 🔐 Don't expose backup codes

        return user;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);
        throw new Error('Failed to decrypt user data');
    }
};

UserSchema.methods.getSafeData = function () {
    const user = this.toObject();

    delete user.password;
    delete user.passwordHistory;
    delete user.phoneNumber;
    delete user.address;
    delete user.failedLoginAttempts;
    delete user.accountLockedUntil;
    delete user.twoFactorSecret; // 🔐 Don't expose 2FA secret
    delete user.twoFactorTempSecret; // 🔐 Don't expose temp secret
    delete user.twoFactorBackupCodes; // 🔐 Don't expose backup codes

    return user;
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

UserSchema.methods.isAccountLocked = function () {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

module.exports = mongoose.model("User", UserSchema);