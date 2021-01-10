PEA = new ProjectileType("Pea", null, 2, 800, 300, 1,
						false, 15, false, [], [],
						"images/pea.png", 30, 30);
SNOW_PEA = new ProjectileType("Snow Pea", PEA, 2, 800, INHERIT, INHERIT,
						true, INHERIT, INHERIT, [{"type":COLD,"time":3}], INHERIT,
						"images/snowpea.png", 30, 30);
BULLET_PEA = new ProjectileType("Bullet Pea", PEA, 3, 1000, 500, INHERIT,
						INHERIT, 10, INHERIT, INHERIT, INHERIT,
						INHERIT, 20, 20);
STAR = new ProjectileType("Star", null, Infinity, 800, 140, 1,
						false, 20, false, [], [],
						"images/star.png", 40, 40);
FAR_STAR = new ProjectileType("Far Star", STAR, INHERIT, 800, 180,  INHERIT,
						INHERIT, INHERIT, INHERIT, INHERIT, INHERIT,
						INHERIT, INHERIT, INHERIT);
HOMING_STAR = new ProjectileType("Homing Star", STAR, 8, 400, Infinity,  INHERIT,
						true, 30, 1000, INHERIT, INHERIT,
						INHERIT, 60, 60);
SPIKE = new ProjectileType("Spike", null, 2, 400, Infinity, 1,
						true, 10, 360, [], [],
						"images/spike.png", 15, 30);
SHARP_SPIKE = new ProjectileType("Sharp Spike", SPIKE, 4, 500, INHERIT, INHERIT,
						INHERIT, INHERIT, 450, INHERIT, INHERIT,
						INHERIT, INHERIT, INHERIT);
SPIKE_BALL = new ProjectileType("Spike Ball", null, 1, 300, Infinity, 1,
						true, 20, null, [], [new ProjectileAttack(SPIKE, null, {type:"radial", number:6})],
						"images/spikeball.png", 40, 40);
ICICLE = new ProjectileType("Icicle", null, Infinity, 900, 120, 1,
						true, 15, false, [{"type":FREEZE,"time":3}], [],
						"images/icicle.svg", 25, 50);
CABBAGE = new ProjectileType("Cabbage", null, 1, 600, Infinity, 0,
						true, 20, false, [], [new PulseAttack(CABBAGE_EXPLOSION, null, 2*Math.PI, null)],
						"images/cabbage.png", 40, 40);
THICC_CABBAGE = new ProjectileType("Thicc Cabbage", null, 1, 600, Infinity, 0,
						true, 25, false, [], [new PulseAttack(THICC_CABBAGE_EXPLOSION, null, 2*Math.PI, null)],
						"images/cabbage.png", 50, 50);
LEAF = new ProjectileType("Leaf", null, Infinity, 400, 120, 0,
						true, 10, false, [{"type": FLUSTERED, "time":3}], [],
						"images/leaf.png", 20, 20);
LEAFY_CABBAGE = new ProjectileType("Leafy Cabbage", THICC_CABBAGE, INHERIT, 500, INHERIT, INHERIT,
						INHERIT, 25, INHERIT, INHERIT, [new PulseAttack(THICC_CABBAGE_EXPLOSION, null, 2*Math.PI, null), new ProjectileAttack(LEAF, 750, {type:"radial", number:12}, -Math.PI/2)],
						INHERIT, 50, 50);
MELON = new ProjectileType("Melon", THICC_CABBAGE, INHERIT, 400, INHERIT, INHERIT,
						INHERIT, 30, INHERIT, INHERIT, [new PulseAttack(MELON_EXPLOSION, null, 2*Math.PI, null)],
						"images/melon.png", 60, 60);

const projectiles = [
	PEA,
	SNOW_PEA,
	STAR,
	HOMING_STAR, 
	SPIKE,
	SPIKE_BALL,
	ICICLE,
	CABBAGE,
	LEAF,
	LEAFY_CABBAGE,
	MELON
]

function mod(m,n) {
	return ((m%n)+n)%n;
}

function ProjectileType(name, base, pierce, speed, maxRange, damage,
						rotating, radius, homing, effects, attacks,
						image, imgwidth, imgheight) {
	this.name = name;
	this.pierce = pierce;
	this.speed = speed; //px per seconds
	this.maxRange = maxRange;
	this.damage = damage;

	this.rotating = rotating;
	this.radius = radius;
	this.homing = homing;
	this.effects = effects; // {type, time}
	this.attacks = attacks;

	this.image = new Image();
	this.image.src = image;
	var imageUrl = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;

	if(base) {
		for(let key of Object.keys(this)) {
			if(this[key] == INHERIT) {
				this[key] = base[key];
			} else if(key == "image" && imageUrl == INHERIT) {
				this.image.src = base.image.src;
			}
		}
	}

	var thisProjectile = this;

	this.canvas = document.createElement("canvas");
	this.canvas.width = thisProjectile.imgwidth;
	this.canvas.height = thisProjectile.imgheight;
	this.image.onload = function() {
		thisProjectile.canvas.getContext("2d").drawImage(thisProjectile.image, 0, 0, thisProjectile.imgwidth, thisProjectile.imgheight);
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

function Projectile(state, type, tower, x, y, angle) {
	this.state = state;
	this.angle = angle;
	this.type = type;
	this.tower = tower;
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

	this.rangeLeft -= Math.hypot(dx, dy);
	if(this.rangeLeft<0) {
		return true;
	}
	
	for (var i = 0; i < this.state.enemies.length; i++) {
		var enemy = this.state.enemies[i];
		if (!this.damagedEnemies.includes(enemy)) {
			if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.type.size + this.type.radius) {
				if (this.type.damage > 0) {
                    enemy.damage(i, this.type.damage);
                }
				for (let effect of this.type.effects) {
					enemy.addEffect(effect.type, effect.time*1000);
				}
				this.damagedEnemies.push(enemy);

				for (let attack of this.type.attacks) {
					this.tower.addAttack(attack, attack.target||this.angle, enemy.x, enemy.y);
				}
				
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
	this.type.draw(this.state.attackContext, this.x, this.y, this.angle);
}