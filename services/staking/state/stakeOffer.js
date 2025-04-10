const { PublicKey } = require('@solana/web3.js');

const { Account } = require('./account.js');
const { STAKE_OFFER_PDA_TYPE } = require('../constant.js');

const STAKE_OFFER_VERSION = 0;

const STAKE_OFFER_IS_INITIALIZED = 0b00000001;

/**
 * @typedef {object} StakeOfferState
 */

/**
 * @param {StakeOfferState} state
 */
function packStakeOfferState(state) {
  let bit = STAKE_OFFER_IS_INITIALIZED;
  return bit;
}

/**
 * @param {number} bit
 */
function unpackStakeOfferState(bit) {
  return {
  };
}

class StakeOfferData {
  /** @type {number} */ version;
  /** @type {number} */ slot;
  /** @type {Date} */ epochStartTime;
  /** @type {number} */ epoch;
  /** @type {Date} */ time;
  /** @type {StakeOfferState} */ state;
  /** @type {PublicKey} */ creator;
  /** @type {PublicKey} */ stakeOfferSeed;
  /** @type {PublicKey} */ publisher;
  /** @type {PublicKey} */ authority;
  /** @type {number} */ lastTxEpoch;
  /** @type {PublicKey} */ stakedTokenMint;
  /** @type {number} */ stakedAmount;
  /** @type {number} */ maxStakedAmount;
  /** @type {number} */ minDepositAmount;
  /** @type {number} */ maxDepositAmount;
  /** @type {number} */ minStakeDuration;
  /** @type {number} */ maxStakeDuration;
  /** @type {PublicKey} */ rewardTokenMint;
  /** @type {number} */ rewardPeriod;
  /** @type {number} */ rewardPercentage;
  /** @type {number} */ rewardReservedAmount;
}

class StakeOfferAccount extends /** @type {new () => Account<StakeOfferData>} */ (Account) { }

const FIXED_STAKE_OFFER_SIZE = 0
  + 1 // discriminator
  + 2 // version
  + 8 // slot
  + 8 // epoch_start_timestamp
  + 8 // epoch
  + 8 // unix_timestamp
  + 1 // state
  + 32 // creator
  + 32 // stake_offer_seed
  + 32 // publisher
  + 32 // authority
  + 8 // last_tx_epoch
  + 32 // staked_token_mint
  + 8 // staked_amount
  + 8 // max_staked_amount
  + 8 // min_deposit_amount
  + 8 // max_deposit_amount
  + 8 // min_stake_duration
  + 8 // max_stake_duration
  + 32 // reward_token_mint
  + 8 // reward_period
  + 1 // reward_percentage
  + 8 // reward_reserved_amount
  ;

/**
 * @param {StakeOfferData} stakeOffer
 */
function calcStakeOfferSpace(stakeOffer) {
  return FIXED_STAKE_OFFER_SIZE
    ;
}

/**
 * @param {Uint8Array} dataU8a
 */
function unpackStakeOfferData(dataU8a) {
  const view = new DataView(dataU8a.buffer);
  let offset = 0;

  const discriminator = dataU8a[offset];
  offset += 1;

  if (discriminator !== STAKE_OFFER_PDA_TYPE[0]) {
    throw new Error(`Invalid stake offer discriminator: ${discriminator}`);
  }

  const stakeOffer = new StakeOfferData();

  stakeOffer.version = view.getUint16(offset, true);
  offset += 2;

  stakeOffer.slot = Number(view.getBigUint64(offset, true));
  offset += 8;

  stakeOffer.epochStartTime = new Date(Number(view.getBigInt64(offset, true)) * 1000);
  offset += 8;

  stakeOffer.epoch = Number(view.getBigUint64(offset, true));
  offset += 8;

  stakeOffer.time = new Date(Number(view.getBigInt64(offset, true)) * 1000);
  offset += 8;

  stakeOffer.state = unpackStakeOfferState(view.getUint8(offset));
  offset += 1;

  stakeOffer.creator = new PublicKey(dataU8a.slice(offset, offset + 32));
  offset += 32;

  stakeOffer.stakeOfferSeed = new PublicKey(dataU8a.slice(offset, offset + 32));
  offset += 32;

  stakeOffer.publisher = new PublicKey(dataU8a.slice(offset, offset + 32));
  offset += 32;

  stakeOffer.authority = new PublicKey(dataU8a.slice(offset, offset + 32));
  offset += 32;

  stakeOffer.stakedTokenMint = new PublicKey(dataU8a.slice(offset, offset + 32));
  offset += 32;

  stakeOffer.stakedAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  stakeOffer.maxStakedAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  stakeOffer.minDepositAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  stakeOffer.maxDepositAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  stakeOffer.minStakeDuration = Number(view.getBigInt64(offset, true));
  offset += 8;

  stakeOffer.maxStakeDuration = Number(view.getBigInt64(offset, true));
  offset += 8;

  stakeOffer.rewardTokenMint = new PublicKey(dataU8a.slice(offset, offset + 32));
  offset += 32;

  stakeOffer.rewardPeriod = Number(view.getBigInt64(offset, true));
  offset += 8;

  stakeOffer.rewardPercentage = dataU8a[offset];
  offset += 1;

  stakeOffer.rewardReservedAmount = Number(view.getBigUint64(offset, true));
  offset += 8;

  return stakeOffer;
}

/**
 * @param {StakeOfferData} stakeOffer
 */
function packStakeOfferData(stakeOffer) {
  const dataLen = calcStakeOfferSpace(stakeOffer);
  const dataU8a = new Uint8Array(dataLen);
  const view = new DataView(dataU8a.buffer);
  let offset = 0;

  view.setUint8(offset, STAKE_OFFER_PDA_TYPE[0]);
  offset += 1;

  view.setUint16(offset, stakeOffer.version, true);
  offset += 2;

  view.setBigUint64(offset, BigInt(stakeOffer.slot), true);
  offset += 8;

  view.setBigInt64(offset, BigInt(stakeOffer.epochStartTime.getTime() / 1000), true);
  offset += 8;

  view.setBigUint64(offset, BigInt(stakeOffer.epoch), true);
  offset += 8;

  view.setBigInt64(offset, BigInt(stakeOffer.time.getTime() / 1000), true);
  offset += 8;

  view.setUint8(offset, packStakeOfferState(stakeOffer.state));
  offset += 1;

  dataU8a.set(stakeOffer.creator.toBytes(), offset);
  offset += 32;

  dataU8a.set(stakeOffer.stakeOfferSeed.toBytes(), offset);
  offset += 32;

  dataU8a.set(stakeOffer.publisher.toBytes(), offset);
  offset += 32;

  dataU8a.set(stakeOffer.authority.toBytes(), offset);
  offset += 32;

  view.setBigUint64(offset, BigInt(stakeOffer.lastTxEpoch), true);
  offset += 8;

  dataU8a.set(stakeOffer.stakedTokenMint.toBytes(), offset);
  offset += 32;

  view.setBigUint64(offset, BigInt(stakeOffer.stakedAmount), true);
  offset += 8;

  view.setBigUint64(offset, BigInt(stakeOffer.maxStakedAmount), true);
  offset += 8;

  view.setBigUint64(offset, BigInt(stakeOffer.minDepositAmount), true);
  offset += 8;

  view.setBigUint64(offset, BigInt(stakeOffer.maxDepositAmount), true);
  offset += 8;

  view.setBigInt64(offset, BigInt(stakeOffer.minStakeDuration), true);
  offset += 8;

  view.setBigInt64(offset, BigInt(stakeOffer.maxStakeDuration), true);
  offset += 8;

  dataU8a.set(stakeOffer.rewardTokenMint.toBytes(), offset);
  offset += 32;

  view.setBigUint64(offset, BigInt(stakeOffer.rewardPeriod), true);
  offset += 8;

  view.setUint8(offset, stakeOffer.rewardPercentage);
  offset += 1;

  return dataU8a;
}

module.exports = {
  STAKE_OFFER_VERSION,
  STAKE_OFFER_IS_INITIALIZED,
  packStakeOfferState,
  unpackStakeOfferState,
  StakeOfferData,
  StakeOfferAccount,
  FIXED_STAKE_OFFER_SIZE,
  calcStakeOfferSpace,
  unpackStakeOfferData,
  packStakeOfferData
}