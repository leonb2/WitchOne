let ownId;
socket.on('pushID', (id) => {
    ownId = id;
});

let password = document.querySelector(".js-lobby-password").innerHTML;
socket.emit('joinLobby', password);

let lobbyIndex;
let nicknameList = document.querySelector(".js-nickname-list");
socket.on('joinLobbySuccessful', (data) => {
    lobbyIndex = data.lobbyIndex;
    lastName = data.thisName;
    refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + data.users.length;
});

socket.on('joinLobbyFail', () => {
    window.location.replace('/');
});

let startButton = document.querySelector(".js-button-start");
startButton.addEventListener('click', () => { 
    alert("Game started.");
});

let admin = false;
socket.on('admin', () => {
    admin = true;
    startButton.classList.remove("not-displayed");
});

let nicknameField = document.querySelector(".js-nickname");
nicknameField.addEventListener('input', () => {
    if (nicknameField.value != "") {
        readyButton.disabled = false;
    }
});

let lastName;
nicknameField.addEventListener("blur", () => {
    if (nicknameField.value != "") {
        let name = nicknameField.value;
        data = {'lobbyIndex': lobbyIndex, 'nickname': name, 'oldNickName' : lastName};
        lastName = nicknameField.value;
        
        socket.emit('changeNickname', data);
    }
});

let readyButton = document.querySelector(".js-button-ready");
let ready = false;
readyButton.disabled = true;
readyButton.addEventListener('click', () => {
    if (ready) {
        ready = false;
        readyButton.classList.remove("lobby-button-ready-active");
    } 
    else {
        ready = true;
        readyButton.classList.add("lobby-button-ready-active");
    }
    data = {'lobbyIndex': lobbyIndex, 'ready' : ready};
    socket.emit('playerReady', data);
});

let playerCount;
socket.on('refreshNicknames', (nicknames) => {
    playerCount = refreshNicknames(nicknames);
});

function refreshNicknames(nicknames) {
     nicknameList.innerHTML = "";
     for (let i = 0; i < nicknames.length; i++) {
         nicknameList.innerHTML += "<div>" + nicknames[i] + "</div>";
     }
     return nicknames.length;
}

let readyCounter = document.querySelector(".js-ready-counter");
socket.on('refreshReady', (readyCount) => {
    readyCounter.innerHTML = readyCount + "/" + playerCount;
    startButton.disabled = true;
    startButton.classList.add("lobby-button-start-disabled");
});

socket.on('refresh', (data) => {
    playerCount = refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + playerCount;
});

socket.on('everyoneReady', () => {
    if (admin) {
        startButton.disabled = false;
        startButton.classList.remove("lobby-button-start-disabled");
    }
});

window.addEventListener('beforeunload', (event) => {
    return event.returnValue = "Die Lobby wird nicht mehr funktionieren, wenn du rausgehst.";
});