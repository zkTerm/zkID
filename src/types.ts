export interface ZkIdKeypair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface EncryptedKeyData {
  encrypted: string;
  salt: string;
  iv: string;
  iterations: number;
}

export interface ZkIdIdentity {
  zkId: string;
  publicKey: string;
  encryptedPrivateKey: EncryptedKeyData;
}

export interface ProofMessage {
  version: string;
  type: string;
  zkId: string;
  timestamp: number;
  nonce: string;
  expiresAt: number;
}

export interface SignatureResult {
  signature: string;
  message: string;
  timestamp: number;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
}

export interface BlockchainProofResult {
  txHash: string;
  verified: boolean;
  timestamp: number;
}

export interface StarknetKeypair {
  privateKey: string;
  publicKey: string;
}

export interface StarknetWallet {
  address: string;
  publicKey: string;
  encryptedPrivateKey: EncryptedKeyData;
  accountType: 'openzeppelin' | 'argentx';
}
