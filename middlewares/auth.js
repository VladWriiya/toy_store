const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req, res, next) => {
    const token = req.header('x-api-key');
    if (!token) {
        return res.status(401).json({msg: "You has no token, authorization denied"});
    }
    try{
        const decodeToken = jwt.verify(token, process.env.TOKEN_SECRET)
        req.tokenData = decodeToken;
        next()
    }
    catch(err) {
        return res.status(401).json({msg: "Token is not valid or expired"});
    }
}


exports.authAdmin = (req, res, next) => {
    const token = req.header('x-api-key');
    if (!token) {
        return res.status(401).json({msg: "You has no token, authorization denied"});
    }
    try{
        const decodeToken = jwt.verify(token, process.env.TOKEN_SECRET);
        if(decodeToken.role !== "admin") {
            return res.status(401).json({msg: "You must be admin"});
        }
        req.tokenData = decodeToken;
        next();
    }
    catch(err) {
        res.status(401).json({msg: "Token is not valid or expired"});
    }
}