function ProjectileType(state, pierce, speed) {
	this.state = state;
	this.pierce = pierce;
	this.speed = speed; //px per seconds
}

function Projectile(state, type, x, y, angle) {
	this.state = state;
	this.pierce = type.pierce;
	this.speed = type.speed;
	this.angle = angle;
	this.x = x;
	this.y = y;
	this.pierceLeft = this.pierce;
	this.damagedEnemies = [];
}

//Will return whether this projectiles should be deleted
Projectile.prototype.update = function() {
	this.x += this.state.interval*(this.speed/1000) * Math.cos(this.angle);
	this.y += this.state.interval*(this.speed/1000) * Math.sin(this.angle);
	
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
	context.fillStyle = "rgb(0, 0, 0)";
	context.strokeStyle = "black";
	context.beginPath();
	context.arc(this.x, this.y, 6, 0, 2*Math.PI);
	context.fill();
	context.stroke();
}