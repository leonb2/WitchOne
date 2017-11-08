// --- SETUP ---

const port = 8000;

const express = require('express');
const app = express();

// enable path for stylings & js
app.use(express.static(__dirname + "/stylings"));
app.use(express.static(__dirname + "/js"));

const session = require('express-session');
app.use(session({
    secret: 'example', //replace with hardcore hash or so
    resave: false,
    saveUninitialized: true
}));

const socketio = require('socket.io');

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
//

const server = app.listen(port, () => {
   console.log(`Server started and is listening to ${port}`);
});

const io = socketio(server);
const rooms = [];

/// --- Website Logic ---

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
            if (password === confirmPassword) {  
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
            // = If both passwords were not equal
            else {
                response.render('register', {
                    'info' : "Passwörter stimmen nicht überein!",
                    'usernameValue' : username
                }); 
                console.log("Passwords did not match!");
            }          
        }
        // = If the username is already used
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
    let gameLengthSec = gameLengthMin*60;
    
    // Look if lobby password is already in use
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].password === lobbyPassword) {
            response.redirect("/createLobby");
            console.log("Lobby password already in use.");
            return;
        }
    }
    
    // Create new room object and add it to the array
    room = {
        'password' : lobbyPassword,
        'gameLength' : gameLengthSec,
        'users' : [],
        'userIDs' : []
    };
    rooms.push(room);
    console.log("Lobby was created.")
    
    request.session.room = lobbyPassword;
    response.redirect('/lobby');
});

app.post('/joinLobbyPost', (request, response) => {
    let lobbyPassword = request.body.lobbyPassword;
    
    // Look for the requested room
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].password === lobbyPassword) {
            request.session.room = lobbyPassword;
            console.log("Requested lobby was found.");
            break;
        }
    }
    
    // If the room was found
    if (request.session.room) {
        response.redirect("/lobby");
    }
    else {
        response.redirect("/");
    }
    
});

app.get('/lobby', (request, response) => {
    if (request.session.room) {
        response.render('lobby', {
            'lobbyPassword' : request.session.room
        });
    }
    else {
        response.redirect('/');
    }
});

// --- SocketIO ---

io.on('connection', (socket) => {
    console.log("Socket " + socket.id + " connected.");
    
    socket.emit('pushID', socket.id);
        
    socket.on('joinLobby', (password) => {
        socket.join(password); 
        console.log("Socket joined the room " + password); 
        
        users = [];
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].password === password) {
                users = rooms[i].users;
                break;
            }
        }
        socket.emit('joinLobbySuccessful', users);
    });
    
    /*
    Look for the room in which a player has changed it nickname.
    Then remove the old nickname and add the new one
    Also removes and adds the socket id so the nicknames and ids are always in the same place in their arrays.
    */
    socket.on('changeNickname', (data) => {
        let users;
        let userIDs;
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].password === data.password) {
                users = rooms[i].users;
                userIDs = rooms[i].userIDs;
                
                let index = users.indexOf(data.oldNickName);
                if (index > -1) {
                    users.splice(index, 1);
                    userIDs.splice(index, 1);
                }
                
                users.push(data.nickname);
                userIDs.push(socket.id);
                rooms[i].users = users;
                rooms[i].userIDs = userIDs;
                break;
            }
        }
        io.to(data.password).emit('refreshNicknames', users);
    });
    
    socket.on('disconnect', () => {
        
        /*
        Look if the player that disconnected was in a room and if so remove the player from that room
        */
        for (let i = 0; i < rooms.length; i++) {
            for (let j = 0; j < rooms[i].userIDs.length; j++) {
                if (rooms[i].userIDs[j] === socket.id) {
                    
                    let users = rooms[i].users;
                    let userIDs = rooms[i].userIDs;
                    
                    users.splice(j, 1);
                    userIDs.splice(j, 1);
                    
                    rooms[i].users = users;
                    rooms[i].userIDs = userIDs;
                    
                    io.to(rooms[j].password).emit('refreshNicknames', users);
                    break;          
                }
            }
        }
        console.log("Socket " + socket.id + " disconnected.");
    });
});























