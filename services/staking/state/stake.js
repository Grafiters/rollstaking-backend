const { PublicKey } = require('@solana/web3.js');

const { Account } = require('./account.js');
const { STAKE_PDA_TYPE } = require('../constant.js');

const STAKE_VERSION = 0;

const STAKE_IS_INITIATED = 0b00000001;
const STAKE_IS_UNSTAKED = 0b00000010;

/**
 * @typedef {object} StakeState
 */

class StakeData {
  /** @type {number} */ version;
  /** @type {number} */ slot;
  /** @type {Date} */ epochStartTime;
  /** @type {number} */ epoch;
  /** @type {Date} */ time;
  /** @type {StakeState} */ state;
  /** @type {PublicKey} */ publisher;
  /** @type {PublicKey} */ stakeOffer;
  /** @type {PublicKey} */ staker;
  /** @type {PublicKey} */ stakeSeed;
  /** @type {number} */ stakedAmount;
  /** @type {number} */ claimedAmount;
}

class StakeAccount extends /** @type {new () => Account<StakeData>} */ (Account) { }

const FIXED_STAKE_PDA_DATA_LEN = 0
  + 1 // discriminator
  + 2 // version
  + 8 // slot
  + 8 // epoch_start_timestamp
  + 8 // epoch
  + 8 // unix_timestamp
  + 1 // state
  + 32 // publisher
  + 32 // stake_offer
  + 32 // staker
  + 32 // stake_seed
  + 8 // staked_amount
  + 8 // claimed_amount
  ;


/**
 * @param {StakeData} stake
 */
function calcStakeDataSpace(stake) {
  return FIXED_STAKE_PDA_DATA_LEN
    ;
}

/**
 * @param {Uint8Array} u8a
 */
function unpackStakeData(u8a) {
  const stake = new StakeData();

  const view = new DataView(u8a.buffer);
  let offset = 0;

  const discriminator = u8a[offset];
  offset += 1;

  if (discriminator !== STAKE_PDA_TYPE[0]) {
    throw new Error(`Invalid stake discriminator: ${discriminator}`);
  }

  stake.version = view.getUint16(offset, true);
  offset += 2;

  stake.slot = Number(view.getBigUint64(offset, true));
  offset += 8;

  stake.epochStartTime = new Date(Number(view.getBigInt64(offset, true)) * 1000);
  offset += 8;

  stake.epoch = Number(view.getBigUint64(offset, true));
  offset += 8;

  stake.time = new Date(Number(view.getBigInt64(offset, true)) * 1000);
  offset += 8;

  stake.state = view.getUint8(offset);
  offset += 1;

  stake.publisher = new PublicKey(u8a.slice(offset, offset + 32));
  offset += 32;

  stake.stakeOffer = new PublicKey(u8a.slice(offset, offset + 32));
  offset += 32;

  stake.staker = new PublicKey(u8a.slice(offset, offset + 32));
  offset += 32;

  stake.stakeSeed = new PublicKey(u8a.slice(offset, offset + 32));
  offset += 32;

  stake.stakedAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  stake.claimedAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  return stake;
}

/**
 * @param {StakeData} stake
 */
function packStakeData(stake) {
  const u8a = new Uint8Array(calcStakeDataSpace(stake));
  const view = new DataView(u8a.buffer);
  let offset = 0;

  view.setUint8(offset, STAKE_PDA_TYPE[0]);
  offset += 1;

  view.setUint16(offset, stake.version, true);
  offset += 2;

  view.setBigUint64(offset, BigInt(stake.slot), true);
  offset += 8;

  view.setBigInt64(offset, BigInt(stake.epochStartTime.getTime() / 1000), true);
  offset += 8;

  view.setBigUint64(offset, BigInt(stake.epoch), true);
  offset += 8;

  view.setBigInt64(offset, BigInt(stake.time.getTime() / 1000), true);
  offset += 8;

  view.setUint8(offset, stake.state | STAKE_IS_INITIATED);
  offset += 1;

  u8a.set(stake.publisher.toBuffer(), offset);
  offset += 32;

  u8a.set(stake.stakeOffer.toBuffer(), offset);
  offset += 32;

  u8a.set(stake.staker.toBuffer(), offset);
  offset += 32;

  u8a.set(stake.stakeSeed.toBuffer(), offset);
  offset += 32;

  view.setBigUint64(offset, BigInt(stake.stakedAmount), true);
  offset += 8;

  view.setBigUint64(offset, BigInt(stake.claimedAmount), true);
  offset += 8;

  return u8a;
}

module.exports = {
  STAKE_VERSION,
  STAKE_IS_INITIATED,
  STAKE_IS_UNSTAKED,
  StakeData,
  StakeAccount,
  calcStakeDataSpace,
  unpackStakeData,
  packStakeData
}