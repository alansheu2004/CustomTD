var defaultTowerTypes = [
	new TowerType(100, 0.75, 14, 100, "peashooter-tower.svg", "peashooter-tower.svg", 33, 33)
]

function TowerType(cost, attackRate, towerSize, range, image, towerImage, imgwidth, imgheight) {
	this.cost = cost;
	this.image = image;
	this.towerSize = towerSize;
	this.towerImage = towerImage;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
	this.range = range;
	this.towerSize = towerSize;
	this.attackRate = attackRate;
}

//Draws with a set max dimention while maintaining an aspect ratio
TowerType.prototype.drawFit = function(context, x, y, max) {
	var image = new Image();
	image.src = this.image;
	var imgwidth = image.width;
	var imgheight = image.height;
	if(imgwidth >= imgheight) {
		context.drawImage(image, x - max/2, y - (max*imgheight/imgwidth)/2, max, max*imgheight/imgwidth);
	} else {
		context.drawImage(image, x - (max*imgwidth/imgheight)/2, y - max/2, max*imgwidth/imgheight, max);
	}
}

//Draws a tower type
TowerType.prototype.drawTower = function(context, x, y) {
	var image = new Image();
	image.src = this.towerImage;
	context.drawImage(image, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
}

//Draws a tower type with an angle
TowerType.prototype.drawTower = function(context, x, y, angle) {
	var image = new Image();
	image.src = this.towerImage;
	
	context.translate(x, y);
	context.rotate(angle-Math.PI/2);
	context.drawImage(image, -this.imgwidth / 2, -this.imgheight / 2, this.imgwidth, this.imgheight);
	context.rotate(-(angle-Math.PI/2));
	context.translate(-x, -y);
	
}

//Draws the range of a tower
TowerType.prototype.drawRange = function(context, x, y) {
	context.lineWidth = 2;
	context.strokeStyle = "rgb(0, 0, 0, 0.3)";
	context.fillStyle = "rgb(0, 0, 0, 0.2)";
	context.beginPath();
	context.arc(x, y, this.range, 0, 2*Math.PI);
	context.fill();
	context.stroke();
	context.lineWidth = 1;
	
	context.fillStyle = "rgb(0, 0, 0, 0.3)";
	context.beginPath();
	context.arc(x, y, this.towerSize, 0, 2*Math.PI);
	context.fill();
}

//Draw the outline of a tower
TowerType.prototype.drawOutline = function(context, x, y, angle) {
	var image = new Image();
	image.src = this.towerImage;
	context.filter = "brightness(0) invert(1) blur(2px)";
	
	context.translate(x, y);
	context.rotate(angle-Math.PI/2);
	for(var i=0; i<2; i++) {
		context.drawImage(image, -this.imgwidth/2-2, -this.imgheight/2 - 2, this.imgwidth + 4, this.imgheight + 4);
	}
	context.rotate(-(angle-Math.PI/2));
	context.translate(-x, -y);
	
	context.filter = "none";
}

function Tower(type, x, y) {
	this.image = type.image;
	this.type = type;
	this.towerImage = type.towerImage;
	this.imgwidth = type.imgwidth;
	this.imgheight = type.imgheight;
	this.range = type.range;
	this.x = x;
	this.y = y;
	this.angle = Math.PI/2;
	this.towerSize = type.towerSize;
	this.cooldown = 0;
}

Tower.prototype.updateState = function(enemies) {
	if (this.cooldown <= 0) {
		for (var i = 0; i < enemies.length; i++) {
			var enemy = enemies[i];
			if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range) {
				this.cooldown = this.type.attackRate;
				this.angle = Math.atan2(enemy.y-this.y, enemy.x-this.x);
				state.valid = false;
				
				
				state.money += enemy.type.rbe;
				if (enemy.type.child == null) {
					enemies.splice(i, 1);
				} else {
					enemy.type = enemy.type.child;
				}
				
				return;
			}
		}
	} else {
		this.cooldown -= state.interval/1000;
	}
}

Tower.prototype.draw = function(context) {
	this.type.drawTower(context, this.x, this.y, this.angle);
}

Tower.prototype.inBounds = function(mx, my) {
	if(Math.hypot(this.x - mx, this.y - my) < this.towerSize) {
		return true;
	} else {
		return false;
	}
}

Tower.prototype.drawRange = function(context) {
	this.type.drawRange(context, this.x, this.y);
}

Tower.prototype.drawOutline = function(context) {
	this.type.drawOutline(context, this.x, this.y, this.angle);
}