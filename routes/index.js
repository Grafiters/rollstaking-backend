const user = require('../controllers/users');
const { authVerify } = require('../services/auth.service');

module.exports = async function (fastify, opts) {
    fastify.get('/user', { preHandler: authVerify }, user.users);
};
