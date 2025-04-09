const { PublicKey } = require("@solana/web3.js");
const nacl = require('tweetnacl');
const { decodeData } = require("./ecnryption.service");

const authVerify = async (req, res) => {
    const userSignature = req.headers[`x-signature`]
    if (!userSignature) {
        return res.status(401).send({
            status: false,
            message: `auth headers x-signature doesn't exists`
        })
    }

    try {
        const decode = decodeData(userSignature);
        const verify = verifySolanaSignature(decode.address, decode.message, decode.signature);
        if (verify) {
            req.user = {
                address: decode.address,
                signature: decode.signature,
            };
        }
    } catch (error) {
        return res.status(401).send({
            status: false,
            message: `signature cannot decode cause ${error}`
        })
    }
}

/**
 * verifikasi solana signature pengganti jwt auth
 * @param {string} address
 * @param {string} message
 * @param {string} signature
 * @returns {boolean}
 */
const verifySolanaSignature = async (address, message, signature) => {
    try {
        message = new TextEncoder().encode(message)
        signature = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        const publicKey = new PublicKey(address);
        
        const isValid = nacl.sign.detached.verify(message, signature, publicKey.toBytes());
        return isValid;
    } catch (error) {
        console.error("Gagal verifikasi:", error);
        return false;
    }
}

module.exports = {
    verifySolanaSignature,
    authVerify
};