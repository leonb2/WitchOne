
let id;
socket.on('pushID', (id) => {
    this.id = id;
});

let password = document.querySelector(".js-lobby-password").innerHTML;
socket.emit('joinLobby', password);

let nicknameList = document.querySelector(".js-nickname-list");
socket.on('joinLobbySuccessful', (data) => {
    lastName = data.thisName;
    refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + data.users.length;
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
        data = {'password': password, 'nickname': name, 'oldNickName' : lastName};
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
        readyButton.classList.remove("lobby-button-ready");
    } 
    else {
        ready = true;
        readyButton.classList.add("lobby-button-ready");
    }
    data = {'password' : password, 'ready' : ready};
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
});

socket.on('refresh', (data) => {
    playerCount = refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + playerCount;
});
