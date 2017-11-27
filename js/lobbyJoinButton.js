var button = document.querySelector(".js-home-button-join");
var lobbyCodeField = document.querySelector(".js-home-input-lobby");

lobbyCodeField.addEventListener('input', function() {
    if (lobbyCodeField.value.length == 4) {
        button.disabled = false;
    }
    else {
        button.disabled = true;
    }
});