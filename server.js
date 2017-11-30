const port = 8000;

const express = require('express');
const app = express();

// enable path for stylings, js & images
app.use(express.static(__dirname + "/stylings"));
app.use(express.static(__dirname + "/js"));
app.use(express.static(__dirname + "/img"));
app.use("/img", express.static(__dirname + '/img'));

const session = require('express-session');
app.use(session({
    secret: 'H4WM52017W1TCH0N3',
    resave: false,
    saveUninitialized: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

const passwordHash = require('password-hash');

app.set('view engine', 'ejs');

const fs = require('fs');

// --- Set up TingoDB ---
const DB_USERS = "users";
const DB_PLACESANDROLES = "placesAndRoles";
const DB_EXAMPLEQUESTIONS = "exampleQuestions";

fs.mkdir(__dirname + '/tingodb', (err) => {});
const db = require('tingodb')().Db;
const database = new db(__dirname + '/tingodb', {});
const ObjectID = require('tingodb')().ObjectID;

const server = app.listen(port, () => {
   console.log(`Server started and is listening to ${port}`);
});

const databaseContent = require(__dirname + '/js/databaseContent.js');

const socketScript = require(__dirname + '/socketIO.js');
function ioRoomDeleteCallback(i) {
    rooms.splice(i, 1);
}
function updateUserStatisticCallback(request, data) {
    let user = request.session.user;
    
    if (user.lastThreeNames.length < 3) {
        user.lastThreeNames.push(data.name);
    }
    else {
        if (user.lastThreeNames.indexOf(data.name) == -1) {
            user.lastThreeNames[2] = user.lastThreeNames[1];
            user.lastThreeNames[1] = user.lastThreeNames[0]; 
            user.lastThreeNames[0] = data.name;
        }
    }
    user.gameCount++;
    if (data.rightVote) {
        user.correctGuesses++;
    }
    if (data.won) {
        user.winCount++;
    }
    if (data.isWitch) {
        user.witchCount++;
    }
    
    database.collection(DB_USERS).update({'username': user.username}, user);   
}
socketScript.initialize(server, ioRoomDeleteCallback, updateUserStatisticCallback);
const rooms = [];

let placesAndRoles;
database.collection(DB_PLACESANDROLES).find().toArray((err, result) => {
    if (result) {
        placesAndRoles = result;
        socketScript.pushPlaces(placesAndRoles);
    }
});

let exampleQuestions;
database.collection(DB_EXAMPLEQUESTIONS).find().toArray((err, result) => {
    if (result) {
        exampleQuestions = result;
        socketScript.pushQuestions(exampleQuestions);
    }
});

app.get('/databases', (request, response) => {    
    data = databaseContent.getData();

    database.collection(DB_PLACESANDROLES).insert(data[0], (err, result) => {
        if (err) {
            return console.log("Error while saving the places to the database!");
        }
        database.collection(DB_EXAMPLEQUESTIONS).insert(data[1], (err, result) => {
            if (err) {
                return console.log("Error while saving the questions to the database!");
            }
            response.redirect('/');
        });
    });
    // response.render('databases'); 
});

/*app.post('/placePost', (request, response) => {
    let place = request.body.place;
    let rawRoles = request.body.roles;
    let roles = rawRoles.split(/\r?\n/);
    
    let placeObj = {'name' : place, 'roles' : roles};
    database.collection(DB_PLACESANDROLES).save(placeObj, (err, result) => {
        if (err) {
            return console.log("Error while saving the new place!");
        }
    });
    response.redirect('/databases');
});

app.post('/questionPost', (request, response) => {
    let question = request.body.question;
    let questionObj = {'question' : question};
    
    database.collection(DB_EXAMPLEQUESTIONS).save(questionObj, (err, result) => {
        if (err) {
            return console.log("Error while saving the new question!");
        }
    });
    response.redirect('/databases');
});*/

// Called when the user comes to the website
app.get('/', (request, response) => {
    if (!request.session.authenticated) {
        response.render('login', {
            'info' : "",
            'usernameValue' : ""
        });
    }
    else {
        let gameCount = request.session.user.gameCount;
        let correctGuesses = request.session.user.correctGuesses;
        let correctPercentage = gameCount > 0 ?
        Math.round(correctGuesses/gameCount*100).toFixed(2): 0;
        
        let info = "";
        if (request.session.joinLobbyFail) {
            info = "Lobby nicht gefunden!";
            request.session.joinLobbyFail = null;
        }
        
        response.render('home', {
            'info': info,
            'username' : request.session.user.username,
            'lastThreeNames': request.session.user.lastThreeNames,
            'gameCount': gameCount,
            'correctGuesses': correctPercentage,
            'winCount': request.session.user.winCount,
            'witchCount': request.session.user.witchCount
        });
    }
});

// Called when the user comes from a game
app.post('/', (request, response) => {
    database.collection(DB_USERS).findOne({'username': request.session.user.username}, (err, result) => {
        response.render('home', {
            'info': "",
            'username' : result.username,
            'lastThreeNames': result.lastThreeNames,
            'gameCount': result.gameCount,
            'correctGuesses': result.correctGuesses,
            'winCount': result.winCount,
            'witchCount': result.witchCount
        });
    });
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
                    'winCount': 0,
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
        'placeIndex' : -1,
        'usedRoleIndices' : [],
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
    request.session.joinLobbyFail = true;
    response.redirect('/');
});

// Called after the user wanted to join a lobby and if the lobby was found
app.get('/lobby', (request, response) => {
    if (request.session.authenticated && request.session.room) {    
        let room = request.session.room;
        request.session.room = null;
        socketScript.pushRequest(request);
        
        response.render('lobby', {
            'lobbyPassword' : room
        });
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