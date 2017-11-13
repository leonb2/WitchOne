let slider = document.querySelector(".js-game-length-slider");
let valueDiv = document.querySelector(".js-game-length");

slider.addEventListener('input', () => {
   valueDiv.innerHTML = slider.value; 
});