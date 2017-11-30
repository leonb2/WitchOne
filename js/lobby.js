// Initialize socket.io -> connects client
var socket = io();

// Get main divs
var lobbyContentDiv = document.querySelector(".js-lobby-content");
var gameContentDiv = document.querySelector(".js-game-content");
var infoOverlayDiv = document.querySelector(".js-info-overlay");
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
// Called after a successful joining -> game not already running
socket.on('joinLobbySuccessful', function (data) {
    lobbyIndex = data.lobbyIndex;
    lastName = data.thisName;
    refreshNicknames(data.users);
    readyCounter.innerHTML = data.readyCount + "/" + data.users.length;
    nicknameField.placeholder = "Spielername";
});

// Called after a unsuccessful joining -> game already running
socket.on('joinLobbyFail', function () {
    showInfoOverlay("Das Spiel ist bereits gestartet!");
    infoOverlayButton.addEventListener('click', function () {
        window.location.replace('/');
    });
});

var nicknameField = document.querySelector(".js-lobby-nickname");
// Add event listener to the nickname field that enables/disables the ready button
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
// Add event listener that listens to the enter key
nicknameField.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        nicknameField.blur();
    }
});

var lastName;
// Add event listener that checks if the player leaves the field
// and then sends the event to update his name
nicknameField.addEventListener("blur", function () {
    if (nicknameField.value != "" && nicknameField.value != lastName) {
        var name = nicknameField.value;
        var data = {'lobbyIndex': lobbyIndex, 'nickname': name, 'oldNickName' : lastName};
        lastName = nicknameField.value;
        
        socket.emit('changeNickname', data);
    }
});
// Called if the wanted nickname is already used in the lobby
socket.on('nameIsUsed', function (data) {
    lastName = data.name;
    nicknameField.value = lastName;
});

var readyButton = document.querySelector(".js-lobby-button-ready");
var ready = false;
readyButton.disabled = true;
// Add event listener that toggles the ready button 
// and sends the event to update the ready state of this player
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
// Add event listener that starts the game by sending the event
startButton.addEventListener('click', function () { 
    data = {'lobbyIndex': lobbyIndex};
    socket.emit('startGame', data);
});

var admin = false;
// Called when this player is the admin of the lobby
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

// Refreshes the list of nicknames by deleting and adding everyone again
function refreshNicknames(nicknames) {
     nicknameList.innerHTML = "";
     for (var i = 0; i < nicknames.length; i++) {
         nicknameList.innerHTML += "<div>" + nicknames[i] + "</div>";
     }
     return nicknames.length;
}

var playerCount;
// Called when one player changed his nickname
socket.on('refreshNicknames', function (data) {
    playerCount = refreshNicknames(data.users);
});

// Refreshes the counter for how many players are ready
function refreshReady (readyCount) {
    readyCounter.innerHTML = readyCount + "/" + playerCount;
    startButton.disabled = true;
} 

var readyCounter = document.querySelector(".js-lobby-ready-counter");
// Called when one player clicked the ready button
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

var infoOverlayInfoDiv = document.querySelector(".js-info-overlay-info");
// Displays the info overlay with the given string
function showInfoOverlay (info) {
    infoOverlayDiv.classList.remove("not-visible");
    infoOverlayInfoDiv.innerHTML = info;
}
var infoOverlayButton = document.querySelector(".js-info-overlay-button");
// Add event listener to the button that makes the info overlay invisible
infoOverlayButton.addEventListener('click', function () {
    infoOverlayDiv.classList.add("not-visible");
});

var questionButton = document.querySelector(".js-game-button-question");
// Add event listener to the button that sends the event to get an example question
questionButton.addEventListener('click', function () {
    socket.emit('getExampleQuestion');
    });
// Called right after the player requested a question
socket.on('sendExampleQuestion', function (data) {
    showInfoOverlay(data.question);
});

var startVoteButtonContainer = document.querySelector(".js-game-button-start-vote-container");
var startVoteButton = document.querySelector(".js-game-button-start-vote");
// Add event listener to the button that starts the vote to find out who is the witch
startVoteButton.addEventListener('click', function () {
    data = {'password': password};
    socket.emit('startVote', data);
});

var voteButton = document.querySelector(".js-game-button-vote");
var voted = false;
var rightVote;
// Add event listener to the "send vote" button that will send the according event
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
            showInfoOverlay("Bitte einen einzigen Ort auswählen!");
        }
        else {
            showInfoOverlay("Bitte einen einzigen Spieler auswählen zum Anschuldigen.");
        }
    }
});

// Called when a non-witch player voted for the right witch
socket.on('rightVote', function (data) {
   rightVote = data.rightVote; 
});

var gameLength;
var place;

// Called when the game starts and sets up all game information
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

// Adds event listeners to all checklist buttons which contain all players or possible places
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

// Called when a player left a running game
socket.on('gameAbort', function () {
    showInfoOverlay("Ein Spieler hat das Spiel verlassen. Es wird nun beendet!");
    infoOverlayButton.addEventListener('click', function () {
        window.location.replace('/');
    });
});

// Called after game start for the witch
socket.on('sendPossiblePlaces', function (data) {
    for (var i = 0; i < data.places.length; i++) {
            checklistDiv.innerHTML += "<button class='js-game-button-checklist button-roles' buttontype='button'>"+data.places[i]+"</button>";        
    }
    checklistButtons = document.querySelectorAll(".js-game-button-checklist");
    setupChecklistButtons();
});

// Called after game start for all non-witch players
socket.on('assignRole', function (data) {
    roleDiv.innerHTML += data.role;
});

var voteStartTime;
// Called after one player starts the vote to accuse players of being the witch
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
// Called when the game is done - time out, witch is correct, vote is done
// Sets up end screen
socket.on('gameFinished', function (data) {
    clearInterval(interval);
    
    if (data.witchCaught) {
        resultDiv.innerHTML = "Die Hexe wurde gefangen!";
    }
    else {
        resultDiv.innerHTML = "Die Hexe ist entkommen!";
    }
    
    witchDiv.innerHTML = "Die Hexe war " + data.witchName + ".";
    
    var won = false;
    if (isWitch) {
        rightVote = false;
        if (!data.witchCaught) {
            won = true;
            rightVote = true;
        }
    }
    else if (data.witchCaught) {
        won = true;
    }
    
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
    
    var newData = {'name': lastName, 'rightVote': rightVote, 'won': won, 'isWitch': isWitch};
    
    socket.emit('updateStatistics', newData);
});

var interval;
var intervalValue;
// Starts a countdown that is shown on screen
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

// Converts all digits below 10 to have two digits -> 4 = 04
function minTwoDigits (number) {
    return number < 10 ? number = "0" + number : number;
}

// Add event listener that will not let the players reload or leave the page like that
window.addEventListener('beforeunload', function (event) {
    return event.returnValue = "Du wirst somit aus der Lobby entfernt. ";
});