const { PublicKey } = require("@solana/web3.js");
const { StakeProgramClient } = require("../program");
const { StakeOfferAccount, unpackStakeOfferData } = require("../state/stakeOffer");
const { create } = require("../tools");

/**
 * @param {StakeProgramClient} client
 * @param {PublicKey} programId
 */
getStakeOffer = async(client, programId) => {
    const accountInfo = await client.connection.getAccountInfo(programId, {
        commitment: 'finalized',
    });

    if (accountInfo === null) {
        return null;
    }
    
    const stakeOffer = create(StakeOfferAccount, {
        address: programId,
        info: accountInfo,
        data: unpackStakeOfferData(Uint8Array.from(accountInfo.data)),
    });

    return stakeOffer;
}

module.exports = {
    getStakeOffer
}