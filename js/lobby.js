let lobbyContentDiv = document.querySelector(".js-lobby-content");
let gameContentDiv = document.querySelector(".js-game-content");
let endScreenDiv = document.querySelector(".js-end-screen");

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
nicknameField.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        nicknameField.blur();
    }
});

let lastName;
nicknameField.addEventListener("blur", () => {
    if (nicknameField.value != "" && nicknameField.value != lastName) {
        let name = nicknameField.value;
        let data = {'lobbyIndex': lobbyIndex, 'nickname': name, 'oldNickName' : lastName};
        lastName = nicknameField.value;
        
        socket.emit('changeNickname', data);
    }
});
socket.on('nameIsUsed', (data) => {
    lastName = data.name;
    nicknameField.value = lastName;
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
socket.on('refreshNicknames', (data) => {
    playerCount = refreshNicknames(data.users);
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
let placeDiv = document.querySelector(".js-game-place");
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
let gameDuration;
startVoteButton.addEventListener('click', () => {
    data = {'password': password};
    socket.emit('startVote', data);
    let minutesAndSeconds = timerDiv.innerHTML.split(":");
    gameDuration = gameLength - ((minutesAndSeconds[0] * 60) + minutesAndSeconds[1]);
});

let voteButton = document.querySelector(".js-game-button-vote");
let voted = false;
let rightVote;
voteButton.addEventListener('click', () => {
    if (activeChecklistButtons.length == 1) {   
        voteButton.classList.add("game-button-vote-active");
        voteButton.disabled = true;
        voted = true;
        let data = {
                'password': password,
                'lobbyIndex': lobbyIndex,
                'vote': activeChecklistButtons[0]
            };
        
        if (!isWitch) {      
            voteButton.innerHTML = "Abgestimmt!";         
            socket.emit('voted', data);
        }
        else {
            voteButton.innerHTML = "Abgeschickt!";
            socket.emit('witchVoted', data);
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
socket.on('rightVote', (data) => {
   rightVote = data.rightVote; 
});

let gameLength;
socket.on('gameStarted', (data) => {
    
    let newData = {'lobbyIndex': lobbyIndex};
    // Am I the witch?
    if (ownId === data.witchID) {
        isWitch = true;
        roleDiv.innerHTML += "die Hexe!";
        placeDiv.parentNode.removeChild(placeDiv);
        socket.emit('getPossiblePlaces', newData);
    }
    else {     
        socket.emit('getRole', newData);
        placeDiv.innerHTML = data.place;
    }
    
    // Change content
    lobbyContentDiv.parentNode.removeChild(lobbyContentDiv);
    gameContentDiv.classList.remove("not-displayed");
    
    // Fill fields
    nameDiv.innerHTML = lastName;
    
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

         checklistButtons = document.querySelectorAll(".js-game-button-checklist");
        setupChecklistButtons();
    }
        
    // Enable timer
    let minutes = minTwoDigits(Math.floor(data.gameLength/60));
    let seconds = minTwoDigits(data.gameLength % 60);
    timerDiv.innerHTML = minutes + ":" + seconds;
    timer(data.gameLength);
    gameLength = data.gameLength;
});

socket.on('sendPossiblePlaces', (data) => {
    for (let i = 0; i < data.places.length; i++) {
            checklistDiv.innerHTML += "<button class='js-game-button-checklist game-button game-button-checklist' buttontype='button'>"+data.places[i]+"</button>";        
    }
    checklistButtons = document.querySelectorAll(".js-game-button-checklist");
    setupChecklistButtons();
});

socket.on('assignRole', (data) => {
    roleDiv.innerHTML += data.role;
});

socket.on('voteStarted', () => {
    startVoteButtonContainer.innerHTML = "Abstimmung gestartet!";
    voteButton.classList.remove("game-button-vote-disabled");
    voteButton.disabled = false;
    
    if (intervalValue > 60) {
        timer(61);
    }
});

let resultDiv = document.querySelector(".js-end-screen-result");
let witchDiv = document.querySelector(".js-end-screen-witch");
let guessDiv = document.querySelector(".js-end-screen-right-guess");
let voteStartDiv = document.querySelector(".js-end-screen-vote-time");
socket.on('gameFinished', (data) => {
    clearInterval(interval);
    
    endScreenDiv.classList.remove("not-visible");
    
    if (data.witchCaught) {
        resultDiv.innerHTML = "Die Hexe wurde gefangen!";
    }
    else {
        resultDiv.innerHTML = "Die Hexe ist entkommen!";
    }
    
    witchDiv.innerHTML = "Die Hexe war " + data.witchName;
    if (rightVote == true) {
        guessDiv.innerHTML = "Du hast richtig getippt!";
    }
    else if (rightVote == false) {
        guessDiv.innerHTML = "Du hast falsch getippt!";
    }
      
    if (gameDuration) {   
        let minutes = minTwoDigits(Math.floor(gameDuration/60));
        let seconds = minTwoDigits(gameDuration % 60);
        voteStartDiv.innerHTML = "Abstimmung gestartet nach " + minutes + ":" + seconds + ".";
    } 
    else {
        voteStartDiv.innerHTML = "Es wurde keine Abstimmung gestartet!";
    }
    
    let won = false;
    if (isWitch) {
        rightVote = true;
        if (!data.witchCaught) {
            won = true;
        }
    }
    else if (data.witchCaught) {
        won = true;
    }
    let newData = {'name': lastName, 'rightVote': rightVote, 'won': won, 'isWitch': isWitch};
    
    socket.emit('updateStatistics', newData);
});

function setupChecklistButtons () {
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
}

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