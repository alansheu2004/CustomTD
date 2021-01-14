function MapScreen(state, map) {
    this.state = state;
    this.game = state.game;

	var thisMapScreen = this;
	this.showBoundaries = false;

    var healthImage = new Image();
	healthImage.src = "images/heart.png";
	this.healthCanvas = document.createElement("canvas");
	this.healthCanvas.width = MAP_RESOURCE_ICON_WIDTH;
	this.healthCanvas.height = MAP_RESOURCE_ICON_HEIGHT;
	healthImage.onload = function() {
		thisMapScreen.healthCanvas.getContext("2d").drawImage(healthImage, 0, 0, MAP_RESOURCE_ICON_WIDTH, MAP_RESOURCE_ICON_HEIGHT);
	}

	var moneyImage = new Image();
	moneyImage.src = "images/money.png";
	this.moneyCanvas = document.createElement("canvas");
	this.moneyCanvas.width = MAP_RESOURCE_ICON_WIDTH;
	this.moneyCanvas.height = MAP_RESOURCE_ICON_HEIGHT;
	moneyImage.onload = function() {
		thisMapScreen.moneyCanvas.getContext("2d").drawImage(moneyImage, 0, 0, MAP_RESOURCE_ICON_WIDTH, MAP_RESOURCE_ICON_HEIGHT);
	}	

    this.healthButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=MAP_RESOURCE_ICON_CENTER_X-0.5*MAP_RESOURCE_ICON_WIDTH && x<=MAP_RESOURCE_ICON_CENTER_X+0.5*MAP_RESOURCE_ICON_WIDTH &&
	        y>=MAP_HEALTH_CENTER_Y-0.5*MAP_RESOURCE_ICON_HEIGHT && y<=MAP_HEALTH_CENTER_Y+0.5*MAP_RESOURCE_ICON_HEIGHT;
	    },
	    function(state) { //action
	        state.health = Infinity; 
	        state.labelCanvas.valid = false;
	    },
	    true, []);
	this.state.addButton(this.healthButton);

    this.moneyButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=MAP_RESOURCE_ICON_CENTER_X-0.5*MAP_RESOURCE_ICON_WIDTH && x<=MAP_RESOURCE_ICON_CENTER_X+0.5*MAP_RESOURCE_ICON_WIDTH &&
	        y>=MAP_MONEY_CENTER_Y-0.5*MAP_RESOURCE_ICON_HEIGHT && y<=MAP_MONEY_CENTER_Y+0.5*MAP_RESOURCE_ICON_HEIGHT;
	    },
	    function(state) { //action
	        state.money = Infinity;
	        state.labelCanvas.valid = false;
	    },
	    true, [state.panelCanvas]);
	this.state.addButton(this.moneyButton);

	this.map = map;
}

MapScreen.prototype.draw = function() {
	this.drawBackground();
	this.drawEnemies();
    this.drawTowers();
	this.drawLabels();
}

//Draws the background of the game
MapScreen.prototype.drawBackground = function() {
	this.state.backgroundContext.drawImage(this.state.map.background, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);
}

MapScreen.prototype.drawBoundaries = function() {
	this.map.drawWaterBoundary(this.state.labelContext, 'blue', 4, 0.4);
	this.map.drawPathBoundary(this.state.labelContext, 'red', 4, 0.4);
	this.map.drawPath(this.state.labelContext, 'red', 6);
	this.map.drawObstacles(this.state.labelContext, 'green', 4, 0.4);
	for (let tower of this.state.towers) {
		tower.drawBoundary('orange', 4, 0.5);
	}
}

//Draws each enemy
MapScreen.prototype.drawEnemies = function() {
	for (let enemy of this.state.enemies) {
		enemy.draw(this.state.enemyContext);
	}
}

//Draws each tower and their range/outline if necessary
MapScreen.prototype.drawTowers = function() {
	for (let tower of this.state.towers) {
		if (this.state.focusedTower == tower) {
			this.state.focusedTower.drawRange(true);
			this.state.focusedTower.drawOutline();
		} else if (this.state.pressingTower || this.state.hoveringTower) {
			if (this.state.selection == tower) {
				this.state.selection.drawRange(true);
				this.state.selection.drawOutline();
			}
		}
		
		tower.draw();
	}
}

//Draws each attack
MapScreen.prototype.drawAttacks = function() {
	for (let tower of this.state.towers) {
		tower.drawAttacks();
	}
}

MapScreen.prototype.drawLabels = function() {
	this.state.labelContext.textAlign = "start";
	this.state.labelContext.textBaseline = "alphabetic";

	this.state.labelContext.fillStyle = this.game.mapScreenTextColor;
	this.state.labelContext.strokeStyle = this.game.mapScreenTextStrokeColor;
	
	if(this.state.round > 0) {
		this.state.labelContext.font = "small-caps " + MAP_ROUND_FONT_SIZE + "px " + this.game.font;
		this.state.labelContext.lineWidth = MAP_ROUND_FONT_SIZE/8;
		this.state.labelContext.strokeText("Round", MAP_ROUND_OFFSET_X, MAP_ROUND_OFFSET_Y);
		this.state.labelContext.fillText("Round", MAP_ROUND_OFFSET_X, MAP_ROUND_OFFSET_Y);

		var roundNumberOffsetX = MAP_ROUND_OFFSET_X + this.state.labelContext.measureText("Round ").width;

		this.state.labelContext.font = "small-caps " + MAP_ROUND_NUMBER_FONT_SIZE + "px " + this.game.font;
		this.state.labelContext.lineWidth = MAP_ROUND_NUMBER_FONT_SIZE/10;

		this.state.labelContext.strokeText(this.state.round, roundNumberOffsetX, MAP_ROUND_OFFSET_Y);
		this.state.labelContext.fillText(this.state.round, roundNumberOffsetX, MAP_ROUND_OFFSET_Y);
	}
	
	this.state.labelContext.drawImage(this.healthCanvas, MAP_RESOURCE_ICON_CENTER_X - MAP_RESOURCE_ICON_WIDTH/2, MAP_HEALTH_CENTER_Y - MAP_RESOURCE_ICON_WIDTH/2, MAP_RESOURCE_ICON_WIDTH, MAP_RESOURCE_ICON_HEIGHT);
	this.state.labelContext.drawImage(this.moneyCanvas, MAP_RESOURCE_ICON_CENTER_X - MAP_RESOURCE_ICON_WIDTH/2, MAP_MONEY_CENTER_Y - MAP_RESOURCE_ICON_HEIGHT/2, MAP_RESOURCE_ICON_WIDTH, MAP_RESOURCE_ICON_HEIGHT);
	
	this.state.labelContext.font = "small-caps " + MAP_RESOURCE_TEXT_FONT_SIZE + "px " + this.game.font;
	this.state.labelContext.textAlign = "start";
	this.state.labelContext.textBaseline = "middle";
    this.state.labelContext.lineWidth = MAP_RESOURCE_TEXT_FONT_SIZE/8;
    this.state.labelContext.strokeText(this.state.health, MAP_RESOURCE_TEXT_OFFSET_X, MAP_HEALTH_CENTER_Y);
    this.state.labelContext.fillText(this.state.health, MAP_RESOURCE_TEXT_OFFSET_X, MAP_HEALTH_CENTER_Y);
    this.state.labelContext.strokeText(this.state.money, MAP_RESOURCE_TEXT_OFFSET_X, MAP_MONEY_CENTER_Y);
	this.state.labelContext.fillText(this.state.money, MAP_RESOURCE_TEXT_OFFSET_X, MAP_MONEY_CENTER_Y);
	
	if(this.showBoundaries) {
		this.drawBoundaries();
	}
}