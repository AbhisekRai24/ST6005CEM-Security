// 🔐 DATA ENCRYPTION UTILITY (Step 5 - Encryption at Rest)
// Location: backend/utils/encryption.js

const crypto = require('crypto');

// ==========================================
// ENCRYPTION ALGORITHM CONFIGURATION
// ==========================================
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Initialization Vector length
const AUTH_TAG_LENGTH = 16; // Authentication tag length for GCM
const SALT_LENGTH = 32; // Salt for key derivation

/**
 * 🔑 Get encryption key from environment
 * CRITICAL: This key must be 32 bytes (64 hex characters)
 */
function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('❌ ENCRYPTION_KEY not found in environment variables');
    }

    // Convert hex string to Buffer
    const keyBuffer = Buffer.from(key, 'hex');

    if (keyBuffer.length !== 32) {
        throw new Error('❌ ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    return keyBuffer;
}

/**
 * 🔒 ENCRYPT FUNCTION
 * Encrypts plaintext data using AES-256-GCM
 * 
 * @param {string} text - The plaintext to encrypt
 * @returns {string} - Format: iv:authTag:encryptedData (all hex-encoded)
 * 
 * HOW IT WORKS:
 * 1. Generates random IV (Initialization Vector) - ensures same text encrypts differently
 * 2. Encrypts data using AES-256-GCM with the IV and secret key
 * 3. Generates authentication tag to detect tampering
 * 4. Returns: "IV:AuthTag:EncryptedData" (colon-separated, hex-encoded)
 * 
 * SECURITY NOTES:
 * - IV is random for each encryption (same plaintext = different ciphertext)
 * - GCM mode provides both confidentiality AND authenticity
 * - Authentication tag prevents attackers from modifying encrypted data
 */
function encrypt(text) {
    // Handle empty/null values
    if (!text || text.trim() === '') {
        return '';
    }

    try {
        const key = getEncryptionKey();

        // Generate random IV (MUST be unique for each encryption)
        const iv = crypto.randomBytes(IV_LENGTH);

        // Create cipher with AES-256-GCM
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt the plaintext
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag (proves data integrity)
        const authTag = cipher.getAuthTag();

        // Return format: iv:authTag:encryptedData
        // All three parts are needed for decryption
        const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

        console.log(`🔒 Encrypted data (length: ${text.length} → ${result.length})`);

        return result;
    } catch (error) {
        console.error('❌ Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * 🔓 DECRYPT FUNCTION
 * Decrypts data encrypted by the encrypt() function
 * 
 * @param {string} encryptedData - Format: iv:authTag:encryptedData
 * @returns {string} - The original plaintext
 * 
 * HOW IT WORKS:
 * 1. Splits encrypted string into IV, AuthTag, and EncryptedData
 * 2. Uses IV and key to create decipher
 * 3. Verifies authentication tag (throws error if data was tampered)
 * 4. Decrypts and returns original plaintext
 * 
 * SECURITY NOTES:
 * - Will FAIL if data was modified (auth tag check fails)
 * - Will FAIL if wrong encryption key is used
 * - This is INTENTIONAL - protects against tampering
 */
function decrypt(encryptedData) {
    // Handle empty/null values
    if (!encryptedData || encryptedData.trim() === '') {
        return '';
    }

    try {
        const key = getEncryptionKey();

        // Split the format: iv:authTag:encryptedData
        const parts = encryptedData.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        // Set authentication tag (will verify during decryption)
        decipher.setAuthTag(authTag);

        // Decrypt the data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        console.log(`🔓 Decrypted data successfully`);

        return decrypted;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);

        // Provide helpful error messages
        if (error.message.includes('Unsupported state')) {
            throw new Error('Decryption failed - data may be corrupted or tampered with');
        }

        if (error.message.includes('Invalid encrypted data format')) {
            throw new Error('Invalid encrypted data format');
        }

        throw new Error('Failed to decrypt data - incorrect key or corrupted data');
    }
}

/**
 * 🔍 CHECK IF DATA IS ENCRYPTED
 * Helper function to detect if a string is already encrypted
 * 
 * @param {string} data - The data to check
 * @returns {boolean} - True if data appears to be encrypted
 */
function isEncrypted(data) {
    if (!data || typeof data !== 'string') {
        return false;
    }

    // Encrypted data has format: hex:hex:hex (3 parts separated by colons)
    const parts = data.split(':');
    if (parts.length !== 3) {
        return false;
    }

    // Check if all parts are valid hex strings
    const hexRegex = /^[0-9a-f]+$/i;
    return parts.every(part => hexRegex.test(part));
}

/**
 * 📊 GENERATE NEW ENCRYPTION KEY (For setup/key rotation)
 * Run this ONCE to generate a new encryption key
 * 
 * Usage:
 *   node -e "console.log(require('./utils/encryption').generateKey())"
 * 
 * Copy output to .env as ENCRYPTION_KEY
 */
function generateKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('\n🔑 NEW ENCRYPTION KEY GENERATED:');
    console.log('   Add this to your .env file:');
    console.log(`   ENCRYPTION_KEY=${key}\n`);
    console.log('⚠️  IMPORTANT: Keep this key secret! Never commit to Git!\n');
    return key;
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
    encrypt,
    decrypt,
    isEncrypted,
    generateKey
};