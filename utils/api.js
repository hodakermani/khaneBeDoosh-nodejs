const request = require('request');
const config = require('./config');

function fetchHouses() {
  return new Promise((resolve,reject) => {
      request(config.api, {json: true}, function (err, response, body) {
      if(err)
        return reject(err);
      else
        return resolve(body);
    });
  });
}

function fetchHouseDetail(houseId) {
    return new Promise((resolve,reject) => {
        const url = config.api + "/" + houseId;
        console.log('url:' + url);

        request(url, {json: true}, function (err, response, body) {
            if(err)
                return reject(err);
            else
                return resolve(body.data);
        });
    });
}

function pay(userId, value) {
    return new Promise((resolve,reject) => {
        request({method: 'POST', uri: config.bankApi,multipart:[{'content-type': 'application/json', body:JSON.stringify({userId, value})}]}, function (err, response, body) {
            if(err)
                return reject(err);
            else
                return resolve(JSON.parse(body).result);
        });
    });
}



module.exports = {
  fetchHouses, fetchHouseDetail, pay
};