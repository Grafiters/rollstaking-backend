require('../config/environtment.js');
const dotenv = require('dotenv');
dotenv.config();

const { PublicKey } = require('@solana/web3.js')
const {
    buildConnection
} = require('../services/solana.service')
const { getStakeOffer } = require('../services/staking/queries/getStakeOffer')
const { StakeProgramClient } = require('../services/staking/program')
const { createPublisherStakeEventSubscription } = require('../services/staking/subcription');
const { StakeDepositEvent } = require('../services/staking/events/stakeDepositEvent');
const { info } = require('console');
const { percentage, reffLevel, nextRefferal } = require('../services/referal.service');
const model = require('../db/models');
const { dbConnection } = require('./config.js');
const { Op } = require('sequelize');

const LISTEN = true

const OFFERPROGRAM = process.env.STAKE_OFFER_PROGRAM
const PUBLISHERPROGRAM = process.env.STAKE_PUBLISHER_PROGRAM
const PROGRAMID = process.env.STAKE_PROGRAM_ID

init = async () => {
    const connection = buildConnection()
    const offerId = new PublicKey(OFFERPROGRAM)

    const stakeProgram = new StakeProgramClient(connection, new PublicKey(PROGRAMID))

    const offer = await getStakeOffer(stakeProgram, offerId)
    
    return offer;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const runListener = async() => {
    await dbConnection()
    // this.stakeOfferPda = await init()
    
    while(LISTEN) {
        // console.log(`waiting process`);
        // const event = fetchEvent()
        // console.log(`process done`);

        await sleep(3000);
        console.log(`waiting process reward`);
        await processStakeReffReward()
        console.log(`done process reward`);
    }
}

fetchEvent = () => {
    const connection = buildConnection()
    const programId = new PublicKey(PROGRAMID)
    const stakeProgram = new StakeProgramClient(connection, programId)

    createPublisherStakeEventSubscription(stakeProgram, new PublicKey(PUBLISHERPROGRAM), async function (event) {
        const isStakeDepositEvent = event && event.constructor && event.constructor.name === 'StakeDepositEvent';
        const isStakeClaimEvent = event && event.constructor && event.constructor.name === 'StakeClaimEvent';
        const isStakeUnstakeEvent = event && event.constructor && event.constructor.name === 'StakeUnstakeEvent';

        if (isStakeDepositEvent) {
            console.log(`deposit event`);
            await processToDatabase(event.stake, event.data.signature)
            console.log(`deposit event`);
        }else if (isStakeClaimEvent) {
            console.log(`deposit claim`);
            await updateForDatabase(event.stake, {
                state: 'claimed',
                claimed: event.stake.data.claimedAmount
            })
            console.log(`deposit claim`);
        } else if (isStakeUnstakeEvent) {
            console.log(`deposit unstake`);
            await updateForDatabase(event.stake, {
                state: 'unstake',
            })
            console.log(`deposit unstake`);
        }
    });
}

const processStakeReffReward = async () => {
    const stakeOn = await model.stake.findAll({
        where: {
            state: 'initialized'
        }
    })

    stakeOn.map(async (stake) => {
        await calculateReff(stake)
    })
}

/**
 * @param {StakeDepositEvent} event
 * @param {string} signature
 * @param {any} stakeOffer
 * @returns {boolean}
 */
processToDatabase = async (event, signature) => {
    let state = 'initialized'
    if (event.data.state & 2) {
        state = 'unstake'
    }

    const stakeParam = {
        signature: signature,
        user_address: event.data.staker.toString(),
        unix_timestamp: new Date(this.stakeOfferPda.data.time).getTime(),
        staked_amount: event.data.stakedAmount,
        claimed: event.data.claimed_amount,
        epoach: event.data.epoach,
        epoach_start_time: new Date(event.data.epochStartTime).getTime(),
        state: state
    }

    try {
        const signatureCheck = await model.stake.findOne({
            where: {
                signature: signature
            }
        })
        if (signatureCheck) return;
    
        const record = await model.stake.create(stakeParam)
        if(record) {
            info(`record stake success from user ${stakeParam.user_address} with amount ${stakeParam.staked_amount}`)
            return true
        }
    
        return false
    } catch (error) {
        console.error(`errored on process to Database => `, error);
    }
}

/**
 * @param {any} stake
 */
const calculateReff = async (stake) => {
    let current_user = await model.user.findOne({
        where: {
            address: stake.user_address
        }
    })

    const maxLevel = await model.config.count({
        where: {
            name: {
                [Op.like]: `Level%`
            }
        }
    })
    
    let lvl = 0    

    while(current_user && current_user.parent_id && lvl <= maxLevel) {
        if (!current_user.parent_id) break;
        const parent_user = await model.user.findOne({
            where: {
                id: current_user.parent_id
            }
        })
        const level = await reffLevel(stake.user_address, parent_user.id)
        const percen = await percentage(level)
        
        const rewardCal = rewardCalculate(stake, percen)
        const reward = parsingAmount(rewardCal.toString())
        
        let [reff, created] = await model.refferal.findOrCreate({
            where: {
                stake_id: stake.id,
                user_address: stake.user_address,
                reference: parent_user.address,
                state: 0
            },
            defaults: {
                stake_id: stake.id,
                user_address: stake.user_address,
                reference: parent_user.address,
                state: 0,
                amount: reward
            }
        })

        if (!created) {
          reff = await model.refferal.update({ amount: reward }, {
            where: {
                stake_id: stake.id,
                user_address: stake.user_address,
                reference: parent_user.address,
                state: 0
            }
        })}

        lvl = level;
        current_user = parent_user
    }
}

/**
 * @param {any} stake
 * @param {string} percentReffs
 */
const rewardCalculate = (stake, percentReffs) => {
    const time = new Date(stake.created_at).getTime()
    const reward_percentage = this.stakeOfferPda.data.rewardPercentage
    const amount_stake = stake.staked_amount
    const reward_period = this.stakeOfferPda.data.rewardPeriod
    const current_timestamp = Date.now()

    const stakeDuration = Math.floor(current_timestamp - time) / 1000;
    const numPeriod = Math.floor(stakeDuration / reward_period);
    
    const rewardEachPeriod = Math.floor((Number(amount_stake) * reward_percentage) / 100)

    const acumulatedReward = numPeriod * rewardEachPeriod

    const reffReward = acumulatedReward * (parseFloat(percentReffs) / 100);

    return reffReward;
}

/**
 * @param {StakeDepositEvent} event
 * @param {any} update
 * @returns {boolean}
 */
updateForDatabase = async (event, update) => {
    const stake = await model.stake.findOne({
        where: {
            user_address: event.data.staker.toString(),
            state: 'initialized'
        }
    })

    if (!stake) return false;

    const updates = await model.stake.update(update,{
        where: {
            user_address: event.data.staker.toString(),
            state: 'initialized'
        }
    })

    if(!updates) return false;
    return true
}

/**
 * @param {string} amount
 * @returns {Number}
 */
parsingAmount = (amount) => {
    return (Number(amount) / (10**9))
}

runListener()