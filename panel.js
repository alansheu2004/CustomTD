function Panel() {
	
}

Panel.prototype.draw = function(context) {
	context.fillStyle = "#996633";
	context.fillRect(480,0,160,360);
	
	this.drawTopBox(context);
	
	this.towerOptionSize = 40;
	this.drawTowerBox(context);
}

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
	context.fillText(state.health, 538, 31);
	context.fillText(state.money, 538, 56);
}

Panel.prototype.drawTowerBox = function(context) {
	context.font = "small-caps 25px Oeztype";
	context.textAlign = "center";
	context.fillStyle = "#ffd630";
	context.fillText("-Towers-", 560, 95);
	
	context.fillStyle = "#d3a06e";
	context.fillRect(490, 100, 140, 200);
	
	for (var i=0; i<state.towerTypes.length; i++) {
		context.filter = "none";
		context.fillStyle = "#f4cea8";
		var towerCoors = this.getTowerOptionCoors(i);
		context.fillRect(towerCoors.x+3, towerCoors.y+3, this.towerOptionSize-6, this.towerOptionSize-6);
		if (state.money < state.towerTypes[i].cost) {
			context.filter = "brightness(50%)";
		}
		state.towerTypes[i].drawFit(state.context, towerCoors.x+this.towerOptionSize/2, towerCoors.y+this.towerOptionSize/2, 40)
	}
	context.filter = "none";
	this.drawScrollBar(context);
}

Panel.prototype.drawScrollBar = function(context) {
	context.fillStyle = "#664321";
	context.fillRect(600, 110, 20, 180);
}

Panel.prototype.getTowerOptionCoors = function(num) {
	return {x:500+50*(num%2), y:110+(this.towerOptionSize+10)*Math.floor(num/2)};
}

Panel.prototype.optionContains = function(num, x, y) {
	var towerCoors = this.getTowerOptionCoors(num);
	if(x>=towerCoors.x && y>=towerCoors.y && x<=towerCoors.x+this.towerOptionSize && y<=towerCoors.y+this.towerOptionSize) {
		return true;
	} else {
		return false;
	}
}