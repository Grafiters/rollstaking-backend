const model = require('../db/models')

/**
 * @param {string} user_address
 * @returns {integer}
 */
const reffLevel = async (user_address, parent_id = NULL, maxLvl = 10) => {
    const query = `
        WITH RECURSIVE upline_tree AS (
            SELECT u.id, u.uid, u.address, u.parent_id, 1 AS level
            FROM users child
            JOIN users u ON u.id = child.parent_id
            WHERE child.address = :user_address

            UNION ALL

            SELECT u.id, u.uid, u.address, u.parent_id, ut.level + 1
            FROM users u
            JOIN upline_tree ut ON u.id = ut.parent_id
            WHERE ut.level < 10
        ),
        max_level AS (
            SELECT MAX(level) AS total_level FROM upline_tree
        )
        SELECT 
            ut.id,
            ut.uid,
            ut.address,
            ut.parent_id,
            (ml.total_level - ut.level + 1) AS level
        FROM upline_tree ut, max_level ml
        WHERE id = :parent_id;
    `;

    const [results] = await model.sequelize.query(query, {
        replacements: { user_address: user_address, parent_id: parent_id },
        type: model.sequelize.QueryTypes.SELECT
    });
    
    if (!results) return 0;

    return results.level ?? 0;
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