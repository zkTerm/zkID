# Starknet zkID Proof Registry Contract

## Overview
Cairo smart contract for storing zkID cryptographic proof hashes on Starknet blockchain.

## Contract: `ZkIDProofRegistry`

### Functions

#### `store_proof(proof_id, proof_hash, zk_id)`
Store a cryptographic proof hash on-chain.

**Parameters:**
- `proof_id: felt252` - Unique identifier for the proof (e.g., UUIDv4 as felt252)
- `proof_hash: felt252` - Poseidon hash of the proof data
- `zk_id: felt252` - User's zkID as felt252

**Emits:** `ProofStored` event

**Constraints:**
- proof_hash must be non-zero
- zk_id must be non-zero  
- proof_id must not already exist (prevents double-storing)

#### `get_proof(proof_id) -> (proof_hash, zk_id, timestamp, owner)`
Retrieve proof data by ID.

**Returns:**
- `proof_hash: felt252` - The stored hash
- `zk_id: felt252` - Associated zkID
- `timestamp: u64` - Unix timestamp when stored
- `owner: ContractAddress` - Address that submitted the proof

#### `verify_proof_exists(proof_id) -> bool`
Check if a proof exists.

**Returns:**
- `bool` - `true` if proof exists, `false` otherwise

## Deployment

### Prerequisites
```bash
# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Install Starkli (CLI tool)
curl https://get.starkli.sh | sh
starkliup
```

### Compile
```bash
# If using from npm package
cd node_modules/@zkterm/zkid/contracts
scarb build

# Or if working in the package source
cd contracts
scarb build
```

### Deploy to Sepolia Testnet

1. **Get Sepolia ETH from faucet:** https://faucet.starknet.io

2. **Declare contract:**
```bash
starkli declare \
  target/dev/zkid_proof_registry_ZkIDProofRegistry.contract_class.json \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_9 \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json
```

3. **Deploy contract:**
```bash
starkli deploy \
  <CLASS_HASH_FROM_DECLARE> \
  --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_9 \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json
```

4. **Save contract address to env:**
```
STARKNET_PROOF_REGISTRY_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
```

## Integration with zkTerm Backend

The backend will:
1. Generate proof hash using Poseidon (via starknet.js)
2. Convert proof ID (UUID) to felt252
3. Sign transaction with server wallet
4. Submit `store_proof` call to contract
5. Return Starkscan link to user

See `server/starknetProofSubmission.ts` for implementation.

## Security Notes

- Server wallet pays gas fees (users don't need STRK tokens)
- Proof hashes are irreversible (one-way Poseidon hash)
- Timestamp provides immutable proof-of-existence
- Owner tracking prevents unauthorized proof submission
