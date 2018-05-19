const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(__dirname + '/Homes.db');

function findById(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM Individual WHERE Username == ?', [username], function (err, user) {
            if (err)
                reject(err);
            else
                resolve(user);
        });
    });
}

function getBalance(name) {
    return new Promise((resolve, reject) => {
        db.get('SELECT Balance FROM Individual WHERE Name == ?', [name], function (err, user) {
            if (err)
                reject(err);
            else
                resolve(user);
        });
    });
}

function addBalance(name, balance) {
    return new Promise((resolve, reject) => {
        db.get('UPDATE Individual SET Balance == ? WHERE Name == ? ', [balance, name], function (err, user) {
            if (err)
                reject(err);
            else {
                // console.log("user:" + user);
                resolve(user);
            }
        });
    });
}


module.exports = {
    findById, addBalance, getBalance
};