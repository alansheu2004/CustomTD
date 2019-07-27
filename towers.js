var defaultTowerTypes = [
	new TowerType("Peashooter", 100, 15, true,
					[
						new TowerUpgrade("Peashooter", 100, 120,
							"resources/images/peashooter.svg", 35, 35,
							[new ProjectileShot(PEA, 500, {type:"single"}, null)])
					]
	), 
	new TowerType("Threepeater", 175, 15, true,
					[
						new TowerUpgrade("Threepeater", 175, 80,
							"resources/images/threepeater.svg", 37, 34,
							[new ProjectileShot(SMALL_PEA, 800, {type:"spray", number:3, angle: Math.PI/10}, null)])
					]
	), 
	new TowerType("Starfruit", 150, 15, false,
					[
						new TowerUpgrade("Starfruit", 150, 100,
							"resources/images/starfruit.svg", 35, 35,
							[new ProjectileShot(STAR, 500, {type:"radial", number:5}, -Math.PI/2)])
					]
	)
];

function TowerType(name, cost, towerSize, turning,
					upgrades) {
	this.name = name;
	this.cost = cost;
	this.towerSize = towerSize;
	this.upgrades = upgrades;
	this.turning = turning;
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
	this.cooldowns = this.upgrade.projectileshots.map(function(ps) {return ps.cooldown});
	this.projectiles = [];
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

Tower.prototype.addProjectile = function(type, x, y, angle) {
	this.projectiles.push(new Projectile(this.state, type, x, y, angle));
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

Tower.prototype.cooldown = function() {
	for(var j = 0; j<this.cooldowns.length; j++) {
		if (this.cooldowns[j] > 0) {
			this.cooldowns[j] -= this.state.interval;
		}
	}
}