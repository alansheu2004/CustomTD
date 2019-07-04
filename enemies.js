var RED = new EnemyType(100, "red", null, 1, 1, 15);
var BLUE = new EnemyType(133, "skyblue", RED, 1, 2, 15);
var GREEN = new EnemyType(167, "limegreen", BLUE, 2, 3, 15);
var YELLOW = new EnemyType(333, "yellow", GREEN, 2, 4, 15);
var PINK = new EnemyType(367, "pink", YELLOW, 3, 5, 15);

function EnemyType(speed, color, child, rbe, damage, size) {
	this.speed = speed; // px per sec
	this.color = color;
	this.child = child;
	this.rbe = rbe;
	this.damage = damage;
	this.size = size;
}

function Enemy(state, id, type) {
	this.type = type;
	this.id = id;
	this.dist = 0;
	this.state = state;
	var point = state.path.pointOnPath(0);
	this.x = point.x;
	this.y = point.y;
}

Enemy.prototype.draw = function(context) {
	context.beginPath();
	context.arc(this.x, this.y, 15, 0, 2*Math.PI);
	context.fillStyle = this.type.color;
	context.fill();
}

Enemy.prototype.damage = function(num) {
	this.state.money += this.type.rbe;
	if (this.type.child == null) {
		this.state.enemies.splice(num, 1);
	} else {
		this.type = this.type.child;
	}
}

//Advances the distance of enemy traveled based on speed
Enemy.prototype.updateDist = function() {
	this.dist += this.state.interval * this.type.speed/1000.0;
}

//Set x and y coordinates based on distance
Enemy.prototype.updatePosition = function() {
	var point = this.state.path.pointOnPath(this.dist);
	this.x = point.x;
	this.y = point.y;
}