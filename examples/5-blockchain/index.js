import { createZkIdIdentity, generateProof, submitProofToSolana, verifyProofOnChain } from '@zkterm/zkid';
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

async function main() {
  console.log('=== Example 5: Solana Blockchain Verification ===\n');

  const HELIUS_RPC = process.env.HELIUS_API_KEY 
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : 'https://api.mainnet-beta.solana.com';
  
  const password = 'MySecurePassword123!';

  console.log('STEP 1: Creating zkID identity...');
  const identity = await createZkIdIdentity(password);
  console.log('zkID:', identity.zkId);
  console.log();

  console.log('STEP 2: Generating cryptographic proof...');
  const proofResult = await generateProof(
    identity.zkId,
    password,
    identity.encryptedPrivateKey.encrypted,
    identity.encryptedPrivateKey.salt,
    identity.encryptedPrivateKey.iv
  );
  console.log('Proof signature:', proofResult.signature.substring(0, 32) + '...');
  console.log();

  const proofHash = crypto.createHash('sha256')
    .update(proofResult.message + proofResult.signature)
    .digest('hex');
  
  console.log('Proof Hash:', proofHash.substring(0, 16) + '...');
  console.log();

  console.log('STEP 3: Submitting to Solana blockchain...');
  console.log('NOTE: This requires SOL for transaction fees and a funded wallet.\n');
  
  if (!process.env.ZKTERM_WALLET_PRIVATE_KEY) {
    console.log('SKIPPED: Set ZKTERM_WALLET_PRIVATE_KEY environment variable to test on-chain submission');
    console.log('\nExample transaction would include:');
    console.log('- Program: Solana Memo Program');
    console.log('- Data: zkTerm|zkID:' + identity.zkId + '|proof:' + proofHash.substring(0, 16) + '...');
    return;
  }

  try {
    const payerKeypair = Keypair.fromSecretKey(
      Buffer.from(process.env.ZKTERM_WALLET_PRIVATE_KEY, 'base64')
    );

    const result = await submitProofToSolana(
      identity.zkId,
      proofHash,
      HELIUS_RPC,
      payerKeypair
    );

    console.log('Blockchain Submission SUCCESS!');
    console.log('- Transaction Hash:', result.txHash);
    console.log('- Solscan:', `https://solscan.io/tx/${result.txHash}`);
    console.log('- Verified:', result.verified);
    console.log('- Timestamp:', new Date(result.timestamp).toISOString());
    console.log();

    console.log('STEP 4: Verifying on-chain...');
    const isOnChain = await verifyProofOnChain(result.txHash, HELIUS_RPC);
    console.log('On-chain verification:', isOnChain ? 'CONFIRMED' : 'PENDING');
    
  } catch (error) {
    console.log('ERROR:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. A funded Solana wallet');
    console.log('2. ZKTERM_WALLET_PRIVATE_KEY set correctly');
    console.log('3. HELIUS_API_KEY for Mainnet (optional, falls back to public RPC)');
  }
}

main().catch(console.error);
