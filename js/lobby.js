var socket = io();

var lobbyContentDiv = document.querySelector(".js-lobby-content");
var gameContentDiv = document.querySelector(".js-game-content");
var endScreenDiv = document.querySelector(".js-end-screen");

var password = document.querySelector(".js-lobby-password").innerHTML;
socket.emit('joinLobby', password);

var ownId;
// Called after joining a lobby
socket.on('pushID', function (id) {
    ownId = id;
});

var lobbyIndex;
var nicknameList = document.querySelector(".js-lobby-nickname-list");
socket.on('joinLobbySuccessful', function (data) {
    lobbyIndex = data.lobbyIndex;
    lastName = data.thisName;
    refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + data.users.length;
    nicknameField.placeholder = "Spielername";
});

socket.on('joinLobbyFail', function () {
    window.location.replace('/');
});

var nicknameField = document.querySelector(".js-lobby-nickname");
nicknameField.addEventListener('input', function () {
    if (nicknameField.value != "") {
        readyButton.disabled = false;
        readyButton.classList.remove("lobby-button-ready-disabled");
    }
    else if (!ready) {
        readyButton.disabled = true;
        readyButton.classList.add("lobby-button-ready-disabled");   
    }
});
nicknameField.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        nicknameField.blur();
    }
});

var lastName;
nicknameField.addEventListener("blur", function () {
    if (nicknameField.value != "" && nicknameField.value != lastName) {
        var name = nicknameField.value;
        var data = {'lobbyIndex': lobbyIndex, 'nickname': name, 'oldNickName' : lastName};
        lastName = nicknameField.value;
        
        socket.emit('changeNickname', data);
    }
});
socket.on('nameIsUsed', function (data) {
    lastName = data.name;
    nicknameField.value = lastName;
});

var readyButton = document.querySelector(".js-lobby-button-ready");
var ready = false;
readyButton.disabled = true;
readyButton.addEventListener('click', function () {
    if (ready) {
        ready = false;
        readyButton.classList.remove("button-toggle-enabled");
    } 
    else {
        ready = true;
        readyButton.classList.add("button-toggle-enabled");
    }
    var data = {'lobbyIndex': lobbyIndex, 'ready' : ready};
    socket.emit('playerReady', data);
});

// Called when a player leaves the lobby
socket.on('resetReady', function () {
    ready = false;
    if (readyButton.classList.contains("lobby-button-ready-active")) {
       readyButton.classList.remove("lobby-button-ready-active"); 
    }
})

var startButton = document.querySelector(".js-lobby-button-start");
startButton.addEventListener('click', function () { 
    data = {'lobbyIndex': lobbyIndex};
    socket.emit('startGame', data);
});

var admin = false;
socket.on('admin', function () {
    admin = true;
    startButton.classList.remove("not-displayed");
});

// Called when the admin left the lobby
socket.on('assignNewAdmin', function (adminId) {
    if (ownId === adminId) {
        admin = true;
        startButton.classList.remove("not-displayed");
    }
});

// Refreshes the list of nicknames by devaring
// and adding everyone again
function refreshNicknames(nicknames) {
     nicknameList.innerHTML = "";
     for (var i = 0; i < nicknames.length; i++) {
         nicknameList.innerHTML += "<div>" + nicknames[i] + "</div>";
     }
     return nicknames.length;
}

var playerCount;
socket.on('refreshNicknames', function (data) {
    playerCount = refreshNicknames(data.users);
});

// Refreshes the counter for how many players are ready
function refreshReady (readyCount) {
    readyCounter.innerHTML = readyCount + "/" + playerCount;
    startButton.disabled = true;
} 

var readyCounter = document.querySelector(".js-lobby-ready-counter");
socket.on('refreshReady', function (readyCount) {
    refreshReady(readyCount);
});

// Called when a new player joins the lobby
socket.on('refresh', function (data) {
    playerCount = refreshNicknames(data.users);
    refreshReady(data.readyCount);
});

// Called when everyone is ready -> the game is ready to start
socket.on('everyoneReady', function () {
    if (admin) {
        startButton.disabled = false;
    }
});

// ----- Game logic -----
var isWitch = false;
var nameDiv = document.querySelector(".js-game-name");
var placeDiv = document.querySelector(".js-game-place");
var roleDiv = document.querySelector(".js-game-role");
var timerDiv = document.querySelector(".js-game-timer");
var orderDiv = document.querySelector(".js-game-order");
var checklistDiv = document.querySelector(".js-game-checklist");
var checklistButtons;
var activeChecklistButtons = [];

var questionButton = document.querySelector(".js-game-button-question");
questionButton.addEventListener('click', function () {
    socket.emit('getExampleQuestion');
    });
socket.on('sendExampleQuestion', function (data) {
        alert(data.question);
});

var startVoteButtonContainer = document.querySelector(".js-game-button-start-vote-container");
var startVoteButton = document.querySelector(".js-game-button-start-vote");
startVoteButton.addEventListener('click', function () {
    data = {'password': password};
    socket.emit('startVote', data);
});

var voteButton = document.querySelector(".js-game-button-vote");
var voted = false;
var rightVote;
voteButton.addEventListener('click', function () {
    if (activeChecklistButtons.length == 1) {   
        voteButton.classList.add("game-button-vote-active");
        voteButton.disabled = true;
        voted = true;
        var data = {
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
socket.on('rightVote', function (data) {
   rightVote = data.rightVote; 
});

var gameLength;
var place;
socket.on('gameStarted', function (data) {
    
    var newData = {'lobbyIndex': lobbyIndex};
    place = data.place;
    
    // Am I the witch?
    if (ownId === data.witchID) {
        isWitch = true;
        roleDiv.innerHTML += "die Hexe!";
        placeDiv.parentNode.removeChild(placeDiv);
        socket.emit('getPossiblePlaces', newData);
    }
    else {     
        socket.emit('getRole', newData);
        placeDiv.innerHTML = place;
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
    for (var i = 0; i < data.users.length; i++) {
        orderDiv.innerHTML += data.users[data.order[i]] + " ";
        if (i < data.users.length-1) {
            orderDiv.innerHTML += "- ";
        }
    }
    
    // Fill checklist
    if (!isWitch) {
        for (var i = 0; i < data.users.length; i++) {
            if (data.users[i] != lastName) {
                checklistDiv.innerHTML += "<button class='js-game-button-checklist button-roles' buttontype='button'>"+data.users[i]+"</button>";
            }
        }

         checklistButtons = document.querySelectorAll(".js-game-button-checklist");
        setupChecklistButtons();
    }
        
    // Enable timer
    var minutes = minTwoDigits(Math.floor(data.gameLength/60));
    var seconds = minTwoDigits(data.gameLength % 60);
    timerDiv.innerHTML = minutes + ":" + seconds;
    timer(data.gameLength);
    gameLength = data.gameLength;
});

socket.on('sendPossiblePlaces', function (data) {
    for (var i = 0; i < data.places.length; i++) {
            checklistDiv.innerHTML += "<button class='js-game-button-checklist button-roles' buttontype='button'>"+data.places[i]+"</button>";        
    }
    checklistButtons = document.querySelectorAll(".js-game-button-checklist");
    setupChecklistButtons();
});

socket.on('assignRole', function (data) {
    roleDiv.innerHTML += data.role;
});

var voteStartTime;
socket.on('voteStarted', function () {
    voteStartTime = gameLength - intervalValue;
    
    startVoteButton.innerHTML = "Abstimmung gestartet!";
    startVoteButton.disabled = true;
    voteButton.classList.remove("game-button-vote-disabled");
    voteButton.disabled = false;
    
    if (intervalValue > 60) {
        timer(61);
    }
});

var resultDiv = document.querySelector(".js-end-screen-result");
var witchDiv = document.querySelector(".js-end-screen-witch");
var guessDiv = document.querySelector(".js-end-screen-right-guess");
var endPlaceDiv = document.querySelector(".js-end-screen-place");
var voteStartDiv = document.querySelector(".js-end-screen-vote-time");
socket.on('gameFinished', function (data) {
    clearInterval(interval);
    
    if (data.witchCaught) {
        resultDiv.innerHTML = "Die Hexe wurde gefangen!";
    }
    else {
        resultDiv.innerHTML = "Die Hexe ist entkommen!";
    }
    
    witchDiv.innerHTML = "Die Hexe war " + data.witchName;
    
    if (rightVote != null) {
        guessDiv.classList.remove("not-displayed");
        if (rightVote == true) {
            guessDiv.innerHTML = "Du hast richtig getippt!";
        }
        else if (rightVote == false) {
            guessDiv.innerHTML = "Du hast falsch getippt!";
        }
    }
    
    endPlaceDiv.innerHTML = "Der Ort war " + place + ".";
      
    if (voteStartTime) {   
        var minutes = Math.floor(voteStartTime/60);
        var seconds = voteStartTime % 60;
        voteStartDiv.innerHTML = "Abstimmung gestartet nach " + minutes + " Minuten und " + seconds + " Sekunden.";
    } 
    else {
        voteStartDiv.innerHTML = "Es wurde keine Abstimmung gestartet!";
    }
    endScreenDiv.classList.remove("not-visible");
    
    var won = false;
    if (isWitch) {
        rightVote = true;
        if (!data.witchCaught) {
            won = true;
        }
    }
    else if (data.witchCaught) {
        won = true;
    }
    var newData = {'name': lastName, 'rightVote': rightVote, 'won': won, 'isWitch': isWitch};
    
    socket.emit('updateStatistics', newData);
});

function setupChecklistButtons () {
    for (var i = 0; i < checklistButtons.length; i++) {
        checklistButtons[i].addEventListener('click', function (event) {
            if (!voted) {
                if (!event.target.classList.contains("button-roles-enabled")) {
                    event.target.classList.add("button-roles-enabled");
                    activeChecklistButtons.push(event.target.innerHTML);
                }
                else {
                    event.target.classList.remove("button-roles-enabled");

                    var index = activeChecklistButtons.indexOf(event.target.innerHTML);                  
                    activeChecklistButtons.splice(index, 1);
                }
            }
        });
    }
}

var interval;
var intervalValue;
function timer (timeSec) {
    if (interval) {
        clearInterval(interval);
    }

    intervalValue = timeSec;
    interval = setInterval( function () {
        
        intervalValue--;
        var minutes = minTwoDigits(Math.floor(intervalValue/60));
        var seconds = minTwoDigits(intervalValue % 60);
        if (minutes === "00" && seconds === "00") {
            clearInterval(interval);
            interval = null;
            var data = {'password': password, 'lobbyIndex' : lobbyIndex};
            socket.emit('gameTimeOut', data);
        }
        timerDiv.innerHTML = minutes + ":" + seconds;
    }, 1000);
}

function minTwoDigits (number) {
    return number < 10 ? number = "0" + number : number;
}

window.addEventListener('beforeunload', function (event) {
    return event.returnValue = "Du wirst somit aus der Lobby entfernt. ";
});