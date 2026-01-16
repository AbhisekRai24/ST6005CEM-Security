// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const { encrypt, decrypt, isEncrypted } = require("../utils/encryption");


// // 🔒 PASSWORD VALIDATION FUNCTION (Feature #1)
// const passwordValidator = (password) => {
//     // Requires: 8+ chars, uppercase, lowercase, number, special char
//     return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
// };

// const UserSchema = new mongoose.Schema(
//     {
//         username: {
//             type: String,
//             required: true,
//             unique: true
//         },
//         email: {
//             type: String,
//             required: true,
//             unique: true
//         },
//         firstName: {
//             type: String
//         },
//         lastName: {
//             type: String
//         },
//         password: {
//             type: String,
//             required: true,
//             validate: {
//                 validator: function (password) {
//                     // Skip validation if password is already hashed (starts with $2b$ for bcrypt)
//                     if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
//                         return true;
//                     }
//                     return passwordValidator(password);
//                 },
//                 message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)"
//             }
//         },
//         role: {
//             type: String,
//             default: "normal"
//         },
//         profileImage: {
//             type: String
//         },
//         // 🔒 PASSWORD REUSE PREVENTION (Feature #3)
//         passwordHistory: {
//             type: [String],
//             default: [],
//             select: false // Don't return in queries by default
//         },
//         // 🔒 PASSWORD EXPIRY TRACKING (Feature #4)
//         passwordChangedAt: {
//             type: Date

//         },
//         // 🔒 ACCOUNT LOCKOUT (Bonus Security Feature)
//         failedLoginAttempts: {
//             type: Number,
//             default: 0
//         },
//         accountLockedUntil: {
//             type: Date
//         }
//     },
//     {
//         timestamps: true
//     }
// );

// // 🔒 AUTO-HASH PASSWORD ON SAVE (Feature #2 - Enhanced)
// UserSchema.pre('save', async function (next) {
//     // Only hash if password is new or modified
//     if (!this.isModified('password')) return next();

//     try {
//         // Use 12 rounds for stronger security
//         const salt = await bcrypt.genSalt(12);
//         this.password = await bcrypt.hash(this.password, salt);

//         // ✅ ONLY update passwordChangedAt if NOT a new user
//         // (Don't set on registration, only on password changes)
//         if (!this.isNew) {
//             this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for safety
//         }

//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // 🔒 METHOD: Check if password was changed after JWT issued
// UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//     if (this.passwordChangedAt) {
//         const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//         return JWTTimestamp < changedTimestamp;
//     }
//     return false;
// };

// // 🔒 METHOD: Check if account is locked
// UserSchema.methods.isAccountLocked = function () {
//     return this.accountLockedUntil && this.accountLockedUntil > Date.now();
// };

// module.exports = mongoose.model("User", UserSchema);


// 🔐 USER MODEL WITH ENCRYPTION (Step 5 - Data Encryption)
// Location: backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { encrypt, decrypt, isEncrypted } = require("../utils/encryption");

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
            // ❌ NOT ENCRYPTED - Needed for login and queries
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
            // ❌ NOT ENCRYPTED - HASHED with bcrypt (one-way function)
        },
        role: {
            type: String,
            default: "normal"
        },
        profileImage: {
            type: String
        },

        // ==========================================
        // 🔐 ENCRYPTED FIELDS (New - Step 5)
        // ==========================================
        // These fields are encrypted at rest in MongoDB
        // Format in DB: "iv:authTag:encryptedData"
        // ==========================================

        phoneNumber: {
            type: String,
            // 🔐 ENCRYPTED - Sensitive personal information
            // Stored as: "a3f2b4c1d5e6f7a8:9b0c1d2e3f4a5b6c:7d8e9f0a1b2c3d4e"
        },

        address: {
            street: {
                type: String,
                // 🔐 ENCRYPTED - Shipping address
            },
            city: {
                type: String,
                // 🔐 ENCRYPTED - Shipping address
            },
            state: {
                type: String,
                // 🔐 ENCRYPTED - Shipping address
            },
            postalCode: {
                type: String,
                // 🔐 ENCRYPTED - Shipping address
            },
            country: {
                type: String,
                // ℹ️ NOT ENCRYPTED - Used for shipping logic/analytics
            }
        },

        // ==========================================
        // 🔒 SECURITY FIELDS (Existing)
        // ==========================================

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

// ==========================================
// 🔐 PRE-SAVE HOOK: ENCRYPT SENSITIVE FIELDS
// ==========================================
// This runs BEFORE saving user to database
// Automatically encrypts sensitive fields
// ==========================================
UserSchema.pre('save', async function (next) {
    try {
        // 🔐 ENCRYPT PHONE NUMBER (if present and modified)
        if (this.phoneNumber && this.isModified('phoneNumber')) {
            // Only encrypt if not already encrypted
            if (!isEncrypted(this.phoneNumber)) {
                console.log(`🔒 Encrypting phone number for user: ${this.email}`);
                this.phoneNumber = encrypt(this.phoneNumber);
            }
        }

        // 🔐 ENCRYPT ADDRESS FIELDS (if present and modified)
        if (this.address) {
            // Encrypt street
            if (this.address.street && this.isModified('address.street')) {
                if (!isEncrypted(this.address.street)) {
                    console.log(`🔒 Encrypting street for user: ${this.email}`);
                    this.address.street = encrypt(this.address.street);
                }
            }

            // Encrypt city
            if (this.address.city && this.isModified('address.city')) {
                if (!isEncrypted(this.address.city)) {
                    console.log(`🔒 Encrypting city for user: ${this.email}`);
                    this.address.city = encrypt(this.address.city);
                }
            }

            // Encrypt state
            if (this.address.state && this.isModified('address.state')) {
                if (!isEncrypted(this.address.state)) {
                    console.log(`🔒 Encrypting state for user: ${this.email}`);
                    this.address.state = encrypt(this.address.state);
                }
            }

            // Encrypt postal code
            if (this.address.postalCode && this.isModified('address.postalCode')) {
                if (!isEncrypted(this.address.postalCode)) {
                    console.log(`🔒 Encrypting postal code for user: ${this.email}`);
                    this.address.postalCode = encrypt(this.address.postalCode);
                }
            }

            // ℹ️ Country is NOT encrypted (used for shipping logic)
        }

        next();
    } catch (error) {
        console.error('❌ Encryption error in pre-save hook:', error.message);
        next(error);
    }
});

// ==========================================
// 🔒 PRE-SAVE HOOK: HASH PASSWORD
// ==========================================
// This runs AFTER encryption hook
// ==========================================
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

// ==========================================
// 🔐 INSTANCE METHOD: GET DECRYPTED USER DATA
// ==========================================
// Use this when you need to return user data to authorized users
// (e.g., user profile, admin viewing user details)
// ==========================================
UserSchema.methods.getDecryptedData = function () {
    const user = this.toObject();

    try {
        // 🔓 Decrypt phone number
        if (user.phoneNumber && isEncrypted(user.phoneNumber)) {
            user.phoneNumber = decrypt(user.phoneNumber);
        }

        // 🔓 Decrypt address fields
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

        // ❌ Remove sensitive fields from output
        delete user.password;
        delete user.passwordHistory;

        console.log(`✅ Decrypted data for user: ${user.email}`);

        return user;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);
        throw new Error('Failed to decrypt user data');
    }
};

// ==========================================
// 🔐 INSTANCE METHOD: GET SAFE USER DATA
// ==========================================
// Use this for public API responses where sensitive data should NOT be shown
// (e.g., user list, search results, public profile)
// ==========================================
UserSchema.methods.getSafeData = function () {
    const user = this.toObject();

    // ❌ Remove ALL sensitive fields (don't decrypt, just remove)
    delete user.password;
    delete user.passwordHistory;
    delete user.phoneNumber; // Don't show encrypted version either
    delete user.address; // Don't show encrypted version either
    delete user.failedLoginAttempts;
    delete user.accountLockedUntil;

    return user;
};

// ==========================================
// 🔒 EXISTING METHODS (Unchanged)
// ==========================================

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