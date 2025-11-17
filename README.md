# @zkterm/zkid

Privacy-preserving cryptographic identity system with Ed25519 proofs, AES-256-GCM encryption, and Solana blockchain verification.

## Features

- **zkID Generation**: Universal `did:zk:xxx` identity format
- **Ed25519 Keypairs**: Cryptographic proof of ownership
- **Password Encryption**: AES-256-GCM with PBKDF2 (200,000 iterations)
- **Message Signing**: Client-side signature generation
- **Blockchain Verification**: Optional Solana on-chain proof submission
- **Browser & Node.js**: Works in both environments

## Installation

```bash
npm install @zkterm/zkid
```

## Quick Start

```javascript
import { createZkIdIdentity, generateProof, verifySignature } from '@zkterm/zkid';

// Create new zkID identity
const password = 'MySecurePassword123!';
const identity = await createZkIdIdentity(password);

console.log('zkID:', identity.zkId);
console.log('Public Key:', identity.publicKey);

// Generate proof of ownership
const proof = await generateProof(
  identity.zkId,
  password,
  identity.encryptedPrivateKey.encrypted,
  identity.encryptedPrivateKey.salt,
  identity.encryptedPrivateKey.iv
);

// Verify signature
const isValid = verifySignature(
  proof.message,
  proof.signature,
  identity.publicKey
);

console.log('Proof valid?', isValid); // true
```

## API Documentation

### Identity Management

#### `createZkIdIdentity(password: string): Promise<ZkIdIdentity>`

Creates a new zkID identity with encrypted private key.

**Returns:**
```typescript
{
  zkId: string;                    // did:zk:xxxxx format
  publicKey: string;               // Base64 encoded public key
  encryptedPrivateKey: {
    encrypted: string;             // Base64 encrypted private key
    salt: string;                  // Hex salt for PBKDF2
    iv: string;                    // Hex IV for AES-GCM
    iterations: number;            // 200,000
  }
}
```

#### `generateZkId(): string`

Generates a random zkID in `did:zk:xxxxxxxxxxxx` format.

#### `truncateZkId(zkId: string): string`

Truncates zkID for display: `did:zk:abcd...xyz9`

#### `validateZkId(zkId: string): boolean`

Validates zkID format (must be `did:zk:` + 12 alphanumeric chars).

### Cryptography

#### `generateIdentityKeypair(): ZkIdKeypair`

Generates Ed25519 keypair for signing.

**Returns:**
```typescript
{
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}
```

#### `encryptPrivateKey(privateKey: Uint8Array, password: string): Promise<EncryptedKeyData>`

Encrypts private key with password using AES-256-GCM + PBKDF2.

#### `decryptPrivateKey(encrypted: string, password: string, salt: string, iv: string, iterations?: number): Promise<Uint8Array>`

Decrypts private key. Throws error if password is incorrect.

#### `signMessage(message: string, secretKey: Uint8Array): string`

Signs message with Ed25519 private key. Returns base64 signature.

#### `verifySignature(message: string, signature: string, publicKey: string): boolean`

Verifies Ed25519 signature against public key.

### Proof Generation

#### `createProofMessage(zkId: string, nonce?: string): ProofMessage`

Creates standardized proof message with timestamp and 10-minute expiry.

#### `generateProof(zkId, password, encrypted, salt, iv, iterations?): Promise<SignatureResult>`

Complete proof generation workflow:
1. Decrypts private key with password
2. Creates proof message with nonce
3. Signs message with Ed25519
4. Zeros private key from memory

**Returns:**
```typescript
{
  signature: string;
  message: string;
  timestamp: number;
}
```

### Blockchain (Optional)

#### `submitProofToSolana(zkId, proofHash, rpcUrl, payerKeypair): Promise<BlockchainProofResult>`

Submits proof to Solana Memo Program.

**Parameters:**
- `zkId`: Your zkID
- `proofHash`: SHA-256 hash of proof
- `rpcUrl`: Solana RPC endpoint
- `payerKeypair`: Funded Solana keypair for transaction fees

**Returns:**
```typescript
{
  txHash: string;
  verified: boolean;
  timestamp: number;
}
```

#### `verifyProofOnChain(txHash: string, rpcUrl: string): Promise<boolean>`

Verifies transaction exists on Solana blockchain.

### Utilities

```typescript
uint8ArrayToBase64(bytes: Uint8Array): string
base64ToUint8Array(base64: string): Uint8Array
uint8ArrayToHex(bytes: Uint8Array): string
hexToUint8Array(hex: string): Uint8Array
```

## Examples

The `examples/` folder contains 5 working examples:

### 1. Basic zkID Generation
```bash
cd examples/1-basic-zkid
npm install
npm start
```

### 2. Sign & Verify Messages
```bash
cd examples/2-sign-verify
npm install
npm start
```

### 3. Password Encryption
```bash
cd examples/3-encryption
npm install
npm start
```

### 4. Complete Workflow
```bash
cd examples/4-full-flow
npm install
npm start
```

### 5. Blockchain Verification
```bash
cd examples/5-blockchain
npm install
npm start
```

## Security Model

1. **Client-Side Key Generation**: Ed25519 keypairs generated in browser/Node.js
2. **Password Protection**: Private keys encrypted with AES-256-GCM
3. **Key Derivation**: PBKDF2 with 200,000 iterations + 32-byte salt
4. **Memory Safety**: Private keys zeroed after use
5. **No Server Exposure**: Encrypted keys stored, never plaintext private keys

## NPM Publishing Guide

### Prerequisites

1. Create NPM account at [npmjs.com](https://www.npmjs.com/signup)
2. Verify your email address
3. Enable 2FA (optional but recommended)

### Publishing Steps

#### 1. Login to NPM

```bash
npm login
```

Enter your credentials:
- Username
- Password
- Email
- 2FA code (if enabled)

#### 2. Build the Package

```bash
cd zkid-package
npm install
npm run build
```

This compiles TypeScript to JavaScript in `dist/` folder.

#### 3. Test Locally

```bash
# In zkid-package/
npm pack

# This creates @zkterm-zkid-1.0.0.tgz
# Test it in an example:
cd examples/1-basic-zkid
npm install ../../@zkterm-zkid-1.0.0.tgz
npm start
```

#### 4. Publish to NPM

```bash
# First time (public package)
npm publish --access public

# Updates
npm version patch  # 1.0.0 -> 1.0.1
npm publish

# Or for minor version
npm version minor  # 1.0.1 -> 1.1.0
npm publish

# Or for major version
npm version major  # 1.1.0 -> 2.0.0
npm publish
```

#### 5. Verify Publication

Visit: https://www.npmjs.com/package/@zkterm/zkid

Install from NPM:
```bash
npm install @zkterm/zkid
```

### Version Management

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.X): Bug fixes, no API changes
- **Minor** (1.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

```bash
npm version patch   # Bug fixes
npm version minor   # New features
npm version major   # Breaking changes
npm publish
```

### Scoped Packages

This package uses `@zkterm` scope. To publish scoped packages:

1. Make sure you own the `@zkterm` organization on NPM
2. Or create your own scope: `@yourname/zkid`
3. Use `--access public` on first publish

### Troubleshooting

**Error: Package already exists**
- Change version in `package.json`
- Or run `npm version patch` first

**Error: You must sign in**
- Run `npm login` again
- Check credentials with `npm whoami`

**Error: Forbidden**
- Check you own the `@zkterm` scope
- Or change to your own scope

**Error: No access**
- Use `npm publish --access public` for scoped packages

## Development

```bash
# Build
npm run build

# Watch mode
npm run build -- --watch
```

## License

MIT

## Author

zkTerm - One Terminal for the Entire Zero-Knowledge Universe

## Links

- [zkTerm](https://zkterm.io)
- [GitHub](https://github.com/zkterm/zkid)
- [NPM](https://www.npmjs.com/package/@zkterm/zkid)
