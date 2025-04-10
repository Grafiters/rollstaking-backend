const user = require('../controllers/users');
const { authVerify, userAuth } = require('../services/auth.service');

module.exports = async function (fastify, opts) {
    fastify.get('/user', { preHandler: authVerify }, user.users);
    fastify.get('/user/refferals', { preHandler: authVerify }, user.referalList);
    fastify.post('/user/refferals/claim', { preHandler: authVerify }, user.claimRewardReff);
    fastify.post('/user/refferals', { preHandler: authVerify }, user.setRefral);
};
