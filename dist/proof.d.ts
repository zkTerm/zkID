import { ProofMessage, SignatureResult } from "./types";
export declare function createProofMessage(zkId: string, nonce?: string): ProofMessage;
export declare function generateProof(zkId: string, password: string, encryptedPrivateKey: string, salt: string, iv: string, iterations?: number): Promise<SignatureResult>;
