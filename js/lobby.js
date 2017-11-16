let lobbyContentDiv = document.querySelector(".js-lobby-content");
let gameContentDiv = document.querySelector(".js-game-content");

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
    nicknameField.value = data.thisName;
});

socket.on('joinLobbyFail', () => {
    window.location.replace('/');
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

let startButton = document.querySelector(".js-button-start");
startButton.addEventListener('click', () => { 
    data = {'lobbyIndex': lobbyIndex};
    socket.emit('startGame', data);
});

let admin = false;
socket.on('admin', () => {
    admin = true;
    startButton.classList.remove("not-displayed");
});
socket.on('assignNewAdmin', (adminId) => {
    if (ownId === adminId) {
        admin = true;
        startButton.classList.remove("not-displayed");
    }
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

// ----- Game logic -----
let isWitch = false;
let nameDiv = document.querySelector(".js-game-name");
let roleDiv = document.querySelector(".js-game-role");
let timerDiv = document.querySelector(".js-game-timer");
let orderDiv = document.querySelector(".js-game-order");
let checklistUsersDiv = document.querySelector(".js-game-checklist-users");

socket.on('gameStarted', (data) => {
    
    let roleString = "nicht die Hexe.";
    // Am I the witch?
    if (ownId === data.witchID) {
        isWitch = true;
        roleString = "die Hexe!"
    }
    
    // Change content
    lobbyContentDiv.innerHTML = "";
    gameContentDiv.classList.remove("not-displayed");
    
    // Fill fields
    nameDiv.innerHTML = lastName;
    roleDiv.innerHTML += roleString;
    
    // Fill in order
    for (let i = 0; i < data.users.length; i++) {
        orderDiv.innerHTML += data.users[data.order[i]] + " ";
        if (i < data.users.length-1) {
            orderDiv.innerHTML += "- ";
        }
    }
    
    // Fill user checklist
    if (!isWitch) {
        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i] != lastName) {
                checklistUsersDiv.innerHTML += "<button type='button'>"+data.users[i]+"</button>"
            }
        }
    }
    
    // Enable timer
    let minutes = minTwoDigits(Math.floor(data.gameLength/60));
    let seconds = minTwoDigits(data.gameLength % 60);
    timerDiv.innerHTML = minutes + ":" + seconds;
    timer(data.gameLength);
});

function timer (timeSec) {
    let interval = setInterval( () => {
        timeSec--;
        let minutes = minTwoDigits(Math.floor(timeSec/60));
        let seconds = minTwoDigits(timeSec % 60);
        if (minutes === "00" && seconds === "00") {
            clearInterval(interval);
            socket.emit('gameFinishedTime');
        }
        timerDiv.innerHTML = minutes + ":" + seconds;
    }, 1000);
}

function minTwoDigits (number) {
    return number < 10 ? number = "0" + number : number;
}

window.addEventListener('beforeunload', (event) => {
    return event.returnValue = "Die Lobby wird nicht mehr funktionieren, wenn du rausgehst.";
});