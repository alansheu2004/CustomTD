var currentState = null; //The current state (should be used for testing primarily)

//This function is called when starting a new game
function init() {
	if(currentState != null) {
		currentState.nextRound = null;
	}

	var DEFAULT_GAME = {
		"map" : defaultMap, 
		"health" : 1,
		"money" : 200,
		"towerTypes" : defaultTowerTypes,
		"enemyWaves" : defaultWaves,
		"font" : "Oeztype",

		"gameOverBackgroundColor" : "rgb(211, 160, 110)",
		"gameOverTextColor" : "#996633",
		"gameOverTextStrokeColor" : "rgb(102, 67, 33)",

		"mapScreenTextColor" : "#ffd630",
		"mapScreenTextStrokeColor" : "#c48a16",

		"panelBaseColor" : "#996633",
		"panelBoxColor": "#d3a06e",
		"panelTextColor" : "#ffd630",
		"panelTowerOptionBoxFillColor" : "#f4cea8",
		"panelTowerOptionBoxHoverOutlineColor" : "#996633",
		"panelTowerOptionScrollBarColor" : "#664321",
		"panelButtonFillColor" : "#804c1b",
		"panelButtonSymbolColor" : "#ffd630",

		"sellButtonColor": "#992200",
		"sellButtonTextColor": "#ffd630",
		"sellMultiplier": 0.5
	}

	currentState = new GameState(document.getElementById("canvasDiv"), DEFAULT_GAME);
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
	this.gameOverFade = 0; //opacity of the game over screen fading in
	this.gameOverText = "Game Over";
	
	this.buttons = [];

	this.map = this.game.map;
	this.mapscreen = new MapScreen(this, this.map);
	this.panel = new Panel(this);

	this.font = game.font;
	
	this.backgroundImage = game.backgroundImage;
	this.health = game.health;
	this.money = game.money;
	this.round = 0;
	this.inRound = false;
	this.towerTypes = game.towerTypes;
	this.towers = [];
	this.path = game.path;
	this.showingBoundaries = true;

	this.enemies = [];
	this.enemywaves = game.enemyWaves;
	this.currentWave = []; //
	this.bunchTimer = []; //Countdown timer for each enemy bunch in the round
	this.enemyCountdown = []; //How many enemies are left in each bunch

	this.roundNotifyTimer = 0; //Time left until big round notification disappears

	this.restartButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=0 && x<=CANVAS_WIDTH &&
	        y>=0 && y<=CANVAS_HEIGHT;
	    },
	    function(state) { //action
	        state.restartButton.active = false; window.clearInterval(state.loop); init();
	    },
	    false);
	this.addButton(this.restartButton);


	this.interval = 40;
	
	this.loop = window.setInterval(function() {
		thisState.update();
	}, thisState.interval);
}

//Adds a new tower
GameState.prototype.addTower = function(towerType, x, y) {
	this.towers.push(new Tower(this, towerType, x, y));
	this.towerCanvas.valid = false;
}

//Adds a new enemy
GameState.prototype.addEnemy = function(enemy) {
	this.enemies.push(enemy);
	this.enemyCanvas.valid = false;
}

//Called every frame; updates all element states and calls validate() if necessary
GameState.prototype.update = function() {
	if (this.gameOverFade < 1)	 {
		this.updateEnemyPositions();
		this.updateEnemyWaves();

		if (this.gameOver) {
			this.splashCanvas.valid = false;
			this.gameOverFade += 0.03;
		} else {
			this.sortEnemies();
			this.updateTowerStates();
			if (this.revalidationTimer > 0) {
				this.valid = false;
				this.revalidationTimer -= this.interval;
			}
			if (this.roundNotifyTimer > 0) {
				this.labelCanvas.valid = false;
				this.roundNotifyTimer -= this.interval;
			}
		}
	}
	
	if(!this.validating) {
		this.validate();
	}
}

//Redraws all the elements
GameState.prototype.validate = function() {
	this.validating = true;

	if(!this.backgroundCanvas.valid) {
		this.clear(this.backgroundCanvas);
		this.mapscreen.drawBackground();
		this.backgroundCanvas.valid = true;
	}
	if(!this.enemyCanvas.valid) {
		this.clear(this.enemyCanvas);
		this.mapscreen.drawEnemies();
		this.enemyCanvas.valid = true;
	}
	if(!this.attackCanvas.valid) {
		this.clear(this.attackCanvas);
		this.mapscreen.drawAttacks();
		this.attackCanvas.valid = true;
	}
	if(!this.towerCanvas.valid) {
		this.clear(this.towerCanvas);
		this.mapscreen.drawTowers();
		this.towerCanvas.valid = true;
	}
	if(!this.panelCanvas.valid) {
		this.clear(this.panelCanvas);
		this.panel.draw();
		this.panelCanvas.valid = true;
	}
	if(!this.labelCanvas.valid) {
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
		for (var i = 0; i<this.enemies.length; i++) {
			this.enemies[i].updateDist();
			if (this.enemies[i].dist > this.map.path.totalLength) {
				this.health = Math.max(this.health - this.enemies[i].type.damage, 0);
				if (this.health<=0) {
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

GameState.prototype.updateEnemyWaves = function() {
	if(this.inRound) {
		for(var i=0; i<this.bunchTimer.length; i++) {
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
		if(this.round == this.enemywaves.length) {
			this.gameOverText = "You Won!";
			this.gameOver = true;
		} else {
			this.money += 50; //CHANGE THIS LATER
			this.panel.playButton.active = true;
		}
		this.labelCanvas.valid = false;
		this.panelCanvas.valid = false;
		this.inRound = false;
	}
	
}

//Disactivates the update loop and displays a game over screen
GameState.prototype.drawGameOver = function() {
	this.splashContext.globalAlpha = this.gameOverFade;
	this.splashContext.fillStyle = this.game.gameOverBackgroundColor;
	this.splashContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	this.splashContext.font = "small-caps " + GAME_OVER_TEXT_FONT_SIZE + "px " + this.game.font;
	this.splashContext.textAlign = "center";
	this.splashContext.textBaseline = "alphabetic";
	this.splashContext.fillStyle =  this.game.gameOverTextColor;
	this.splashContext.strokeStyle =  this.game.gameOverTextStrokeColor;
	this.splashContext.lineWidth = GAME_OVER_TEXT_FONT_SIZE/20;
	this.splashContext.fillText(this.gameOverText, CANVAS_WIDTH/2, GAME_OVER_TEXT_Y);
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
	for (var i = 0; i<this.towers.length; i++) {
		this.towers[i].updateState(this.enemies);
		this.towers[i].updateAttacks();
	}
}

GameState.prototype.focusTower = function(tower, id) {
	this.focusedTower = tower;
	this.focusedTowerNumber = id;
	this.panel.sellButton.active = true;
	var nextUpgrade = this.focusedTower.type.upgrades[this.focusedTower.upgradeNum+1];
	if(nextUpgrade == undefined || this.money < nextUpgrade.cost) {
		this.panel.upgradeButton.active = false;
	} else {
		this.panel.upgradeButton.active = true;
	}

	this.panelCanvas.valid = false;
	this.towerCanvas.valid = false;
}

GameState.prototype.sellFocusedTower = function() {
	if(this.focusedTower != null) {
		this.towers.splice(this.focusedTowerNumber, 1);
		this.money += Math.ceil(this.focusedTower.baseSellPrice * this.game.sellMultiplier);
		this.unfocus();
	}
	this.labelCanvas.valid = false;
}

GameState.prototype.unfocus = function() {
	this.panel.sellButton.active = false;
	this.panel.upgradeButton.active = false;
	this.focusedTower = null;
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
		this.labelContext.fillText(this.round, ROUND_NOTIFICATION_CENTER_X, ROUND_NOTIFICATION_NUMBER_Y);
		this.labelContext.strokeText(this.round, ROUND_NOTIFICATION_CENTER_X, ROUND_NOTIFICATION_NUMBER_Y);
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

	this.currentWave = this.enemywaves[this.round-1];
	this.bunchTimer = this.currentWave.enemybunches.map(function(bunch) {return bunch.time * 1000 + 1000});
	this.enemyCountdown = this.currentWave.enemybunches.map(function(bunch) {return bunch.number});

	this.labelCanvas.valid = false;
}

//Returns the mouse coordinates relative to the canvas
GameState.prototype.setMouse = function(e) {

	var element = this.canvasDiv, offsetX = 0, offsetY = 0, mx, my;

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
	this.selectionCoors = {x:Math.round(this.mouse.x/10)*10, y:Math.round(this.mouse.y/10)*10};
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
		this.canvasDiv.requestFullscreen().then(function() {thisState.valid = false;});
	} else {
		document.exitFullscreen().then(function() {thisState.valid = false;});;
	}
}

window.onload = function() {
	init();
	try {		
		
	} catch (e) {
		alert("There's an error in the code:\n\n" + e.message + "\n\nPlease notify me1234q@gmail.com about this and wait approximately a month for a reply because that's how often he checks his email.")
		console.trace();
	}
}