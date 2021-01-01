var defaultTowerTypes = [
	new TowerType("Peashooter", 25, true, false,
					[
						new TowerUpgrade("BASE", 200, 160,
							"Shoots good ol' reliable peas",
							"images/peashooter.svg", 70, 70,
							[new ProjectileAttack(PEA, 1200, {type:"single"}, null)]),
						new TowerUpgrade("Repeater", 220, 160,
							"Shoots peas twice as fast",
							"images/repeater.svg", 70, 73,
							[new ProjectileAttack(PEA, 600, {type:"single"}, null)]),
						[
							new TowerUpgrade("Threepeater", 350, 180,
								"Shoots 3 peas at a time with bullet speed",
								"images/threepeater.svg", 74, 68,
								[new ProjectileAttack(BULLET_PEA, 750, {type:"spray", number:3, angle: Math.PI/8}, null)]),
							new TowerUpgrade("Snow Pea", 360, 160,
								"Shoots snow peas that slow foes",
								"images/snowpeashooter.svg", 70, 73,
								[new ProjectileAttack(SNOW_PEA, 600, {type:"single"}, null)])
						]
					]
	),
	new TowerType("Starfruit", 25, false, false,
					[
						new TowerUpgrade("BASE", 250, 140,
							"Shoots 5 stars in all directions",
							"images/starfruit.svg", 70, 70,
							[new ProjectileAttack(STAR, 1250, {type:"radial", number:5}, -Math.PI/2)]),
						new TowerUpgrade("Shooting-Star", 175, 160,
							"Shoots slightly faster and farther",
							"images/shootingstar.svg", 70, 70,
							[new ProjectileAttack(FAR_STAR, 1000, {type:"radial", number:5}, -Math.PI/2)]),
						[
							new TowerUpgrade("Superstar", 540, 160,
								"Doubles the number of stars shot",
								"images/superstar.svg", 70, 70,
								[new ProjectileAttack(FAR_STAR, 1000, {type:"radial", number:10}, -Math.PI/2)]),
							new TowerUpgrade("Gravistar", 490, 180,
								"Shoots a giant single homing star",
								"images/gravistar.svg", 70, 70,
								[new ProjectileAttack(HOMING_STAR, 2000, {type:"single"}, null)])
						]
					]
	),
	new TowerType("Iceshroom", 30, false, false,
					[
						new TowerUpgrade("BASE", 180, 120,
							"Blasts cold air that temporarily freezes nearby bloons",
							"images/iceshroom.svg", 80, 70,
							[new PulseAttack(FREEZE_PULSE, 3000, 2*Math.PI, null)]),
						new TowerUpgrade("Deep Freeze", 200, 120,
							"Leaves enemies slow after thawing",
							"images/deepfreeze.svg", 80, 70,
							[new PulseAttack(DEEP_FREEZE_PULSE, 3000, 2*Math.PI, null)]),
						[
							new TowerUpgrade("Icicle Spikes", 340, 120,
								"Shoots ice shards that freeze and damage enemies",
								"images/iciclespikes.svg", 80, 70,
								[new PulseAttack(DEEP_FREEZE_PULSE, 2500, 2*Math.PI, null), new ProjectileAttack(ICICLE, 5000, {type:"radial", number:6}, Math.PI/2)]),
							new TowerUpgrade("Climate Change", 300, 180,
								"The range increses greatly",
								"images/climatechange.svg", 80, 70,
								[new PulseAttack(FAR_FREEZE_PULSE, 3000, 2*Math.PI, null)]),
						]
					]
	),
	new TowerType("Cattail", 25, true, true,
					[
						new TowerUpgrade("BASE", 440, 150,
							"Shoots spikes that can home on targets",
							"images/cattail.svg", 70, 70,
							[new ProjectileAttack(SPIKE, 1000, {type:"single"}, null)]),
						new TowerUpgrade("Sharp-Shooter", 350, 150,
							"Shoots faster and sharper spikes",
							"images/sharpshooter.svg", 70, 70,
							[new ProjectileAttack(SHARP_SPIKE, 1000, {type:"single"}, null)]),
						[
							new TowerUpgrade("Mechameow", 400, 150,
								"A mechanized tail rapidly shoots spikes",
								"images/mechameow.svg", 70, 70,
								[new ProjectileAttack(SHARP_SPIKE, 333, {type:"single"}, null)]),
							new TowerUpgrade("Spike Balls", 500, 150,
								"Shoots spike balls that explode into multiple spikes",
								"images/spikeballs.svg", 70, 70,
								[new ProjectileAttack(SPIKE_BALL, 1000, {type:"single"}, null)])
						]
					]
	),
	new TowerType("Cabbage-pult", 30, true, false,
					[
						new TowerUpgrade("BASE", 500, 180,
							"Shoots cabbages that explode on contact",
							"images/cabbagepult.svg", 70, 80,
							[new ProjectileAttack(CABBAGE, 1500, {type:"single"}, null)]),
						new TowerUpgrade("Thiccness", 180, 200,
							"Cabbage explosions are slightly bigger",
							"images/thiccness.svg", 70, 80,
							[new ProjectileAttack(THICC_CABBAGE, 1500, {type:"single"}, null)]),
						[
							new TowerUpgrade("Leaf Tornado", 420, 200,
								"Leaves erupt from the cabbage, slightly flustering foes",
								"images/leaftornado.svg", 70, 80,
								[new ProjectileAttack(LEAFY_CABBAGE, 1500, {type:"single"}, null)]),
							new TowerUpgrade("Melon-pult", 560, 200,
								"Shoots melons (for some reason) that do double damage and big explosions",
								"images/melonpult.svg", 70, 92,
								[new ProjectileAttack(MELON, 1750, {type:"single"}, null)])
						]
					]
	)
];

function TowerType(name, footprint, turning, water,
					upgrades) {
	this.name = name;
	this.footprint = footprint;
	this.upgrades = upgrades;
	this.turning = turning;
	this.water = water;
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
						description,
						image, imgwidth, imgheight,
						attacks) {
	this.name = name;
	this.cost = cost;
	this.image = new Image();
	this.image.src = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
	this.range = range;
	this.attacks = attacks;
	this.description = description;

	var thisTower = this;

	this.canvas = document.createElement("canvas");
	this.canvas.width = thisTower.imgwidth;
	this.canvas.height = thisTower.imgheight;
	this.image.onload = function() {
		thisTower.canvas.getContext("2d").drawImage(thisTower.image, 0, 0, thisTower.imgwidth, thisTower.imgheight);
	}
}

//Draws with a set max dimension while maintaining an aspect ratio
TowerUpgrade.prototype.drawFit = function(context, x, y, max) {
	if(this.imgwidth >= this.imgheight) {
		context.drawImage(this.image, x - max/2, y - (max*this.imgheight/this.imgwidth)/2, max, max*this.imgheight/this.imgwidth);
	} else {
		context.drawImage(this.image, x - (max*this.imgwidth/this.imgheight)/2, y - max/2, max*this.imgwidth/this.imgheight, max);
	}
}

//Draws a tower type with an angle
TowerUpgrade.prototype.draw = function(context, x, y, angle) {
	if(angle) {
		context.translate(x, y);
		context.rotate(angle-Math.PI/2);
		
		context.drawImage(this.canvas, -this.imgwidth/2, -this.imgheight/2, this.imgwidth, this.imgheight);

		context.rotate(-(angle-Math.PI/2));
		context.translate(-x, -y);
	} else {
		context.drawImage(this.canvas, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
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
	// var dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
 //      s = 2,  // thickness scale
 //      i = 0,  // iterator
 //      x = 5,  // final position
 //      y = 5;

	// context.translate(x, y);
	// context.rotate(angle-Math.PI/2);
  
	// // draw images at offsets from the array scaled by s
	// for(; i < dArr.length; i += 2) {
	// 	context.drawImage(this.image, -this.imgwidth/2 + dArr[i]*s, -this.imgheight/2 + dArr[i+1]*s, this.imgwidth, this.imgheight);
	// }

	// // fill with color
	// context.globalCompositeOperation = "source-in";
	// context.fillStyle = "white";
	// context.fillRect(-CANVAS_WIDTH, -CANVAS_HEIGHT, 2*CANVAS_WIDTH, 2*CANVAS_HEIGHT);
	// context.globalCompositeOperation = "source-over";

	// context.rotate(-(angle-Math.PI/2));
	// context.translate(-x, -y);

}

function Tower(state, type, x, y) {
	this.state = state;
	this.type = type;
	this.x = x;
	this.y = y;
	
	this.upgradeNum = 0;
	this.upgradeBranch = null;
	this.upgrade = this.type.upgrades[this.upgradeNum];
	if(this.upgradeBranch != null) {
		this.upgrade = this.upgrade[this.upgradeNum];
	}

	this.angle = Math.PI/2;
	this.cooldowns = this.upgrade.attacks.map(function(ps) {return ps.cooldown});
	this.attacks = [];
	this.targetEnemy = null;

	this.baseSellPrice = this.upgrade.cost;
}

Tower.prototype.updateState = function(enemies) {
	this.cooldown();

	for (var i = 0; i < enemies.length; i++) {
		var enemy = enemies[i];
		if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.upgrade.range) {
			this.attack(enemy);
			return;
		}
	}
	
}

Tower.prototype.attack = function(enemy) {
	var angle = Math.atan2(enemy.y-this.y, enemy.x-this.x);
	this.targetEnemy = enemy;

	for(var j = 0; j<this.cooldowns.length; j++) {
		if (this.cooldowns[j] <= 0) {
			this.cooldowns[j] = this.upgrade.attacks[j].cooldown;

			let targetAngle;
			if(this.upgrade.attacks[j].target == null) {
				targetAngle = angle;
				if(this.type.turning) {
					this.angle = angle;
				}
			} else {
				targetAngle = this.upgrade.attacks[j].target;
			}

			this.addAttack(this.upgrade.attacks[j], targetAngle);

		}
	}

	this.state.attackCanvas.valid = false;
	this.state.towerCanvas.valid = false;
}

Tower.prototype.addAttack = function(attack, targetAngle, x, y) { //x, y optional defaults to tower position
	switch(attack.type) {
		case "projectile":
			switch(attack.dispersion.type) {
				case "single":
					this.addProjectile(attack.projectiletype, x||this.x, y||this.y, targetAngle);
					break;
				case "spray":
					for(var k=0; k<attack.dispersion.number; k++) {
						this.addProjectile(attack.projectiletype, x||this.x, y||this.y, 
							targetAngle - (attack.dispersion.number/2 - 0.5 - k)*attack.dispersion.angle);
					}
					break;
				case "radial":
					for(var k=0; k<attack.dispersion.number; k++) {
						this.addProjectile(attack.projectiletype, x||this.x, y||this.y, targetAngle + k*(2*Math.PI/attack.dispersion.number));
					}
					break;
				
			}
			break;
		case "pulse":
			this.addPulse(attack.pulsetype, x||this.x, y||this.y, targetAngle, attack.angleWidth);
			break;
	}

	this.state.attackCanvas.valid = false;
}

Tower.prototype.draw = function() {
	this.upgrade.draw(this.state.towerContext, this.x, this.y, this.angle);
}

Tower.prototype.inBounds = function(mx, my) {
	if(Math.hypot(this.x - mx, this.y - my) < this.type.footprint) {
		return true;
	} else {
		return false;
	}
}

Tower.prototype.drawRange = function(valid) {
	this.upgrade.drawRange(this.state.towerContext, this.x, this.y, valid);
}

Tower.prototype.drawBoundary = function(color, lineWidth, fillOpacity) {
	this.type.drawBoundary(this.state.labelContext, this.x, this.y, color, lineWidth, fillOpacity);
}

Tower.prototype.drawOutline = function() {
	this.upgrade.drawOutline(this.state.towerContext, this.x, this.y, this.angle);
}

Tower.prototype.addProjectile = function(type, x, y, angle) {
	var projectile = new Projectile(this.state, type, this, x, y, angle);
	if(type.homing) {
		projectile.targetEnemy = this.targetEnemy;
	}
	this.attacks.push(projectile);
}

Tower.prototype.addPulse = function(type, x, y, angle, angleWidth) {
	var pulse = new Pulse(this.state, type, this, x, y, angle, angleWidth);
	this.attacks.push(pulse);
}


Tower.prototype.drawAttacks = function() {
	for (let attack of this.attacks) {
		attack.draw(this.state.attackContext);
	}
}

Tower.prototype.updateAttacks = function() {
	for (var i = 0; i < this.attacks.length; i++) {
		if (this.attacks[i].update()) {
			this.attacks.splice(i, 1);
			i--;
		}
		this.state.attackCanvas.valid = false;
	}
}

Tower.prototype.cooldown = function() {
	for(var j = 0; j<this.cooldowns.length; j++) {
		if (this.cooldowns[j] > 0) {
			this.cooldowns[j] -= this.state.interval;
		}
	}
}

Tower.prototype.nextUpgrade = function(branch) {
	this.upgradeNum += 1;
	if(Array.isArray(this.type.upgrades[this.upgradeNum]) && this.upgradeBranch == null) {
		this.upgradeBranch = branch;
	} 
	if(this.upgradeBranch == null) {
		this.upgrade = this.type.upgrades[this.upgradeNum];	
	} else {
		this.upgrade = this.type.upgrades[this.upgradeNum][this.upgradeBranch];
	}
	this.state.money -= this.upgrade.cost;
	this.baseSellPrice += this.upgrade.cost;
	this.cooldowns = this.upgrade.attacks.map(function(ps) {return ps.cooldown});
	this.state.valid = false;
}