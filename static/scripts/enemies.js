var RED = new EnemyType(100, null, 3, 1, 22, 1,
	"images/red.svg", 36, 48);
var BLUE = new EnemyType(133, RED, 4, 2, 23, 1,
	"images/blue.svg", 38, 51);
var GREEN = new EnemyType(200, BLUE, 5, 3, 24, 1,
	"images/green.svg", 40, 54);
var YELLOW = new EnemyType(400, GREEN, 6, 4, 26, 1,
	"images/yellow.svg", 42, 57);
var PINK = new EnemyType(500, YELLOW, 8, 5, 28, 1,
	"images/pink.svg", 44, 60);

function EnemyType(speed, child, rewardMoney, damage, size, health,
					image, imgwidth, imgheight) {
	this.speed = speed; // px per sec
	this.child = child;
	this.rewardMoney = rewardMoney;
	this.damage = damage; //if passed through map
	this.size = size;
	this.health = health;

	this.image = new Image();
	this.image.src = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;

	var thisEnemy = this;

	this.image.onload = function() {
		thisEnemy.canvas = document.createElement("canvas");
		thisEnemy.canvas.width = thisEnemy.imgwidth;
		thisEnemy.canvas.height = thisEnemy.imgheight;
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
	this.state.money += this.type.rewardMoney;
	this.health -= damage;

	if(this.health <= 0) {
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
		this.state.panelCanvas.vlid = false;
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