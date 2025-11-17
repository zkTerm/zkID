"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZkId = generateZkId;
exports.createZkIdIdentity = createZkIdIdentity;
exports.truncateZkId = truncateZkId;
exports.validateZkId = validateZkId;
const crypto_1 = require("./crypto");
function generateZkId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    const randomValues = new Uint8Array(12);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 12; i++) {
        randomPart += chars[randomValues[i] % chars.length];
    }
    return `did:zk:${randomPart}`;
}
async function createZkIdIdentity(password) {
    const keypair = (0, crypto_1.generateIdentityKeypair)();
    const encryptedPrivateKey = await (0, crypto_1.encryptPrivateKey)(keypair.secretKey, password);
    keypair.secretKey.fill(0);
    return {
        zkId: generateZkId(),
        publicKey: (0, crypto_1.uint8ArrayToBase64)(keypair.publicKey),
        encryptedPrivateKey,
    };
}
function truncateZkId(zkId) {
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
function validateZkId(zkId) {
    const zkIdRegex = /^did:zk:[a-z0-9]{12}$/;
    return zkIdRegex.test(zkId);
}
