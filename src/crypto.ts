import nacl from 'tweetnacl';
import { ZkIdKeypair, EncryptedKeyData } from './types';

if (typeof globalThis.crypto === 'undefined' && typeof process !== 'undefined') {
  try {
    const { webcrypto } = require('node:crypto');
    (globalThis as any).crypto = webcrypto;
  } catch (e) {
  }
}

const PBKDF2_ITERATIONS = 200000;
const AES_KEY_LENGTH = 256;
const PBKDF2_HASH = 'SHA-256';

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

export function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateIdentityKeypair(): ZkIdKeypair {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey,
  };
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: PBKDF2_HASH,
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: AES_KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

export async function encryptPrivateKey(
  privateKey: Uint8Array,
  password: string
): Promise<EncryptedKeyData> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    privateKey as BufferSource
  );

  return {
    encrypted: uint8ArrayToBase64(new Uint8Array(encryptedBuffer)),
    salt: uint8ArrayToHex(salt),
    iv: uint8ArrayToHex(iv),
    iterations: PBKDF2_ITERATIONS,
  };
}

export async function decryptPrivateKey(
  encryptedBase64: string,
  password: string,
  saltHex: string,
  ivHex: string,
  iterations: number = PBKDF2_ITERATIONS
): Promise<Uint8Array> {
  const salt = hexToUint8Array(saltHex);
  const iv = hexToUint8Array(ivHex);
  const encryptedData = base64ToUint8Array(encryptedBase64);

  const key = await deriveKey(password, salt, iterations);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      encryptedData as BufferSource
    );

    return new Uint8Array(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}

export function signMessage(
  message: string,
  secretKey: Uint8Array
): string {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  
  const signature = nacl.sign.detached(messageBytes, secretKey);
  
  return uint8ArrayToBase64(signature);
}

export function verifySignature(
  message: string,
  signatureBase64: string,
  publicKeyBase64: string
): boolean {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const signature = base64ToUint8Array(signatureBase64);
  const publicKey = base64ToUint8Array(publicKeyBase64);
  
  return nacl.sign.detached.verify(messageBytes, signature, publicKey);
}
