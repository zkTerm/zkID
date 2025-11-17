import { generateIdentityKeypair, encryptPrivateKey, decryptPrivateKey, uint8ArrayToHex } from '@zkterm/zkid';

async function main() {
  console.log('=== Example 3: Password Encryption & Decryption ===\n');

  const keypair = generateIdentityKeypair();
  const password = 'MySecurePassword123!';
  const wrongPassword = 'WrongPassword456!';

  console.log('Original Private Key:', uint8ArrayToHex(keypair.secretKey).substring(0, 32) + '...');
  console.log();

  console.log('Encrypting private key with password...');
  const encryptedData = await encryptPrivateKey(keypair.secretKey, password);
  
  console.log('Encrypted Data:');
  console.log('- Encrypted:', encryptedData.encrypted.substring(0, 32) + '...');
  console.log('- Salt:', encryptedData.salt.substring(0, 16) + '...');
  console.log('- IV:', encryptedData.iv.substring(0, 16) + '...');
  console.log('- Iterations:', encryptedData.iterations);
  console.log();

  keypair.secretKey.fill(0);
  console.log('Original private key zeroed from memory\n');

  console.log('Attempting decryption with CORRECT password...');
  try {
    const decryptedKey = await decryptPrivateKey(
      encryptedData.encrypted,
      password,
      encryptedData.salt,
      encryptedData.iv,
      encryptedData.iterations
    );
    console.log('SUCCESS! Decrypted Key:', uint8ArrayToHex(decryptedKey).substring(0, 32) + '...');
    decryptedKey.fill(0);
  } catch (error) {
    console.log('FAILED:', error.message);
  }
  console.log();

  console.log('Attempting decryption with WRONG password...');
  try {
    const decryptedKey = await decryptPrivateKey(
      encryptedData.encrypted,
      wrongPassword,
      encryptedData.salt,
      encryptedData.iv,
      encryptedData.iterations
    );
    console.log('SUCCESS! Decrypted Key:', uint8ArrayToHex(decryptedKey).substring(0, 32) + '...');
    decryptedKey.fill(0);
  } catch (error) {
    console.log('FAILED (expected):', error.message);
  }
  
  console.log('\nNOTE: AES-256-GCM with PBKDF2 (200,000 iterations) ensures strong encryption');
}

main().catch(console.error);
