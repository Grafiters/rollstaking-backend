const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { Connection } = require("@solana/web3.js")
const { PublicKey } = require("@solana/web3.js");
const { getStakeOffer } = require("../services/staking/queries/getStakeOffer");
const { clusterApiUrl } = require("@solana/web3.js");
const { TransactionInstruction } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction } = require('@solana/spl-token');
const { SYSVAR_CLOCK_PUBKEY } = require('@solana/web3.js');
const { STAKE_INIT_TAG } = require('../services/staking/constant');
const { SystemProgram } = require('@solana/web3.js');
const { SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const { Transaction } = require('@solana/web3.js');
const { Keypair } = require('@solana/web3.js');

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    console.log(`Loaded environment from ${envFile}`);
} else {
    console.error(`Environment file ${envFile} not found.`);
    process.exit(1);
}


const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const OFFERPROGRAM = process.env.STAKE_OFFER_PROGRAM
const PUBLISHERPROGRAM = process.env.STAKE_PUBLISHER_PROGRAM
const PROGRAMID = process.env.STAKE_PROGRAM_ID

const STAKE_OFFER_STAKED_PDA_TYPE = new Uint8Array([5]);
const STAKE_OFFER_REWARD_PDA_TYPE = new Uint8Array([4]);

/**
 * @param {number} amount 
 */
const InitStake = async (amount) => {
    const connection = connections()

    
    
    const clients = client(connection, new PublicKey(PROGRAMID));
    
    const wallets = generateWallet()

    const stakeOffer = await detailStake(clients, new PublicKey(OFFERPROGRAM))
    
    const tokenMintAccount = await connection.getAccountInfo(stakeOffer.data.stakedTokenMint);
    const rewardMintAccount = await connection.getAccountInfo(stakeOffer.data.rewardTokenMint);
    
    const stakeOfferPda = stakePda(clients, new PublicKey(OFFERPROGRAM));
    const rewardsPda = rewardPda(clients, new PublicKey(OFFERPROGRAM));

    const stakeInitPreps = buildInstruction(
        clients,
        stakeOfferPda,
        rewardsPda,
        stakeOffer,
        tokenMintAccount,
        rewardMintAccount,
        wallets,
        amount
    )

    const blockHash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        recentBlockhash: blockHash.blockhash,
        feePayer: wallets.publicKey
    })

    transaction.add(stakeInitPreps.depositInstruction);

    transaction.sign(wallets);
    
    const tx = await connection.sendRawTransaction(transaction.serialize())
    console.log(`deposit success => ${tx}`);

    await connection.confirmTransaction();
}

/**
 * @param {{connection: Connection, programId: PublicKey}} client
 * @param {PublicKey} stakePda
 * @param {PublicKey} rewardPda
 * @param {any} stakeOffer
 * @param {any} tokenInfo
 * @param {anu} rewardTokenInfo
 * @param {any} wallet
 * @param {number} amount
 * @returns {{stakeOfferInstruction: TransactionInstruction, depositInstruction: TransactionInstruction}}
 */
const buildInstruction = (client, stakePda, rewardPda, stakeOffer, tokenInfo, rewardTokenInfo,  wallet, amount) => {
    let mode = 0
    
    const stakeSameWithReward = stakeOffer.data.stakedTokenMint.equals(stakeOffer.data.rewardTokenMint)
    if (stakeSameWithReward){
        mode = 0b00000100;
    }

    const stakeTokenAta = getAssociatedTokenAddressSync(
        stakeOffer.data.stakedTokenMint,
        stakePda,
        true,
        tokenInfo.owner,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const payerTokenAta = getAssociatedTokenAddressSync(
        stakeOffer.data.stakedTokenMint,
        wallet.publicKey,
        true,
        tokenInfo.owner,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const rewardTokenAta = getAssociatedTokenAddressSync(
        stakeOffer.data.rewardTokenMint,
        rewardPda,
        true,
        rewardTokenInfo.owner,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const sysvarClock = SYSVAR_CLOCK_PUBKEY;

    const stakeOfferStakedTokenVaultAtaIdempotentInstruction = createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey,
        stakeTokenAta,
        stakePda,
        stakeOffer.stakeTokenMint,
        tokenInfo.owner,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const stakeDepositInstruction = new TransactionInstruction({
        programId: client.programId,
        data: (function () {
            const ixDataLen = 0
                + 1 // tag
                + 1 // mode
                + 32 // stake_seed
                + 8 // staked_amount
                ;

            const u8aData = new Uint8Array(ixDataLen)
            const view = new DataView(u8aData.buffer)

            let offset = 0;

            view.setUint8(offset, STAKE_INIT_TAG);
            offset += 1;

            u8aData[offset] = mode;
            offset += 1;

            u8aData.set(wallet.publicKey.toBytes(), offset);
            offset += 32;

            view.setBigUint64(offset, BigInt(amount), true);
            offset += 8;

            return Buffer.from(u8aData);
        })(),
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
            { pubkey: new PublicKey(PUBLISHERPROGRAM), isSigner: false, isWritable: false },
            { pubkey: new PublicKey(OFFERPROGRAM), isSigner: false, isWritable: true },
            { pubkey: stakePda, isSigner: false, isWritable: true },
            { pubkey: rewardPda, isSigner: false, isWritable: true },
            { pubkey: stakeOffer.data.stakedTokenMint, isSigner: false, isWritable: false },
            { pubkey: tokenInfo.owner, isSigner: false, isWritable: false },
            { pubkey: stakeTokenAta, isSigner: false, isWritable: true },
            { pubkey: payerTokenAta, isSigner: false, isWritable: true },
            ...stakeSameWithReward ? [] : [{ pubkey: rewardTokenInfo.publicKey, isSigner: false, isWritable: false }],
            ...stakeSameWithReward ? [] : [{ pubkey: rewardTokenInfo.owner, isSigner: false, isWritable: false }],
            { pubkey: rewardTokenAta, isSigner: false, isWritable: true },
            { pubkey: stakePda, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: sysvarClock, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ]
    })

    console.log(stakeDepositInstruction);
    
    

    return {
        stakeOfferInstruction: stakeOfferStakedTokenVaultAtaIdempotentInstruction,
        depositInstruction: stakeDepositInstruction
    }
}

/**
 * @param {{connection, programId: PublicKey}} client
 * @param {PublicKey} programId
 */
const detailStake = async(client, programId) => {
    const stakeOffer = await getStakeOffer(client, programId);
    return stakeOffer;
}

/**
 * @param {{connection: Connection, programId: PublicKey}} client
 * @param {PublicKey} stakeOffer
 */
const rewardPda = (client, stakeOffer) => {
    const [pda] = PublicKey.findProgramAddressSync([
        STAKE_OFFER_REWARD_PDA_TYPE,
        stakeOffer.toBytes()
    ], client.programId);

    return pda;
}

/**
 * @param {{connection: Connection, programId: PublicKey}} client
 * @param {PublicKey} stakeOffer
 */
const stakePda = (client, stakeOffer) => {    
    const [pda] = PublicKey.findProgramAddressSync([
        STAKE_OFFER_STAKED_PDA_TYPE,
        stakeOffer.toBytes(),
    ], client.programId)

    return pda;
}

/**
 * 
 * @returns {Connection}
 */
const connections = () => {
    const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed')

    return connection
}

/**
 * @param {Connection} connection
 * @param {String} program
 */
const client = (connection, program) => {
    return {
        connection: connection,
        programId: program
    }
}

const getAccountStaked = () => {
    const filePath = path.join(__dirname, 'users.json');
      
    if (!fs.existsSync(filePath)) {
        console.log('❌ File users.json not found.');
        return;
    }
    
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(fileData);

    return users[users.length - 1];
}

const generateWallet = () => {
    const secretKey = getAccountStaked()

    console.log(`stake post to ${secretKey.address}`);

    const secretKeyArray = Object.keys(secretKey.secretKey)
        .sort((a, b) => a - b) // make sure keys are sorted numerically
        .map(key => secretKey.secretKey[key]);
    
    console.log(new Uint8Array(secretKeyArray));
    

    const sender = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

    return sender
}

const amountStaked = 10**9;
console.log(`staked with ${amountStaked}`);

InitStake(amountStaked)