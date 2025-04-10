// @ts-check

const { PublicKey } = require('@solana/web3.js');

const { STAKE_INIT_EVENT } = require('../constant.js');
const { StakeEvent } = require('../event.js');
const { StakeOfferAccount, unpackStakeOfferData } = require('../state/stakeOffer.js');
const { StakeAccount, unpackStakeData } = require('../state/stake.js');
const { create, interpretU8a, u8aToDate } = require('../tools.js');


class StakeDepositEvent extends StakeEvent {
  /** @type {StakeOfferAccount} */
  stakeOffer;

  /** @type {StakeAccount} */
  stake;
}

/**
 * @param {Array<Uint8Array>} u8as
 * @returns {StakeDepositEvent}
 */
function unpackStakeDepositEvent(u8as) {
  if (u8as[0][0] !== STAKE_INIT_EVENT[0]) {
    throw new Error('Invalid PurchaseInitiatedEvent data', {
      cause: new Error(u8as.map(function (u8a) {
        return interpretU8a(u8a);
      }).join(' ')),
    });
  }

  const event = new StakeDepositEvent();

  event.epoch = Number(new DataView(new Uint8Array(u8as[1]).buffer).getBigUint64(0, true));
  event.epochStartTime = Number(new DataView(new Uint8Array(u8as[2]).buffer).getBigUint64(0, true));
  event.slot = Number(new DataView(new Uint8Array(u8as[3]).buffer).getBigUint64(0, true));
  event.date = u8aToDate(u8as[4]);
  event.stake = create(StakeAccount, {
    address: new PublicKey(u8as[5]),
    data: unpackStakeData(u8as[6]),
  });
  event.stakeOffer = create(StakeOfferAccount, {
    address: new PublicKey(u8as[7]),
    data: unpackStakeOfferData(u8as[8]),
  });

  return event;
}

module.exports = {
  unpackStakeDepositEvent,
  StakeDepositEvent
}