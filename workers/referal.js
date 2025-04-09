const { info } = require("console")
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

const claimWorker = true

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
                    state: 'pending'
                }
            })

            info(`done processing jobs ${job}`)

            await claimProcess(job.user_address)
        }
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
            state: 'process',
        }
    })

    try {
        const connection = buildConnection()
        const sender = senderGenerate()
        const instruction = buildInstruction([user_address], [amount])
        const transaction = initTransaction(instruction, sender)

        const sending = await sendAndConfirm(connection, transaction, sender)
        if (isValidSignature(sending)) {
            await model.refferal.update({
                    state: 'claimed'
                },
                {
                    where: {
                        reference: user_address,
                        state: 'process'
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

claimProcess(data)