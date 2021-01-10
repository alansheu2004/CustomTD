//Tower Table
var towerTable = document.getElementById("towerTable");
var towerTableTemplate = document.getElementById("towerTableTemplate");
var backtoTowerScreen = document.getElementById("backToTowerScreen");
function setUpTowerTable() {
    for(let tower of currentState.game.towerTypes) {
        let row = towerTableTemplate.cloneNode(true);
        row.style.display = "table-row";
        row.children[0].children[0].src = tower.upgrades[0].image.src;
        row.children[1].textContent = tower.name;
        row.children[2].children[0].addEventListener("click", function() {editTower(tower)});
        row.children[3].children[0].addEventListener("click", function() {deleteTower(tower, row)});
        towerTable.appendChild(row);
    }
    backtoTowerScreen.addEventListener("click", exitTower);
}

var mainTowerScreen = document.getElementById("mainTowerScreen");
var editTowerScreen = document.getElementById("editTowerScreen");
var towerNameInput = document.getElementById("towerName");
var towerFootprintInput = document.getElementById("towerFootprint");
var towerTurningInput = document.getElementById("towerTurning");
var towerWaterInput = document.getElementById("towerWater");
var towerImageInput = document.getElementById("towerImage");
var currentTowerImage = document.getElementById("currentTowerImage");

var currentTower = null;
function editTower(tower) {
    currentTower = tower;
    towerNameInput.value = currentTower.name;
    towerFootprintInput.value = currentTower.footprint;
    towerTurningInput.checked = currentTower.turning;
    towerWaterInput.checked = currentTower.water;

    mainTowerScreen.style.display = "none";
    editTowerScreen.style.display = "initial";
}

function exitTower() {
    editTowerScreen.style.display = "none";
    mainTowerScreen.style.display = "initial";
    currentTower = null;
}

function deleteTower(tower, row) {
    let index = currentState.game.towerTypes.indexOf(tower);
    if (index > -1) {
        currentState.game.towerTypes.splice(index, 1);
        currentState.panelCanvas.valid = false;
    }

    if(row) {
        row.remove();
    }
}


function setUpTowerInputs() {
    // towerImageInput.addEventListener("change", function() {
    //     var url = (window.URL ? URL : webkitURL).createObjectURL(backgroundImageInput.files[0]);
    //     currentTower.image.src = url;
    //     currentTowerImage.src = url;
    //     currentState.panelCanvas.valid = false;
    //     currentState.towerCanvas.valid = false;
    // });

    towerNameInput.addEventListener("input", function() {
        currentTower.name = towerNameInput.value;
        currentState.panelCanvas.valid = false;
    });

    towerFootprintInput.addEventListener("input", function() {
        currentTower.footprint = towerFootprintInput.value;
    });

    towerTurningInput.addEventListener("input", function() {
        currentTower.turning = towerTurningInput.checked;
    });

    towerWaterInput.addEventListener("input", function() {
        currentTower.water = towerWaterInput.checked;
    });
}