const port = 8000;

const express = require('express');
const app = express();

// enable path for stylings & js
app.use(express.static(__dirname + "/stylings"));
app.use(express.static(__dirname + "/js"));

const session = require('express-session');
app.use(session({
    secret: 'H4WM52017W1TCH0N3',
    resave: false,
    saveUninitialized: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

const passwordHash = require('password-hash');

const ejs = require('ejs');
app.set('view engine', 'ejs');

// --- Set up TingoDB ---
const DB_USERS = "users";
const DB_PLACESANDROLES = "placesAndRoles";
const DB_EXAMPLEQUESTIONS = "exampleQuestions";

require('fs').mkdir(__dirname + '/tingodb', (err) => {});
const db = require('tingodb')().Db;
const database = new db(__dirname + '/tingodb', {});
const ObjectID = require('tingodb')().ObjectID;

const server = app.listen(port, () => {
   console.log(`Server started and is listening to ${port}`);
});

const socketScript = require(__dirname + '/socketIO.js');
function ioRoomDeleteCallback(i) {
    rooms.splice(i, 1);
}

let placesAndRoles = database.collection(DB_PLACESANDROLES).find();
placesAndRoles = null;
let exampleQuestions = database.collection(DB_EXAMPLEQUESTIONS).find();
exampleQuestions = null;

socketScript.initialize(server, placesAndRoles, exampleQuestions, ioRoomDeleteCallback);
const rooms = [];

// Called when the user comes to the website
app.get('/', (request, response) => {
    if (!request.session.authenticated) {
        response.render('login', {
            'info' : "",
            'usernameValue' : ""
        });
    }
    else {
        response.render('home', {
            'lastThreeNames': request.session.user.lastThreeNames,
            'gameCount': request.session.user.gameCount,
            'correctGuesses': request.session.user.correctGuesses,
            'winLoseRatio': request.session.user.winLoseRatio,
            'witchCount': request.session.user.witchCount
        });
    }
});

// Called when the user clicks the button to login
app.post('/loginPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    
    // Verify password from the result that was found
    function verifyPassword(result) {
        if (passwordHash.verify(password, result.password)) 
        {        
            request.session.authenticated = true;
            request.session.user = result;

            response.redirect('/');
        }
        else {
            response.render('login', {
                'info': "Daten nicht korrekt!",
                'usernameValue' : username
            });  
        }
    }
    
    // Look in the database if theres an username like the given one
    database.collection(DB_USERS).findOne({
        'username' : username
    }, (err, result) => {
        // = If an according entry was found
        if (result) {      
            verifyPassword(result); 
        }
        else {
            // Look in the database if theres an email like the given one
            database.collection(DB_USERS).findOne({
                'email' : username
            }, (err, result) => {
                if (result) {
                    verifyPassword(result);
                }
                else {
                    response.render('login', {
                        'info': "Daten nicht korrekt!",
                        'usernameValue' : username
                    });  
                }
            }); 
        } 
    });
});

app.post('/logoutPost', (request, response) => {
    request.session.destroy();
    response.redirect('/');
});

// Called when the user clicks the button to register
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

// Called when the user clicks the button to finally register
app.post('/registerPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confPassword;
    let email = request.body.email;

    database.collection(DB_USERS).findOne({
        'username' : username
    }, (err, result) => {   
        // If the username is still free
        if (!result) {   
            if (password === confirmPassword) {  
                // Hash password
                let hash = passwordHash.generate(password);

                // Add user to database
                let user = {
                    'username': username,
                    'password': hash,
                    'email': email,
                    'lastThreeNames': [],
                    'gameCount': 0,
                    'correctGuesses': 0,
                    'winLoseRatio': 0,
                    'witchCount': 0
                };
                database.collection(DB_USERS).save(user, (err, result) => {
                    if (err) {
                        return console.log("Error while saving the user!"); 
                    }
                });
                
                // Login user as well
                request.session.user = user;
                request.session.authenticated = true;     

                response.redirect('/');
            }
            // = If both passwords were not equal
            else {
                response.render('register', {
                    'info' : "Passwörter stimmen nicht überein!",
                    'usernameValue' : username
                }); 
            }          
        }
        // = If the username is already used
        else {
            response.render('register', {
                'info' : "Nutzername ist bereits vorhanden!",
                'usernameValue' : ""
            }); 
        }
    });
});

// Called when the user clicks the button to create a lobby
app.get('/createLobby', (request, response) => {
    if (request.session.authenticated) {     
        let passwordFree;
        let password;
        
        // Generate a room code
        do {
            password = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            for (let i = 0; i < 4; i++) {
                password += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            passwordFree = true;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].password === password) {
                    passwordFree = false;
                }
            }
        } while (!passwordFree);
        
        request.session.possibleRoom = password;
        response.render('createLobby', {'password': password});
    } 
    else {
        response.redirect('/');
    }
});

// Called when the user clicks the button to finish the lobby creation
app.post('/createLobbyPost', (request, response) => {
    let lobbyPassword = request.session.possibleRoom;
    request.session.possibleRoom = null;
    let gameLengthMin = request.body.gameLengthMin;
    let gameLengthSec = gameLengthMin*60;
    
    // Look again if lobby password is already in use
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].password === lobbyPassword) {
            response.redirect("/createLobby");
            console.log("ERROR: Lobby password already in use.");
            return;
        }
    }
    
    // Create new room object and add it to the array
    room = {
        'password' : lobbyPassword,
        'gameLength' : gameLengthSec,
        'users' : [],
        'userIDs' : [],
        'adminID' : null,
        'usersReady' : 0,
        'witchID' : null,
        'votedIDs' : [],
        'votedIDsAmount' : [],
    };
    rooms.push(room);
    socketScript.addRoom(room);
    console.log("Lobby was created.")
    
    request.session.room = lobbyPassword;
    response.redirect('/lobby');
});

// Called when the user clicked the button to join a lobby
app.post('/joinLobbyPost', (request, response) => {
    let lobbyPassword = request.body.lobbyPassword;
    lobbyPassword = lobbyPassword.toUpperCase();
    
    // Look for the requested room
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].password === lobbyPassword) {
            request.session.room = lobbyPassword;
            response.redirect('/lobby');
            return;
        }
    }
    
    // If the room was not found
    response.redirect('/');
});

// Called after the user wanted to join a lobby and if the lobby was found
app.get('/lobby', (request, response) => {
    if (request.session.authenticated && request.session.room) {
        response.render('lobby', {
            'lobbyPassword' : request.session.room
        });
        request.session.room = null;
    }
    else {
        response.redirect('/');
    }
});

// Called after the user clicked the button to leave the lobby
app.get('/leaveLobby', (request, response) => {
    request.session.room = null;
    response.redirect('/');
});























