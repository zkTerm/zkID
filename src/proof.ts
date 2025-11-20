import { decryptPrivateKey, signMessage, uint8ArrayToHex } from './crypto';
import { ProofMessage, SignatureResult } from './types';

export function createProofMessage(
  zkId: string,
  nonce?: string
): ProofMessage {
  const timestamp = Date.now();
  const nonceValue = nonce || uint8ArrayToHex(crypto.getRandomValues(new Uint8Array(16)));
  
  return {
    version: '2.0.0',
    type: 'zkid_cryptographic_ownership',
    zkId,
    timestamp,
    nonce: nonceValue,
    expiresAt: timestamp + (10 * 60 * 1000),
  };
}

export async function generateProof(
  zkId: string,
  password: string,
  encryptedPrivateKey: string,
  salt: string,
  iv: string,
  iterations: number = 200000
): Promise<SignatureResult> {
  let decryptedKey: Uint8Array | null = null;
  
  try {
    decryptedKey = await decryptPrivateKey(
      encryptedPrivateKey,
      password,
      salt,
      iv,
      iterations
    );

    const proofMessage = createProofMessage(zkId);
    const messageString = JSON.stringify(proofMessage);
    
    const signature = signMessage(messageString, decryptedKey);
    
    return {
      signature,
      message: messageString,
      timestamp: proofMessage.timestamp,
    };
  } finally {
    if (decryptedKey) {
      decryptedKey.fill(0);
    }
  }
}
