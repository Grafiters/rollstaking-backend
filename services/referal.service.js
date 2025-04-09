const model = require('../db/models')

/**
 * @param {string} user_address
 * @returns {integer}
 */
const reffLevel = async (user_address) => {
    const query = `
        WITH RECURSIVE referral_tree AS (
        SELECT uid, parent_id, 0 AS level
        FROM users
        WHERE address = :user_address

        UNION ALL

        SELECT u.uid, u.parent_id, rt.level + 1
        FROM users u
        JOIN referral_tree rt ON u.id = rt.parent_id
        )
        SELECT MAX(level) AS user_level FROM referral_tree;
    `;

    const [results] = await model.sequelize.query(query, {
        replacements: { user_address },
        type: model.sequelize.QueryTypes.SELECT
    });
    console.log(results);
    

    return results.user_level ?? 0;
}

/**
 * @param {int} level
 * @returns {string}
 */
const percentage = async (level) => {
    const data = await model.configs.findOne({
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
    percentage
}