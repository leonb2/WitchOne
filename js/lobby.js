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
readyButton.disabled = true;

socket.on('refreshNicknames', (nicknames) => {
    refreshNicknames(nicknames);
});

 function refreshNicknames(nicknames) {
    nicknameList.innerHTML = "";
    for (let i = 0; i < nicknames.length; i++) {
        nicknameList.innerHTML += "<div>" + nicknames[i] + "</div>";
    }
}