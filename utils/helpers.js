exports.validate = (req, res, next) => {
    if (JSON.validater(req.body)) {
        return next()
    } else {
        return res.status(500).json({
            status: 'failed'
        })
    }
}