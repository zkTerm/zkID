import { generateIdentityKeypair, signMessage, verifySignature, uint8ArrayToBase64 } from '@zkterm/zkid';

async function main() {
  console.log('=== Example 2: Sign and Verify Messages ===\n');

  const keypair = generateIdentityKeypair();
  const publicKeyBase64 = uint8ArrayToBase64(keypair.publicKey);

  console.log('Generated Ed25519 Keypair');
  console.log('Public Key:', publicKeyBase64.substring(0, 32) + '...');
  console.log();

  const message = 'This is my cryptographic proof of zkID ownership!';
  console.log('Message to sign:', message);
  console.log();

  const signature = signMessage(message, keypair.secretKey);
  console.log('Signature:', signature.substring(0, 32) + '...');
  console.log();

  const isValid = verifySignature(message, signature, publicKeyBase64);
  console.log('Signature Valid?', isValid);
  console.log();

  const tamperedMessage = 'This is TAMPERED proof of zkID ownership!';
  const isTamperedValid = verifySignature(tamperedMessage, signature, publicKeyBase64);
  console.log('Tampered Message Valid?', isTamperedValid);
  
  keypair.secretKey.fill(0);
  console.log('\nNOTE: Private key has been securely zeroed from memory');
}

main().catch(console.error);
