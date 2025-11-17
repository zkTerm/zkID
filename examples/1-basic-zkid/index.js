import { createZkIdIdentity, truncateZkId, validateZkId } from '@zkterm/zkid';

async function main() {
  console.log('=== Example 1: Basic zkID Generation ===\n');

  const password = 'MySecurePassword123!';
  console.log('Creating new zkID identity with password...\n');

  const identity = await createZkIdIdentity(password);

  console.log('zkID Created Successfully!');
  console.log('------------------------');
  console.log('zkID:', identity.zkId);
  console.log('zkID (truncated):', truncateZkId(identity.zkId));
  console.log('Public Key:', identity.publicKey.substring(0, 32) + '...');
  console.log('Valid zkID?', validateZkId(identity.zkId));
  console.log('\nEncrypted Private Key Data:');
  console.log('- Salt:', identity.encryptedPrivateKey.salt.substring(0, 16) + '...');
  console.log('- IV:', identity.encryptedPrivateKey.iv.substring(0, 16) + '...');
  console.log('- Iterations:', identity.encryptedPrivateKey.iterations);
  console.log('- Encrypted:', identity.encryptedPrivateKey.encrypted.substring(0, 32) + '...');
  
  console.log('\nNOTE: Store these values securely. You need them to prove ownership!');
}

main().catch(console.error);
