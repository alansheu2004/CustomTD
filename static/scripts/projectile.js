PEA = new ProjectileType(2, 1600, null, 
						false,
						"images/pea.png", 30, 30);
BULLET_PEA = new ProjectileType(2, 2000, null, 
						false,
						"images/pea.png", 20, 20);
STAR = new ProjectileType(2, 1600, 140, 
						false,
						"images/star.png", 36, 36);
FAR_STAR = new ProjectileType(2, 1600, 160, 
						false,
						"images/star.png", 36, 36);

function ProjectileType(pierce, speed, maxRange,
						rotating,
						image, imgwidth, imgheight) {
	this.pierce = pierce;
	this.speed = speed; //px per seconds
	this.maxRange = maxRange;

	this.rotating = rotating;

	this.image = new Image();
	this.image.src = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
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
			if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.type.size) {
				enemy.damage(i);
				this.damagedEnemies.push(enemy);
				
				if(this.pierceLeft != null) {
					this.pierceLeft--;
					if (this.pierceLeft <= 0) {
						return true;
					}
				}
			}
			
		}
	}
	
	return false;
}

Projectile.prototype.draw = function() {
	this.type.draw(this.state.context, this.x, this.y, this.angle);
}