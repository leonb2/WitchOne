let password = document.querySelector(".js-lobby-password").innerHTML;

socket.emit('joinLobby', password);