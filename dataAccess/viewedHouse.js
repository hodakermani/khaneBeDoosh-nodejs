const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(__dirname + '/Homes.db');

function findById(houseId, parentId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM Viewed WHERE HouseID == ? AND ParentID == ?', [houseId, parentId], function (err, record) {
            if (err)
                reject(err);
            else {
                if (record)
                    resolve(true);
                else
                    resolve(false);
            }

        });
    });
}

function addViewedHouse(houseId, individualId) {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'INSERT INTO Viewed VALUES (?, ?, ?)';
        db.run(sqlQuery, [houseId, "خانه به دوش", individualId], function (err, result) {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
}

module.exports = {
    findById, addViewedHouse
};