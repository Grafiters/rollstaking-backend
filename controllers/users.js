const { where } = require('sequelize');
const model = require('../db/models');
const { addJob } = require('../workers/queue');
const { reffLevel, percentage } = require('../services/referal.service');

exports.users = async(req, res) => {
    const total = await model.refferal.sum('amount',{
        where: {
          reference: req.user.address
        }
    });

    res.send(JSON.stringify(
        {
            status: 200,
            data: {
                address: req.user.address,
                uid: req.user.uid,
                claim_reff_reward: req.user.claim_reff_reward,
                total_reff: total
            }
        }
    ));
}

exports.setRefral = async(req, res) => {
    const { referals } = req.body

    const reffCheck = await model.user.findOne({
        where: {
            uid: referals
        }
    })

    if(!reffCheck) {
        res.status(422).send(JSON.stringify(
            {
                status: 422,
                message: `your refferal id is not found`
            }
        ));
    }
    
    try {
        const update = await model.user.update(
            {
                parent_id: reffCheck.id
            },
            {
                where: {
                    address: req.user.address
                }
            }
        )

        if (update) {
            res.status(201).send(JSON.stringify(
                {
                    status: 201,
                    data: `referal has been update`
                }
            ));
        }
    } catch (error) {
        res.status(422).send(JSON.stringify(
            {
                status: 422,
                message: `your refferal id is not found ${error}`
            }
        ));
    }
}

exports.referalList = async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page * 1) * limit;

    const user = req.user
    const total = await model.refferal.count({
        where: {
          reference: user.address
        }
    });

    const reffereds = await model.refferal.findAll({
        where: {
            reference: user.address
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    })

    const transformed = [];
    if (reffereds.length > 0) {
        transformed = await Promise.all(reffereds.map(async (reff) => {
            const reff = await reffLevel(reff.user_address)
            const percent = await percentage(reff)

            return {
                user_address: reff.user_address,
                reference: reff.referemce,
                amount: reff.amount,
                reffLevel: reff,
                percent: percent,
                state: reff.state,
                created_at: reff.created_at
            }
        }))
    }

    return res.status(200).send({
        status: 200,
        data: transformed,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
    });
}

exports.claimRewardReff = async(req, res) => {
    const user = req.user
    const total = await model.refferal.count({
        where: {
          reference: user.address,
          state: 'pending'
        }
    });

    if (total > 0) {
        const job = { user_address: user.address, status: 'process', timestamp: Date.now() }
        addJob(job)
    }

    return res.status(200).send({
        status: 200,
        data: `you don't have any pending reward to claim`,
    });  
}