const userDataAccess = require('../dataAccess/user');
const houseDataAccess = require('../dataAccess/house');
const revealedHouseDataAccess = require('../dataAccess/viewedHouse');
const api = require('../utils/api');

async function search(searchQuery) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await houseDataAccess.search(searchQuery);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

class HouseNotFound {
};

class AlreadyRevealed {
};

async function revealHouse(userId, houseId) {
    return new Promise(async (resolve, reject) => {
        try {
            await getHouse(houseId);
            if (await revealedHouseDataAccess.findById(houseId, userId))
                return reject(new AlreadyRevealed());
            await revealedHouseDataAccess.addViewedHouse(houseId, userId);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function hasRevealed(userId, houseId) {
    return revealedHouseDataAccess.findById(userId, "خانه به دوش");
}

async function getHouse(houseId) {
    return new Promise(async (resolve, reject) => {
        try {
            // let house = await houseDataAccess.findById(houseId);

            console.log("houseID:" + houseId);
            const house = await api.fetchHouseDetail(houseId);

            let sellPrice = 0, basePrice = 0, rentPrice = 0;
            if (house.dealType == 0) {
                sellPrice = house.price.sellPrice;
            }
            else {
                basePrice = house.price.basePrice;
                rentPrice = house.price.rentPrice;
            }

            houseDataAccess.updateById(houseId, sellPrice, basePrice, rentPrice);
            if (!house)
                return reject(new HouseNotFound());
            resolve(house);
        } catch (err) {
            reject(err);
        }
    });
}

async function increaseCredit(user, amount) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await api.pay(user.Name, amount);
            if(result === "OK" || amount === -1000) {
                const sum = parseInt(user.Balance) + parseInt(amount);
                await userDataAccess.addBalance(user.Name, sum);
                console.log("balance: " + await userDataAccess.getBalance(user.Name));
                resolve(user);
            }else{
                reject();
            }
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    increaseCredit, getHouse, revealHouse, search, hasRevealed, AlreadyRevealed, HouseNotFound
};
