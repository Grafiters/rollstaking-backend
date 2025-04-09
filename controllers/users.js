exports.users = async(req, res) => {    
    res.send(JSON.stringify(
        {
            status: 200,
            message: `hi, ${req.user.address}`
        }
    ));
}