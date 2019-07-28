var PLAY;

function Panel(state) {
	this.state = state;

	this.playx = 560;
	this.playy = 332;
	this.playr = 20;

	var thisPanel = this;

	PLAY = new Button(state, 
		function(x, y) {return Math.hypot(x-thisPanel.playx, y-thisPanel.playy) <= thisPanel.playr;},
		function(state) {state.nextRound();},
		true);
	state.addButton(PLAY)
}

//Draws the panel
Panel.prototype.draw = function(context) {
	context.fillStyle = "#996633";
	context.fillRect(480,0,160,360);
	
	this.drawTopBox(context);
	
	this.towerOptionSize = 40;
	this.drawTowerBox(context);

	this.drawBottom(context);
}

//Draws the top container for health and money
Panel.prototype.drawTopBox = function(context) {
	context.fillStyle = "#d3a06e";
	context.fillRect(505, 10, 110, 55);
	
	context.font = "small-caps 16px Oeztype";
	context.textAlign = "start";
	context.fillStyle = "#ffd630";
	
	var healthImage = new Image();
	healthImage.src = "resources/images/heart.png";
	context.drawImage(healthImage, 510, 15, 22, 20);
	
	context.font = "small-caps 22px Oeztype";
	context.textAlign = "center";
	context.fillStyle = "#ffba30";
	context.strokeStyle = "#c48a16";
	context.lineWidth = 3;
	context.strokeText("$", 521, 58);
	context.fillText("$", 521, 58);
	context.lineWidth = 1;
	
	context.font = "small-caps 16px Oeztype";
	context.textAlign = "start";
	context.fillStyle = "#ffd630";
	context.fillText(this.state.health, 538, 31);
	context.fillText(this.state.money, 538, 56);
}

//Draws the container and its contexts for the tower options
Panel.prototype.drawTowerBox = function(context) {
	context.fillStyle = "#d3a06e";
	context.fillRect(495, 75, 130, 40);
	
	context.textAlign = "center";
	context.fillStyle = "#ffd630";
	if(this.state.optionFocusing || this.state.dragging) {
		context.font = "small-caps 18px Oeztype";
		context.fillText("$" + this.state.selection.cost, 560, 95);
		context.font = "small-caps 15px Oeztype";
		context.fillText(this.state.selection.name, 560, 110);
	} else {
		context.font = "small-caps 27px Oeztype";
		context.fillText("-Towers-", 560, 105);
	}
	
	context.fillStyle = "#d3a06e";
	context.fillRect(495, 125, 130, 180);
	
	for (var i=0; i<this.state.towerTypes.length; i++) {
		context.filter = "none";
		context.fillStyle = "#f4cea8";
		var towerCoors = this.getTowerOptionCoors(i);
		context.fillRect(towerCoors.x+3, towerCoors.y+3, this.towerOptionSize-6, this.towerOptionSize-6);

		if((this.state.dragging || this.state.optionFocusing) && this.state.selection==this.state.towerTypes[i]) {
			context.strokeStyle = "#b07b48";
			context.lineWidth = 3;
			context.strokeRect(towerCoors.x+3, towerCoors.y+3, this.towerOptionSize-6, this.towerOptionSize-6);
		}

		if (this.state.money < this.state.towerTypes[i].cost) {
			context.filter = "brightness(50%)";
		}
		
		this.state.towerTypes[i].upgrades[0].drawFit(context, towerCoors.x+this.towerOptionSize/2, towerCoors.y+this.towerOptionSize/2, 40);
		context.filter = "none";
	}
	
	this.drawScrollBar(context);
}

//Draws the scrollbar in the tower box
Panel.prototype.drawScrollBar = function(context) {
	context.fillStyle = "#664321";
	context.fillRect(600, 135, 15, 160);
}

Panel.prototype.drawBottom = function(context) {
	if (!PLAY.active) {
		context.filter = "opacity(30%)";
	}
	if(this.state.buttonPressed && this.state.selection == PLAY) {
		context.fillStyle = "#664321";
	} else {
		context.fillStyle = "#804c1b";
	}
	context.beginPath();
	context.arc(this.playx, this.playy, this.playr, 0, 2*Math.PI);
	context.fill();

	context.fillStyle = "#ffd630";
	context.beginPath();
	context.moveTo(this.playx - this.playr/4, this.playy - this.playr/2);
	context.lineTo(this.playx - this.playr/4, this.playy + this.playr/2);
	context.lineTo(this.playx + this.playr/2, this.playy);
	context.closePath();
	context.fill();

	context.filter = "none";
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