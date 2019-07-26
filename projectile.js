PEA = new ProjectileType(1, 1400, "resources/images/pea.png", 15, 15);

function ProjectileType(pierce, speed, image, imgwidth, imgheight) {
	this.pierce = pierce;
	this.speed = speed; //px per seconds
	this.image = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
}

function Projectile(state, type, x, y, angle) {
	this.state = state;
	this.angle = angle;
	this.type = type;
	this.x = x;
	this.y = y;
	this.pierceLeft = this.type.pierce;
	this.damagedEnemies = [];
}

//Will return whether this projectiles should be deleted
Projectile.prototype.update = function() {
	this.x += this.state.interval*(this.type.speed/1000) * Math.cos(this.angle);
	this.y += this.state.interval*(this.type.speed/1000) * Math.sin(this.angle);
	
	if(this.x < 0 || this.x > 480 || this.y < 0 || this.y > 360) {
		return true;
	}
	
	for (var i = 0; i < this.state.enemies.length; i++) {
		var enemy = this.state.enemies[i];
		if (!this.damagedEnemies.includes(enemy.id)) {
			if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.type.size) {
				enemy.damage(i);
				this.damagedEnemies.push(enemy.id);
				this.pierceLeft--;
				if (this.pierceLeft <= 0) {
					return true;
				}
			}
			
		}
	}
	
	return false;
}

Projectile.prototype.draw = function(context) {
	var image = new Image();
	image.src = this.type.image;
	context.drawImage(image, this.x - this.type.imgwidth/2, this.y - this.type.imgheight/2, this.type.imgwidth, this.type.imgheight);
}