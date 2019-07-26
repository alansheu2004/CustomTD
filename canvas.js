var currentState; //The current state (should be used for testing primarily)

//This function is called when starting a new game
function init() {
	document.getElementById("restart").style.display = "none";
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
	this.revalidationTimer = 2000; //Milliseconds until stop auto revalidation
	
	this.dragging = false; //Whether in the process of placing a tower
	this.focusing = false; //Hovering over a tower
	this.optionFocusing = false; //Hovering over a tower option
	this.selection = null; //The Tower or TowerType that is being dragged or hovered
	this.selectionNumber = 0; //The Number of the TowerType selected
	this.mouse = {x: 0, y: 0};
	this.dragOutOfOption = false; //Has dragging tower left option box?
	
	this.gameOver = false;
	this.gameOverFade = 0; //opacity of the game over screen fading in
	
	this.panel = new Panel(this);
	
	this.backgroundImage = "resources/images/map.png";
	
	this.health = 100;
	this.money = 250;
	
	this.towerTypes = defaultTowerTypes;
	this.towers = [];
	this.path = defaultPath;
	this.enemies = [];
	
	//Disables double clicking on the canvas to select text
	canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	
	
	canvas.addEventListener('mousedown', function(e) {
		thisState.mouseDown(e);
	}, true);
	canvas.addEventListener('mousemove', function(e) {
		thisState.mouseMove(e);
	}, true);
	canvas.addEventListener('mouseup', function(e) {
		thisState.mouseUp(e);
	}, true);

	this.interval = 15;
	
	this.loop = window.setInterval(function() { thisState.update(); }, thisState.interval);
}

//Adds a new enemy
CanvasState.prototype.addEnemy = function(enemy) {
	this.enemies.push(enemy);
	this.valid = false;
}

//Called every frame; updates all element states and calls validate() if necessary
CanvasState.prototype.update = function() {
	this.updateEnemyPositions();
	
	if (this.gameOver) {
		this.valid = false;
		this.gameOverFade += 0.03;
	} else {
		this.sortEnemies();
		this.updateTowerStates();
		if (this.revalidationTimer >= 0) {
			this.valid = false;
		} else {
			this.revalidationTimer -= this.interval;
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

//Disactivates the update loop and displays a game over screen
CanvasState.prototype.drawGameOver = function() {
	this.context.fillStyle = "rgb(211, 160, 110, " + this.gameOverFade + ")";
	this.context.fillRect(0, 0, 640, 480);
	
	this.context.font = "small-caps 72px Oeztype";
	this.context.textAlign = "center";
	this.context.fillStyle = "rgb(255, 214, 48, " + this.gameOverFade + ")";
	this.context.strokeStyle = "rgb(102, 67, 33, " + this.gameOverFade + ")";
	this.context.lineWidth = 3;
	this.context.fillText("Game Over", 320, 150);
	this.context.strokeText("Game Over", 320, 150);
	
	if (this.gameOverFade >= 1) {
		window.clearInterval(this.loop);
		setTimeout(function() {document.getElementById("restart").style.display = "initial";}, 500);
	}
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

CanvasState.prototype.mouseDown = function(e) {
	var mouse = this.setMouse(e);
	if (!this.dragging) {
		for (var i = 0; i < this.towerTypes.length; i++) {
			
			if (this.panel.optionContains(i, mouse.x, mouse.y) && this.money >= this.towerTypes[i].cost) {
				this.dragging = true;
				this.selectionNumber = i;
				this.selection = this.towerTypes[i];
				this.dragOutOfOption = false;
				this.valid = false;
				return;
			}
		}
	}
}

CanvasState.prototype.mouseMove = function(e) {
	var mouse = this.setMouse(e);
	if (this.dragging){
		if(!this.dragOutOfOption) {
			if(!this.panel.optionContains(this.selectionNumber, mouse.x, mouse.y)) {
				this.dragOutOfOption = true;
			}
		}
		this.valid = false;
	} else if (mouse.x < 480) {
		for (var i = 0; i < this.towers.length; i++) {
			if (this.towers[i].inBounds(mouse.x, mouse.y)) {
				this.selection = this.towers[i];
				this.focusing = true;
				this.valid = false;
				return;
			}
		}
	} else {
		for (var i = 0; i < this.towerTypes.length; i++) {
			if(this.panel.optionContains(i, mouse.x, mouse.y)) {
				this.optionFocusing = true;
				this.selectionNumber = i;
				this.selection = this.towerTypes[i];
				this.valid = false;
				return;
			}
		}
	}
	
	//Stops focusing if nothing returned
	if (this.focusing) {
		this.focusing = false;
		this.valid = false;
	}

	if (this.optionFocusing) {
		this.optionFocusing = false;
		this.valid = false;
	}
}

CanvasState.prototype.mouseUp = function(e) {
	var mouse = this.setMouse(e);
	if (this.dragging){
		if(this.dragOutOfOption) {
			if (mouse.x < 480) {
				this.towers.push(new Tower(this, this.selection, mouse.x, mouse.y));
				this.money -= this.selection.cost;
			}
			this.dragging = false;
		} else {
			this.dragOutOfOption = true;
		}
		this.valid = false;
	}
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