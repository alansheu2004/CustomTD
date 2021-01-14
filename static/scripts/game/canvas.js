var currentState = null;
var started = false;

var DEFAULT_GAME = {
	"title" : "ZombiesTD",
	"map" : defaultMap, 
	"health" : 10,
	"money" : 300,
	"roundlyIncome" : 0,
	"towerTypes" : defaultTowerTypes,
	"enemyTypes" : defaultEnemyTypes,
	"enemyWaves" : defaultWaves,
	"font" : "Oeztype",
	"backgroundMusic" : "sounds/poolMusic.mp3",
	"damageSound" : "sounds/splat.mp3",

	"splashBackgroundColor" : "#d3a06e",
	"splashTextColor" : "#996633",
	"gameOverText" : "The Zombies have Eaten your Brains!",
	"victoryText" : "You Live to See Another Day!",

	"mapScreenTextColor" : "#ffd630",
	"mapScreenTextStrokeColor" : "#c48a16",

	"panelBaseColor" : "#996633",
	"panelBoxColor": "#d3a06e",
	"panelTextColor" : "#ffd630",
	"panelTowerOptionColor" : "#f4cea8",
	"panelTowerOptionOutlineColor" : "#996633",
	"panelButtonColor": "#992200",
	"panelButtonTextColor": "#ffd630",
	"sellMultiplier": 75
}

//This function is called when starting a new game
function init() {
	if(currentState != null) {
		currentState.nextRound = null;
		currentState.backgroundMusic.pause();
	}

	currentState = new GameState(document.getElementById("canvasDiv"), DEFAULT_GAME);

	if(typeof variable !== undefined) {
		setUpShowBoundariesInput()
		setUpFontSelect();
		setUpColorInputs();
		setUpTextInputs();
		setUpBackgroundMusicInput();
		setUpBackgroundImageInput();
		setUpSpinners();
		setUpTowerTable();
		setUpTowerInputs();
		setUpEnemyTable();
		setUpEnemyInputs();
	}
}

//Defines the Canvas, game, and all its properties
function GameState(canvasDiv, game) {
	this.canvasDiv = canvasDiv;

	this.backgroundCanvas = document.getElementById("backgroundCanvas");
	this.backgroundCanvas.width = CANVAS_WIDTH;
	this.backgroundCanvas.height = CANVAS_HEIGHT;
	this.backgroundCanvas.valid = false;
	this.backgroundContext = backgroundCanvas.getContext("2d");

	this.enemyCanvas = document.getElementById("enemyCanvas");
	this.enemyCanvas.width = CANVAS_WIDTH;
	this.enemyCanvas.height = CANVAS_HEIGHT;
	this.enemyCanvas.valid = false;
	this.enemyContext = enemyCanvas.getContext("2d");

	this.attackCanvas = document.getElementById("attackCanvas");
	this.attackCanvas.width = CANVAS_WIDTH;
	this.attackCanvas.height = CANVAS_HEIGHT;
	this.attackCanvas.valid = false;
	this.attackContext = attackCanvas.getContext("2d");

	this.towerCanvas = document.getElementById("towerCanvas");
	this.towerCanvas.width = CANVAS_WIDTH;
	this.towerCanvas.height = CANVAS_HEIGHT;
	this.towerCanvas.valid = false;
	this.towerContext = towerCanvas.getContext("2d");

	this.panelCanvas = document.getElementById("panelCanvas");
	this.panelCanvas.width = CANVAS_WIDTH;
	this.panelCanvas.height = CANVAS_HEIGHT;
	this.panelCanvas.valid = false;
	this.panelContext = panelCanvas.getContext("2d");

	this.labelCanvas = document.getElementById("labelCanvas");
	this.labelCanvas.width = CANVAS_WIDTH;
	this.labelCanvas.height = CANVAS_HEIGHT;
	this.labelCanvas.valid = false;
	this.labelContext = labelCanvas.getContext("2d");

	this.dragCanvas = document.getElementById("dragCanvas");
	this.dragCanvas.width = CANVAS_WIDTH;
	this.dragCanvas.height = CANVAS_HEIGHT;
	this.dragCanvas.valid = false;
	this.dragContext = dragCanvas.getContext("2d");

	this.splashCanvas = document.getElementById("splashCanvas");
	this.splashCanvas.width = CANVAS_WIDTH;
	this.splashCanvas.height = CANVAS_HEIGHT;
	this.splashCanvas.valid = false;
	this.splashContext = splashCanvas.getContext("2d");

	var thisState = this; //To be referenced by anonymous inner classes
	this.game = game;
	
	this.calibrateMeasures(this.backgroundCanvas);
	if (document.defaultView && document.defaultView.getComputedStyle) {
		window.addEventListener('resize', function() {thisState.calibrateMeasures(thisState.backgroundCanvas)});
	}
	
	this.valid = false; //Needs to be redrawn?
	this.validating = false;
	this.revalidationTimer = 1000; //Milliseconds until stop auto revalidation (Allow resources time to load)
	
	this.draggingTower = false; //Whether in the process of placing a tower
	this.hoveringTower = false; //Hovering over a placed tower
	this.pressingTower = false; //Pressing over a placed tower
	this.hoveringTowerOption = false; //Hovering over a tower option
	this.selection = null; //The Object that is being dragged or hovered
	this.selectionNumber = 0; //The Number of the TowerType selected
	this.mouse = {x: 0, y: 0};
	this.selectionCoors = {x:0, y:0};
	this.dropValid = false; //Whether the selected tower can be placed
	this.towerDraggedOutOfOptionBox = false; //Has dragging tower left option box?
	this.buttonPressed = false;
	this.mouseHandler = new MouseHandler(this);
	
	this.focusedTower = null; //The tower that currently has their menu up
	this.focusedTowerNumber = 0;

	this.gameOver = false;
	this.victory = false;
	this.gameOverFade = 0; //opacity of the game over screen fading in
	
	this.buttons = [];

	this.startButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=0 && x<=CANVAS_WIDTH &&
	        y>=0 && y<=CANVAS_HEIGHT;
	    },
		function(state) { //action
			state.startButton.active = false;
			started = true;
			state.splashCanvas.valid = false;
			state.playBackgroundMusic();
			state.clear(state.splashCanvas);
	    },
	    true, []);
	this.addButton(this.startButton);

	this.restartButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=0 && x<=CANVAS_WIDTH &&
	        y>=0 && y<=CANVAS_HEIGHT;
	    },
	    function(state) { //action
			state.restartButton.active = false; 
			window.clearInterval(state.loop);
			state.pauseBackgroundMusic();
			currentState = new GameState(document.getElementById("canvasDiv"), state.game);
			currentState.playBackgroundMusic();
	    },
	    false, []);
	this.addButton(this.restartButton);

	this.map = this.game.map;
	this.mapscreen = new MapScreen(this, this.map);
	this.panel = new Panel(this);

	this.font = game.font;
	this.backgroundMusic = document.createElement("audio");
	
	this.backgroundImage = game.backgroundImage;
	this.health = game.health;
	this.money = game.money;
	this.round = 0;
	this.inRound = false;
	this.towerTypes = game.towerTypes;
	this.towers = [];
	this.path = game.path;
	this.showingBoundaries = true;
	this.fastForwarding = false;

	this.enemies = [];
	this.enemyWaves = game.enemyWaves;
	this.currentWave = []; //
	this.bunchTimer = []; //Countdown timer for each enemy bunch in the round
	this.enemyCountdown = []; //How many enemies are left in each bunch

	this.roundNotifyTimer = 0; //Time left until big round notification disappears

	this.interval = 40;
	
	this.loop = window.setInterval(function() {
		thisState.update();
	}, thisState.interval);
}

//Adds a new tower
GameState.prototype.addTower = function(towerType, x, y) {
	var newTower = new Tower(this, towerType, x, y);
	if(this.towers.length == 0 || newTower.y < this.towers[0].y) {
		this.towers.unshift(newTower);
	} else {
		for(var i = 0; i < this.towers.length; i++) {
			if(newTower.y > this.towers[i].y) {
				this.towers.splice(i, 0, newTower);
				break;
			}
		}
	}
	this.towerCanvas.valid = false;
	return newTower;
}

//Adds a new enemy
GameState.prototype.addEnemy = function(enemy) {
	this.enemies.push(enemy);
	this.enemyCanvas.valid = false;
}

//Called every frame; updates all element states and calls validate() if necessary
GameState.prototype.update = function() {
	if (this.gameOverFade < 1) {
		for(let f = 0; f < (this.fastForwarding ? FF_RATE : 1); f++) {
			this.updateEnemyPositions();
			this.updateenemyWaves();

			if (this.gameOver) {
				this.splashCanvas.valid = false;
				this.gameOverFade += 0.03;
			} else if (!started){
				this.splashCanvas.valid = false;
			} else {
				this.sortEnemies();
				this.updateTowerStates();
				if (this.revalidationTimer > 0) {
					this.valid = false;
					this.revalidationTimer -= this.interval;
				}
			}
		}
	}

	if (this.roundNotifyTimer > 0) {
		this.labelCanvas.valid = false;
		this.roundNotifyTimer -= this.interval;
	}
	
	if(!this.validating) {
		this.validate();
	}
}

//Redraws all the elements
GameState.prototype.validate = function() {
	this.validating = true;

	if(this.revalidationTimer>0 || !this.backgroundCanvas.valid) {
		this.clear(this.backgroundCanvas);
		this.mapscreen.drawBackground();
		this.backgroundCanvas.valid = true;
	}
	if(this.revalidationTimer>0 || !this.enemyCanvas.valid) {
		this.clear(this.enemyCanvas);
		this.mapscreen.drawEnemies();
		this.enemyCanvas.valid = true;
	}
	if(this.revalidationTimer>0 || !this.attackCanvas.valid) {
		this.clear(this.attackCanvas);
		this.mapscreen.drawAttacks();
		this.attackCanvas.valid = true;
	}
	if(this.revalidationTimer>0 || !this.towerCanvas.valid) {
		this.clear(this.towerCanvas);
		this.mapscreen.drawTowers();
		this.towerCanvas.valid = true;
	}
	if(this.revalidationTimer>0 || !this.panelCanvas.valid) {
		this.clear(this.panelCanvas);
		this.panel.draw();
		this.panelCanvas.valid = true;
	}
	if(this.revalidationTimer>0 || !this.labelCanvas.valid) {
		this.clear(this.labelCanvas);
		this.mapscreen.drawLabels();
		if(this.roundNotifyTimer > 0) {
			this.drawRoundNotification();
		}
		this.labelCanvas.valid = true;
	}

	
	if(this.gameOver) {
		this.clear(this.splashCanvas);
		this.drawGameOver();
	} else if(!started) {
		this.clear(this.splashCanvas);
		this.drawGameStart();
	} else {
		if(!this.dragCanvas.valid) {
			this.clear(dragCanvas);
			if(this.draggingTower && this.towerDraggedOutOfOptionBox) {
				this.selection.upgrades[0].drawRange(this.dragContext, this.selectionCoors.x, this.selectionCoors.y, this.dropValid);
				this.selection.upgrades[0].draw(this.dragContext, this.selectionCoors.x, this.selectionCoors.y);
				this.dragCanvas.valid = true;
			}
		}
	} 
	
	this.validating = false;
}

GameState.prototype.clear = function(canvas) {
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	context.filter = "none";
}

//Advances the position of each enemy
GameState.prototype.updateEnemyPositions = function() {
	
	if (this.enemies.length > 0) {
		for (let i = 0; i<this.enemies.length; i++) {
			this.enemies[i].updateDist();
			if (this.enemies[i].dist > this.map.path.totalLength) {
				this.health = Math.max(this.health - this.enemies[i].type.damage, 0);
				this.labelCanvas.valid = false;
				if (this.health<=0) {
					this.victory = false;
					this.gameOver = true;
				}
				
				this.enemies.splice(i, 1);
				i--;
				continue;
			}
			this.enemies[i].updatePosition();
		}
		this.enemyCanvas.valid = false;
	}
}

GameState.prototype.updateenemyWaves = function() {
	if(this.inRound) {
		for(let i=0; i<this.bunchTimer.length; i++) {
			if(this.enemyCountdown[i] > 0) {
				this.bunchTimer[i] -= this.interval;
				while (this.bunchTimer[i] <= 0 && this.enemyCountdown[i]>0) {
					this.addEnemy(new Enemy(this, this.currentWave.enemybunches[i].enemy));
					this.bunchTimer[i] = this.currentWave.enemybunches[i].spacing*1000;
					this.enemyCountdown[i]--;
				}
			}
		}
	
		for (let c of this.enemyCountdown) {
			if(c>0) {
				return;
			}
		}
	
		if (this.enemies.length > 0) {
			return;
		}
	
		//Round should be over
		if(this.round == this.enemyWaves.length) {
			this.victory = true;
			this.gameOver = true;
		} else {
			this.money += this.game.roundlyIncome; //CHANGE THIS LATER
			this.panel.playButton.active = true;
		}
		this.labelCanvas.valid = false;
		this.panelCanvas.valid = false;
		this.inRound = false;
	}
	
}

GameState.prototype.drawGameStart = function() {
	this.splashContext.fillStyle = this.game.splashBackgroundColor;
	this.splashContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	this.setFontFit(this.splashContext, this.game.title, GAME_OVER_TEXT_FONT_SIZE, CANVAS_WIDTH*0.9);
	this.splashContext.font = "small-caps " + this.splashContext.font;
	this.splashContext.textAlign = "center";
	this.splashContext.textBaseline = "alphabetic";
	this.splashContext.fillStyle =  this.game.splashTextColor;
	this.splashContext.strokeStyle =  this.game.splashTextStrokeColor;
	this.splashContext.lineWidth = GAME_OVER_TEXT_FONT_SIZE/20;
	this.splashContext.fillText(this.game.title, CANVAS_WIDTH/2, GAME_OVER_TEXT_Y);
	//this.context.strokeText(this.gameOverText, CANVAS_WIDTH/2, GAME_OVER_TEXT_Y);

	this.setFontFit(this.splashContext, "Click Anywhere to Start", RESTART_TEXT_FONT_SIZE, CANVAS_WIDTH*0.9);
	this.splashContext.textAlign = "center";
	this.splashContext.baseLine = "hanging";
	this.splashContext.fillStyle = this.game.splashTextColor;
	this.splashContext.fillText("Click Anywhere to Start", CANVAS_WIDTH/2, RESTART_TEXT_CENTER_Y);
}

//Displays a game over screen
GameState.prototype.drawGameOver = function() {
	this.splashContext.globalAlpha = this.gameOverFade;
	this.splashContext.fillStyle = this.game.splashBackgroundColor;
	this.splashContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	this.setFontFit(this.splashContext, this.victory ? this.game.victoryText: this.game.gameOverText, GAME_OVER_TEXT_FONT_SIZE, CANVAS_WIDTH*0.9);
	this.splashContext.font = "small-caps " + this.splashContext.font;
	this.splashContext.textAlign = "center";
	this.splashContext.textBaseline = "alphabetic";
	this.splashContext.fillStyle =  this.game.splashTextColor;
	this.splashContext.strokeStyle =  this.game.splashTextStrokeColor;
	this.splashContext.lineWidth = GAME_OVER_TEXT_FONT_SIZE/20;
	this.splashContext.fillText(this.victory ? this.game.victoryText: this.game.gameOverText, CANVAS_WIDTH/2, GAME_OVER_TEXT_Y);
	//this.context.strokeText(this.gameOverText, CANVAS_WIDTH/2, GAME_OVER_TEXT_Y);
	
	this.splashContext.globalAlpha = 1;

	if (this.gameOverFade >= 1) {
		this.restartButton.active = true;

		this.setFontFit(this.splashContext, "Click Anywhere to Restart", RESTART_TEXT_FONT_SIZE, CANVAS_WIDTH*0.9);
		this.splashContext.textAlign = "center";
		this.splashContext.baseLine = "hanging";
		this.splashContext.fillStyle = this.game.gameOverTextColor;
		this.splashContext.fillText("Click Anywhere to Restart", CANVAS_WIDTH/2, RESTART_TEXT_CENTER_Y);
	}
}

GameState.prototype.showBoundaries = function(show) {
	if (show) {
		this.showingBoundaries = true;
	} else {
		this.showingBoundaries= false;
	}
	this.labelCanvas.valid = false;
}

//Updates the towers based on enemies
GameState.prototype.updateTowerStates = function(){
	for (let i = 0; i<this.towers.length; i++) {
		this.towers[i].updateState(this.enemies);
		this.towers[i].updateAttacks();
	}
}

GameState.prototype.focusTower = function(tower, id) {
	this.focusedTower = tower;
	this.focusedTowerNumber = id;
	this.panel.sellButton.active = true;

	this.panelCanvas.valid = false;
	this.towerCanvas.valid = false;
}

GameState.prototype.sellFocusedTower = function() {
	if(this.focusedTower != null) {
		this.towers.splice(this.focusedTowerNumber, 1);
		this.money += Math.floor(this.focusedTower.baseSellPrice * this.game.sellMultiplier/100);
		this.unfocus();
	}
	this.labelCanvas.valid = false;
}

GameState.prototype.unfocus = function() {
	this.panel.sellButton.active = false;
	this.panel.upgradeButton0.active = false;
	this.panel.upgradeButton1.active = false;
	this.panel.upgradeInfoButton0.active = false;
	this.panel.upgradeInfoButton1.active = false;
	this.focusedTower = null;
	this.panel.showingUpgradeInfo = false;
	this.panelCanvas.valid = false;
	this.towerCanvas.valid = false;
}

//Sorts the enemies array from first in the path to last
GameState.prototype.sortEnemies = function() {
	this.enemies.sort(function(a, b) {return b.dist - a.dist});
}

GameState.prototype.drawRoundNotification = function() {
	if(this.round != 0) {
		this.labelContext.textAlign = "center";
		this.labelContext.fillStyle = this.game.mapScreenTextColor;
		this.labelContext.strokeStyle = this.game.mapScreenTextStrokeColor;

		this.labelContext.textBaseline = "bottom";
		this.labelContext.lineWidth = ROUND_NOTIFICATION_TEXT_FONT_SIZE/15;
		this.labelContext.font = "small-caps " + ROUND_NOTIFICATION_TEXT_FONT_SIZE + "px " + this.game.font;
		this.labelContext.fillText("Round", ROUND_NOTIFICATION_CENTER_X, ROUND_NOTIFICATION_TEXT_Y);
		this.labelContext.strokeText("Round", ROUND_NOTIFICATION_CENTER_X, ROUND_NOTIFICATION_TEXT_Y);

		this.labelContext.textBaseline = "hanging";
		this.labelContext.lineWidth = ROUND_NOTIFICATION_NUMBER_FONT_SIZE/15;
		this.labelContext.font = "small-caps " + ROUND_NOTIFICATION_NUMBER_FONT_SIZE + "px " + this.game.font;
		this.labelContext.fillText(this.round == this.enemyWaves.length ? "Final": this.round, ROUND_NOTIFICATION_CENTER_X, ROUND_NOTIFICATION_NUMBER_Y);
		this.labelContext.strokeText(this.round == this.enemyWaves.length ? "Final": this.round, ROUND_NOTIFICATION_CENTER_X, ROUND_NOTIFICATION_NUMBER_Y);
	}
}

GameState.prototype.addButton = function(button) {
	this.buttons.push(button);
}

GameState.prototype.nextRound = function() {
	this.round++;
	this.inRound = true;
	this.roundNotifyTimer = 2000;
	this.panel.playButton.active = false;

	this.currentWave = this.enemyWaves[this.round-1];
	this.bunchTimer = this.currentWave.enemybunches.map(function(bunch) {return bunch.time * 1000 + 1000});
	this.enemyCountdown = this.currentWave.enemybunches.map(function(bunch) {return bunch.number});

	this.labelCanvas.valid = false;
}

//Returns the mouse coordinates relative to the canvas
GameState.prototype.setMouse = function(e) {

	var element = this.backgroundCanvas, offsetX = 0, offsetY = 0, mx, my;

	if (element.offsetParent !== undefined) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		} while ((element = element.offsetParent));
	}

	offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
	offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;


	mx = e.pageX - offsetX;
	my = e.pageY - offsetY;
	
	mx *= CANVAS_WIDTH / this.styleWidth;
	my *= CANVAS_HEIGHT / this.styleHeight;

	this.mouse = {x: mx, y: my};
	this.selectionCoors = {x:Math.round(this.mouse.x/MAP_TOWER_GRAIN)*MAP_TOWER_GRAIN, y:Math.round(this.mouse.y/MAP_TOWER_GRAIN)*MAP_TOWER_GRAIN};
	return this.mouse;
}

GameState.prototype.setFontFit = function(context, text, targetFontSize, maxWidth) { //Returns the font size given that it must fit within maxWidth. If small enough, returns targetFontSize
	var fontSize = targetFontSize;
	context.font = "small-caps " + fontSize + "px " + this.game.font;
	var width = context.measureText(text).width;
	if (width > maxWidth) {
		fontSize *= maxWidth/width;
		context.font = "small-caps " + fontSize + "px " + this.game.font;
	}
	
}


//Calculates accurate dimensions for the canvas
GameState.prototype.calibrateMeasures = function(canvas) {
	this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
	this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
	this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
	this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	this.styleWidth       = parseInt(document.defaultView.getComputedStyle(canvas, null)['width'], 10);
	this.styleHeight      = parseInt(document.defaultView.getComputedStyle(canvas, null)['height'], 10);
	
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;
}

GameState.prototype.toggleFullscreen = function() {
	var thisState = this;
	if(document.fullscreenElement==null) {
		this.canvasDiv.requestFullscreen().then(function() {thisState.panelCanvas.valid = false;});
	} else {
		document.exitFullscreen().then(function() {thisState.panelCanvas.valid = false;});;
	}
}

GameState.prototype.playBackgroundMusic = function() {
	if(this.game.backgroundMusic) {
		this.backgroundMusic.src = this.game.backgroundMusic;
		this.backgroundMusic.loop = true;
		this.backgroundMusic.play();
	}
}

GameState.prototype.pauseBackgroundMusic = function() {
	this.backgroundMusic.pause();
}

GameState.prototype.toggleFF = function() {
	this.fastForwarding = !this.fastForwarding;
}

window.onload = init;