import { createZkIdIdentity, generateProof, verifySignature, createProofMessage } from '@zkterm/zkid';

async function main() {
  console.log('=== Example 4: Complete zkID Workflow ===\n');

  const password = 'MySecurePassword123!';

  console.log('STEP 1: Creating new zkID identity...');
  const identity = await createZkIdIdentity(password);
  console.log('zkID:', identity.zkId);
  console.log('Public Key:', identity.publicKey.substring(0, 32) + '...');
  console.log();

  console.log('STEP 2: Generating cryptographic proof of ownership...');
  const proofResult = await generateProof(
    identity.zkId,
    password,
    identity.encryptedPrivateKey.encrypted,
    identity.encryptedPrivateKey.salt,
    identity.encryptedPrivateKey.iv,
    identity.encryptedPrivateKey.iterations
  );
  
  console.log('Proof Generated:');
  console.log('- Signature:', proofResult.signature.substring(0, 32) + '...');
  console.log('- Timestamp:', new Date(proofResult.timestamp).toISOString());
  console.log();

  console.log('STEP 3: Verifying proof signature...');
  const isValid = verifySignature(
    proofResult.message,
    proofResult.signature,
    identity.publicKey
  );
  
  console.log('Signature Valid?', isValid);
  console.log();

  console.log('STEP 4: Parsing proof message...');
  const proofMessage = JSON.parse(proofResult.message);
  console.log('Proof Details:');
  console.log('- Version:', proofMessage.version);
  console.log('- Type:', proofMessage.type);
  console.log('- zkID:', proofMessage.zkId);
  console.log('- Timestamp:', new Date(proofMessage.timestamp).toISOString());
  console.log('- Nonce:', proofMessage.nonce.substring(0, 16) + '...');
  console.log('- Expires:', new Date(proofMessage.expiresAt).toISOString());
  
  console.log('\n=== WORKFLOW COMPLETE ===');
  console.log('This proves cryptographic ownership of zkID:', identity.zkId);
  console.log('The signature can be verified by anyone with the public key!');
}

main().catch(console.error);
