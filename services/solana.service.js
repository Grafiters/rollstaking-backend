const fs = require('fs');
const path = require('path');

const { getAssociatedTokenAddressSync, unpackMint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, createTransferCheckedInstruction, TOKEN_2022_PROGRAM_ID } = require("@solana/spl-token");
const { Transaction } = require("@solana/web3.js");
const { PublicKey } = require("@solana/web3.js");
const { Connection } = require("@solana/web3.js");
const { sendAndConfirmTransaction } = require("@solana/web3.js");
const { clusterApiUrl } = require("@solana/web3.js");
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
const { error } = require('console');

const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const BATCH_SIZE = 20;

/**
 * @returns {Connection}
 */
const buildConnection = () => {
    const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed')

    return connection
}

/**
 * @returns {any}
 */
const senderGenerate = () => {  
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../fixture/devnet.json')), 'utf8'));
    const sender = Keypair.fromSecretKey(secretKey);

    return sender
}

/**
 * @param {Array<string>} address
 * @param {Array<string>} amount
 * @returns {Array}
 */
const buildInstruction = (address, amount) => {
    const result = address.map((val, i) => (
        {
            address: val,
            amount: amount[i]
        }
    ))

    return result
}

/**
 * @param {Connection} connection
 * @param {{address: string, amount: string}[]} receipient
 * @param {any} wallet
 * @param {string} token_address
 * @returns {Transaction}
 */
const initTransaction = async (connection, receipient, wallet, token_address) => {
    let mint = token_address
    if (typeof token_address === 'string') {
        mint = new PublicKey(token_address)
    }

    const transactions = new Transaction()
    
    const tokenMintAccount = await connection.getAccountInfo(token_address)
    if (!tokenMintAccount) {
        error(`token mint not found`)
        return null
    }

    const tokenMint = unpackMint(token_address, tokenMintAccount, TOKEN_2022_PROGRAM_ID)

    for (const receipt of receipient) {
        const receiptAddress = new PublicKey(receipt.address)

        const fromTokenAssosiate = getAssociatedTokenAddressSync(
            mint,
            wallet.publicKey,
            false,
            tokenMintAccount.owner,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
        transactions.add(
            createAssociatedTokenAccountIdempotentInstruction(
                wallet.publicKey,
                fromTokenAssosiate,
                wallet.publicKey,
                mint,
                tokenMintAccount.owner,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        )

        const toTokenAssosiate = getAssociatedTokenAddressSync(
            mint,
            receiptAddress,
            false,
            tokenMintAccount.owner,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )

        transactions.add(
            createAssociatedTokenAccountIdempotentInstruction(
                wallet.publicKey,
                toTokenAssosiate,
                receiptAddress,
                mint,
                tokenMintAccount.owner,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        )

        const amount = parsingAmount(receipt.amount, tokenMint.decimals)
        
        transactions.add(
            createTransferCheckedInstruction(
                fromTokenAssosiate,
                mint,
                toTokenAssosiate,
                wallet.publicKey,
                amount,
                tokenMint.decimals,
                [],
                tokenMintAccount.owner
            )
        )
    }

    return transactions
}

/**
 * @param {Connection} connection
 * @param {PublicKey} token
 * @return {AccountInfo}
 */
getTokenInfo = async(connection, token) => {
    const tokenInfo = await connection.getAccountInfo(token, {commitment: 'finalized' })
    return tokenInfo
}

/**
 * @param {Connection} connection
 * @param {Transaction} transaction
 * @param {any} sender
 * @param {any} receipt
 * @returns {string}
 */
const sendAndConfirm = async(connection, transaction, sender, receipt) => {
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = sender.publicKey
    
    try {
        const tx = await sendAndConfirmTransaction(connection, transaction, [sender], {
            commitment: 'confirmed'
        })

        return tx
    } catch (error) {
        console.log(error);
        
        return error
    }
}

/**
 * @param {string} signature
 */
isValidSignature = (signature) => {
  try {
    const decoded = bs58.decode(signature);
    return decoded.length === 64; 
  } catch (err) {
    return false;
  }
}

/**
 * @param {string} amount
 * @param {Number} decimals
 * @returns {Number}
 */
parsingAmount = (amount, decimals) => {
    return Math.floor(amount * (10**decimals))
}


module.exports = {
    buildConnection,
    BATCH_SIZE,
    buildInstruction,
    initTransaction,
    sendAndConfirm,
    senderGenerate,
    isValidSignature
}