"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8ArrayToBase64 = uint8ArrayToBase64;
exports.base64ToUint8Array = base64ToUint8Array;
exports.hexToUint8Array = hexToUint8Array;
exports.uint8ArrayToHex = uint8ArrayToHex;
exports.generateIdentityKeypair = generateIdentityKeypair;
exports.encryptPrivateKey = encryptPrivateKey;
exports.decryptPrivateKey = decryptPrivateKey;
exports.signMessage = signMessage;
exports.verifySignature = verifySignature;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
if (typeof globalThis.crypto === 'undefined' && typeof process !== 'undefined') {
    try {
        const { webcrypto } = require('node:crypto');
        globalThis.crypto = webcrypto;
    }
    catch (e) {
    }
}
const PBKDF2_ITERATIONS = 200000;
const AES_KEY_LENGTH = 256;
const PBKDF2_HASH = 'SHA-256';
function uint8ArrayToBase64(bytes) {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(bytes).toString('base64');
    }
    return btoa(String.fromCharCode(...Array.from(bytes)));
}
function base64ToUint8Array(base64) {
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
function hexToUint8Array(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}
function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
function generateIdentityKeypair() {
    const keypair = tweetnacl_1.default.sign.keyPair();
    return {
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey,
    };
}
async function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const baseKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey']);
    const derivedKey = await crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: salt,
        iterations,
        hash: PBKDF2_HASH,
    }, baseKey, {
        name: 'AES-GCM',
        length: AES_KEY_LENGTH,
    }, false, ['encrypt', 'decrypt']);
    return derivedKey;
}
async function encryptPrivateKey(privateKey, password) {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
    const encryptedBuffer = await crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: iv,
    }, key, privateKey);
    return {
        encrypted: uint8ArrayToBase64(new Uint8Array(encryptedBuffer)),
        salt: uint8ArrayToHex(salt),
        iv: uint8ArrayToHex(iv),
        iterations: PBKDF2_ITERATIONS,
    };
}
async function decryptPrivateKey(encryptedBase64, password, saltHex, ivHex, iterations = PBKDF2_ITERATIONS) {
    const salt = hexToUint8Array(saltHex);
    const iv = hexToUint8Array(ivHex);
    const encryptedData = base64ToUint8Array(encryptedBase64);
    const key = await deriveKey(password, salt, iterations);
    try {
        const decryptedBuffer = await crypto.subtle.decrypt({
            name: 'AES-GCM',
            iv: iv,
        }, key, encryptedData);
        return new Uint8Array(decryptedBuffer);
    }
    catch (error) {
        throw new Error('Decryption failed: Invalid password or corrupted data');
    }
}
function signMessage(message, secretKey) {
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    const signature = tweetnacl_1.default.sign.detached(messageBytes, secretKey);
    return uint8ArrayToBase64(signature);
}
function verifySignature(message, signatureBase64, publicKeyBase64) {
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    const signature = base64ToUint8Array(signatureBase64);
    const publicKey = base64ToUint8Array(publicKeyBase64);
    return tweetnacl_1.default.sign.detached.verify(messageBytes, signature, publicKey);
}
