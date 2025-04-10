const { PublicKey, Logs } = require("@solana/web3.js");

// @ts-check
class StakeEvent {
    /** @type {string} */
    signature;
  
    /** @type {PublicKey} */
    programId;
  
    /** @type {number} */
    epoch;
  
    /** @type {number} */
    epochStartTime;
  
    /** @type {number} */
    slot;
  
    /** @type {Date} */
    date;
  
    /** @type {Logs} */
    data;
}

module.exports = {
    StakeEvent
}