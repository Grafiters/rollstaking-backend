const { info } = require("console")
require('../config/environtment.js');
const { hasJob, getJob } = require("./queue")
const { reffLevel } = require('../services/referal.service')
const model = require('../db/models')
const {
    buildConnection,
    buildInstruction,
    initTransaction,
    sendAndConfirm,
    senderGenerate,
    isValidSignature
} = require('../services/solana.service')
const { where } = require("sequelize")
const { StakeProgramClient } = require("../services/staking/program")
const { getStakeOffer } = require("../services/staking/queries/getStakeOffer");
const { PublicKey } = require("@solana/web3.js");

const claimWorker = true
const OFFERPROGRAM = process.env.STAKE_OFFER_PROGRAM
const PROGRAMID = process.env.STAKE_PROGRAM_ID

jobClaim = async () => {
    while(claimWorker) {
        console.log(`processing to claim reward`);
    
        const [jobs] = await model.sequelize.query(`
            SELECT DISTINCT reference
            FROM "refferals"
            WHERE state = 1`
        );

        for (const job of jobs) {
            await claimProcess(job.reference)
        }
        
        console.log(`processing to next claim reward`);
        await sleep(5000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {string} user_address
 * @returns {boolean}
 */
const claimProcess = async (user_address) => {
    const amount = await model.refferal.sum('amount', {
        where: {
            reference: user_address,
            state: 1,
        }
    })

    if(amount <= 0) return;

    try {
        const connection = buildConnection()
        const sender = senderGenerate()

        const program = new StakeProgramClient(connection, new PublicKey(PROGRAMID))
        const stakeInfo = await getStakeOffer(program, new PublicKey(OFFERPROGRAM))

        const instruction = buildInstruction([user_address], [amount])
        const transaction = await initTransaction(connection, instruction, sender, stakeInfo.data.rewardTokenMint)


        const sending = await sendAndConfirm(connection, transaction, sender, user_address)
        
        if (isValidSignature(sending)) {
            await model.refferal.update({
                    state: 3
                },
                {
                    where: {
                        reference: user_address,
                        state: 1
                    }
                }
            )
            
            await model.user.update({
                claim_reff_reward: amount
            },
            {
                where: {
                    address: user_address
                }
            })
        }

        return true
    } catch (error) {
        console.error(error);
        return false
    }
}

jobClaim()