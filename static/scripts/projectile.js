PEA = new ProjectileType(null, 2, 1600, 500, 1,
						false, 15, false, [],
						"images/pea.png", 30, 30);
BULLET_PEA = new ProjectileType(PEA, 3, 2000, 700, INHERIT,
						INHERIT, 10, INHERIT, INHERIT,
						INHERIT, 20, 20);
STAR = new ProjectileType(null, Infinity, 1600, 140, 1,
						false, 20, false, [],
						"images/star.png", 40, 40);
FAR_STAR = new ProjectileType(STAR, INHERIT, 1600, 180,  INHERIT,
						INHERIT, INHERIT, INHERIT, INHERIT,
						INHERIT, INHERIT, INHERIT);
SPIKE = new ProjectileType(null, 2, 800, null, 1,
						true, 10, 450, [],
						"images/spike.png", 15, 30);
SHARP_SPIKE = new ProjectileType(SPIKE, 3, 1000, INHERIT, INHERIT,
						INHERIT, INHERIT, 630, INHERIT,
						INHERIT, INHERIT, INHERIT);
ICICLE = new ProjectileType(null, Infinity, 1800, 140, 1,
						true, 15, false, [{"type":FREEZE,"time":3}],
						"images/icicle.svg", 25, 50);

function mod(m,n) {
	return ((m%n)+n)%n;
}

function ProjectileType(base, pierce, speed, maxRange, damage,
						rotating, radius, homing, effects,
						image, imgwidth, imgheight) {
	this.pierce = pierce;
	this.speed = speed; //px per seconds
	this.maxRange = maxRange;
	this.damage = damage;

	this.rotating = rotating;
	this.radius = radius;
	this.homing = homing;
	this.effects = effects; // {type, time}

	this.image = new Image();
	this.image.src = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;

	if(base) {
		for(let key of Object.keys(this)) {
			if(this[key] == INHERIT) {
				this[key] = base[key];
			} else if(key == "image") {
				this[key].src = base[key].src;
			}
		}
	}
}

ProjectileType.prototype.draw = function(context, x, y, angle) {
	if(this.rotating) {
		context.translate(x, y);
		context.rotate(angle-Math.PI/2);
		
		context.drawImage(this.image, -this.imgwidth/2, -this.imgheight/2, this.imgwidth, this.imgheight);

		context.rotate(-(angle-Math.PI/2));
		context.translate(-x, -y);
	} else {
		context.drawImage(this.image, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
	}
}

/*
	Dispersion can be:
	{type:"single"} A single projectile
	{type:"spray", number, angle} Sprays multiple projectiles with angle between them
	{type:"radial", number} Evenly shoots multiple projectiles in all directions
*/
function ProjectileAttack(projectiletype, cooldown, dispersion, target) { //Targets a specific angle, default if null
	this.type = "projectile";
	this.projectiletype = projectiletype;
	this.cooldown = cooldown;
	this.dispersion = dispersion;
	this.target = target;
}

function Projectile(state, type, x, y, angle) {
	this.state = state;
	this.angle = angle;
	this.type = type;
	this.x = x;
	this.y = y;
	this.pierceLeft = this.type.pierce;
	this.rangeLeft = this.type.maxRange;
	this.damagedEnemies = [];
}

//Will return whether this projectiles should be deleted
Projectile.prototype.update = function() {
	if(this.type.homing) {
		this.assignNewTarget();
		if(this.targetEnemy && this.state.enemies.includes(this.targetEnemy)) {
			let angle = mod(Math.atan2(this.targetEnemy.y-this.y, this.targetEnemy.x-this.x)-this.angle, 2*Math.PI);
			if(angle <= Math.PI) {
				this.angle += Math.min(angle, this.type.homing*(Math.PI/180)*this.state.interval/1000);
			} else {
				this.angle -= Math.min(2*Math.PI-angle, this.type.homing*(Math.PI/180)*this.state.interval/1000);
			}
		}
	}

	var dx = this.state.interval*(this.type.speed/1000) * Math.cos(this.angle);
	var dy = this.state.interval*(this.type.speed/1000) * Math.sin(this.angle);
	this.x += dx;
	this.y += dy;
	
	if(this.x < 0 || this.x > CANVAS_WIDTH || this.y < 0 || this.y > CANVAS_HEIGHT) {
		return true;
	}

	if(this.rangeLeft != null) {
		this.rangeLeft -= Math.hypot(dx, dy);
		if(this.rangeLeft<0) {
			return true;
		}
	}
	
	for (var i = 0; i < this.state.enemies.length; i++) {
		var enemy = this.state.enemies[i];
		if (!this.damagedEnemies.includes(enemy)) {
			if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.type.size + this.type.radius) {
				enemy.damage(i, this.type.damage);
				for (let effect of this.type.effects) {
					enemy.addEffect(effect.type, effect.time*1000);
				}
				this.damagedEnemies.push(enemy);
				
				this.pierceLeft--;
				if (this.pierceLeft <= 0) {
					return true;
				}

				if(this.type.homing) {
					this.assignNewTarget();
				}
			}
		}
	}
	
	return false;
}

Projectile.prototype.assignNewTarget = function() {
	var shortest = Infinity;
	var closestEnemy;
	for(let enemy of this.state.enemies) {
		if (!this.damagedEnemies.includes(enemy)) {
			let dist = Math.hypot(enemy.y-this.y, enemy.x-this.x);
			if(dist < shortest) {
				shortest = dist;
				closestEnemy = enemy;
			}
		}
	}
	if(closestEnemy) {
		this.targetEnemy = closestEnemy;
	} else {
		this.targetEnemy = null;
	}
}

Projectile.prototype.draw = function() {
	this.type.draw(this.state.context, this.x, this.y, this.angle);
}