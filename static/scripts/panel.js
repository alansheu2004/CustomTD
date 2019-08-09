function Panel(state) {
	this.state = state;

	this.playx = 560;
	this.playy = 332;
	this.playr = 20;

	var thisPanel = this;

	this.playButton = new Button(state, 
		function(x, y) {return Math.hypot(x-thisPanel.playx, y-thisPanel.playy) <= thisPanel.playr;},
		function(state) {state.nextRound();},
		true);
	state.addButton(this.playButton);
}

//Draws the panel
Panel.prototype.draw = function() {
	
	this.drawBase();
	
	this.drawTopBox();
	
	this.towerOptionSize = 40;
	this.drawTowerBox();

	this.drawBottom();
}

Panel.prototype.drawBase = function() {
	this.state.context.fillStyle = "#996633";
	this.state.context.fillRect(PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
}

//Draws the top container for health and money
Panel.prototype.drawTopBox = function() {
	this.state.context.fillStyle = "#d3a06e";
	this.state.context.fillRect(PANEL_TOP_BOX_X, PANEL_TOP_BOX_Y, PANEL_TOP_BOX_WIDTH, PANEL_TOP_BOX_HEIGHT);
	
	this.state.context.font = "small-caps 16px Oeztype";
	this.state.context.textAlign = "start";
	this.state.context.fillStyle = "#ffd630";
	
	var healthImage = new Image();
	healthImage.src = "../images/heart.png";
	this.state.context.drawImage(healthImage, 510, 15, 22, 20);
	
	this.state.context.font = "small-caps 22px Oeztype";
	this.state.context.textAlign = "center";
	this.state.context.fillStyle = "#ffba30";
	this.state.context.strokeStyle = "#c48a16";
	this.state.context.lineWidth = 3;
	this.state.context.strokeText("$", 521, 58);
	this.state.context.fillText("$", 521, 58);
	this.state.context.lineWidth = 1;
	
	this.state.context.font = "small-caps 16px Oeztype";
	this.state.context.textAlign = "start";
	this.state.context.fillStyle = "#ffd630";
	this.state.context.fillText(this.state.health, 538, 31);
	this.state.context.fillText(this.state.money, 538, 56);
}

//Draws the container and its contexts for the tower options
Panel.prototype.drawTowerBox = function() {
	this.state.context.fillStyle = "#d3a06e";
	this.state.context.fillRect(495, 75, 130, 40);
	
	this.state.context.textAlign = "center";
	this.state.context.fillStyle = "#ffd630";
	if(this.state.draggingTower || this.state.hoveringTowerOption) {
		this.state.context.font = "small-caps 18px Oeztype";
		this.state.context.fillText("$" + this.state.selection.cost, 560, 95);
		this.state.context.font = "small-caps 15px Oeztype";
		this.state.context.fillText(this.state.selection.name, 560, 110);
	} else {
		this.state.context.font = "small-caps 27px Oeztype";
		this.state.context.fillText("-Towers-", 560, 105);
	}
	
	this.state.context.fillStyle = "#d3a06e";
	this.state.context.fillRect(495, 125, 130, 180);
	
	for (var i=0; i<this.state.towerTypes.length; i++) {
		this.state.context.filter = "none";
		this.state.context.fillStyle = "#f4cea8";
		var towerCoors = this.getTowerOptionCoors(i);
		this.state.context.fillRect(towerCoors.x+3, towerCoors.y+3, this.towerOptionSize-6, this.towerOptionSize-6);

		if((this.state.draggingTower || this.state.hoveringTowerOption) && this.state.selection==this.state.towerTypes[i]) {
			this.state.context.strokeStyle = "#b07b48";
			this.state.context.lineWidth = 3;
			this.state.context.strokeRect(towerCoors.x+3, towerCoors.y+3, this.towerOptionSize-6, this.towerOptionSize-6);
		}

		if (this.state.money < this.state.towerTypes[i].cost) {
			this.state.context.filter = "brightness(50%)";
		}
		
		this.state.towerTypes[i].upgrades[0].drawFit(this.state.context, towerCoors.x+this.towerOptionSize/2, towerCoors.y+this.towerOptionSize/2, 40);
		this.state.context.filter = "none";
	}
	
	this.drawScrollBar(this.state.context);
}

//Draws the scrollbar in the tower box
Panel.prototype.drawScrollBar = function() {
	this.state.context.fillStyle = "#664321";
	this.state.context.fillRect(600, 135, 15, 160);
}

Panel.prototype.drawBottom = function() {
	if (!this.playButton.active) {
		this.state.context.filter = "opacity(30%)";
	}
	if(this.state.buttonPressed && this.state.selection == this.playButton) {
		this.state.context.fillStyle = "#664321";
	} else {
		this.state.context.fillStyle = "#804c1b";
	}
	this.state.context.beginPath();
	this.state.context.arc(this.playx, this.playy, this.playr, 0, 2*Math.PI);
	this.state.context.fill();

	this.state.context.fillStyle = "#ffd630";
	this.state.context.beginPath();
	this.state.context.moveTo(this.playx - this.playr/4, this.playy - this.playr/2);
	this.state.context.lineTo(this.playx - this.playr/4, this.playy + this.playr/2);
	this.state.context.lineTo(this.playx + this.playr/2, this.playy);
	this.state.context.closePath();
	this.state.context.fill();

	this.state.context.filter = "none";
}

//Gets the coordinates of the top left corner of the tower option in the panel
Panel.prototype.getTowerOptionCoors = function(num) {
	return {x:505+(this.towerOptionSize+5)*(num%2), y:135+(this.towerOptionSize+5)*Math.floor(num/2)};
}

//Returns whether a coordinate pair is inside a tower option
Panel.prototype.optionContains = function(num, x, y) {
	var towerCoors = this.getTowerOptionCoors(num);
	if(x>=towerCoors.x && y>=towerCoors.y && x<=towerCoors.x+this.towerOptionSize && y<=towerCoors.y+this.towerOptionSize) {
		return true;
	} else {
		return false;
	}
}