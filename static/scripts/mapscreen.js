function MapScreen(state) {
    this.state = state;
}

MapScreen.prototype.draw = function() {
    this.clear();
	this.drawBackground();
	//this.path.draw(this.context);
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
	background.src = this.state.backgroundImage;
	this.state.context.drawImage(background, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);
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
	this.state.context.font = "small-caps 22px Oeztype";
	this.state.context.textAlign = "start";
	this.state.context.fillStyle = "#ffd630";
	this.state.context.strokeStyle = "#c48a16";
	this.state.context.lineWidth = 2;
	this.state.context.strokeText("Round", 13, 35);
	this.state.context.fillText("Round", 13, 35);

	this.state.context.font = "small-caps 30px Oeztype";
	this.state.context.lineWidth = 3;
	if(this.state.round > 0) {
		this.state.context.strokeText(this.state.round, 85, 35);
		this.state.context.fillText(this.state.round, 85, 35);
	} else {
		this.state.context.strokeText("-", 83, 35);
		this.state.context.fillText("-", 83, 35);
	}
	

	var healthImage = new Image();
	healthImage.src = "../images/heart.png";
	this.state.context.drawImage(healthImage, 10, 45, 20, 20);
	
	this.state.context.font = "small-caps 22px Oeztype";
	this.state.context.textAlign = "center";
	this.state.context.fillStyle = "#ffba30";
	this.state.context.strokeStyle = "#c48a16";
	this.state.context.lineWidth = 3;
	this.state.context.strokeText("$", 20, 90);
	this.state.context.fillText("$", 20, 90);
	
	this.state.context.font = "small-caps 18px Oeztype";
	this.state.context.textAlign = "start";
    this.state.context.fillStyle = "#ffd630";
    this.state.context.lineWidth = 2;
    this.state.context.strokeText(this.state.health, 37, 62);
    this.state.context.fillText(this.state.health, 37, 62);
    this.state.context.strokeText(this.state.money, 37, 87);
    this.state.context.fillText(this.state.money, 37, 87);
}