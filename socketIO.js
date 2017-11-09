const rooms = [];

exports.initialize = function (server) {
    const socketio = require('socket.io');
    const io = socketio(server);

    io.on('connection', (socket) => {
        console.log("Socket " + socket.id + " connected.");

        socket.emit('pushID', socket.id);

        socket.on('joinLobby', (password) => {
            socket.join(password); 
            console.log("Socket joined the room " + password); 

            let name;
            let users = [];
            let readyCount = 0;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].password === password) {
                    users = rooms[i].users;
                    name = "Spieler " + (users.length+1);
                    users.push(name);
                    rooms[i].userIDs.push(socket.id);
                    readyCount = rooms[i].usersReady;
                    break;
                }
            }
            data = {'thisName': name, 'users': users, 'readyCount': readyCount};
            socket.emit('joinLobbySuccessful', data);
            io.to(password).emit('refresh', data);
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

        socket.on('playerReady', (data) => {
            let readyCount;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].password === data.password) {
                    if (data.ready) {
                        rooms[i].usersReady++;
                    }
                    else {
                        rooms[i].usersReady--;
                    }
                    readyCount = rooms[i].usersReady;
                    break;
                }
            }
            io.to(data.password).emit('refreshReady', readyCount);
        });
        
        socket.on('disconnect', (password) => {

            /*
            Look if the player that disconnected was in a room and if so remove the player from that room.
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

                        io.to(rooms[i].password).emit('refreshNicknames', users);
                        break;          
                    }
                }
            }
            console.log("Socket " + socket.id + " disconnected.");
        });
    });
}

exports.addRoom = function (room) {
    rooms.push(room);
}