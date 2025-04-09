/**
 * 
 * @param {int} length 
 * @returns {string}
 */
const GenerateLowercaseUID = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let uid = '';
    for (let i = 0; i < length; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return uid;
}


module.exports = {
  GenerateLowercaseUID
};