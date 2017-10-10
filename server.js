const port = 8000;

const express = require('express');
const app = express();

// enable path for stylings
app.use(express.static(__dirname + "/stylings"));

const session = require('express-session');
app.use(session({
    secret: 'example', //replace with hardcore hash or so
    resave: false,
    saveUninitialized: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

const passwordHash = require('password-hash');

app.set('view engine', 'ejs');

/*
// --- Set up TingoDB ---
const DB_COLLECTION = "users";

require('fs').mkdir(__dirname + '/tingodb', (err) => {});

const db = require('tingodb')().Db;
const database = new db(__dirname + '/tingodb', {});
const ObjectID = require('tingodb')().ObjectID;
// ---
*/

app.listen(port, () => {
   console.log(`Server started and is listening to ${port}`);
});

app.get('/', (request, response) => {
    response.render('index');
});