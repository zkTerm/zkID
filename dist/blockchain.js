"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitProofToSolana = submitProofToSolana;
exports.verifyProofOnChain = verifyProofOnChain;
const web3_js_1 = require("@solana/web3.js");
const MEMO_PROGRAM_ID = new web3_js_1.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
async function submitProofToSolana(zkId, proofHash, rpcUrl, payerKeypair) {
    const connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
    const memoData = `zkTerm|zkID:${zkId}|proof:${proofHash}|ts:${Date.now()}`;
    const memoInstruction = new web3_js_1.TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoData, 'utf8'),
    });
    const transaction = new web3_js_1.Transaction().add(memoInstruction);
    try {
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payerKeypair], {
            commitment: 'confirmed',
            maxRetries: 3,
        });
        return {
            txHash: signature,
            verified: true,
            timestamp: Date.now(),
        };
    }
    catch (error) {
        throw new Error(`Failed to submit proof to Solana: ${error.message}`);
    }
}
async function verifyProofOnChain(txHash, rpcUrl) {
    try {
        const connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
        const tx = await connection.getTransaction(txHash, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        return tx !== null;
    }
    catch (error) {
        console.error('Error verifying proof on-chain:', error);
        return false;
    }
}
