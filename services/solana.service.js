const fs = require('fs');
const { getAssociatedTokenAddress, createTransferInstruction } = require("@solana/spl-token");
const { Transaction } = require("@solana/web3.js");
const { PublicKey } = require("@solana/web3.js");
const { Connection } = require("@solana/web3.js");
const { sendAndConfirmTransaction } = require("@solana/web3.js");
const { clusterApiUrl } = require("@solana/web3.js");
const bs58 = require('bs58');

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
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('../fixture/devnet.json', 'utf8')));
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
 * @param {{address: string, amount: string}[]} receipient
 * @param {any} wallet
 * @param {string} token_address
 * @returns {Transaction}
 */
const initTransaction = async (receipient, wallet, token_address) => {
    let mint = token_address
    if (typeof token_address === 'string') {
        mint = new PublicKey(token_address)
    }
    const transactions = new Transaction()
    for (const receipt of receipient) {
        const fromTokenAssosiate = await getAssociatedTokenAddress(mint, wallet.publicKey)
        const toTokenAssosiate = await getAssociatedTokenAddress(mint, new PublicKey(receipt.address))
        const publicKey = wallet.publicKey
        const amount = receipt.amount

        transactions.add(
            createTransferInstruction({
                fromTokenAssosiate,
                toTokenAssosiate,
                publicKey,
                amount
            })
        )
    }

    return transactions
}

/**
 * @param {Connection} connection
 * @param {Transaction} transaction
 * @param {any} sender
 * @returns {string}
 */
const sendAndConfirm = async(connection, transaction, sender) => {
    try {
        const tx = await sendAndConfirmTransaction(connection, transaction, [sender])
        return tx
    } catch (error) {
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

module.exports = {
    buildConnection,
    BATCH_SIZE,
    buildInstruction,
    initTransaction,
    sendAndConfirm,
    senderGenerate,
    isValidSignature
}