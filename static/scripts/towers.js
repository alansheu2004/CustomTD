var defaultTowerTypes = [
	new TowerType("Peashooter", 30, true,
					[
						new TowerUpgrade("BASE", 100, 200,
							"images/peashooter.svg", 70, 70,
							[new ProjectileShot(PEA, 700, {type:"single"}, null)])
					]
	), 
	new TowerType("Threepeater", 30, true,
					[
						new TowerUpgrade("BASE", 175, 160,
							"images/threepeater.svg", 74, 68,
							[new ProjectileShot(SMALL_PEA, 1000, {type:"spray", number:3, angle: Math.PI/8}, null)])
					]
	), 
	new TowerType("Starfruit", 30, false,
					[
						new TowerUpgrade("BASE", 125, 160,
							"images/starfruit.svg", 70, 70,
							[new ProjectileShot(STAR, 650, {type:"radial", number:5}, -Math.PI/2)])
					]
	)
];

function TowerType(name, footprint, turning,
					upgrades) {
	this.name = name;
	this.footprint = footprint;
	this.upgrades = upgrades;
	this.turning = turning;
}

TowerType.prototype.drawBoundary = function(context, x, y, color, lineWidth, fillOpacity) {
	context.fillStyle = color;
	context.strokeStyle = color;
	context.lineWidth = lineWidth.toString();
	context.beginPath();
	context.filter = "opacity(" + fillOpacity + ")"
	context.arc(x, y, this.footprint, 0, 2*Math.PI);
	context.fill();
	context.filter = "none";
	context.stroke();
}

function TowerUpgrade(name, cost, range,
						image, imgwidth, imgheight,
						projectileshots) {
	this.name = name;
	this.cost = cost;
	this.image = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
	this.range = range;
	this.projectileshots = projectileshots;
}

/*
	Dispersion can be:
	{type:"single"} A single projectile
	{type:"spray", number, angle} Sprays multiple projectiles with angle between them
	{type:"radial", number} Evenly shoots multiple projectiles in all directions
*/
function ProjectileShot(projectiletype, cooldown, dispersion, target) { //Targets a specific angle, default if null
	this.projectiletype = projectiletype;
	this.cooldown = cooldown;
	this.dispersion = dispersion;
	this.target = target;
}

//Draws with a set max dimension while maintaining an aspect ratio
TowerUpgrade.prototype.drawFit = function(context, x, y, max) {
	var image = new Image();
	image.src = this.image;
	if(this.imgwidth >= this.imgheight) {
		context.drawImage(image, x - max/2, y - (max*this.imgheight/this.imgwidth)/2, max, max*this.imgheight/this.imgwidth);
	} else {
		context.drawImage(image, x - (max*this.imgwidth/this.imgheight)/2, y - max/2, max*this.imgwidth/this.imgheight, max);
	}
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
TowerUpgrade.prototype.drawRange = function(context, x, y, valid) {
	context.lineWidth = 2;
	if(valid) {
		context.strokeStyle = RANGE_VALID_COLOR;
		context.fillStyle = RANGE_VALID_COLOR;
	} else  {
		context.strokeStyle = RANGE_INVALID_COLOR;
		context.fillStyle = RANGE_INVALID_COLOR;
	}
	
	context.beginPath();
	context.arc(x, y, this.range, 0, 2*Math.PI);
	context.filter = "opacity(0.3)";
	context.fill();
	context.filter = "opacity(0.5)";
	context.stroke();
	context.filter = "none";
	context.lineWidth = 1;
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
	this.cooldowns = this.upgrade.projectileshots.map(function(ps) {return ps.cooldown});
	this.projectiles = [];

	this.baseSellPrice = this.upgrade.cost;
}

Tower.prototype.updateState = function(enemies) {
	this.cooldown();

	for (var i = 0; i < enemies.length; i++) {
		var enemy = enemies[i];
		if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.upgrade.range) {
			var angle = Math.atan2(enemy.y-this.y, enemy.x-this.x);

			for(var j = 0; j<this.cooldowns.length; j++) {
				if (this.cooldowns[j] <= 0) {
					this.cooldowns[j] = this.upgrade.projectileshots[j].cooldown;

					var projectileAngle;
					if(this.upgrade.projectileshots[j].target == null) {
						projectileAngle = angle;
						if(this.type.turning) {
							this.angle = angle;
						}
					} else {
						projectileAngle = this.upgrade.projectileshots[j].target;
					}
					
					switch(this.upgrade.projectileshots[j].dispersion.type) {
						case "single":
							this.addProjectile(this.upgrade.projectileshots[j].projectiletype, this.x, this.y, projectileAngle);
							break;
						case "spray":
							for(var k=0; k<this.upgrade.projectileshots[j].dispersion.number; k++) {
								this.addProjectile(this.upgrade.projectileshots[j].projectiletype, this.x, this.y, 
									projectileAngle - (this.upgrade.projectileshots[j].dispersion.number/2 - 0.5 - k)*this.upgrade.projectileshots[j].dispersion.angle);
							}
							break;
						case "radial":
							for(var k=0; k<this.upgrade.projectileshots[j].dispersion.number; k++) {
								this.addProjectile(this.upgrade.projectileshots[j].projectiletype, this.x, this.y, projectileAngle + k*(2*Math.PI/this.upgrade.projectileshots[j].dispersion.number));
							}
							break;
						
					}

				}
			}

			this.state.valid = false;
			return;
		}
	}
	
}

Tower.prototype.draw = function() {
	this.upgrade.draw(this.state.context, this.x, this.y, this.angle);
}

Tower.prototype.inBounds = function(mx, my) {
	if(Math.hypot(this.x - mx, this.y - my) < this.type.footprint) {
		return true;
	} else {
		return false;
	}
}

Tower.prototype.drawRange = function(valid) {
	this.upgrade.drawRange(this.state.context, this.x, this.y, valid);
}

Tower.prototype.drawBoundary = function(color, lineWidth, fillOpacity) {
	this.type.drawBoundary(this.state.context, this.x, this.y, color, lineWidth, fillOpacity);
}

Tower.prototype.drawOutline = function() {
	this.upgrade.drawOutline(this.state.context, this.x, this.y, this.angle);
}

Tower.prototype.addProjectile = function(type, x, y, angle) {
	this.projectiles.push(new Projectile(this.state, type, x, y, angle));
}

Tower.prototype.drawProjectiles = function() {
	for (let projectile of this.projectiles) {
		projectile.draw(this.state.context);
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

Tower.prototype.cooldown = function() {
	for(var j = 0; j<this.cooldowns.length; j++) {
		if (this.cooldowns[j] > 0) {
			this.cooldowns[j] -= this.state.interval;
		}
	}
}