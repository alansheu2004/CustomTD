var state;

function init() {
	state = new CanvasState(document.getElementById("mainCanvas"));
	
}

function CanvasState(canvas) {
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.context = canvas.getContext("2d");
	
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
	this.calibrateMeasures(this);
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;
  
	
	this.valid = false;
	this.revalidationCount = 50;
	this.dragging = false;
	this.focusing = false;
	this.selection = null;
	this.selectionNumber = 0;
	this.selectionx = 0;
	this.selectiony = 0;
	this.dragOutOfOption = false; //Has dragging tower left option box?
	
	this.panel = new Panel();
	
	this.health = 100;
	this.money = 250;
	
	this.towerTypes = defaultTowerTypes;
	this.towers = [];
	this.path = defaultPath;
	this.enemies = [];
	
	window.addEventListener('resize', this.calibrateMeasures(this));
	
	var thisState = this;
	
	
	canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	canvas.addEventListener('mousedown', function(e) {
		var mouse = thisState.getMouse(e);
		var mx = mouse.x;
		var my = mouse.y;
		if (!thisState.dragging) {
			for (var i = 0; i < thisState.towerTypes.length; i++) {
				if (thisState.panel.optionContains(i, mx, my) && thisState.money >= thisState.towerTypes[i].cost) {
					thisState.dragging = true;
					thisState.selectionNumber = i;
					thisState.selection = thisState.towerTypes[i];
					thisState.selectionx = mouse.x;
					thisState.selectiony = mouse.y;
					thisState.dragOutOfOption = false;
					thisState.valid = false;
					return;
				}
			}
		}
	}, true);
	
	canvas.addEventListener('mousemove', function(e) {
		var mouse = thisState.getMouse(e);
		if (thisState.dragging){
			thisState.selectionx = mouse.x;
			thisState.selectiony = mouse.y;
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
		if (thisState.focusing) {
			thisState.focusing = false;
			thisState.valid = false;
		}
	}, true);
	
	canvas.addEventListener('mouseup', function(e) {
		var mouse = thisState.getMouse(e);
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
}

CanvasState.prototype.addEnemy = function(enemy) {
	this.enemies.push(enemy);
	this.valid = false;
}

CanvasState.prototype.update = function() {
	this.updateEnemyPositions();
	this.sortEnemies();
	this.updateTowerStates();
	if (this.revalidationCount > 0) {
		this.valid = false;
		this.revalidationCount--;
	}
	if(!this.valid) {
		this.clear();
		this.drawBackground();
		//this.path.draw(this.context);
		this.drawEnemies();
		this.drawTowers();
		this.panel.draw(this.context);
		if(this.dragging && this.dragOutOfOption) {
			this.selection.drawRange(this.context, this.selectionx, this.selectiony);
			this.selection.drawTower(this.context, this.selectionx, this.selectiony);
		}
		
		this.valid = true;
	}
}

CanvasState.prototype.clear = function() {
	this.context.clearRect(0,0,this.width,this.height);
}

CanvasState.prototype.drawBackground = function() {
	var background = new Image();
	background.src = "map.png";
	this.context.drawImage(background, 0, 0, 480, 360);
}

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

CanvasState.prototype.updateTowerStates = function(){
	for (var i = 0; i<this.towers.length; i++) {
		this.towers[i].updateState(this.enemies);
	}
}

CanvasState.prototype.sortEnemies = function() {
	this.enemies.sort(function(a, b) {return b.dist - a.dist});
}

CanvasState.prototype.drawEnemies = function() {
	for (let enemy of this.enemies) {
		enemy.draw(this.context);
	}
}

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

CanvasState.prototype.getMouse = function(e) {
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

	return {x: mx, y: my};
}

CanvasState.prototype.calibrateMeasures = function(state) {
	var canvas = state.canvas;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		state.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		state.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		state.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		state.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
		state.styleWidth       = parseInt(document.defaultView.getComputedStyle(canvas, null)['width'], 10);
		state.styleHeight      = parseInt(document.defaultView.getComputedStyle(canvas, null)['height'], 10);
	}
}

try {
	init();
} catch (e) {
	alert("There's an error in the code:\n\n" + e.message + "\n\nPlease email me1234q@gmail.com about this and wait approximately a month for a reply because that's how often he checks his email.")
}
