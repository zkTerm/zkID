import { generateIdentityKeypair, encryptPrivateKey, uint8ArrayToBase64 } from './crypto';
import { ZkIdIdentity } from './types';

export function generateZkId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  const randomValues = new Uint8Array(12);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 12; i++) {
    randomPart += chars[randomValues[i] % chars.length];
  }
  
  return `did:zk:${randomPart}`;
}

export async function createZkIdIdentity(password: string): Promise<ZkIdIdentity> {
  const keypair = generateIdentityKeypair();
  
  const encryptedPrivateKey = await encryptPrivateKey(keypair.secretKey, password);
  
  keypair.secretKey.fill(0);
  
  return {
    zkId: generateZkId(),
    publicKey: uint8ArrayToBase64(keypair.publicKey),
    encryptedPrivateKey,
  };
}

export function truncateZkId(zkId: string): string {
  if (!zkId.startsWith('did:zk:')) {
    return zkId;
  }
  
  const identifier = zkId.replace('did:zk:', '');
  if (identifier.length <= 8) {
    return zkId;
  }
  
  const first4 = identifier.substring(0, 4);
  const last4 = identifier.substring(identifier.length - 4);
  return `did:zk:${first4}...${last4}`;
}

export function validateZkId(zkId: string): boolean {
  const zkIdRegex = /^did:zk:[a-z0-9]{12}$/;
  return zkIdRegex.test(zkId);
}
