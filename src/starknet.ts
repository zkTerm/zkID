import { ec, hash, CallData } from 'starknet';
import { encryptPrivateKey, decryptPrivateKey, hexToUint8Array, uint8ArrayToHex } from './crypto';
import { StarknetKeypair, StarknetWallet, EncryptedKeyData } from './types';

const OPENZEPPELIN_ACCOUNT_CLASS_HASH = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
const ARGENTX_ACCOUNT_CLASS_HASH = '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f';

export function generateStarknetKeypair(): StarknetKeypair {
  const privateKeyBytes = ec.starkCurve.utils.randomPrivateKey();
  const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
  const privateKey = '0x' + privateKeyHex;
  const publicKey = ec.starkCurve.getStarkKey(privateKeyHex);
  
  return {
    privateKey,
    publicKey,
  };
}

export function calculateStarknetAddress(
  publicKey: string,
  accountType: 'openzeppelin' | 'argentx' = 'openzeppelin'
): string {
  const classHash = accountType === 'argentx' ? ARGENTX_ACCOUNT_CLASS_HASH : OPENZEPPELIN_ACCOUNT_CLASS_HASH;
  
  let constructorCalldata: string[];
  if (accountType === 'argentx') {
    constructorCalldata = CallData.compile({
      owner: publicKey,
      guardian: '0'
    });
  } else {
    constructorCalldata = CallData.compile({
      publicKey
    });
  }
  
  const address = hash.calculateContractAddressFromHash(
    publicKey,
    classHash,
    constructorCalldata,
    0
  );
  
  return address;
}

export async function createStarknetWallet(
  password: string,
  accountType: 'openzeppelin' | 'argentx' = 'openzeppelin'
): Promise<StarknetWallet> {
  const keypair = generateStarknetKeypair();
  const address = calculateStarknetAddress(keypair.publicKey, accountType);
  
  const privateKeyBytes = hexToUint8Array(keypair.privateKey.replace('0x', ''));
  const encryptedPrivateKey = await encryptPrivateKey(privateKeyBytes, password);
  
  return {
    address,
    publicKey: keypair.publicKey,
    encryptedPrivateKey,
    accountType,
  };
}

export async function importStarknetWallet(
  privateKey: string,
  password: string,
  accountType: 'openzeppelin' | 'argentx' = 'openzeppelin'
): Promise<StarknetWallet> {
  const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  const publicKey = ec.starkCurve.getStarkKey(normalizedPrivateKey);
  const address = calculateStarknetAddress(publicKey, accountType);
  
  const privateKeyBytes = hexToUint8Array(normalizedPrivateKey.replace('0x', ''));
  const encryptedPrivateKey = await encryptPrivateKey(privateKeyBytes, password);
  
  return {
    address,
    publicKey,
    encryptedPrivateKey,
    accountType,
  };
}

export async function decryptStarknetPrivateKey(
  encryptedData: EncryptedKeyData,
  password: string
): Promise<string> {
  const privateKeyBytes = await decryptPrivateKey(
    encryptedData.encrypted,
    password,
    encryptedData.salt,
    encryptedData.iv,
    encryptedData.iterations
  );
  
  return '0x' + uint8ArrayToHex(privateKeyBytes);
}

export function getStarknetPublicKey(privateKey: string): string {
  const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  return ec.starkCurve.getStarkKey(normalizedPrivateKey);
}
