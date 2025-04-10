const { PublicKey } = require("@solana/web3.js");
const { Connection } = require("@solana/web3.js");

class StakeProgramClient {
    /**
     * 
     * @param {Connection} connection 
     * @param {PublicKey} programId 
     */
    constructor(connection, programId){
        this.connection = connection;
        this.programId = programId;
    }
}

module.exports = {
    StakeProgramClient
}