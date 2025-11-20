# @zkterm/zkid

Privacy-preserving cryptographic identity system with Ed25519 proofs, AES-256-GCM encryption, and multi-chain blockchain verification (Solana + Starknet).

## Features

- **zkID Generation**: Universal `did:zk:xxx` identity format
- **Ed25519 Keypairs**: Cryptographic proof of ownership for zkID
- **STARK Curve Keypairs**: Starknet wallet generation (OpenZeppelin/ArgentX)
- **Password Encryption**: AES-256-GCM with PBKDF2 (200,000 iterations)
- **Message Signing**: Client-side signature generation
- **Multi-Chain Blockchain Verification**: Optional Solana & Starknet on-chain proof submission
- **Starknet Wallet Management**: Create, import, and manage Starknet wallets
- **Browser & Node.js**: Works in both environments

## Installation

```bash
npm install @zkterm/zkid
```

## Included Starknet Smart Contract

This package includes a **Cairo smart contract** for on-chain zkID proof verification on Starknet.

### What's Included

The `contracts/` directory contains:
- **`src/lib.cairo`** - ZkIDProofRegistry smart contract source code
- **`Scarb.toml`** - Cairo project configuration
- **`README.md`** - Complete deployment guide with Scarb and Starkli instructions

### Contract: ZkIDProofRegistry

The contract provides immutable on-chain proof storage with the following functions:

- `store_proof(proof_id, proof_hash, zk_id)` - Store zkID proof hash on-chain
- `get_proof(proof_id)` - Retrieve proof data (hash, zkID, timestamp, owner)
- `verify_proof_exists(proof_id)` - Check if proof exists

### Quick Deploy

```bash
# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Compile contract
cd node_modules/@zkterm/zkid/contracts
scarb build

# Deploy to Starknet (see contracts/README.md for full instructions)
```

**Full deployment guide:** See `contracts/README.md` for detailed instructions including:
- Starknet wallet setup with Starkli
- Testnet/Mainnet deployment
- Contract interaction examples
- Integration with your backend

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

### Starknet Wallet Example

```javascript
import { createStarknetWallet, importStarknetWallet } from '@zkterm/zkid';

// Option 1: Create new wallet (generates keypair automatically)
const password = 'MySecurePassword123!';
const wallet = await createStarknetWallet(password, 'openzeppelin'); // or 'argentx'

console.log('Starknet Address:', wallet.address);
console.log('Public Key:', wallet.publicKey);
console.log('Encrypted:', wallet.encryptedPrivateKey.encrypted);

// Option 2: Import existing private key (e.g., from external source)
// Use this when you already have a Starknet private key
const existingPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const importedWallet = await importStarknetWallet(
  existingPrivateKey,
  password,
  'openzeppelin'
);

console.log('Imported Address:', importedWallet.address);

// Deploy the included Cairo contract (see contracts/README.md)
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

#### Solana Blockchain Verification

##### `submitProofToSolana(zkId, proofHash, rpcUrl, payerKeypair): Promise<BlockchainProofResult>`

Submits zkID proof to Solana Memo Program.

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

##### `verifyProofOnChain(txHash: string, rpcUrl: string): Promise<boolean>`

Verifies transaction exists on Solana blockchain.

### Starknet Wallet Management

Complete Starknet wallet creation and management with STARK curve cryptography.

#### `generateStarknetKeypair(): StarknetKeypair`

Generates a new STARK curve keypair for Starknet wallets.

**Returns:**
```typescript
{
  privateKey: string;  // Hex format with 0x prefix
  publicKey: string;   // Stark public key
}
```

**Example:**
```javascript
import { generateStarknetKeypair } from '@zkterm/zkid';

const keypair = generateStarknetKeypair();
console.log('Private Key:', keypair.privateKey);
console.log('Public Key:', keypair.publicKey);
```

#### `calculateStarknetAddress(publicKey: string, accountType?: 'openzeppelin' | 'argentx'): string`

Calculates Starknet account address from public key.

**Parameters:**
- `publicKey`: Stark public key
- `accountType`: Account implementation type (default: `'openzeppelin'`)
  - `'openzeppelin'`: OpenZeppelin account contract
  - `'argentx'`: ArgentX account contract

**Returns:** Starknet account address (hex string)

**Example:**
```javascript
import { calculateStarknetAddress } from '@zkterm/zkid';

const address = calculateStarknetAddress(publicKey, 'openzeppelin');
console.log('Starknet Address:', address);
```

#### `createStarknetWallet(password: string, accountType?: 'openzeppelin' | 'argentx'): Promise<StarknetWallet>`

Creates a new Starknet wallet with encrypted private key.

**Parameters:**
- `password`: Password for encrypting private key
- `accountType`: Account type (default: `'openzeppelin'`)

**Returns:**
```typescript
{
  address: string;              // Starknet account address
  publicKey: string;            // Stark public key
  encryptedPrivateKey: {
    encrypted: string;          // Base64 encrypted private key
    salt: string;               // Hex salt for PBKDF2
    iv: string;                 // Hex IV for AES-GCM
    iterations: number;         // 200,000
  };
  accountType: 'openzeppelin' | 'argentx';
}
```

**Example:**
```javascript
import { createStarknetWallet } from '@zkterm/zkid';

const wallet = await createStarknetWallet('MySecurePassword123!', 'openzeppelin');
console.log('Wallet Address:', wallet.address);
console.log('Public Key:', wallet.publicKey);
console.log('Account Type:', wallet.accountType);
```

#### `importStarknetWallet(privateKey: string, password: string, accountType?: 'openzeppelin' | 'argentx'): Promise<StarknetWallet>`

Imports existing Starknet wallet from private key.

**Parameters:**
- `privateKey`: Starknet private key (hex, with or without 0x prefix)
- `password`: Password for encrypting private key
- `accountType`: Account type (default: `'openzeppelin'`)

**Returns:** `StarknetWallet` object (same as `createStarknetWallet`)

**Example:**
```javascript
import { importStarknetWallet } from '@zkterm/zkid';

const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const wallet = await importStarknetWallet(privateKey, 'MyPassword123!', 'argentx');
console.log('Imported Wallet:', wallet.address);
```

#### `decryptStarknetPrivateKey(encryptedData: EncryptedKeyData, password: string): Promise<string>`

Decrypts Starknet wallet private key.

**Parameters:**
- `encryptedData`: Encrypted private key data (from wallet creation/import)
- `password`: Password used during encryption

**Returns:** Decrypted private key (hex string with 0x prefix)

**Example:**
```javascript
import { decryptStarknetPrivateKey } from '@zkterm/zkid';

const privateKey = await decryptStarknetPrivateKey(
  wallet.encryptedPrivateKey,
  'MyPassword123!'
);
console.log('Decrypted Private Key:', privateKey);
```

#### `getStarknetPublicKey(privateKey: string): string`

Derives Stark public key from private key.

**Parameters:**
- `privateKey`: Starknet private key (hex, with or without 0x prefix)

**Returns:** Stark public key (hex string)

**Example:**
```javascript
import { getStarknetPublicKey } from '@zkterm/zkid';

const publicKey = getStarknetPublicKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
console.log('Public Key:', publicKey);
```

### Utilities

```typescript
uint8ArrayToBase64(bytes: Uint8Array): string
base64ToUint8Array(base64: string): Uint8Array
uint8ArrayToHex(bytes: Uint8Array): string
hexToUint8Array(hex: string): Uint8Array
```

## Examples

### Complete zkID Workflow (Ed25519)

```javascript
import { 
  createZkIdIdentity, 
  generateProof, 
  verifySignature 
} from '@zkterm/zkid';

// 1. Create zkID identity
const password = 'MySecurePassword123!';
const identity = await createZkIdIdentity(password);

console.log('zkID:', identity.zkId);
console.log('Public Key:', identity.publicKey);

// 2. Generate cryptographic proof
const proof = await generateProof(
  identity.zkId,
  password,
  identity.encryptedPrivateKey.encrypted,
  identity.encryptedPrivateKey.salt,
  identity.encryptedPrivateKey.iv
);

console.log('Proof Signature:', proof.signature);
console.log('Proof Message:', proof.message);

// 3. Verify signature
const isValid = verifySignature(
  proof.message,
  proof.signature,
  identity.publicKey
);

console.log('Proof Valid?', isValid); // true
```

### Complete Starknet Wallet Workflow

```javascript
import { 
  createStarknetWallet,
  importStarknetWallet,
  decryptStarknetPrivateKey,
  calculateStarknetAddress,
  getStarknetPublicKey
} from '@zkterm/zkid';

// 1. Create new Starknet wallet (OpenZeppelin)
const password = 'MyStarknetPassword123!';
const wallet = await createStarknetWallet(password, 'openzeppelin');

console.log('Wallet Address:', wallet.address);
console.log('Public Key:', wallet.publicKey);
console.log('Account Type:', wallet.accountType);

// 2. Decrypt private key when needed
const privateKey = await decryptStarknetPrivateKey(
  wallet.encryptedPrivateKey,
  password
);
console.log('Private Key:', privateKey);

// 3. Import existing wallet (ArgentX)
const existingKey = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const importedWallet = await importStarknetWallet(
  existingKey,
  'NewPassword456!',
  'argentx'
);
console.log('Imported Address:', importedWallet.address);

// 4. Calculate address from public key
const publicKey = getStarknetPublicKey(privateKey);
const address = calculateStarknetAddress(publicKey, 'openzeppelin');
console.log('Calculated Address:', address);
```

### Working Code Examples

The `examples/` folder contains 5 working examples:

#### 1. Basic zkID Generation
```bash
cd examples/1-basic-zkid
npm install
npm start
```

#### 2. Sign & Verify Messages
```bash
cd examples/2-sign-verify
npm install
npm start
```

#### 3. Password Encryption
```bash
cd examples/3-encryption
npm install
npm start
```

#### 4. Complete Workflow
```bash
cd examples/4-full-flow
npm install
npm start
```

#### 5. Blockchain Verification (Solana)
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

zkTerm

## Links

- [zkTerm](https://zkterm.io)
- [GitHub](https://github.com/zkterm/zkid)
- [NPM](https://www.npmjs.com/package/@zkterm/zkid)
