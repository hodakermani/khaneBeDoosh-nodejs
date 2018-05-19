const sqlite3 = require('sqlite3').verbose();
const API = require('../utils/api');

function addHouses() {
    const db = new sqlite3.Database(__dirname + '/Homes.db');
    return new Promise(async (resolve, reject) => {
        try {
            let housesList = await API.fetchHouses();
            for (let house of housesList.data) {
                await add(house, housesList.expireTime);
            }
            resolve();
            db.close();
        } catch (err) {
            reject(err);
        }
    });
}

// add one house
function add(house, expires) {
    const db = new sqlite3.Database(__dirname + '/Homes.db');

    let sellPrice = 0, basePrice = 0, rentPrice = 0;
    if (house.dealType === 0) {
        sellPrice = house.price.sellPrice;
    }
    else {
        rentPrice = house.price.rentPrice;
        basePrice = house.price.basePrice;
    }

    return new Promise((resolve, reject) => {
        const sqlQuery = 'INSERT INTO House VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sqlQuery, [
            house.id,
            "خانه به دوش",
            house.area,
            house.buildingType,
            house.imageURL,
            "", //description
            house.dealType,
            "", //phone
            expires,
            house.address,
            sellPrice,
            basePrice,
            rentPrice
        ], function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        db.close();
    });
}

function search(searchQuery) {
    const db = new sqlite3.Database(__dirname + '/Homes.db');
    let sqlQuery = 'SELECT * from House WHERE ';

    if (searchQuery.minArea !== null) {
        sqlQuery += 'Area >= $minArea ';
        searchQuery['$minArea'] = searchQuery.minArea;
    }
    delete searchQuery.minArea;


    if (searchQuery.maxPrice !== null && searchQuery.maxPrice !== "maxPrice") {
        sqlQuery += 'AND (SellPrice < $maxPrice OR RentPrice < $maxPrice) ';
        searchQuery['$maxPrice'] = searchQuery.maxPrice;
    }
    delete searchQuery.maxPrice;


    if (searchQuery.buildingType !== null && searchQuery.buildingType !== "هیچی") {
        sqlQuery += 'AND buildingType == $homeType ';
        searchQuery['$homeType'] = searchQuery.buildingType;
    }
    delete searchQuery.buildingType;


    if (searchQuery.dealType !== null && searchQuery.dealType !== "هیچی") {
        sqlQuery += 'AND dealType > $dealType ';
        searchQuery['$dealType'] = searchQuery.dealType;
    }
    delete searchQuery.dealType;

    return new Promise((resolve, reject) => {
        db.all(sqlQuery, searchQuery, async function (err, houses) {
            if (err)
                return reject(err);
            let expired = false;
            houses.forEach((house) => {
                if (Date.now() > house.expires)
                    expired = true;
            });
            if (expired) {
                try {
                    await updateExpired();
                    let result = await search(searchQuery);
                    return resolve(result);
                } catch (err) {
                    return reject(err);
                }
            }
            else
                resolve(houses);
        });
        db.close();
    });
}

function updateExpired() {
    return new Promise(async (resolve, reject) => {
        try {
            await removeExpired();
            await addHouses();
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function removeExpired() {
    const db = new sqlite3.Database(__dirname + '/Homes.db');
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM House WHERE ExpireTime < ? ", Date.now(), function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
        db.close();
    });
}

function findById(id) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(__dirname + '/Homes.db');
        db.get('SELECT * FROM House WHERE ID == ? ', [id], function (err, house) {
            if (err)
                reject(err);
            else
                resolve(house);
            db.close();
        });
    });
}

function updateById(id, sellPrice, basePrice, rentPrice) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(__dirname + '/Homes.db');
        const sql = 'UPDATE House SET SellPrice == ?, BasePrice == ?, RentPrice == ? WHERE ID == ? ';

        db.get(sql, [sellPrice, basePrice, rentPrice, id], function (err, house) {
            if (err)
                reject(err);
            else
                resolve(house);
            db.close();
        });
    });
}

try {
    // addHouses();
} catch (err) {

}

module.exports = {
    findById, updateById, search, updateExpired
};