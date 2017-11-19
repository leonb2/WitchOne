let lobbyContentDiv = document.querySelector(".js-lobby-content");
let gameContentDiv = document.querySelector(".js-game-content");

let password = document.querySelector(".js-lobby-password").innerHTML;
socket.emit('joinLobby', password);

let ownId;
// Called after joining a lobby
socket.on('pushID', (id) => {
    ownId = id;
});

let lobbyIndex;
let nicknameList = document.querySelector(".js-lobby-nickname-list");
socket.on('joinLobbySuccessful', (data) => {
    lobbyIndex = data.lobbyIndex;
    lastName = data.thisName;
    refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + data.users.length;
    nicknameField.placeholder = data.thisName;
});

socket.on('joinLobbyFail', () => {
    window.location.replace('/');
});

let nicknameField = document.querySelector(".js-lobby-nickname");
nicknameField.addEventListener('input', () => {
    if (nicknameField.value != "") {
        readyButton.disabled = false;
        readyButton.classList.remove("lobby-button-ready-disabled");
    }
    else if (!ready) {
        readyButton.disabled = true;
        readyButton.classList.add("lobby-button-ready-disabled");   
    }
});

let lastName;
nicknameField.addEventListener("blur", () => {
    if (nicknameField.value != "") {
        let name = nicknameField.value;
        let data = {'lobbyIndex': lobbyIndex, 'nickname': name, 'oldNickName' : lastName};
        lastName = nicknameField.value;
        
        socket.emit('changeNickname', data);
    }
});

let readyButton = document.querySelector(".js-lobby-button-ready");
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
    let data = {'lobbyIndex': lobbyIndex, 'ready' : ready};
    socket.emit('playerReady', data);
});

// Called when a player leaves the lobby
socket.on('resetReady', () => {
    ready = false;
    if (readyButton.classList.contains("lobby-button-ready-active")) {
       readyButton.classList.remove("lobby-button-ready-active"); 
    }
})

let startButton = document.querySelector(".js-lobby-button-start");
startButton.addEventListener('click', () => { 
    data = {'lobbyIndex': lobbyIndex};
    socket.emit('startGame', data);
});

let admin = false;
socket.on('admin', () => {
    admin = true;
    startButton.classList.remove("not-displayed");
});

// Called when the admin left the lobby
socket.on('assignNewAdmin', (adminId) => {
    if (ownId === adminId) {
        admin = true;
        startButton.classList.remove("not-displayed");
    }
});

// Refreshes the list of nicknames by deleting
// and adding everyone again
function refreshNicknames(nicknames) {
     nicknameList.innerHTML = "";
     for (let i = 0; i < nicknames.length; i++) {
         nicknameList.innerHTML += "<div>" + nicknames[i] + "</div>";
     }
     return nicknames.length;
}

let playerCount;
socket.on('refreshNicknames', (nicknames) => {
    playerCount = refreshNicknames(nicknames);
});

// Refreshes the counter for how many players are ready
function refreshReady (readyCount) {
    readyCounter.innerHTML = readyCount + "/" + playerCount;
    startButton.disabled = true;
    startButton.classList.add("lobby-button-start-disabled");
} 

let readyCounter = document.querySelector(".js-lobby-ready-counter");
socket.on('refreshReady', (readyCount) => {
    refreshReady(readyCount);
});

// Called when a new player joins the lobby
socket.on('refresh', (data) => {
    playerCount = refreshNicknames(data.users);
    refreshReady(data.readyCount);
});

// Called when everyone is ready -> the game is ready to start
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
let checklistDiv = document.querySelector(".js-game-checklist");
let checklistButtons;
let activeChecklistButtons = [];

let questionButton = document.querySelector(".js-game-button-question");
questionButton.addEventListener('click', () => {
    socket.emit('getExampleQuestion');
    });
socket.on('sendExampleQuestion', (data) => {
        alert(data.question);
});

let startVoteButtonContainer = document.querySelector(".js-game-button-start-vote-container");
let startVoteButton = document.querySelector(".js-game-button-start-vote");
startVoteButton.addEventListener('click', () => {
    data = {'password': password};
    socket.emit('startVote', data);
});

let voteButton = document.querySelector(".js-game-button-vote");
let voted = false;
voteButton.addEventListener('click', () => {
    if (activeChecklistButtons.length == 1) {    
        if (!isWitch) {
            voteButton.classList.add("game-button-vote-active");
            voteButton.innerHTML = "Abgestimmt!";
            voteButton.disabled = true;
            voted = true;
            let data = {'password': password, 'lobbyIndex': lobbyIndex, 'vote': activeChecklistButtons[0]};
            socket.emit('voted', data);
        }
        else {
            
        }
    }
    else {
        if (isWitch) {
            alert("Bitte einen einzigen Ort auswählen.");
        }
        else {
            alert("Bitte einen einzigen Spieler auswählen zum Anschuldigen.")
        }
    }
});

socket.on('gameStarted', (data) => {
    
    let roleString = "nicht die Hexe.";
    // Am I the witch?
    if (ownId === data.witchID) {
        isWitch = true;
        roleString = "die Hexe!"
    }
    
    // Change content
    lobbyContentDiv.parentNode.removeChild(lobbyContentDiv);
    gameContentDiv.classList.remove("not-displayed");
    
    // Fill fields
    nameDiv.innerHTML = lastName;
    roleDiv.innerHTML += roleString;
    if (isWitch) {
        voteButton.innerHTML = "Schätzung abgeben";
        voteButton.classList.remove("game-button-vote-disabled");
        voteButton.disabled = false;
        
        startVoteButton.parentElement.removeChild(startVoteButton);
    }
    
    // Fill in order
    for (let i = 0; i < data.users.length; i++) {
        orderDiv.innerHTML += data.users[data.order[i]] + " ";
        if (i < data.users.length-1) {
            orderDiv.innerHTML += "- ";
        }
    }
    
    // Fill checklist
    if (!isWitch) {
        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i] != lastName) {
                checklistDiv.innerHTML += "<button class='js-game-button-checklist game-button game-button-checklist' buttontype='button'>"+data.users[i]+"</button>";
            }
        }  
    }
    else {
        // Fill in all possible places
    }
    checklistButtons = document.querySelectorAll(".js-game-button-checklist");
    
    for (let i = 0; i < checklistButtons.length; i++) {
        checklistButtons[i].addEventListener('click', () => {
            if (!voted) {
                if (!checklistButtons[i].classList.contains("game-button-checklist-active")) {
                    checklistButtons[i].classList.add("game-button-checklist-active");
                    activeChecklistButtons.push(checklistButtons[i].innerHTML);
                }
                else {
                    checklistButtons[i].classList.remove("game-button-checklist-active");
                    
                    let index = activeChecklistButtons.indexOf(checklistButtons[i].innerHTML);                  
                    activeChecklistButtons.splice(index, 1);
                }
            }
        });
    }
    
    // Enable timer
    let minutes = minTwoDigits(Math.floor(data.gameLength/60));
    let seconds = minTwoDigits(data.gameLength % 60);
    timerDiv.innerHTML = minutes + ":" + seconds;
    timer(data.gameLength);
});

socket.on('voteStarted', () => {
    startVoteButtonContainer.innerHTML = "Abstimmung gestartet!";
    voteButton.classList.remove("game-button-vote-disabled");
    voteButton.disabled = false;
    
    if (intervalValue > 60) {
        timer(61);
    }
});

socket.on('gameFinished', (data) => {
    alert(data.witchCaught + "  " + data.witchName);
});

let interval;
let intervalValue;
function timer (timeSec) {
    if (interval) {
        clearInterval(interval);
    }
    
    intervalValue = timeSec;
    interval = setInterval( () => {
        intervalValue--;
        let minutes = minTwoDigits(Math.floor(intervalValue/60));
        let seconds = minTwoDigits(intervalValue % 60);
        if (minutes === "00" && seconds === "00") {
            clearInterval(interval);
            interval = null;
            let data = {'password': password, 'lobbyIndex' : lobbyIndex};
            socket.emit('gameTimeOut', data);
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