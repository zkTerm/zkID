import { Keypair } from '@solana/web3.js';
import { BlockchainProofResult } from './types';
export declare function submitProofToSolana(zkId: string, proofHash: string, rpcUrl: string, payerKeypair: Keypair): Promise<BlockchainProofResult>;
export declare function verifyProofOnChain(txHash: string, rpcUrl: string): Promise<boolean>;
