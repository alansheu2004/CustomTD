var defaultTowerTypes = [
	new TowerType("Peashooter", 100, 15,
					[
						new TowerUpgrade("Peashooter", 100,
							"resources/images/peashooter-tower.svg", 33, 33,
							120, 0.5),
					]
	)
];

function TowerType(name, cost, towerSize,
					upgrades) {
	this.name = name;
	this.cost = cost;
	this.towerSize = towerSize;
	this.upgrades = upgrades;
}

function TowerUpgrade(name, cost,
						image, imgwidth, imgheight,
						range, attackRate) {
	this.name = name;
	this.cost = cost;
	this.image = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
	this.range = range;
	this.attackRate = attackRate;
}

//Draws with a set max dimension while maintaining an aspect ratio
TowerUpgrade.prototype.drawFit = function(context, x, y, max) {
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
TowerUpgrade.prototype.draw = function(context, x, y) {
	
	context.drawImage(image, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
}

//Draws a tower type with an angle
TowerUpgrade.prototype.draw = function(context, x, y, angle) {
	var image = new Image();
	image.src = this.image;

	if(angle) {
		context.translate(x, y);
		context.rotate(angle-Math.PI/2);
		
		context.drawImage(image, -this.imgwidth/2, -this.imgheight/2, this.imgwidth, this.imgheight);

		context.rotate(-(angle-Math.PI/2));
		context.translate(-x, -y);
	} else {
		context.drawImage(image, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
	}
}

//Draws the range of a tower
TowerUpgrade.prototype.drawRange = function(context, x, y) {
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
TowerUpgrade.prototype.drawOutline = function(context, x, y, angle) {
	var image = new Image();
	image.src = this.image;
	context.filter = "brightness(0) invert(1) blur(2px)";
	
	context.translate(x, y);
	context.rotate(angle-Math.PI/2);
	context.drawImage(image, -this.imgwidth/2-2, -this.imgheight/2 - 2, this.imgwidth + 4, this.imgheight + 4);
	context.rotate(-(angle-Math.PI/2));
	context.translate(-x, -y);
	
	context.filter = "none";
}




function Tower(state, type, x, y) {
	this.state = state;
	this.type = type;
	this.x = x;
	this.y = y;
	
	this.upgradeNum = 0;
	this.upgrade = this.type.upgrades[this.upgradeNum];

	this.angle = Math.PI/2;
	this.cooldown = 0;
}

Tower.prototype.updateState = function(enemies) {
	if (this.cooldown <= 0) {
		for (var i = 0; i < enemies.length; i++) {
			var enemy = enemies[i];
			if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.upgrade.range) {
				this.cooldown = this.upgrade.attackRate;
				this.angle = Math.atan2(enemy.y-this.y, enemy.x-this.x);
				this.state.valid = false;
				
				this.projectiles.push(new Projectile(this.state, new ProjectileType(this.state, 1, 1400), this.x, this.y, this.angle));
				
				return;
			}
		}
	} else {
		this.cooldown -= this.state.interval/1000;
	}
}

Tower.prototype.draw = function(context) {
	this.upgrade.draw(context, this.x, this.y, this.angle);
}

Tower.prototype.inBounds = function(mx, my) {
	if(Math.hypot(this.x - mx, this.y - my) < this.type.towerSize) {
		return true;
	} else {
		return false;
	}
}

Tower.prototype.drawRange = function(context) {
	this.upgrade.drawRange(context, this.x, this.y);
}

Tower.prototype.drawOutline = function(context) {
	this.upgrade.drawOutline(context, this.x, this.y, this.angle);
}

Tower.prototype.drawProjectiles = function(context) {
	for (let projectile of this.projectiles) {
		projectile.draw(context);
	}
}

Tower.prototype.updateProjectiles = function() {
	for (var i = 0; i < this.projectiles.length; i++) {
		if (this.projectiles[i].update()) {
			this.projectiles.splice(i, 1);
			i--;
		}
		this.state.valid = false;
	}
}