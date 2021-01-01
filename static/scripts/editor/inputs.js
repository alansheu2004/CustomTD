//Show Boundaries
var showBoundariesInput = document.getElementById("showBoundaries");
var showBoundariesLabel = document.querySelector("label[for=showBoundaries]");
function setUpShowBoundariesInput() {
    showBoundariesInput.checked = currentState.mapscreen.showBoundaries;
    if(showBoundariesInput.checked) {
        showBoundariesLabel.textContent = "Hide Boundaries";
    } else {
        showBoundariesLabel.textContent = "Show Boundaries";
    }
    showBoundariesInput.addEventListener("change", function() {
        currentState.mapscreen.showBoundaries = showBoundariesInput.checked;
        if(showBoundariesInput.checked) {
            showBoundariesLabel.textContent = "Hide Boundaries";
        } else {
            showBoundariesLabel.textContent = "Show Boundaries";
        }
        currentState.labelCanvas.valid = false;
    });
}

//Font Select
var fontSelect = document.getElementById("font");
for (let option of fontSelect.children) {
    option.style.fontFamily = option.value;
}

function setUpFontSelect() {
    fontSelect.addEventListener("change", function() {
        fontSelect.style.fontFamily = fontSelect.options[fontSelect.selectedIndex].value;
        currentState.game.font = fontSelect.options[fontSelect.selectedIndex].value;
        currentState.panelCanvas.valid = false;
        currentState.labelCanvas.valid = false;
    });
    for(var i=0; i<fontSelect.options.length; i++) {
        if(currentState.game.font == fontSelect.options[i].value) {
            fontSelect.selectedIndex = i;
            break;
        }
    }
    fontSelect.style.fontFamily = fontSelect.options[fontSelect.selectedIndex].value;
}

//Color Inputs
var colorInputs = [
    document.getElementById("panelBaseColor"),
    document.getElementById("panelBoxColor"),
    document.getElementById("panelTextColor"),
    document.getElementById("panelButtonColor"),
    document.getElementById("panelButtonTextColor"),
    document.getElementById("panelTowerOptionColor"),
    document.getElementById("panelTowerOptionOutlineColor")
];

function shouldInvert(h){
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];
    // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return r*0.299 + g*0.587 + b*0.114 < 150;
}

function setUpColorInputs() {
    for(let input of colorInputs) {
        input.value = currentState.game[input.id];
        input.parentElement.style.backgroundColor = input.value;
        if(shouldInvert(input.value)) {
            input.parentElement.classList.add("inverted");
        } else {
            input.parentElement.classList.remove("inverted");
        }
        input.addEventListener("input", function() {
            input.parentElement.style.backgroundColor = input.value;
            currentState.game[input.id] = input.value;
            currentState.panelCanvas.valid = false;
        });
    }
}

//Background Music
var backgroundMusicInput = document.getElementById("backgroundMusic");
var backgroundMusicLabel = document.querySelector("label[for=backgroundMusic]");
var removeBackgroundMusicButton = document.getElementById("removeBackgroundMusic");
function setUpBackgroundMusicInput() {
    if(currentState.game.backgroundMusic) {
        backgroundMusicLabel.textContent = "Change...";
        removeBackgroundMusicButton.style.display = "initial";
    } else {
        backgroundMusicLabel.textContent = "Add...";
        removeBackgroundMusicButton.style.display = "none";
    }

    backgroundMusicInput.addEventListener("change", function() {
        currentState.pauseBackgroundMusic();
        currentState.game.backgroundMusic = (window.URL ? URL : webkitURL).createObjectURL(backgroundMusicInput.files[0]);
        currentState.playBackgroundMusic();
        backgroundMusicLabel.textContent = "Change...";
        removeBackgroundMusicButton.style.display = "initial";
    });
    removeBackgroundMusicButton.addEventListener("click", function() {
        currentState.pauseBackgroundMusic();
        currentState.game.backgroundMusic = null;
        currentState.playBackgroundMusic();
        backgroundMusicLabel.textContent = "Add...";
        removeBackgroundMusicButton.style.display = "none";
    });
}

//Background Image
var backgroundImageInput = document.getElementById("backgroundImage");
var currentBackgroundImage = document.getElementById("currentBackgroundImage");
function setUpBackgroundImageInput() {
    if(currentState.game.backgroundMusic) {
        currentBackgroundImage.src = currentState.game.map.background.src;
    }

    backgroundImageInput.addEventListener("change", function() {
        var url = (window.URL ? URL : webkitURL).createObjectURL(backgroundImageInput.files[0]);
        currentState.game.map.background.src = url;
        currentBackgroundImage.src = url;
        currentState.backgroundCanvas.valid = false;
    });
}

//Spinners
var pathWidthSpinner = document.getElementById("pathWidth");

function setUpSpinners() {
    pathWidthSpinner.value = currentState.map.path.width;
    pathWidthSpinner.addEventListener("input", function() {
        currentState.map.path.width = pathWidthSpinner.value;
        currentState.map.path.setBoundary();
        currentState.labelCanvas.valid = false;
    });
}