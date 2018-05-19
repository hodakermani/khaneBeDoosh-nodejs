const express = require('express');
const bodyParser = require('body-parser');
const { authenticate, login, errorHandler}  = require('./middlewares');
const presentation = require('./presentation');

const app = express();

app.use(bodyParser.json());

app.post('/auth/login', login);

app.post('/secure/api/addBalance', authenticate, presentation.increaseCredit);

app.post('/api/search', presentation.search);

app.post('/secure/api/houseDetailsGetPhone', authenticate, presentation.revealHouse);

app.get('/api/houseDetails/:house_id', presentation.getHouse);

app.get('/secure/api/getBalance', authenticate, presentation.getUser);

app.use(errorHandler);

app.listen(4000);