// TO-DO: if a new user joins the room the start button has to be disabled

const rooms = [];

exports.initialize = function (server, roomDeleteCallback) {
    const socketio = require('socket.io');
    const io = socketio(server);

    io.on('connection', (socket) => {
        console.log(`Socket ${socket.id} connected.`);

        socket.emit('pushID', socket.id);

        socket.on('joinLobby', (password) => {
            socket.join(password); 
            console.log(`${socket.id} joined the room ${password}`); 

            let index = -1;
            let name = null;
            let users = [];
            let readyCount = 0;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].password === password) {
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
                data = {'lobbyIndex': index, 'thisName': name, 'users': users, 'readyCount': readyCount};
                socket.emit('joinLobbySuccessful', data);
                io.to(password).emit('refresh', data);
            }
            else {
                socket.emit('joinLobbyFail');
            }
        });

        /*
        Look for the room in which a player has changed it nickname.
        Then remove the old nickname and add the new one
        Also removes and adds the socket id so the nicknames and ids are always in the same place in their arrays.
        */
        socket.on('changeNickname', (data) => {
            let users;
            let userIDs;
            
            let room = rooms[data.lobbyIndex];
            users = room.users;
            userIDs = room.userIDs;

            let index = users.indexOf(data.oldNickName);
            if (index > -1) {
                users.splice(index, 1);
                userIDs.splice(index, 1);
            }

            users.push(data.nickname);
            userIDs.push(socket.id);
            rooms[data.lobbyIndex].users = users;
            rooms[data.lobbyIndex].userIDs = userIDs;
            
            io.to(room.password).emit('refreshNicknames', users);
        });

        socket.on('playerReady', (data) => {              
            let room = rooms[data.lobbyIndex];
            let readyCount = room.usersReady;
            let maxReady = room.users.length;
            
            if (data.ready) {
                readyCount++;
            }
            else {
                readyCount--;
            }
            
            rooms[data.lobbyIndex].usersReady = readyCount;

            io.to(room.password).emit('refreshReady', readyCount);
            
            if (readyCount == maxReady) {
                io.to(room.password).emit('everyoneReady');
            }
        });
        
        socket.on('startGame', (data) => {
            let room = rooms[data.lobbyIndex];
            
            data = {'gameLength' : room.gameLength};
            io.to(room.password).emit('gameStarted', data);
        });
        
        socket.on('disconnect', () => {
            /*
            Look if the player that disconnected was in a room and if so remove the player from that room.
            
            TODO: Check if admin just left and if so, assign new one
            */
            for (let i = 0; i < rooms.length; i++) {
                for (let j = 0; j < rooms[i].userIDs.length; j++) {
                    if (rooms[i].userIDs[j] === socket.id) {

                        let index = i;
                        let password = rooms[i].password;
                        let users = rooms[i].users;
                        let userIDs = rooms[i].userIDs;

                        users.splice(j, 1);
                        userIDs.splice(j, 1);
                        
                        rooms[i].usersReady--;
                        
                        if (users.length > 0) {
                            rooms[i].users = users;
                            rooms[i].userIDs = userIDs;

                            io.to(password).emit('refreshNicknames', users);
                            
                            let adminId = userIDs[0];
                            io.to(password).emit('assignNewAdmin', adminId);
                            
                        }
                        else {
                            rooms.splice(i, 1);
                            roomDeleteCallback(i);
                        }
                        break;          
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