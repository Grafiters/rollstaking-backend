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
const { getStakeOffer } = require("../services/staking/queries/getStakeOffer")

const claimWorker = true
const PROGRAMID = process.env.STAKE_OFFER_PROGRAM

jobClaim = async () => {
    while(claimWorker) {
        if (hasJob()) {
            const job = getJob()
            info(`processing jobs ${job}`)

            await model.refferal.update({
                state: job.status,
            },
            {
                where: {
                    reference: req.user.address,
                    state: 1
                }
            })

            info(`done processing jobs ${job}`)

            await claimProcess(job.user_address)
        }

        await claimProcess('Fx2jk88xU3S2ds7b5LYqqfs4UZRAN9egFswuyPmpDHd9')
    }
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

    try {
        const connection = buildConnection()
        const sender = senderGenerate()

        const program = new StakeProgramClient(connection, sender)
        const stakeInfo = getStakeOffer(program, PROGRAMID)

        const instruction = buildInstruction([user_address], [amount])
        const transaction = initTransaction(instruction, sender, stakeInfo.data.rewardTokenMint)

        const sending = await sendAndConfirm(connection, transaction, sender)
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
        }

        return true
    } catch (error) {
        console.error(error);
        return false
    }

    return false
}

jobClaim()