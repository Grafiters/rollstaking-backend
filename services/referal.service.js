const model = require('../db/models')

/**
 * @param {string} user_address
 * @returns {integer}
 */
const reffLevel = async (user_address) => {
    const query = `
        WITH RECURSIVE referral_tree AS (
            SELECT id, uid, address, parent_id, 0 AS level
            FROM users
            WHERE parent_id IS NULL

            UNION ALL

            SELECT u.id, u.uid, u.address, u.parent_id, rt.level + 1
            FROM users u
            JOIN referral_tree rt ON u.parent_id = rt.id
        )
        SELECT level AS user_level
        FROM referral_tree
        WHERE address = :user_address;
    `;

    const [results] = await model.sequelize.query(query, {
        replacements: { user_address },
        type: model.sequelize.QueryTypes.SELECT
    });
    

    return results.user_level ?? 0;
}

/**
 * @param {string} address
 * @returns {{address: string, parent_id: any, level: int}}
 */
const nextRefferal = async(address) => {
    const user = await model.user.findOne({
        where: {
            address: address
        }
    })

    const reffUser = await model.user.findOne({
        where: {
            id: user.parent_id
        }
    })
    
    const lvl = reffLevel(reffUser.address)

    return {
        address: reffUser.address,
        parent_id: reffUser.parent_id,
        level: lvl
    }
}

/**
 * @param {int} level
 * @returns {string}
 */
const percentage = async (level) => {
    const data = await model.config.findOne({
        where: {
            name: `Level ${level}`
        }
    })

    if (data) {
        return data.value
    }

    return '0'
}

module.exports = {
    reffLevel,
    percentage,
    nextRefferal
}