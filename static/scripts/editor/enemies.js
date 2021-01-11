//Enemy Table
var enemyTable = document.getElementById("enemyTable");
var enemyTableTemplate = document.getElementById("enemyTableTemplate");
var backtoEnemyScreen = document.getElementById("backToEnemyScreen");
function setUpEnemyTable() {
    for(let enemy of currentState.game.enemyTypes) {
        let row = enemyTableTemplate.cloneNode(true);
        row.style.display = "table-row";
        row.children[0].children[0].src = enemy.image.src;
        row.children[1].textContent = enemy.name;
        row.children[2].children[0].addEventListener("click", function() {editEnemy(enemy)});
        row.children[3].children[0].addEventListener("click", function() {deleteEnemy(enemy, row)});
        enemyTable.appendChild(row);
    }
    backtoEnemyScreen.addEventListener("click", exitEnemy);
}

var mainEnemyScreen = document.getElementById("mainEnemyScreen");
var editEnemyScreen = document.getElementById("editEnemyScreen");

var enemyImageInput = document.getElementById("enemyImage");
var currentEnemyImage = document.getElementById("currentEnemyImage");
var enemyWidthInput = document.getElementById("enemyWidth");
var enemyHeightInput = document.getElementById("enemyHeight");

var enemyNameInput = document.getElementById("enemyName");
var enemySizeInput = document.getElementById("enemySize");
var enemyHealthInput = document.getElementById("enemyHealth");
var enemySpeedInput = document.getElementById("enemySpeed");
var enemyRewardInput = document.getElementById("enemyReward");
var enemyDamageInput = document.getElementById("enemyDamage");

var currentEnemy = null;
function editEnemy(enemy) {
    currentEnemy = enemy;
    currentEnemyImage.src = enemy.image.src;
    enemyWidthInput.value = enemy.imgwidth;
    enemyHeightInput.value = enemy.imgheight;
    enemyNameInput.value = enemy.name;
    enemySizeInput.value = enemy.size;
    enemyHealthInput.value = enemy.health;
    enemySpeedInput.value = enemy.speed;
    enemyRewardInput.value = enemy.reward;
    enemyDamageInput.value = enemy.damage;

    mainEnemyScreen.style.display = "none";
    editEnemyScreen.style.display = "initial";
}

function exitEnemy() {
    editEnemyScreen.style.display = "none";
    mainEnemyScreen.style.display = "initial";
    currentEnemy = null;
}

function deleteEnemy(enemy, row) {
    let index = currentState.game.enemyTypes.indexOf(enemy);
    if (index > -1) {
        currentState.game.enemyTypes.splice(index, 1);
        currentState.panelCanvas.valid = false;
    }

    if(row) {
        row.remove();
    }
}


function setUpEnemyInputs() {
    enemyImageInput.addEventListener("change", function() {
        var url = (window.URL ? URL : webkitURL).createObjectURL(enemyImageInput.files[0]);
        currentEnemy.image.src = url;
        currentEnemyImage.src = url;
        currentState.enemyCanvas.valid = false;
    });

    enemyWidthInput.addEventListener("input", function() {
        currentEnemy.imgwidth = enemyWidthInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemyHeightInput.addEventListener("input", function() {
        currentEnemy.imgheight = enemyHeightInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemyNameInput.addEventListener("input", function() {
        currentEnemy.name = enemyNameInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemySizeInput.addEventListener("input", function() {
        currentEnemy.size = enemySizeInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemyHealthInput.addEventListener("input", function() {
        currentEnemy.health = enemyHealthInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemySpeedInput.addEventListener("input", function() {
        currentEnemy.speed = enemySpeedInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemyRewardInput.addEventListener("input", function() {
        currentEnemy.reward = enemyRewardInput.value;
        currentState.enemyCanvas.valid = false;
    });

    enemyDamageInput.addEventListener("input", function() {
        currentEnemy.damage = enemyDamageInput.value;
        currentState.panelCanvas.valid = false;
    });
}