const { where } = require('sequelize');
const model = require('../db/models');
const { addJob } = require('../workers/queue');
const { reffLevel, percentage } = require('../services/referal.service');

exports.users = async(req, res) => {
    const sum = await model.refferal.sum('amount',{
        where: {
          reference: req.user.address
        }
    });

    let reffs = null
    if (req.user.parent_id) {
        const reffUser = await model.user.findOne({
            where: {
                id: req.user.parent_id
            }
        })

        reffs = reffUser.address
    }

    let total = "0.0"
    if (sum) {
        total = sum
    }

    return res.send({
        status: 200,
        data: {
            address: req.user.address,
            uid: req.user.uid,
            refferals: reffs,
            claim_reff_reward: req.user.claim_reff_reward,
            total_reff: total
        }
    });
}

exports.setRefral = async(req, res) => {
    const { referals } = req.body

    if (!referals) {
        return res.status(422).send({
            status: 422,
            message: `referals must be exists`
        });
    }

    const reffCheck = await model.user.findOne({
        where: {
            uid: referals
        }
    })

    if(!reffCheck ) {
        return res.status(422).send({
            status: 422,
            message: `your refferal id is not found`
        });
    }
    
    if(String(referals).toLowerCase() == String(req.user.uid).toLowerCase()) {
        return res.status(422).send({
            status: 422,
            message: `cannot use your reff code`
        });
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
            return res.status(201).send({
                status: 201,
                data: `referal has been update`
            });
        }
    } catch (error) {
        return res.status(422).send({
            status: 422,
            message: `your refferal id is not found ${error}`
        });
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
        page: page,
        limit: limit,
        where: {
            reference: user.address
        },
        order: [['createdAt', 'DESC']]
    })

    let transformed = [];
    if (reffereds.length > 0) {
        transformed = await Promise.all(reffereds.map(async (reff) => {
            const refs = await reffLevel(reff.user_address, user.id)
            const percent = await percentage(refs)

            let state = 'pending'
            if (reff.state == 1) {
                state = 'process';
            } else if (reff.state == 3) {
                state = 'claimed';
            }else if (reff.state == -1) {
                state = 'failed'
            }

            const refUser = await model.user.findOne({
                where: {
                    address: reff.reference
                }
            })

            return {
                user_address: reff.user_address,
                reff_uid: refUser.uid,
                reference: reff.reference,
                amount: reff.amount,
                reffLevel: refs,
                percent: percent,
                state: state,
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
          state: 0
        }
    });

    if (total > 0) {
        await model.refferal.update({
            state: 1,
        },
        {
            where: {
                reference: req.user.address,
                state: 0
            }
        })
    }

    return res.status(200).send({
        status: 200,
        data: `reward success to process`,
    });  
}