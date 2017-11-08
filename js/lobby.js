
let id;
socket.on('pushID', (id) => {
    this.id = id;
});

let password = document.querySelector(".js-lobby-password").innerHTML;
socket.emit('joinLobby', password);

let nicknameList = document.querySelector(".js-nickname-list");
socket.on('joinLobbySuccessful', (users) => {
    refreshNicknames(users);
});

let nicknameField = document.querySelector(".js-nickname");
nicknameField.addEventListener("input", () => {
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
        readyButton.classList.add("lobby-button-ready");
        ready = false;   
    } 
    else {
        ready = true;
        readyButton.classList.remove("lobby-button-ready");
    }
});

socket.on('refreshNicknames', (nicknames) => {
    refreshNicknames(nicknames);
});

 function refreshNicknames(nicknames) {
    nicknameList.innerHTML = "";
    for (let i = 0; i < nicknames.length; i++) {
        nicknameList.innerHTML += "<div>" + nicknames[i] + "</div>";
    }
}