function MapScreen(state) {
    this.state = state;
}

MapScreen.prototype.draw = function() {
    this.clear();
	this.drawBackground();
	//this.path.draw(this.context);
	this.drawEnemies();
	this.drawTowers();
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