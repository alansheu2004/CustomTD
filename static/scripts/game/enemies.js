var ZOMBIE = new EnemyType("Zombie", 60, null, 25, 1, 22, 10,
	"images/zombie.png", 55, 60);
var FLAG_ZOMBIE = new EnemyType("Flag Zombie", 60, null, 25, 1, 22, 10,
	"images/zombieFlag.png", 75, 80);
var CONE_HEAD_ZOMBIE = new EnemyType("Cone-Head Zombie", 50, ZOMBIE, 0, 2, 22, 15,
	"images/zombieCone.png", 55, 80);
var BUCKET_HEAD_ZOMBIE = new EnemyType("Bucket-Head Zombie", 50, ZOMBIE, 0, 3, 22, 30,
	"images/zombieBucket.png", 55, 75);
var POLE_VAULT_ZOMBIE = new EnemyType("Pole-Vaulting Zombie", 150, null, 25, 2, 22, 15,
	"images/zombiePoleVault.png", 55, 60);
var FOOTBALL_ZOMBIE = new EnemyType("Football Zombie", 120, null, 25, 5, 22, 30,
	"images/zombieFootball.png", 60, 60);

const defaultEnemyTypes = [ZOMBIE, FLAG_ZOMBIE, CONE_HEAD_ZOMBIE, BUCKET_HEAD_ZOMBIE, POLE_VAULT_ZOMBIE, FOOTBALL_ZOMBIE];

function EnemyType(name, speed, child, reward, damage, size, health,
					image, imgwidth, imgheight) {
	this.name = name;
	this.speed = speed; // px per sec
	this.child = child;
	this.reward = reward;
	this.damage = damage; //if passed through map
	this.size = size;
	this.health = health;

	this.image = new Image();
	this.image.src = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;

	var thisEnemy = this;

	this.canvas = document.createElement("canvas");
	this.canvas.width = thisEnemy.imgwidth;
	this.canvas.height = thisEnemy.imgheight;
	this.image.onload = function() {
		thisEnemy.canvas.getContext("2d").drawImage(thisEnemy.image, 0, 0, thisEnemy.imgwidth, thisEnemy.imgheight);
	}
}

EnemyType.prototype.draw = function(context, x, y) {
	context.drawImage(this.canvas, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
}

function Enemy(state, type) {
	this.type = type;
	this.dist = 0;
	this.state = state;
	var point = state.map.path.pointOnPath(0);
	this.x = point.x;
	this.y = point.y;

	this.health = this.type.health;
	this.effects = []; //should have {type, time}
}

Enemy.prototype.draw = function() {
	this.type.draw(this.state.enemyContext, this.x, this.y);
}

//Advances the distance of enemy traveled based on speed
Enemy.prototype.updateDist = function() {
	var effectsOver = [];
	var speedMultiplier = 1;
	for (let i = 0; i < this.effects.length; i++) {
		this.effects[i].time -= this.state.interval;
		if(this.effects[i].time <= 0) {
			this.effects.splice(i, 1);
			i--;
		} else {
			speedMultiplier *= this.effects[i].type.speedMultiplier;
		}
	}

	this.dist += this.state.interval * speedMultiplier * this.type.speed/1000.0;
}

//Set x and y coordinates based on distance
Enemy.prototype.updatePosition = function() {
	var point = this.state.map.path.pointOnPath(this.dist);
	this.x = point.x;
	this.y = point.y;
}

Enemy.prototype.damage = function(id, damage) {
	this.health -= damage;

	if(this.health <= 0) {
		this.state.money += this.type.reward;
		if(this.type.child == null) {
			this.state.enemies.splice(id, 1);
		} else {
			let damageLeft = -this.health;
			this.type = this.type.child;
			this.health = this.type.health;
			this.damage(id, damageLeft);
		}
	
		this.state.labelCanvas.valid = false;
		this.state.enemyCanvas.valid = false;
		this.state.panelCanvas.valid = false;
	}
}

Enemy.prototype.addEffect = function(newEffect, time) {
	for(let effect of this.effects) {
		if(effect.type == newEffect) {
			return;
		}
	}
	this.effects.push({"type":newEffect, "time": time});
}