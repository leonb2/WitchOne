// --- SETUP ---

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


// --- Set up TingoDB ---
const DB_COLLECTION = "users";

require('fs').mkdir(__dirname + '/tingodb', (err) => {});

const db = require('tingodb')().Db;
const database = new db(__dirname + '/tingodb', {});
const ObjectID = require('tingodb')().ObjectID;
// ---

const server = app.listen(port, () => {
   console.log(`Server started and is listening to ${port}`);
});

/// ---

app.get('/', (request, response) => {
    
    if (!request.session.authenticated) {
        response.render('login', {
            'info' : "",
            'usernameValue' : ""
        });
    }
    else {
        response.render('home');
    }
});

app.post('/loginPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    
    database.collection(DB_COLLECTION).findOne({
        'username' : username
    }, (err, result) => {
        if (result) {      
            if (passwordHash.verify(password, result.password)) {        
                request.session['authenticated'] = true;
                request.session['username'] = username;

                response.redirect('/');
                console.log("Login successful!");
            }
            else {
                response.render('login', {
                    'info': "Daten nicht korrekt!",
                    'usernameValue' : username
                });  
            } 
        }
        else {
            response.render('login', {
                'info': "Daten nicht korrekt!",
                'usernameValue' : username
            });  
        } 
    });
});