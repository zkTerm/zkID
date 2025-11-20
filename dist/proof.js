"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProofMessage = createProofMessage;
exports.generateProof = generateProof;
const crypto_1 = require("./crypto");
function createProofMessage(zkId, nonce) {
    const timestamp = Date.now();
    const nonceValue = nonce || (0, crypto_1.uint8ArrayToHex)(crypto.getRandomValues(new Uint8Array(16)));
    return {
        version: '2.0.0',
        type: 'zkid_cryptographic_ownership',
        zkId,
        timestamp,
        nonce: nonceValue,
        expiresAt: timestamp + (10 * 60 * 1000),
    };
}
async function generateProof(zkId, password, encryptedPrivateKey, salt, iv, iterations = 200000) {
    let decryptedKey = null;
    try {
        decryptedKey = await (0, crypto_1.decryptPrivateKey)(encryptedPrivateKey, password, salt, iv, iterations);
        const proofMessage = createProofMessage(zkId);
        const messageString = JSON.stringify(proofMessage);
        const signature = (0, crypto_1.signMessage)(messageString, decryptedKey);
        return {
            signature,
            message: messageString,
            timestamp: proofMessage.timestamp,
        };
    }
    finally {
        if (decryptedKey) {
            decryptedKey.fill(0);
        }
    }
}
