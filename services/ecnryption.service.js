const CryptoJS = require("crypto-js");
const SECRETKEY = process.env.SECRETKEY || 'superSecret123!*';

/**
 * encode data solana signature
 * @param {string} message
 * @param {string} address
 * @param {string} signature
 * @returns {string}
 */
const encodeData = (message, address, signature) => {
    const timestamp = Math.floor(Date.now() / 1000); 
    const data = JSON.stringify({ message, address, signature, timestamp });
    const encrypted = CryptoJS.AES.encrypt(data, SECRETKEY).toString();

    return encrypted;
}

/**
 * decode data solana signature
 * @param {string} auth_signature
 * @returns { {address: string, message: string, signature: string} } decode data
 */
const decodeData = (auth_signature) => {
    try {        
        const bytes = CryptoJS.AES.decrypt(auth_signature, SECRETKEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        const { message, address, signature } = JSON.parse(decrypted);
        return { address, message, signature };
    } catch (error) {
        return error
    }

}

module.exports = {
    encodeData,
    decodeData
}