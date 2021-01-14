//Tower Table
var towerTable = document.getElementById("towerTable");
var towerTableTemplate = document.getElementById("towerTableTemplate");
var backtoTowerScreen = document.getElementById("backToTowerScreen");
function setUpTowerTable() {
    fillTowerRows();
    backtoTowerScreen.addEventListener("click", exitTower);
}

function fillTowerRows() {
    towerTable.textContent = "";
    for(let tower of currentState.game.towerTypes) {
        let row = towerTableTemplate.cloneNode(true);
        row.style.display = "table-row";
        row.children[0].children[0].src = tower.upgrades[0].image.src;
        row.children[1].textContent = tower.name;
        row.children[2].children[0].addEventListener("click", function() {editTower(tower)});
        row.children[3].children[0].addEventListener("click", function() {deleteTower(tower, row)});
        towerTable.appendChild(row);
    }
}

var mainTowerScreen = document.getElementById("mainTowerScreen");
var editTowerScreen = document.getElementById("editTowerScreen");

var towerNameInput = document.getElementById("towerName");
var towerDescriptionInput = document.getElementById("towerDescription");
var towerFootprintInput = document.getElementById("towerFootprint");
var towerCostInput = document.getElementById("towerCost");
var towerTurningInput = document.getElementById("towerTurning");
var towerWaterInput = document.getElementById("towerWater");

var upgradeTable = document.getElementById("upgradeTable");
var baseUpgrade = document.getElementById("baseUpgrade");
var upgradeTemplate = document.getElementById("upgradeTemplate");

var currentTower = null;
function editTower(tower) {
    currentTower = tower;
    towerNameInput.value = currentTower.name;
    towerDescriptionInput.value = currentTower.upgrades[0].description;
    towerFootprintInput.value = currentTower.footprint;
    towerCostInput.value = currentTower.upgrades[0].cost;
    towerTurningInput.checked = currentTower.turning;
    towerWaterInput.checked = currentTower.water;

    while(upgradeTable.children[0].children.length > 1) {
        upgradeTable.children[0].removeChild(upgradeTable.children[0].children[1]);
    }
    document.querySelector("#baseUpgrade .upgradeImage").src = currentTower.upgrades[0].image.src;
    document.querySelector("#baseUpgrade .range").value = currentTower.upgrades[0].range;
    document.querySelector("#baseUpgrade .width").value = currentTower.upgrades[0].imgwidth;
    document.querySelector("#baseUpgrade .height").value = currentTower.upgrades[0].imgheight;

    let counter = 1;
    for(let upgrade of tower.upgrades.slice(1)) {
        if(Array.isArray(upgrade)) {
            let tr = upgradeTable.insertRow();
            let td = tr.insertCell();
            tr.appendChild(td);
            td.appendChild(makeUpgradeDiv(upgrade[0], counter));
            td.querySelector(".upgradeDescription").rows = 3;
            counter++;

            td = tr.insertCell();
            tr.appendChild(td);
            td.appendChild(makeUpgradeDiv(upgrade[1], counter));
            td.querySelector(".upgradeDescription").rows = 3;
        } else {
            let tr = upgradeTable.insertRow();
            let td = tr.insertCell();
            td.colSpan = 2;
            tr.appendChild(td);
            td.appendChild(makeUpgradeDiv(upgrade, counter));
        }
        counter++;
    }

    mainTowerScreen.style.display = "none";
    editTowerScreen.style.display = "initial";
}

function makeUpgradeDiv(upgrade, counter) {
    let upgradeDiv = upgradeTemplate.cloneNode(true);
    upgradeDiv.querySelector("[for='upgradeImageLabel']").for = "upgradeImage" + counter;
    upgradeDiv.querySelector("#upgradeImageInput").id = "upgradeImage" + counter;

    upgradeDiv.querySelector(".upgradeName").value = upgrade.name;
    upgradeDiv.querySelector(".upgradeDescription").value = upgrade.description;
    upgradeDiv.querySelector(".upgradeImage").src = upgrade.image.src;
    upgradeDiv.querySelector(".upgradeCost").value = upgrade.cost;
    upgradeDiv.querySelector(".range").value = upgrade.range;
    upgradeDiv.querySelector(".width").value = upgrade.imgwidth;
    upgradeDiv.querySelector(".height").value = upgrade.imgheight;

    upgradeDiv.querySelector("#upgradeImage" + counter).addEventListener("change", function() {
        var url = (window.URL ? URL : webkitURL).createObjectURL(upgradeDiv.querySelector("#upgradeImage" + counter).files[0]);
        upgrade.image.src = url;
        upgradeDiv.querySelector(".upgradeImage").src = url;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    upgradeDiv.querySelector(".upgradeName").addEventListener("input", function() {
        upgrade.name = upgradeDiv.querySelector(".upgradeName").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    upgradeDiv.querySelector(".upgradeDescription").addEventListener("input", function() {
        upgrade.description = upgradeDiv.querySelector(".upgradeDescription").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    upgradeDiv.querySelector(".upgradeCost").addEventListener("input", function() {
        upgrade.cost = upgradeDiv.querySelector(".upgradeCost").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });
    
    upgradeDiv.querySelector(".range").addEventListener("input", function() {
        upgrade.range = upgradeDiv.querySelector(".range").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    upgradeDiv.querySelector(".width").addEventListener("input", function() {
        upgrade.imgwidth = upgradeDiv.querySelector(".width").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    upgradeDiv.querySelector(".height").addEventListener("input", function() {
        upgrade.imgheight = upgradeDiv.querySelector(".height").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    upgradeDiv.style.display = "flex";
    return upgradeDiv;
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

    towerNameInput.addEventListener("input", function() {
        currentTower.name = towerNameInput.value;
        fillTowerRows();
        currentState.panelCanvas.valid = false;
    });

    towerDescriptionInput.addEventListener("input", function() {
        currentTower.upgrades[0].description = towerDescriptionInput.value;
    });

    towerFootprintInput.addEventListener("input", function() {
        currentTower.footprint = towerFootprintInput.value;
    });

    towerCostInput.addEventListener("input", function() {
        currentTowerupgrades[0].cost = towerCostInput.value;
    });

    towerTurningInput.addEventListener("input", function() {
        currentTower.turning = towerTurningInput.checked;
    });

    towerWaterInput.addEventListener("input", function() {
        currentTower.water = towerWaterInput.checked;
    });

    document.getElementById("upgradeImage0").addEventListener("change", function() {
        var url = (window.URL ? URL : webkitURL).createObjectURL(document.getElementById("upgradeImage0").files[0]);
        currentTower.upgrades[0].image.src = url;
        document.querySelector("#baseUpgrade .upgradeImage").src = url;
        fillTowerRows();
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });
    
    document.querySelector("#baseUpgrade .range").addEventListener("input", function() {
        currentTower.upgrades[0].range = document.querySelector("#baseUpgrade .range").value;
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    document.querySelector("#baseUpgrade .width").addEventListener("input", function() {
        currentTower.upgrades[0].imgwidth = document.querySelector("#baseUpgrade .width").value;
        fillEnemyRows();
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });

    document.querySelector("#baseUpgrade .height").addEventListener("input", function() {
        currentTower.upgrades[0].imgheight = document.querySelector("#baseUpgrade .height").value;
        fillEnemyRows();
        currentState.towerCanvas.valid = false;
        currentState.panelCanvas.valid = false;
    });
}