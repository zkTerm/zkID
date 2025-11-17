import { Connection, Transaction, TransactionInstruction, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { BlockchainProofResult } from './types';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function submitProofToSolana(
  zkId: string,
  proofHash: string,
  rpcUrl: string,
  payerKeypair: Keypair
): Promise<BlockchainProofResult> {
  const connection = new Connection(rpcUrl, 'confirmed');
  
  const memoData = `zkTerm|zkID:${zkId}|proof:${proofHash}|ts:${Date.now()}`;
  
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoData, 'utf8'),
  });

  const transaction = new Transaction().add(memoInstruction);

  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payerKeypair],
      {
        commitment: 'confirmed',
        maxRetries: 3,
      }
    );

    return {
      txHash: signature,
      verified: true,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    throw new Error(`Failed to submit proof to Solana: ${error.message}`);
  }
}

export async function verifyProofOnChain(
  txHash: string,
  rpcUrl: string
): Promise<boolean> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const tx = await connection.getTransaction(txHash, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    
    return tx !== null;
  } catch (error) {
    console.error('Error verifying proof on-chain:', error);
    return false;
  }
}
