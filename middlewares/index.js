const jwt = require('jsonwebtoken');
const config = require('./config');
const userDataAccess = require('../dataAccess/user');
const logger = {log: console.log};

class AuthorizationError {
    constructor(err) {
        this.error = err;
    }
}

async function authenticate(req, res, next) {
    let token;
    if (req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer ", "");
    } else {
        return next(new AuthorizationError('Authorization header not found!'));
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, config.authorizationTokenSecret);
        let user = await userDataAccess.findById(decodedToken.username);
        delete user.Password;
        req.user = user;
        return next();
    } catch (err) {
        return next(err);
    }
}

async function login(req, res, next) {
    try {
        const {username, password} = req.body;
        const user = await userDataAccess.findById(username);
        if (!user) {
            res.status(401).send('Invalid username or password');
            return next();
        }
        if (user.Password != password) {
            res.status(401).send('Invalid username or password');
            return next();
        }
        const token = jwt.sign({username: user.Username}, config.authorizationTokenSecret, {expiresIn: config.authorizationTokenExpiresLength});
        res.json({token, success: true});
        return next();
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

function errorHandler(err, req, res, next) {
    logger.log(err);
    if (err instanceof AuthorizationError) {
        res.sendStatus(401);
    } else {
        res.sendStatus(500);
    }
}

module.exports = {
    login, authenticate, errorHandler
};
