function MapScreen(state, map) {
    this.state = state;
    this.game = state.game;

    this.healthButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=MAP_RESOURCE_ICON_CENTER_X-0.5*MAP_RESOURCE_ICON_WIDTH && x<=MAP_RESOURCE_ICON_CENTER_X+0.5*MAP_RESOURCE_ICON_WIDTH &&
	        y>=MAP_HEALTH_CENTER_Y-0.5*MAP_RESOURCE_ICON_HEIGHT && y<=MAP_HEALTH_CENTER_Y+0.5*MAP_RESOURCE_ICON_HEIGHT;
	    },
	    function(state) { //action
	        state.health = Infinity; state.valid = false;
	    },
	    true);
	this.state.addButton(this.healthButton);

    this.moneyButton = new Button(this, 
	    function(x, y) { //inbounds
	        return x>=MAP_RESOURCE_ICON_CENTER_X-0.5*MAP_RESOURCE_ICON_WIDTH && x<=MAP_RESOURCE_ICON_CENTER_X+0.5*MAP_RESOURCE_ICON_WIDTH &&
	        y>=MAP_MONEY_CENTER_Y-0.5*MAP_RESOURCE_ICON_HEIGHT && y<=MAP_MONEY_CENTER_Y+0.5*MAP_RESOURCE_ICON_HEIGHT;
	    },
	    function(state) { //action
	        state.money = Infinity; state.valid = false;
	    },
	    true);
	this.state.addButton(this.moneyButton);

	this.map = map;
}

MapScreen.prototype.draw = function() {
    this.clear();
	this.drawBackground();
	this.drawBoundaries();
	this.drawEnemies();
    this.drawTowers();
    this.drawResources();
}

//Clears the canvas, leaving it blank
MapScreen.prototype.clear = function() {
	this.state.context.clearRect(0,0,this.width,this.height);
}

//Draws the background of the game
MapScreen.prototype.drawBackground = function() {
	var background = new Image();
	background.src = this.state.map.background;
	this.state.context.drawImage(background, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);
}

MapScreen.prototype.drawBoundaries = function() {
	this.map.drawPathBoundary(this.state.context, 'red', 4, 0.35);
	this.map.drawPath(this.state.context, 'red', 6);
}

//Draws each enemy
MapScreen.prototype.drawEnemies = function() {
	for (let enemy of this.state.enemies) {
		enemy.draw(this.state.context);
	}
}

//Draws each tower and their range/outline if necessary
MapScreen.prototype.drawTowers = function() {
	for (let tower of this.state.towers) {
		if (this.state.hoveringTower) {
			if (this.state.selection == tower) {
				this.state.selection.drawRange(this.state.context);
				this.state.selection.drawOutline(this.state.context);
			}
		}
		tower.draw(this.state.context);
		tower.drawProjectiles(this.state.context);
	}
}

MapScreen.prototype.drawResources = function() {
	this.state.context.textAlign = "start";
	this.state.context.textBaseline = "alphabetic";

	this.state.context.fillStyle = this.game.mapScreenTextColor;
	this.state.context.strokeStyle = this.game.mapScreenTextStrokeColor;
	
	if(this.state.round > 0) {
		this.state.context.font = "small-caps " + MAP_ROUND_FONT_SIZE + "px " + this.game.font;
		this.state.context.lineWidth = MAP_ROUND_FONT_SIZE/8;
		this.state.context.strokeText("Round", MAP_ROUND_OFFSET_X, MAP_ROUND_OFFSET_Y);
		this.state.context.fillText("Round", MAP_ROUND_OFFSET_X, MAP_ROUND_OFFSET_Y);

		var roundNumberOffsetX = MAP_ROUND_OFFSET_X + this.state.context.measureText("Round ").width;

		this.state.context.font = "small-caps " + MAP_ROUND_NUMBER_FONT_SIZE + "px " + this.game.font;
		this.state.context.lineWidth = MAP_ROUND_NUMBER_FONT_SIZE/10;

		this.state.context.strokeText(this.state.round, roundNumberOffsetX, MAP_ROUND_OFFSET_Y);
		this.state.context.fillText(this.state.round, roundNumberOffsetX, MAP_ROUND_OFFSET_Y);
	}
	

	var healthImage = new Image();
	healthImage.src = "images/heart.png";
	this.state.context.drawImage(healthImage, MAP_RESOURCE_ICON_CENTER_X - MAP_RESOURCE_ICON_WIDTH/2, MAP_HEALTH_CENTER_Y - MAP_RESOURCE_ICON_WIDTH/2, MAP_RESOURCE_ICON_WIDTH, MAP_RESOURCE_ICON_HEIGHT);
	
	var moneyImage = new Image();
	moneyImage.src = "images/money.png";
	this.state.context.drawImage(moneyImage, MAP_RESOURCE_ICON_CENTER_X - MAP_RESOURCE_ICON_WIDTH/2, MAP_MONEY_CENTER_Y - MAP_RESOURCE_ICON_HEIGHT/2, MAP_RESOURCE_ICON_WIDTH, MAP_RESOURCE_ICON_HEIGHT);
	
	this.state.context.font = "small-caps " + MAP_RESOURCE_TEXT_FONT_SIZE + "px " + this.game.font;
	this.state.context.textAlign = "start";
	this.state.context.textBaseline = "middle";
    this.state.context.lineWidth = MAP_RESOURCE_TEXT_FONT_SIZE/8;
    this.state.context.strokeText(this.state.health, MAP_RESOURCE_TEXT_OFFSET_X, MAP_HEALTH_CENTER_Y);
    this.state.context.fillText(this.state.health, MAP_RESOURCE_TEXT_OFFSET_X, MAP_HEALTH_CENTER_Y);
    this.state.context.strokeText(this.state.money, MAP_RESOURCE_TEXT_OFFSET_X, MAP_MONEY_CENTER_Y);
    this.state.context.fillText(this.state.money, MAP_RESOURCE_TEXT_OFFSET_X, MAP_MONEY_CENTER_Y);
}