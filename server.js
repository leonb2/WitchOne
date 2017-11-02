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

app.get('/register', (request, response) => {
    if (!request.session.authenticated) {
        response.render('register', {
            'info' : "",
            'usernameValue' : ""
        });
    }
    else {
        response.redirect('/');
    }
});

app.post('/registerPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confPassword;
    let email = request.body.email;

    database.collection(DB_COLLECTION).findOne({
        'username' : username
    }, (err, result) => {   
        // If the username is still free
        if (!result) {   
            if (password == confirmPassword) {  
                // Hash password
                let hash = passwordHash.generate(password);

                // Add user to database
                let user = {'username': username, 'password': hash, 'email': email };
                database.collection(DB_COLLECTION).save(user, (err, result) => {
                    if (err) {
                        return console.log("Error while saving the user!"); 
                    }
                    console.log("User was saved & logged in!");
                });

                // Login user as well
                request.session['username'] = username;
                request.session['authenticated'] = true;     

                response.redirect('/');
            }
            // If both passwords were not equal
            else {
                response.render('register', {
                    'info' : "Passwörter stimmen nicht überein!",
                    'usernameValue' : username
                }); 
                console.log("Passwords did not match!");
            }          
        }
        // If the username is already used
        else {
            response.render('register', {
                'info' : "Nutzername ist bereits vorhanden!",
                'usernameValue' : ""
            }); 
            console.log("Username already used!");  
        }
    });
});

app.get('/createLobby', (request, response) => {
    if (request.session.authenticated) {
        response.render('createLobby');
    } 
    else {
        response.redirect('/');
    }
});

app.post('/createLobbyPost', (request, response) => {
    let lobbyPassword = request.body.lobbyPassword;
    let gameLengthMin = request.body.gameLengthMin;
    
    // socket.emit ? :D
});

