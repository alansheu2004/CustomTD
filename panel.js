function Panel(state) {
	this.state = state;
}

//Draws the panel
Panel.prototype.draw = function(context) {
	context.fillStyle = "#996633";
	context.fillRect(480,0,160,360);
	
	this.drawTopBox(context);
	
	this.towerOptionSize = 40;
	this.drawTowerBox(context);
}

//Draws the top container for health and money
Panel.prototype.drawTopBox = function(context) {
	context.fillStyle = "#d3a06e";
	context.fillRect(500, 10, 120, 55);
	
	context.font = "small-caps 16px Oeztype";
	context.textAlign = "start";
	context.fillStyle = "#ffd630";
	
	var healthImage = new Image();
	healthImage.src = "heart.png";
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
	context.font = "small-caps 25px Oeztype";
	context.textAlign = "center";
	context.fillStyle = "#ffd630";
	context.fillText("-Towers-", 560, 95);
	
	context.fillStyle = "#d3a06e";
	context.fillRect(490, 100, 140, 200);
	
	for (var i=0; i<this.state.towerTypes.length; i++) {
		context.filter = "none";
		context.fillStyle = "#f4cea8";
		var towerCoors = this.getTowerOptionCoors(i);
		context.fillRect(towerCoors.x+3, towerCoors.y+3, this.towerOptionSize-6, this.towerOptionSize-6);
		if (this.state.money < this.state.towerTypes[i].cost) {
			context.filter = "brightness(50%)";
		}
		this.state.towerTypes[i].drawFit(context, towerCoors.x+this.towerOptionSize/2, towerCoors.y+this.towerOptionSize/2, 40)
	}
	context.filter = "none";
	this.drawScrollBar(context);
}

//Draws the scrollbar in the tower box
Panel.prototype.drawScrollBar = function(context) {
	context.fillStyle = "#664321";
	context.fillRect(600, 110, 20, 180);
}

//Gets the coordinates of the top left corner of the tower option in the panel
Panel.prototype.getTowerOptionCoors = function(num) {
	return {x:500+50*(num%2), y:110+(this.towerOptionSize+10)*Math.floor(num/2)};
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