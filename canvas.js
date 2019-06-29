var state; //The current state (should be used for testing primarily)

//This function is called when starting a new game
function init() {
	state = new CanvasState(document.getElementById("mainCanvas"));
	
}

//Defines the Canvas, game,  and all its properties
function CanvasState(canvas) {
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.context = canvas.getContext("2d");
	
	this.calibrateMeasures();
	window.addEventListener('resize', this.calibrateMeasures());
	
	this.valid = false; //Needs to be redrawn?
	
	this.dragging = false; //Whether in the process of placing a tower
	this.focusing = false; //Hovering over a tower
	this.selection = null; //The Tower or TowerType that is being dragged or hovered
	this.selectionNumber = 0; //The Number of the TowerType selected
	this.mouse = {x: 0, y: 0};
	this.dragOutOfOption = false; //Has dragging tower left option box?
	
	this.panel = new Panel();
	
	this.backgroundImage = "map.png";
	
	this.health = 100;
	this.money = 250;
	
	this.towerTypes = defaultTowerTypes;
	this.towers = [];
	this.path = defaultPath;
	this.enemies = [];
	
	var thisState = this; //To be referenced by anonymous inner classes
	
	//Disables double clicking on the canvas to select text
	canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	
	canvas.addEventListener('mousedown', function(e) {
		var mouse = thisState.setMouse(e);
		if (!thisState.dragging) {
			for (var i = 0; i < thisState.towerTypes.length; i++) {
				if (thisState.panel.optionContains(i, mouse.x, mouse.y) && thisState.money >= thisState.towerTypes[i].cost) {
					thisState.dragging = true;
					thisState.selectionNumber = i;
					thisState.selection = thisState.towerTypes[i];
					thisState.dragOutOfOption = false;
					thisState.valid = false;
					return;
				}
			}
		}
	}, true);
	
	canvas.addEventListener('mousemove', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisState.dragging){
			if(!thisState.dragOutOfOption) {
				if(!thisState.panel.optionContains(thisState.selectionNumber, mouse.x, mouse.y)) {
					thisState.dragOutOfOption = true;
				}
			}
			thisState.valid = false;
		} else if (mouse.x < 480) {
			for (var i = 0; i < thisState.towers.length; i++) {
				if (thisState.towers[i].inBounds(mouse.x, mouse.y)) {
					thisState.selection = thisState.towers[i];
					thisState.focusing = true;
					thisState.valid = false;
					return;
				}
			}
			
		}
		
		//Stops focusing if nothing returned
		if (thisState.focusing) {
			thisState.focusing = false;
			thisState.valid = false;
		}
	}, true);
	
	canvas.addEventListener('mouseup', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisState.dragging){
			if(thisState.dragOutOfOption) {
				if (mouse.x < 480) {
					thisState.towers.push(new Tower(thisState.selection, mouse.x, mouse.y));
					thisState.money -= thisState.selection.cost;
				}
				thisState.dragging = false;
			} else {
				thisState.dragOutOfOption = true;
			}
			thisState.valid = false;
		}
	}, true);

	this.interval = 30;
	
	this.loop = window.setInterval(function() { thisState.update(); }, thisState.interval);
	window.setInterval(function() { thisState.valid = false; }, 1000);
}

//Adds a new enemy
CanvasState.prototype.addEnemy = function(enemy) {
	this.enemies.push(enemy);
	this.valid = false;
}

//Called every frame; updates all element states and calls validate() if necessary
CanvasState.prototype.update = function() {
	this.updateEnemyPositions();
	this.sortEnemies();
	this.updateTowerStates();
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
	if(this.dragging && this.dragOutOfOption) {
		this.selection.drawRange(this.context, this.mouse.x, this.mouse.y);
		this.selection.drawTower(this.context, this.mouse.x, this.mouse.y);
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
					window.clearInterval(this.loop);
					setTimeout(this.gameOver, 500);
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
CanvasState.prototype.gameOver = function() {
	state.context.fillStyle = "rgb(211, 160, 110)";
	state.context.fillRect(0, 0, 640, 480);
	
	state.context.font = "small-caps 72px Oeztype";
	state.context.textAlign = "center";
	state.context.fillStyle = "#ffd630";
	state.context.strokeStyle = "#664321";
	state.context.lineWidth = 3;
	state.context.fillText("Game Over", 320, 210);
	state.context.strokeText("Game Over", 320, 210);
}

//Updates the towers based on enemies
CanvasState.prototype.updateTowerStates = function(){
	for (var i = 0; i<this.towers.length; i++) {
		this.towers[i].updateState(this.enemies);
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

//Calculates accurate dimensions for the canvas
CanvasState.prototype.calibrateMeasures = function() {
	var canvas = this.canvas;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
		this.styleWidth       = parseInt(document.defaultView.getComputedStyle(canvas, null)['width'], 10);
		this.styleHeight      = parseInt(document.defaultView.getComputedStyle(canvas, null)['height'], 10);
	}
	
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;
}

try {
	init();
} catch (e) {
	alert("There's an error in the code:\n\n" + e.message + "\n\nPlease notify me1234q@gmail.com about this and wait approximately a month for a reply because that's how often he checks his email.")
}
