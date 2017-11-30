const rooms = [];
let placesAndRoles;
let exampleQuestions;
let request;

exports.initialize = function (server, places, questions, roomDeleteCallback, updateUserStatisticCallback) {
    const socketio = require('socket.io');
    const io = socketio(server);
    
    placesAndRoles = places;
    exampleQuestions = questions;
        
    /*
    Called when a user joins a lobby
    Emit the socketID to the player and add the player to the room.
    */
    io.on('connection', (socket) => {
        console.log(`Socket ${socket.id} connected.`);

        socket.emit('pushID', socket.id);

        socket.on('joinLobby', (password) => {
            socket.join(password); 

            // Find the lobby and add the player to it
            let index = -1;
            let name = null;
            let users = [];
            let readyCount = 0;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].password === password) {
                    
                    // If the game has already started
                    if (rooms[i].placeIndex != -1) {
                        socket.emit('joinLobbyFail');
                        return;
                    }
                    
                    console.log(`${socket.id} joined the room ${password}`); 
                    index = i;
                    users = rooms[i].users;
                    name = "Spieler " + (users.length+1);
                    users.push(name);
                    rooms[i].userIDs.push(socket.id);
                    readyCount = rooms[i].usersReady;
                    
                    // Assign lobby leader
                    if (users.length == 1) {
                        rooms[i].adminID = socket.id;
                        socket.emit('admin');
                    }
                    break;
                }
            }
            
            if (index != -1) {
                let data = {
                    'lobbyIndex': index,
                    'thisName': name,
                    'users': users,
                    'readyCount': readyCount
                };
                socket.emit('joinLobbySuccessful', data);
                io.to(password).emit('refresh', data);
            }
            // = If no lobby was found (=> some kind of error)
            else {
                socket.emit('joinLobbyFail');
            }
        });

        /*
        Called when a player changes his nickname.
        Remove the old nickname and ID and then add the new nickname and ID again, so that nickname and ID are always at the same place
        */
        socket.on('changeNickname', (data) => {
            let users;
            let userIDs;
            
            let room = rooms[data.lobbyIndex];
            users = room.users;
            userIDs = room.userIDs;
            let newData;
            
            // If name is already used
            if (users.indexOf(data.nickname) != -1) {
                newData = {'name': data.oldNickName};
                socket.emit('nameIsUsed', newData);
                return;
            }

            let index = users.indexOf(data.oldNickName);
            if (index > -1) {
                users.splice(index, 1);
                userIDs.splice(index, 1);
            }

            users.push(data.nickname);
            userIDs.push(socket.id);
            room.users = users;
            room.userIDs = userIDs;
            
            newData = {'users': users};
            
            io.to(room.password).emit('refreshNicknames', newData);
        });

        /*
        Called when a player clicked the ready button.
        Check if the player is ready or not and refresh the new count for every player
        If everyone is ready the according event is fired
        */
        socket.on('playerReady', (data) => {              
            let room = rooms[data.lobbyIndex];
            let readyCount = room.usersReady;
            
            if (data.ready) {
                readyCount++;
            }
            else {
                readyCount--;
            }
            
            room.usersReady = readyCount;

            io.to(room.password).emit('refreshReady', readyCount);
            
            if (readyCount == room.users.length && readyCount >= 3) {
                io.to(room.password).emit('everyoneReady');
            }
        });
        
        /*
        Called when the admin clicked the start button.
        Select a place and distribute the roles
        */
        socket.on('startGame', (data) => {
            let room = rooms[data.lobbyIndex];
            
            // Determine who is the witch
            let witchIndex = Math.floor(Math.random() * room.users.length);
            let witchID = room.userIDs[witchIndex];
            rooms[data.lobbyIndex].witchID = witchID;
            
            // Determin place index
            room.placeIndex = Math.floor(Math.random() * placesAndRoles.length);
            
            // Generate random order
            let order = [];
            let random;
            for (let i = 0; i < room.users.length; i++) {
                let index = 0;
                while (index != -1) {
                    random = Math.floor(Math.random() * room.users.length);
                    index = order.indexOf(random);
                }
                order.push(random);
            }
            
            let newData = { 
                'users': room.users,
                'gameLength' : room.gameLength,
                'place' : placesAndRoles[room.placeIndex].name,
                'witchID': witchID,
                'order': order
            };
            io.to(room.password).emit('gameStarted', newData);
        });
        
        socket.on('getPossiblePlaces', data => {
            let room = rooms[data.lobbyIndex];
            
            let places = [];
            
            for (let i = 0; i < placesAndRoles.length; i++) {
                places.push(placesAndRoles[i].name);
            }
            
            let newData = {'places': places}
            
            socket.emit('sendPossiblePlaces', newData);
        });
        
        socket.on('getRole', (data) => {
            let room = rooms[data.lobbyIndex];
            
            let index = 0;
            let random;
            let role;
            do {
                random = Math.floor(Math.random() * placesAndRoles[room.placeIndex].roles.length);           
                index = room.usedRoleIndices.indexOf(random);
            }
            while (index != -1 && room.usedRoleIndices.length < placesAndRoles[room.placeIndex].roles.length);
            room.usedRoleIndices.push(random);
            role = placesAndRoles[room.placeIndex].roles[random];
            
            let newData = {'role' : role};
            socket.emit('assignRole', newData);
        });
            
        /*
        Called when a player clicked the button to get an example question.
        */
        socket.on('getExampleQuestion', () => {
            let index = Math.floor(Math.random() * exampleQuestions.length);
            let data = {'question': exampleQuestions[index].question};
            
            socket.emit('sendExampleQuestion', data);     
        });
        
        socket.on('witchVoted', (data) => {
            let room = rooms[data.lobbyIndex];
            
            let place = placesAndRoles[room.placeIndex].name;
            
            let witchWon = false;
            if (place === data.vote) {
                witchWon = true;
            }
            
            let witchName = room.users[room.userIDs.indexOf(room.witchID)];
            let newData = {'witchCaught' : !witchWon, 'witchName': witchName};
            
            io.to(data.password).emit('gameFinished', newData);
        });
        
        /*
        Called when a player clicked the button to start the vote.
        */
        socket.on('startVote', (data) => {
            io.to(data.password).emit('voteStarted');
        });
        
        socket.on('voted', (data) => {
            let room = rooms[data.lobbyIndex];
            
            // Track vote
            let userID = room.userIDs[room.users.indexOf(data.vote)];
            let index = room.votedIDs.indexOf(userID);
            if (index == -1) {
                room.votedIDs.push(userID);
                room.votedIDsAmount.push(1);
            }
            else {
                room.votedIDsAmount[index]++;
            } 
            
            // Check if player voted correctly
            let newData;
            if (userID == room.witchID) {
                newData = {'rightVote' : true};
            }
            else {
                newData = {'rightVote' : false};
            }
            socket.emit('rightVote', newData);
            
            // Check if everyone voted
            let voteCount = 0;
            for (let i = 0; i < room.votedIDsAmount.length; i++) {
                voteCount += room.votedIDsAmount[i];
            }
            
            if (voteCount === room.users.length-1) {
                // Bubble sort by amount - but also change id array
                for (let i = 0; i < room.votedIDsAmount.length; i++) {
                    for (let j = i; j > 0; j--) {
                        if (room.votedIDsAmount[i] < room.votedIDsAmount[i - 1]) {
                            [room.votedIDsAmount[i], room.votedIDsAmount[i - 1]] =
                                [room.votedIDsAmount[i - 1], room.votedIDsAmount[i]];
                            [room.votedIDs[i], room.votedIDs[i - 1]] = 
                                [room.votedIDs[i - 1], room.votedIDs[i]];    
                        }
                    }
                }
                
                let witchName = room.users[room.userIDs.indexOf(room.witchID)];
                if (room.votedIDsAmount.length > 1) {
                    if (room.votedIDsAmount[room.votedIDsAmount.length-1] > room.votedIDsAmount[room.votedIDsAmount.length-2]) {
                        newData = {'witchCaught' : true, 'witchName': witchName};
                    }
                    else {
                        newData = {'witchCaught' : false, 'witchName': witchName};
                    }
                }
                else {
                    newData = {'witchCaught' : true, 'witchName': witchName};
                }
                
                io.to(data.password).emit('gameFinished', newData);
            } 
        });
        
        socket.on('gameTimeOut', (data) => {
            let room = rooms[data.lobbyIndex];
            let witchName = room.users[room.userIDs.indexOf(room.witchID)];
            let newData = {'witchCaught' : false, 'witchName' : witchName};
            io.to(data.password).emit('gameFinished', newData);
        });
        
        socket.on('updateStatistics', (data) => {
            updateUserStatisticCallback(request, data);
        });
            
        socket.on('disconnect', () => {
            /*
            Look if the player that disconnected was in a room and if so remove the player from that room.
            Also check if the admin left and if so assign a new one.
            If the game was already running it will be stopped
            */
            for (let i = 0; i < rooms.length; i++) {
                for (let j = 0; j < rooms[i].userIDs.length; j++) {
                    if (rooms[i].userIDs[j] === socket.id) {
                        let index = i;
                        let room = rooms[index];
                        let password = room.password;
                        
                        // If the game is not running already
                        if (room.witchID == null) {
                        
                            let users = room.users;
                            let userIDs = room.userIDs;

                            users.splice(j, 1);
                            userIDs.splice(j, 1);

                            rooms[i].usersReady = 0;

                            if (users.length > 0) {
                                rooms[i].users = users;
                                rooms[i].userIDs = userIDs;

                                io.to(password).emit('refreshNicknames', users);

                                io.to(password).emit('resetReady');

                                // = If the admin just left
                                if (socket.id === rooms[i].adminID) {
                                    let adminID = userIDs[0];
                                    rooms[i].adminID = adminID;
                                    io.to(password).emit('assignNewAdmin', adminID);
                                }
                            }
                            else {
                                rooms.splice(i, 1);
                                roomDeleteCallback(i);
                            }
                            break;
                        }
                        else {
                            io.to(password).emit('gameAbort'); 
                            break;
                        }
                    }
                }
            }
            console.log(`Socket ${socket.id} disconnected.`);
        });
    });
}

exports.addRoom = function (room) {
    rooms.push(room);
}

exports.pushRequest = function (req) {
    request = req;
}