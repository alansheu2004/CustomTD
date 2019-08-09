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
	
	this.towerOptionSize = 40;
	this.drawTowerBox();

	this.drawBottom();
}

Panel.prototype.drawBase = function() {
	this.state.context.fillStyle = "#996633";
	this.state.context.fillRect(PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
}

//Draws the container and its contexts for the tower options
Panel.prototype.drawTowerBox = function() {
	this.state.context.fillStyle = "#d3a06e";
	this.state.context.fillRect(PANEL_TOWER_BOX_X, PANEL_TOWER_BOX_Y, PANEL_TOWER_BOX_WIDTH, PANEL_TOWER_BOX_HEIGHT);
	
	this.state.context.textAlign = "center";
	this.state.context.fillStyle = "#ffd630";
	if(this.state.draggingTower || this.state.hoveringTowerOption) {
		this.state.context.font = "small-caps 18px Oeztype";
		this.state.context.fillText("$" + this.state.selection.cost, PANEL_TOWER_BOX_MID_X, PANEL_TOWER_BOX_Y + PANEL_TOWER_BOX_TOWER_COST_OFFSET_Y);
		this.state.context.font = "small-caps 15px Oeztype";
		this.state.context.fillText(this.state.selection.name, PANEL_TOWER_BOX_MID_X, PANEL_TOWER_BOX_Y + PANEL_TOWER_BOX_TOWER_NAME_OFFSET_Y);
	} else {
		this.state.context.font = "small-caps 27px Oeztype";
		this.state.context.fillText("-Towers-", PANEL_TOWER_BOX_MID_X, PANEL_TOWER_BOX_Y + PANEL_TOWER_BOX_TOWER_TEXT_OFFSET_Y);
	}
	
	this.state.context.fillStyle = "#d3a06e";
	this.state.context.fillRect(PANEL_TOWER_OPTION_BOX_X, PANEL_TOWER_OPTION_BOX_Y, PANEL_TOWER_OPTION_BOX_WIDTH, PANEL_TOWER_OPTION_BOX_HEIGHT);
	
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
	this.state.context.fillRect(PANEL_TOWER_OPTION_SCROLL_BAR_X, PANEL_TOWER_OPTION_SCROLL_BAR_Y, PANEL_TOWER_OPTION_SCROLL_BAR_WIDTH, PANEL_TOWER_OPTION_SCROLL_BAR_HEIGHT);
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
	return {
		x: PANEL_TOWER_OPTIONS_X + (PANEL_TOWER_OPTION_SIZE + PANEL_TOWER_OPTION_GAP) * (num%2), 
		y: PANEL_TOWER_OPTIONS_Y + (PANEL_TOWER_OPTION_SIZE + PANEL_TOWER_OPTION_GAP) * Math.floor(num/2)
	};
}

//Returns whether a coordinate pair is inside a tower option
Panel.prototype.optionContains = function(num, x, y) {
	var towerCoors = this.getTowerOptionCoors(num);
	if(x>=towerCoors.x && y>=towerCoors.y && x<=towerCoors.x+PANEL_TOWER_OPTION_SIZE && y<=towerCoors.y+PANEL_TOWER_OPTION_SIZE) {
		return true;
	} else {
		return false;
	}
}