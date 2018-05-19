const application = require('../application');

async function getHouse(req, res, next) {
    try {
        const houseId = req.params.house_id;
        const house = await application.getHouse(houseId);
        res.status(200).send({data: house});
    } catch (err) {
        if (err instanceof application.HouseNotFound)
            res.status(404).send("House not found!");
        else
            next(err);
    }
}

function getUser(req, res, next) {
    if (req.user)
        res.status(200).send(req.user);
    else
        res.status(401).send(null);
}

async function revealHouse(req, res, next) {
    try {
        if (!req.user)
            return res.sendStatus(401);

        const houseId = req.body.houseId;

        if (await application.hasRevealed(req.user.Name, houseId)) {
            return res.status(200).send({success: true, btnMsg: ''});
        }
        else {
            if(req.user.Balance > 1000) {
                await application.revealHouse(req.user.Name, houseId);
                req.user = await application.increaseCredit(req.user, -1000);
                return res.status(200).send({success: true, btnMsg: ''});
            } else {
                return res.status(200).send({
                    success: false,
                    btnMsg: 'اعتبار شما برای دریافت شماره مالک/مشاور کافی نیست.'
                });
            }
        }
    } catch (err) {
        if (err instanceof application.AlreadyRevealed)
            res.status(400).send('House already revealed!');
        else if (err instanceof application.HouseNotFound)
            res.status(400).send('House not found!');
        else
            next(err);
    }
}

async function search(req, res, next) {
    try {
        const minArea = req.body.minArea;
        const buildingType = req.body.buildingType;
        const dealType = req.body.dealType;
        const maxPrice = req.body.maxPrice;
        const foundHouses = await application.search({minArea, buildingType, dealType, maxPrice});
        res.status(200).send({houses:foundHouses,success:true});
    } catch (err) {
        next(err);
    }
}

async function increaseCredit(req, res, next) {
    try {
        if (!req.user)
            return res.sendStatus(401);
        const balance = req.body.balance;
        const user = await application.increaseCredit(req.user, balance);

        console.log(user.Balance);

        res.status(200).send({balance: user.Balance, success: true, msg: "افزایش اعتبار موفقیت آمیز بود."});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    increaseCredit, search, revealHouse, getHouse, getUser
};