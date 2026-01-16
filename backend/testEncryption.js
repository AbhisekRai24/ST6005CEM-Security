require('dotenv').config();
const { encrypt, decrypt, isEncrypted } = require('./utils/encryption');

console.log('\n🔐 Testing Encryption Utility...\n');

const testData = {
   phone: '+977-9812345678',
   address: 'Kathmandu, Nepal'
};

console.log('1️⃣ Original Data:');
console.log('   Phone:', testData.phone);
console.log('   Address:', testData.address);

console.log('\n2️⃣ Encrypting...');
const encryptedPhone = encrypt(testData.phone);
const encryptedAddress = encrypt(testData.address);

console.log('   Encrypted Phone:', encryptedPhone.substring(0, 50) + '...');
console.log('   Encrypted Address:', encryptedAddress.substring(0, 50) + '...');
console.log('   Is Encrypted?', isEncrypted(encryptedPhone));

console.log('\n3️⃣ Decrypting...');
const decryptedPhone = decrypt(encryptedPhone);
const decryptedAddress = decrypt(encryptedAddress);

console.log('   Decrypted Phone:', decryptedPhone);
console.log('   Decrypted Address:', decryptedAddress);

console.log('\n4️⃣ Verification:');
console.log('   Phone Match:', testData.phone === decryptedPhone ? '✅' : '❌');
console.log('   Address Match:', testData.address === decryptedAddress ? '✅' : '❌');

console.log('\n✅ Encryption test complete!\n');
