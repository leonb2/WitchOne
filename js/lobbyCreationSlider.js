var slider = document.querySelector(".js-game-length-slider");
var valueDiv = document.querySelector(".js-game-length");

slider.addEventListener('input', function() {
   valueDiv.innerHTML = slider.value; 
});