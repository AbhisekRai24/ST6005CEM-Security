

const crypto = require('crypto');

// ==========================================
// ENCRYPTION ALGORITHM CONFIGURATION
// ==========================================
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('❌ ENCRYPTION_KEY not found in environment variables');
    }
    const keyBuffer = Buffer.from(key, 'hex');

    if (keyBuffer.length !== 32) {
        throw new Error('❌ ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    return keyBuffer;
}

function encrypt(text) {
    if (!text || text.trim() === '') {
        return '';
    }
    try {
        const key = getEncryptionKey();

        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

        console.log(`🔒 Encrypted data (length: ${text.length} → ${result.length})`);

        return result;
    } catch (error) {
        console.error('❌ Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
}



function decrypt(encryptedData) {

    if (!encryptedData || encryptedData.trim() === '') {
        return '';
    }
    try {
        const key = getEncryptionKey();
        const parts = encryptedData.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);


        decipher.setAuthTag(authTag);
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

function isEncrypted(data) {
    if (!data || typeof data !== 'string') {
        return false;
    }
    const parts = data.split(':');
    if (parts.length !== 3) {
        return false;
    }
    const hexRegex = /^[0-9a-f]+$/i;
    return parts.every(part => hexRegex.test(part));
}


function generateKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('\n🔑 NEW ENCRYPTION KEY GENERATED:');
    console.log('   Add this to your .env file:');
    console.log(`   ENCRYPTION_KEY=${key}\n`);
    console.log('⚠️  IMPORTANT: Keep this key secret! Never commit to Git!\n');
    return key;
}


module.exports = {
    encrypt,
    decrypt,
    isEncrypted,
    generateKey
};