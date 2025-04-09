const { Transaction } = require("@solana/web3.js");
const { PublicKey } = require("@solana/web3.js");
const { sendAndConfirmTransaction } = require("@solana/web3.js");
const { SystemProgram } = require("@solana/web3.js");
const { clusterApiUrl } = require("@solana/web3.js");
const { Connection } = require("@solana/web3.js");
const bs58 = require('bs58');

const BATCH_SIZE = 20;

/**
 * @returns {Connection}
 */
const buildConnection = () => {
    const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
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
 * @returns {Transaction}
 */
const initTransaction = (receipient, wallet) => {
    const transactions = new Transaction()
    for (const receipt of receipient) {
        transactions.add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(receipt.address),
                lamports: receipt.amount
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


moduke.exports = {
    buildConnection,
    BATCH_SIZE,
    buildInstruction,
    initTransaction,
    sendAndConfirm,
    senderGenerate,
    isValidSignature
}