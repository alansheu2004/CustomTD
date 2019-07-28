var currentState = null; //The current state (should be used for testing primarily)

//This function is called when starting a new game
function init() {
	if(currentState != null) {
		currentState.nextRound = null;
	}
	currentState = new CanvasState(document.getElementById("mainCanvas"));
}

//Defines the Canvas, game,  and all its properties
function CanvasState(canvas) {
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.context = canvas.getContext("2d");
	var thisState = this; //To be referenced by anonymous inner classes
	
	this.calibrateMeasures(this.canvas);
	if (document.defaultView && document.defaultView.getComputedStyle) {
		window.addEventListener('resize', function() {thisState.calibrateMeasures(thisState.canvas)});
	}
	
	this.valid = false; //Needs to be redrawn?
	this.revalidationTimer = 1000; //Milliseconds until stop auto revalidation
	
	this.dragging = false; //Whether in the process of placing a tower
	this.focusing = false; //Hovering over a tower
	this.optionFocusing = false; //Hovering over a tower option
	this.selection = null; //The Object that is being dragged or hovered
	this.selectionNumber = 0; //The Number of the TowerType selected
	this.mouse = {x: 0, y: 0};
	this.dragOutOfOption = false; //Has dragging tower left option box?
	this.buttonPressed = false;

	this.gameOver = false;
	this.gameOverFade = 0; //opacity of the game over screen fading in
	this.gameOverText = "Game Over";
	
	this.buttons = [];

	this.panel = new Panel(this);
	
	this.backgroundImage = "resources/images/map.png";
	
	this.health = 100;
	this.money = 275;
	this.round = 0;
	this.inRound = false;
	
	this.towerTypes = defaultTowerTypes;
	this.towers = [];
	this.path = defaultPath;

	this.enemies = [];
	this.enemywaves = defaultwaves;
	this.currentWave = [];
	this.bunchTimer = [];
	this.enemyCountdown = [];

	this.roundNotifyTimer = 0;

	this.restartx = 320;
	this.restarty = 210;
	this.restartw = 180;
	this.restarth = 50;
	this.restartButton = new Button(this, 
		function(x, y) {return x>=thisState.restartx-thisState.restartw/2 && x<=thisState.restartx+thisState.restartw/2 &&
			y>=thisState.restarty-thisState.restarty/2 && y<=thisState.restarty+thisState.restarth/2;},
		function(state) {state.restartButton.active = false; window.clearInterval(state.loop); init();},
		false);
	this.addButton(this.restartButton);
	
	//Disables double clicking on the canvas to select text
	canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	
	
	canvas.addEventListener('mousedown', function(e) {
		var mouse = thisState.setMouse(e);
		if (!thisState.startDragging(mouse)) {
			return;
		}
	}, true);

	canvas.addEventListener('mousemove', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisState.moveDragging(mouse)){
			//Do nothing
		} else if (thisState.towerHovering(mouse)) {
			return;
		} else if (thisState.optionHovering(mouse)) {
			return;
		}
		//Stops focusing if nothing returned
		thisState.stopFocusing();
	}, true);

	canvas.addEventListener('mouseup', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisState.dropTower(mouse)){
			return;
		} else if (thisState.releaseButton(mouse)) {
			return;
		}
	}, true);



	canvas.addEventListener('touchstart', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisState.touchToMouseEvent(e, 'mousedown'));
		if (thisState.startDragging(mouse)) {
			
		} else if (thisState.towerHovering(mouse)) {
			return;
		} else if (thisState.optionHovering(mouse)) {
			return;
		}
		//Stops focusing if nothing returned
		thisState.stopFocusing();
	}, true);

	canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisState.touchToMouseEvent(e, 'mousemove'));
		if (thisState.moveDragging(mouse)){
			//Do nothing
		} 
	}, true);

	canvas.addEventListener('touchend', function(e) {
		e.preventDefault();
		var mouse = thisState.mouse;
		if (thisState.dragging){
			if(thisState.dropTower(mouse)) {
				
			} else {
				thisState.dragging = false;
				thisState.optionFocusing = true;
			}
			thisState.valid = false;
		} else if (thisState.releaseButton(mouse)) {
			return;
		}
	}, true);



	this.interval = 20;
	
	this.loop = window.setInterval(function() { thisState.update(); }, thisState.interval);
}

//Adds a new enemy
CanvasState.prototype.addEnemy = function(enemy) {
	this.enemies.push(enemy);
	this.valid = false;
}

//Called every frame; updates all element states and calls validate() if necessary
CanvasState.prototype.update = function() {
	if (!(this.gameOverFade >= 1))	 {
		this.updateEnemyPositions();
		this.updateEnemyWaves();

		if (this.gameOver) {
			this.valid = false;
			this.gameOverFade += 0.03;
		} else {
			this.sortEnemies();
			this.updateTowerStates();
			if (this.revalidationTimer > 0) {
				this.valid = false;
				this.revalidationTimer -= this.interval;
			}
			if (this.roundNotifyTimer > 0) {
				this.valid = false;
				this.roundNotifyTimer -= this.interval;
			}
		}
	}
	
	if(!this.valid) {
		this.validate();
	}
}

//Redraws all the elements
CanvasState.prototype.validate = function() {
	this.clear();
	this.drawBackground();
	//this.path.draw(this.context);
	this.drawEnemies();
	this.drawTowers();

	this.panel.draw(this.context);

	this.drawRoundNumber();
	if(this.roundNotifyTimer > 0) {
		this.drawRoundNotification();
	}
	
	if(this.gameOver) {
		this.drawGameOver();
	} else {
		if(this.dragging && this.dragOutOfOption) {
			this.selection.upgrades[0].drawRange(this.context, this.mouse.x, this.mouse.y);
			this.selection.upgrades[0].draw(this.context, this.mouse.x, this.mouse.y);
		}
	}
	
	this.valid = true;
}

//Clears the canvas, leaving it blank
CanvasState.prototype.clear = function() {
	this.context.clearRect(0,0,this.width,this.height);
}

//Draws the background of the game
CanvasState.prototype.drawBackground = function() {
	var background = new Image();
	background.src = this.backgroundImage;
	this.context.drawImage(background, 0, 0, this.canvas.width-160, this.canvas.height);
}

//Advances the position of each enemy
CanvasState.prototype.updateEnemyPositions = function() {
	
	if (this.enemies.length > 0) {
		for (var i = 0; i<this.enemies.length; i++) {
			this.enemies[i].updateDist();
			if (this.enemies[i].dist > this.path.totalLength) {
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
		this.valid = false;
	}
}

CanvasState.prototype.updateEnemyWaves = function() {

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
		this.panel.playButton.active = true;
	}
	this.valid = false;
	this.inRound = false;
}

//Disactivates the update loop and displays a game over screen
CanvasState.prototype.drawGameOver = function() {
	this.context.fillStyle = "rgb(211, 160, 110, " + this.gameOverFade + ")";
	this.context.fillRect(0, 0, 640, 480);
	
	this.context.font = "small-caps 72px Oeztype";
	this.context.textAlign = "center";
	this.context.fillStyle = "rgb(255, 214, 48, " + this.gameOverFade + ")";
	this.context.strokeStyle = "rgb(102, 67, 33, " + this.gameOverFade + ")";
	this.context.lineWidth = 3;
	this.context.fillText(this.gameOverText, 320, 150);
	this.context.strokeText(this.gameOverText, 320, 150);
	
	if (this.gameOverFade >= 1) {
		this.restartButton.active = true;

		this.drawRestartButton();
	}
}

CanvasState.prototype.drawRestartButton = function() {
	this.context.fillStyle = "#a6703c";
	this.context.strokeStyle = "#664321";
	this.context.lineWidth = 5;
	this.context.fillRect(this.restartx-this.restartw/2, this.restarty-this.restarth/2, this.restartw, this.restarth);
	this.context.strokeRect(this.restartx-this.restartw/2, this.restarty-this.restarth/2, this.restartw, this.restarth);

	this.context.font = "small-caps " + 0.8*this.restarth + "px Oeztype";
	this.context.textAlign = "center";
	this.context.fillStyle = "#664321";
	this.context.fillText("Restart", this.restartx, this.restarty+0.3*this.restarth);
}

//Updates the towers based on enemies
CanvasState.prototype.updateTowerStates = function(){
	for (var i = 0; i<this.towers.length; i++) {
		this.towers[i].updateState(this.enemies);
		this.towers[i].updateProjectiles();
	}
}

//Sorts the enemies array from first in the path to last
CanvasState.prototype.sortEnemies = function() {
	this.enemies.sort(function(a, b) {return b.dist - a.dist});
}

//Draws each enemy
CanvasState.prototype.drawEnemies = function() {
	for (let enemy of this.enemies) {
		enemy.draw(this.context);
	}
}

//Draws each tower and their range/outline if necessary
CanvasState.prototype.drawTowers = function() {
	for (let tower of this.towers) {
		if (this.focusing) {
			if (this.selection == tower) {
				this.selection.drawRange(this.context);
				this.selection.drawOutline(this.context);
			}
		}
		tower.draw(this.context);
		tower.drawProjectiles(this.context);
	}
}

CanvasState.prototype.drawRoundNumber = function() {
	if(this.round != 0) {
		this.context.textAlign = "start";
		this.context.fillStyle = "#ffd630";
		this.context.strokeStyle = "#c48a16";
		this.context.lineWidth = 1;

		this.context.font = "small-caps 20px Oeztype";
		this.context.fillText("Round", 10, 30);
		this.context.strokeText("Round", 10, 30);

		this.context.font = "small-caps 25px Oeztype";
		this.context.fillText(this.round, 75, 30);
		this.context.strokeText(this.round, 75, 30);
	}
}

CanvasState.prototype.drawRoundNotification = function() {
	if(this.round != 0) {
		this.context.textAlign = "center";
		this.context.fillStyle = "#ffd630";
		this.context.strokeStyle = "#c48a16";
		this.context.lineWidth = 2;

		this.context.font = "small-caps 30px Oeztype";
		this.context.fillText("Round", 240, 150);
		this.context.strokeText("Round", 240, 150);

		this.context.font = "small-caps 50px Oeztype";
		this.context.fillText(this.round, 240, 200);
		this.context.strokeText(this.round, 240, 200);
	}
}

CanvasState.prototype.addButton = function(button) {
	this.buttons.push(button);
}

CanvasState.prototype.nextRound = function() {
	this.round++;
	this.inRound = true;
	this.roundNotifyTimer = 2000;
	this.panel.playButton.active = false;

	this.currentWave = this.enemywaves[this.round-1];
	this.bunchTimer = this.currentWave.enemybunches.map(function(bunch) {return bunch.time * 1000 + 1000});
	this.enemyCountdown = this.currentWave.enemybunches.map(function(bunch) {return bunch.number});

	this.valid = false;
}

//Returns the mouse coordinates relative to the canvas
CanvasState.prototype.setMouse = function(e) {

	var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

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
	
	mx *= 640 / this.styleWidth;
	my *= 360 / this.styleHeight;

	this.mouse = {x: mx, y: my};
	return this.mouse;
}

CanvasState.prototype.touchToMouseEvent = function(me, eventName) {
	var touch = me.touches[0];
	return new MouseEvent(eventName, {clientX: touch.clientX, clientY: touch.clientY})
}

//Returns whether dragging tower actually started
CanvasState.prototype.startDragging = function(mouse) {
	if (!this.dragging) {
		for (var i = 0; i < this.towerTypes.length; i++) {
			if (this.panel.optionContains(i, mouse.x, mouse.y) && this.money >= this.towerTypes[i].cost) {
				this.dragging = true;
				this.selectionNumber = i;
				this.selection = this.towerTypes[i];
				this.dragOutOfOption = false;
				this.valid = false;
				return true;
			}
		}

		for (var i = 0; i < this.buttons.length; i++) {
			
			if (this.buttons[i].active && this.buttons[i].inBounds(mouse.x, mouse.y)) {
				this.buttonPressed = true;
				this.selection = this.buttons[i];
				this.valid = false;
				return true;
			}
		}
		//Not selected any option
		return false;
	} else {
		this.valid = false;
		return true;
	}
}

//Returns whether currently dragging
CanvasState.prototype.moveDragging = function(mouse) {
	if (this.dragging){
		if(!this.dragOutOfOption) {
			if(!this.panel.optionContains(this.selectionNumber, mouse.x, mouse.y)) {
				this.dragOutOfOption = true;
			}
		}
		this.valid = false;
		return true;
	} else if (this.buttonPressed){
		if (!this.selection.inBounds(mouse.x, mouse.y)) {
			this.buttonPressed = false;
			this.valid = false;
			return true;
		}
	} else {
		return false;
	}
}

CanvasState.prototype.towerHovering = function(mouse) {
	if (mouse.x <= 480) {
		for (var i = 0; i < this.towers.length; i++) {
			if (this.towers[i].inBounds(mouse.x, mouse.y)) {
				this.selection = this.towers[i];
				this.focusing = true;
				this.valid = false;
				return true;
			}
		}
	}
	return false;
}

CanvasState.prototype.optionHovering = function(mouse) {
	if (mouse.x > 480) {
		for (var i = 0; i < this.towerTypes.length; i++) {
			if(this.panel.optionContains(i, mouse.x, mouse.y)) {
				this.optionFocusing = true;
				this.selectionNumber = i;
				this.selection = this.towerTypes[i];
				this.valid = false;
				return true;;
			}
		}
	}
	return false;
	
}

CanvasState.prototype.stopFocusing = function() {
	if (this.focusing) {
		this.focusing = false;
		this.valid = false;
	}

	if (this.optionFocusing) {
		this.optionFocusing = false;
		this.valid = false;
	}
}

CanvasState.prototype.dropTower = function(mouse) {
	if (this.dragging){
		if(this.dragOutOfOption) {
			if (mouse.x < 480) {
				this.towers.push(new Tower(this, this.selection, mouse.x, mouse.y));
				this.money -= this.selection.cost;
			}
			this.dragging = false;
			return true;
		} else {
			this.dragOutOfOption = true;
			this.dragging = true;
		}
		this.valid = false;
		return true;
	}
	return false;
}

CanvasState.prototype.releaseButton = function(mouse) {
	if (this.buttonPressed) {
		this.buttonPressed = false;
		if(this.selection.inBounds(mouse.x, mouse.y)) {
			this.selection.action(this);
			this.valid = false;
			return true;
		}
	}
	return false;
}

//Calculates accurate dimensions for the canvas
CanvasState.prototype.calibrateMeasures = function(canvas) {
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

window.onload = function() {
	try {
		init();
	} catch (e) {
		alert("There's an error in the code:\n\n" + e.message + "\n\nPlease notify me1234q@gmail.com about this and wait approximately a month for a reply because that's how often he checks his email.")
	}
}